import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { useAuthStore } from "../../stores/authStore";

interface UserProfile {
  name: string;
  email: string;
}

export default function ProfileEditScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";
  const borderColor = isDark ? "#333" : "#e0e0e0";

  const { userProfile } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile>({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const saveProfile = () => {
    // 실제로는 서버에 저장하는 로직이 들어가야 함
    Alert.alert("성공", "프로필이 저장되었습니다!");
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setProfile({
      name: userProfile?.name || "",
      email: userProfile?.email || "",
    });
    setIsEditing(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        {/* 헤더 */}
        <View style={[styles.header, { backgroundColor: cardColor }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>프로필 편집</Text>
          <View style={styles.headerActions}>
            {isEditing ? (
              <>
                <TouchableOpacity onPress={cancelEdit}>
                  <Text style={[styles.headerButton, { color: infoColor }]}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveProfile}>
                  <Text style={[styles.headerButton, { color: "#4F8EF7" }]}>저장</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={[styles.headerButton, { color: "#4F8EF7" }]}>편집</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* 프로필 정보 */}
          <View style={[styles.infoSection, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>기본 정보</Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: infoColor }]}>이름</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: textColor,
                    borderColor: borderColor,
                    backgroundColor: isEditing ? (isDark ? "#2A2D36" : "#f8f9fa") : "transparent",
                  },
                ]}
                value={profile.name}
                onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
                editable={isEditing}
                placeholder="이름을 입력하세요"
                placeholderTextColor={infoColor}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: infoColor }]}>이메일</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: textColor,
                    borderColor: borderColor,
                    backgroundColor: isEditing ? (isDark ? "#2A2D36" : "#f8f9fa") : "transparent",
                  },
                ]}
                value={profile.email}
                onChangeText={(text) => setProfile((prev) => ({ ...prev, email: text }))}
                editable={isEditing}
                placeholder="이메일을 입력하세요"
                placeholderTextColor={infoColor}
                keyboardType="email-address"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileImageSection: {
    alignItems: "center",
    paddingVertical: 32,
    marginTop: 16,
    borderRadius: 12,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4F8EF7",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
  },
  infoSection: {
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
});
