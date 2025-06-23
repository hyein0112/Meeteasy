import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={bgColor} translucent={true} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#4F8EF7",
          tabBarInactiveTintColor: "#bbb",
          tabBarLabelStyle: { fontWeight: "bold", fontSize: 13 },
          tabBarStyle: Platform.select({
            ios: { position: "absolute", backgroundColor: bgColor },
            default: { backgroundColor: bgColor },
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
    </>
  );
}
