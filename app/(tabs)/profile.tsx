import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const menuTextColor = isDark ? "#eee" : "#222";
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="account-circle" size={28} color="#4F8EF7" style={{ marginRight: 8 }} />
          <Text style={[styles.title, { color: textColor }]}>내 정보/설정</Text>
        </View>
        <View style={[styles.menuBox, { backgroundColor: cardColor }]}>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="account" size={22} color="#4F8EF7" style={{ marginRight: 12 }} />
            <Text style={[styles.menuText, { color: menuTextColor }]}>프로필 관리</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="account-group" size={22} color="#4F8EF7" style={{ marginRight: 12 }} />
            <Text style={[styles.menuText, { color: menuTextColor }]}>내 모임 관리</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="calendar-sync" size={22} color="#4F8EF7" style={{ marginRight: 12 }} />
            <Text style={[styles.menuText, { color: menuTextColor }]}>캘린더 연동</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="bell" size={22} color="#4F8EF7" style={{ marginRight: 12 }} />
            <Text style={[styles.menuText, { color: menuTextColor }]}>알림 설정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="logout" size={22} color="#4F8EF7" style={{ marginRight: 12 }} />
            <Text style={[styles.menuText, { color: menuTextColor }]}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold" },
  menuBox: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderColor: "#f0f0f0" },
  menuText: { fontSize: 17 },
});
