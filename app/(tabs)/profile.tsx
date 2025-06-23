import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fb" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="account-circle" size={28} color="#4F8EF7" style={{ marginRight: 8 }} />
          <Text style={styles.title}>내 정보/설정</Text>
        </View>
        <View style={styles.menuBox}>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="account" size={22} color="#4F8EF7" style={{ marginRight: 12 }} />
            <Text style={styles.menuText}>프로필 관리</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="account-group" size={22} color="#4F8EF7" style={{ marginRight: 12 }} />
            <Text style={styles.menuText}>내 모임 관리</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="calendar-sync" size={22} color="#4F8EF7" style={{ marginRight: 12 }} />
            <Text style={styles.menuText}>캘린더 연동</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="bell" size={22} color="#4F8EF7" style={{ marginRight: 12 }} />
            <Text style={styles.menuText}>알림 설정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="logout" size={22} color="#4F8EF7" style={{ marginRight: 12 }} />
            <Text style={styles.menuText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#4F8EF7" },
  menuBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderColor: "#f0f0f0" },
  menuText: { fontSize: 17, color: "#222" },
});
