import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";

import VoiceAssistantScreen from "./src/screens/VoiceAssistantScreen";
import FamilySafetyScreen from "./src/screens/FamilySafetyScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Tab = createBottomTabNavigator();

const ICONS = {
  Assistant: "🎤",
  Safety: "🛡️",
  Settings: "⚙️",
};

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: "#E94560",
            tabBarInactiveTintColor: "#888",
            tabBarStyle: { backgroundColor: "#16162A" },
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONS[route.name]}</Text>,
          })}
        >
          <Tab.Screen
            name="Assistant"
            component={VoiceAssistantScreen}
            options={{ title: "असिस्टेंट" }}
          />
          <Tab.Screen
            name="Safety"
            component={FamilySafetyScreen}
            options={{ title: "सेफ्टी" }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: "सेटिंग्स" }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
