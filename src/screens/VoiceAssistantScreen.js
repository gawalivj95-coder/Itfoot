import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Speech from "expo-speech";
import Voice from "@react-native-voice/voice";
import { parseCommand } from "../utils/commandParser";
import { askGeneralKnowledge } from "../utils/aiAssistant";
import { getCurrentLocation } from "../utils/location";
import { sendSOS } from "../utils/sms";
import { loadContacts } from "../utils/familyStore";

const STATE = {
  IDLE: "IDLE",
  LISTENING: "LISTENING",
  THINKING: "THINKING",
};

function speakHindi(text) {
  Speech.speak(text, { language: "hi-IN", pitch: 1, rate: 0.95 });
}

export default function VoiceAssistantScreen() {
  const [status, setStatus] = useState(STATE.IDLE);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const listeningRef = useRef(false);

  React.useEffect(() => {
    Voice.onSpeechResults = (e) => {
      const text = e.value && e.value[0] ? e.value[0] : "";
      setHeard(text);
      handleCommand(text);
    };
    Voice.onSpeechError = () => {
      setStatus(STATE.IDLE);
      listeningRef.current = false;
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  async function startListening() {
    setHeard("");
    setReply("");
    setStatus(STATE.LISTENING);
    listeningRef.current = true;
    try {
      await Voice.start("hi-IN");
    } catch (e) {
      setStatus(STATE.IDLE);
    }
  }

  async function stopListening() {
    listeningRef.current = false;
    try {
      await Voice.stop();
    } catch (e) {
      // ignore
    }
  }

  async function handleCommand(text) {
    setStatus(STATE.THINKING);
    const command = parseCommand(text);

    switch (command.type) {
      case "ANSWER": {
        setReply(command.text);
        speakHindi(command.text);
        break;
      }
      case "TV_ON":
      case "TV_OFF":
      case "TV_VOLUME_UP":
      case "TV_VOLUME_DOWN": {
        const msg = "TV control is version mein shamil nahi hai.";
        setReply(msg);
        speakHindi(msg);
        break;
      }
      case "TRIGGER_SOS": {
        await handleSOS();
        break;
      }
      case "SHARE_LOCATION": {
        try {
          const loc = await getCurrentLocation();
          const msg = "Aapki location family ko bhej di gayi hai.";
          setReply(msg);
          speakHindi(msg);
        } catch (e) {
          const msg = "Location nahi mil paayi, permission check karein.";
          setReply(msg);
          speakHindi(msg);
        }
        break;
      }
      case "EMPTY": {
        setStatus(STATE.IDLE);
        return;
      }
      default: {
        // Local command nahi mila -> online general knowledge try karo
        const result = await askGeneralKnowledge(text);
        setReply(result.text);
        speakHindi(result.text);
      }
    }
    setStatus(STATE.IDLE);
  }

  async function handleSOS() {
    try {
      const contacts = await loadContacts();
      if (!contacts.length) {
        const msg = "Pehle Family Safety screen mein emergency contact add karein.";
        setReply(msg);
        speakHindi(msg);
        return;
      }
      const loc = await getCurrentLocation();
      await sendSOS(
        contacts.map((c) => c.phoneNumber),
        loc
      );
      const msg = "SOS message bhej diya gaya hai.";
      setReply(msg);
      speakHindi(msg);
    } catch (e) {
      const msg = "SOS bhejne mein dikkat aayi.";
      setReply(msg);
      speakHindi(msg);
    }
  }

  const micLabel =
    status === STATE.LISTENING
      ? "सुन रहा हूँ... (छोड़ने पर रुकेगा)"
      : status === STATE.THINKING
      ? "सोच रहा हूँ..."
      : "बोलने के लिए दबाकर रखें";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>वॉइस असिस्टेंट</Text>

      <View style={styles.transcriptBox}>
        {heard ? <Text style={styles.heardText}>आपने कहा: {heard}</Text> : null}
        {status === STATE.THINKING ? (
          <ActivityIndicator size="small" color="#4A90D9" />
        ) : null}
        {reply ? <Text style={styles.replyText}>{reply}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.micButton, status === STATE.LISTENING && styles.micButtonActive]}
        onPressIn={startListening}
        onPressOut={stopListening}
        activeOpacity={0.8}
      >
        <Text style={styles.micIcon}>🎤</Text>
      </TouchableOpacity>
      <Text style={styles.micLabel}>{micLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A2E",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
  },
  transcriptBox: {
    minHeight: 100,
    width: "100%",
    marginBottom: 40,
    alignItems: "center",
  },
  heardText: { color: "#AAAAAA", fontSize: 16, marginBottom: 10, textAlign: "center" },
  replyText: { color: "#FFFFFF", fontSize: 18, textAlign: "center", lineHeight: 26 },
  micButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E94560",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: "#0F9B8E",
    transform: [{ scale: 1.1 }],
  },
  micIcon: { fontSize: 60 },
  micLabel: { color: "#CCCCCC", marginTop: 20, fontSize: 15 },
});
