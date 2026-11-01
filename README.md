  async function handleSave() {
    if (!key.trim()) {
      Alert.alert("Key khali hai");
      return;
    }
    await saveApiKey(key);
    setSaved(true);
    Alert.alert("Save ho gaya", "Ab assistant general sawaalon ke jawab bhi de sakega.");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>सेटिंग्स</Text>

      <Text style={styles.label}>Anthropic API Key</Text>
      <Text style={styles.hint}>
        Yeh key sirf is phone mein save rehti hai, kahin aur nahi jaati. Duniya ki
        kisi bhi jaankari ke sawaal ke liye zaroori hai (offline command jaise TV,
        SOS, date-time iske bina bhi chalenge).
      </Text>
      <TextInput
        style={styles.input}
        value={key}
        onChangeText={setKey}
        placeholder="sk-ant-..."
        placeholderTextColor="#888"
        secureTextEntry
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Linking.openURL("https://console.anthropic.com")}>
        <Text style={styles.link}>Key yahan se banayein: console.anthropic.com</Text>
      </TouchableOpacity>

      {saved ? <Text style={styles.status}>✓ Key saved hai</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20, paddingTop: 50 },
  title: { color: "#FFFFFF", fontSize: 24, fontWeight: "700", marginBottom: 25 },
  label: { color: "#FFF", fontSize: 15, marginBottom: 6 },
  hint: { color: "#999", fontSize: 12, marginBottom: 12, lineHeight: 18 },
  input: {
    backgroundColor: "#22223B",
    color: "#FFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#0F9B8E",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  saveText: { color: "#FFF", fontWeight: "700" },
  link: { color: "#4A90D9", textAlign: "center", marginBottom: 20 },
  status: { color: "#0F9B8E", textAlign: "center", fontSize: 14 },
});


==========================================================================================
FILE: README.md
==========================================================================================

# Family Safety Assistant (Itfoot)

Ek Android (Expo / React Native) app: Voice Assistant + Family Safety.

## Features

**Voice Assistant**
- Mic button dabaye rakho, bolo, chhodte hi action hota hai
- Offline commands (internet ke bina): SOS trigger, live location share, aaj ki date/time
- Online hone par (aur Settings mein API key daalne ke baad): koi bhi general sawaal, Hindi mein jawab

**Family Safety**
- SOS button: ek tap mein saare emergency contacts ko location ke saath SMS (Send button khud dabana padta hai -- Android policy ke mutabik; poori tarah automatic SMS ke liye alag se restricted permission approval chahiye hoti hai jo yeh app nahi maangti)
- Live location sharing: sirf consent ("Haan") ke baad shuru hoti hai, kabhi bhi band ki ja sakti hai
- Emergency contacts list (add/remove)

## Zaroori limitations (sach-sach)

1. **Yeh app sirf apne hi phone ko control karti hai.** Kisi doosre phone (jaise mummy-papa ke phone) ko door se control/track karna sirf tab hi hota hai jab **unke apne phone mein yehi app install ho** aur unhone khud consent diya ho. Bina unki jaankari/consent ke kisi bhi phone ko track/control karna is project ka hissa nahi hai -- aisa karna stalkerware jaisa hota hai.
2. **Offline + "duniya ki har jaankari" saath nahi chal sakte.** Offline command list choti hai (SOS, location share, date/time). General knowledge ke liye internet + API key chahiye.
3. Voice recognition (`@react-native-voice/voice`) aur background location ke liye **Expo Go kaafi nahi hai** -- development build banana padega (`expo-dev-client`, neeche steps mein hai).
4. SOS SMS automatic nahi bhejta (Send button khud dabana padega) -- yeh Google Play policy ke hisaab se sabse safe tareeka hai.

## Setup

```bash
npm install
npx expo prebuild
npx expo run:android   # ya EAS build se APK banayein
```

Pehli baar app kholne par:
1. Settings mein jaake apni Anthropic API key daalein (console.anthropic.com se free milti hai) -- yeh sirf phone mein save hoti hai
2. Family Safety mein emergency contacts add karein
3. Live location toggle "Haan" karke consent dein

## Isi phone (mummy/papa ka) mein bhi install karne ke liye

Same APK unke phone mein install karo. Woh bhi apne emergency contacts add karenge aur consent denge. Dono phone alag-alag independent installs hain -- koi bhi doosre ko force control nahi kar sakta, sirf jo share karna chaho wahi dikhta hai.

## GitHub par push karna

Mujhe is session mein internet access nahi hai, isliye main khud clone/push nahi kar saka. Aapko yeh karna hoga:

```bash
git clone https://github.com/gawalivj95-coder/Itfoot.git
cd Itfoot
# is folder ki saari files yahan copy karein
git add .
git commit -m "Voice assistant aur family safety screens add kiye"
git push
```

**Kabhi bhi apna GitHub token/password chat mein mat likhiye.**# Itfoot
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import * as Contacts from "expo-contacts";
import {
  loadContacts,
  addContact,
  removeContact,
  getLocationConsent,
  setLocationConsent,
} from "../utils/familyStore";
import { getCurrentLocation, startLiveTracking } from "../utils/location";
import { sendSOS } from "../utils/sms";

