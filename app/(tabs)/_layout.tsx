import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4F8EF7",
        tabBarInactiveTintColor: "#bbb",
        tabBarLabelStyle: { fontWeight: "bold", fontSize: 13 },
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "모임",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "캘린더",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="calendar-month" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "내 정보",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-circle" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
