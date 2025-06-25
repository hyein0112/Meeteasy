import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { AuthService } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const menuTextColor = isDark ? "#eee" : "#222";

  const { userProfile } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말로 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await AuthService.signOut();
            router.replace("/onboarding");
          } catch (error) {
            Alert.alert("오류", "로그아웃에 실패했습니다. 다시 시도해 주세요.");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert("회원탈퇴", "정말로 회원탈퇴 하시겠습니까? 모든 데이터가 삭제됩니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "탈퇴",
        style: "destructive",
        onPress: async () => {
          try {
            await AuthService.deleteAccount();
            router.replace("/onboarding");
          } catch (error: any) {
            Alert.alert("오류", error.message || "회원탈퇴에 실패했습니다.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="account-circle" size={28} color="#4F8EF7" style={{ marginRight: 8 }} />
          <Text style={[styles.title, { color: textColor }]}>내 정보</Text>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={{ color: textColor, fontSize: 15 }}>{userProfile?.email || ""}</Text>
          </View>
        </View>
        <View style={[styles.menuBox, { backgroundColor: cardColor }]}>
          {/* <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/calendar-sync")}>
            <MaterialCommunityIcons name="calendar-sync" size={22} color="#4F8EF7" style={{ marginRight: 12 }} />
            <Text style={[styles.menuText, { color: menuTextColor }]}>캘린더 연동</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={22} color="#F44336" style={{ marginRight: 12 }} />
            <Text style={[styles.menuText, { color: "#F44336" }]}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
            <MaterialCommunityIcons name="account-remove" size={22} color="#F44336" style={{ marginRight: 12 }} />
            <Text style={[styles.menuText, { color: "#F44336" }]}>회원탈퇴</Text>
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