export default function FamilySafetyScreen() {
  const [contacts, setContacts] = useState([]);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [trackingSub, setTrackingSub] = useState(null);

  useEffect(() => {
    (async () => {
      setContacts(await loadContacts());
      setConsent(await getLocationConsent());
    })();
    return () => {
      if (trackingSub) trackingSub.remove();
    };
  }, []);

  async function handleAddFromPhonebook() {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission chahiye", "Contacts access ke bina number nahi chun sakte.");
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });
    if (!data.length) {
      Alert.alert("Koi contact nahi mila");
      return;
    }
    // Simplified: pehla number le lete hain agar maujood ho. Real app mein
    // yahan ek picker UI dikhega.
    Alert.alert(
      "Manually add karein",
      "Neeche diye box mein naam aur number bharen, phir 'Add' dabayen."
    );
  }

  async function handleManualAdd() {
    if (!newName.trim() || !newNumber.trim()) {
      Alert.alert("Naam aur number dono bharen");
      return;
    }
    const updated = await addContact({
      name: newName.trim(),
      phoneNumber: newNumber.trim(),
    });
    setContacts(updated);
    setNewName("");
    setNewNumber("");
  }

  async function handleRemove(phoneNumber) {
    const updated = await removeContact(phoneNumber);
    setContacts(updated);
  }

  async function handleToggleConsent(value) {
    if (value) {
      Alert.alert(
        "Live location sharing",
        "Aap apni live location apne family members ke saath share karna chahte hain? Yeh aap kabhi bhi band kar sakte hain.",
        [
          { text: "Nahi", style: "cancel" },
          {
            text: "Haan, share karo",
            onPress: async () => {
              await setLocationConsent(true);
              setConsent(true);
              try {
                const sub = await startLiveTracking(() => {});
                setTrackingSub(sub);
              } catch (e) {
                Alert.alert("Permission nahi mili", String(e.message || e));
                await setLocationConsent(false);
                setConsent(false);
              }
            },
          },
        ]
      );
    } else {
      await setLocationConsent(false);
      setConsent(false);
      if (trackingSub) {
        trackingSub.remove();
        setTrackingSub(null);
      }
    }
  }

  async function handleSOSPress() {
    if (!contacts.length) {
      Alert.alert("Pehle emergency contact add karein");
      return;
    }
    setSending(true);
    try {
      const loc = await getCurrentLocation();
      await sendSOS(
        contacts.map((c) => c.phoneNumber),
        loc
      );
    } catch (e) {
      Alert.alert("SOS bhejne mein dikkat", String(e.message || e));
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>फैमिली सेफ्टी</Text>

      <TouchableOpacity
        style={styles.sosButton}
        onPress={handleSOSPress}
        disabled={sending}
      >
        <Text style={styles.sosText}>{sending ? "भेज रहे हैं..." : "SOS"}</Text>
      </TouchableOpacity>
      <Text style={styles.sosHint}>
        Dabate hi saare emergency contacts ko aapki live location SMS se chali jaayegi
      </Text>

      <View style={styles.consentRow}>
        <Text style={styles.consentLabel}>लाइव लोकेशन शेयरिंग</Text>
        <Switch value={consent} onValueChange={handleToggleConsent} />
      </View>
      <Text style={styles.consentHint}>
        {consent
          ? "Chalu hai - family aapki location dekh sakti hai. Kabhi bhi band karein."
          : "Band hai - jab tak aap 'Haan' nahi kahenge, location share nahi hogi."}
      </Text>

      <Text style={styles.sectionTitle}>Emergency Contacts</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.phoneNumber}
        style={{ width: "100%" }}
        renderItem={({ item }) => (
          <View style={styles.contactRow}>
            <View>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactNumber}>{item.phoneNumber}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item.phoneNumber)}>
              <Text style={styles.removeText}>हटाएं</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Koi contact add nahi kiya gaya</Text>}
      />

      <View style={styles.addBox}>
        <TextInput
          style={styles.input}
          placeholder="नाम"
          placeholderTextColor="#888"
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="मोबाइल नंबर"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={newNumber}
          onChangeText={setNewNumber}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleManualAdd}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20, paddingTop: 50 },
  title: { color: "#FFFFFF", fontSize: 24, fontWeight: "700", marginBottom: 20 },
  sosButton: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E94560",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  sosText: { color: "#FFF", fontSize: 28, fontWeight: "800" },
  sosHint: { color: "#AAA", textAlign: "center", marginBottom: 25, fontSize: 13 },
  consentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#22223B",
    padding: 15,
    borderRadius: 10,
  },
  consentLabel: { color: "#FFF", fontSize: 16 },
  consentHint: { color: "#999", fontSize: 12, marginTop: 6, marginBottom: 20 },
  sectionTitle: { color: "#FFF", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#22223B",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactName: { color: "#FFF", fontSize: 15 },
  contactNumber: { color: "#999", fontSize: 13 },
  removeText: { color: "#E94560", fontSize: 13 },
  emptyText: { color: "#777", textAlign: "center", marginVertical: 10 },
  addBox: { marginTop: 15 },
  input: {
    backgroundColor: "#22223B",
    color: "#FFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#0F9B8E",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: { color: "#FFF", fontWeight: "700" },
});
