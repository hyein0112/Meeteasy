import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  category: "general" | "meeting" | "reminder";
}

const mockNotificationSettings: NotificationSetting[] = [
  {
    id: "push_notifications",
    title: "푸시 알림",
    description: "모임 관련 알림을 푸시로 받습니다",
    icon: "bell",
    isEnabled: true,
    category: "general",
  },
  {
    id: "email_notifications",
    title: "이메일 알림",
    description: "중요한 알림을 이메일로 받습니다",
    icon: "email",
    isEnabled: false,
    category: "general",
  },
  {
    id: "sms_notifications",
    title: "SMS 알림",
    description: "긴급한 알림을 문자로 받습니다",
    icon: "message-text",
    isEnabled: false,
    category: "general",
  },
  {
    id: "meeting_invites",
    title: "모임 초대",
    description: "새로운 모임 초대 알림",
    icon: "account-plus",
    isEnabled: true,
    category: "meeting",
  },
  {
    id: "meeting_updates",
    title: "모임 업데이트",
    description: "모임 정보 변경 알림",
    icon: "calendar-edit",
    isEnabled: true,
    category: "meeting",
  },
  {
    id: "meeting_reminders",
    title: "모임 리마인더",
    description: "모임 시작 전 알림",
    icon: "clock-alert",
    isEnabled: true,
    category: "reminder",
  },
  {
    id: "schedule_votes",
    title: "일정 투표",
    description: "새로운 일정 투표 알림",
    icon: "calendar-clock",
    isEnabled: true,
    category: "meeting",
  },
  {
    id: "chat_messages",
    title: "채팅 메시지",
    description: "새로운 채팅 메시지 알림",
    icon: "chat",
    isEnabled: false,
    category: "general",
  },
];

export default function NotificationSettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";

  const [settings, setSettings] = useState<NotificationSetting[]>(mockNotificationSettings);
  const [quietHours, setQuietHours] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");

  const toggleSetting = (id: string) => {
    setSettings((prev) => prev.map((setting) => (setting.id === id ? { ...setting, isEnabled: !setting.isEnabled } : setting)));
  };

  const toggleQuietHours = () => {
    setQuietHours(!quietHours);
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "general":
        return "일반 알림";
      case "meeting":
        return "모임 알림";
      case "reminder":
        return "리마인더";
      default:
        return "기타";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "general":
        return "cog";
      case "meeting":
        return "account-group";
      case "reminder":
        return "clock";
      default:
        return "bell";
    }
  };

  const renderSetting = (setting: NotificationSetting) => (
    <View key={setting.id} style={[styles.settingItem, { backgroundColor: cardColor }]}>
      <View style={styles.settingInfo}>
        <MaterialCommunityIcons name={setting.icon as any} size={20} color={infoColor} />
        <View style={styles.settingDetails}>
          <Text style={[styles.settingTitle, { color: textColor }]}>{setting.title}</Text>
          <Text style={[styles.settingDescription, { color: infoColor }]}>{setting.description}</Text>
        </View>
      </View>
      <Switch
        value={setting.isEnabled}
        onValueChange={() => toggleSetting(setting.id)}
        trackColor={{ false: "#767577", true: "#4F8EF7" }}
        thumbColor={setting.isEnabled ? "#fff" : "#f4f3f4"}
      />
    </View>
  );

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, NotificationSetting[]>);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        {/* 헤더 */}
        <View style={[styles.header, { backgroundColor: cardColor }]}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>알림 설정</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* 전체 알림 설정 */}
          <View style={[styles.section, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>전체 알림</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="volume-off" size={20} color={infoColor} />
                <Text style={[styles.settingText, { color: textColor }]}>방해 금지 시간</Text>
              </View>
              <Switch
                value={quietHours}
                onValueChange={toggleQuietHours}
                trackColor={{ false: "#767577", true: "#4F8EF7" }}
                thumbColor={quietHours ? "#fff" : "#f4f3f4"}
              />
            </View>

            {quietHours && (
              <View style={styles.quietHoursInfo}>
                <Text style={[styles.quietHoursText, { color: infoColor }]}>
                  {quietStart} ~ {quietEnd} (알림이 울리지 않습니다)
                </Text>
              </View>
            )}
          </View>

          {/* 카테고리별 알림 설정 */}
          {Object.entries(groupedSettings).map(([category, categorySettings]) => (
            <View key={category} style={[styles.section, { backgroundColor: cardColor }]}>
              <View style={styles.categoryHeader}>
                <MaterialCommunityIcons name={getCategoryIcon(category) as any} size={20} color={infoColor} />
                <Text style={[styles.sectionTitle, { color: textColor }]}>{getCategoryTitle(category)}</Text>
              </View>

              {categorySettings.map(renderSetting)}
            </View>
          ))}

          {/* 알림 테스트 */}
          <View style={[styles.section, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>알림 테스트</Text>
            <Text style={[styles.sectionDescription, { color: infoColor }]}>현재 설정으로 테스트 알림을 보냅니다</Text>

            <TouchableOpacity style={styles.testButton}>
              <MaterialCommunityIcons name="bell-ring" size={20} color="#fff" />
              <Text style={styles.testButtonText}>테스트 알림 보내기</Text>
            </TouchableOpacity>
          </View>

          {/* 알림 통계 */}
          <View style={[styles.section, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>알림 통계</Text>

            <View style={styles.statsItem}>
              <MaterialCommunityIcons name="bell" size={20} color="#4CAF50" />
              <Text style={[styles.statsText, { color: textColor }]}>오늘 받은 알림: 5개</Text>
            </View>

            <View style={styles.statsItem}>
              <MaterialCommunityIcons name="calendar-check" size={20} color="#4F8EF7" />
              <Text style={[styles.statsText, { color: textColor }]}>이번 주 모임 알림: 3개</Text>
            </View>

            <View style={styles.statsItem}>
              <MaterialCommunityIcons name="clock-alert" size={20} color="#FF9800" />
              <Text style={[styles.statsText, { color: textColor }]}>예정된 리마인더: 2개</Text>
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingDetails: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  quietHoursInfo: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginTop: 8,
  },
  quietHoursText: {
    fontSize: 14,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F8EF7",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  statsText: {
    fontSize: 14,
    marginLeft: 12,
  },
});
