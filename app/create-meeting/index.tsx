import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";

export default function CreateMeetingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const borderColor = isDark ? "#333" : "#e0e0e0";

  const [meetingName, setMeetingName] = useState("");
  const [purpose, setPurpose] = useState("");

  const createMeeting = () => {
    if (!meetingName.trim()) {
      Alert.alert("알림", "모임명을 입력해주세요.");
      return;
    }

    // 모임 생성 후 초대 화면으로 이동
    const meetingData = {
      name: meetingName,
      purpose,
      createdAt: new Date().toISOString(),
    };

    router.push({
      pathname: "/invite",
      params: { meetingData: JSON.stringify(meetingData) },
    } as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>새 모임 만들기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 모임명 */}
        <View style={[styles.section, { backgroundColor: cardColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>모임명 *</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="모임명을 입력하세요"
            placeholderTextColor={isDark ? "#666" : "#999"}
            value={meetingName}
            onChangeText={setMeetingName}
          />
        </View>

        {/* 모임 목적 */}
        <View style={[styles.section, { backgroundColor: cardColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>모임 목적 (선택)</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="모임 목적을 입력하세요"
            placeholderTextColor={isDark ? "#666" : "#999"}
            value={purpose}
            onChangeText={setPurpose}
          />
        </View>

        {/* 생성 버튼 */}
        <TouchableOpacity style={styles.createButton} onPress={createMeeting}>
          <Text style={styles.createButtonText}>모임 생성하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: "#4F8EF7",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
