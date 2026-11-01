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
