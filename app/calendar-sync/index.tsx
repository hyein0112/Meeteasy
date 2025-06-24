import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface CalendarService {
  id: string;
  name: string;
  icon: string;
  color: string;
  isConnected: boolean;
  account?: string;
}

const mockCalendarServices: CalendarService[] = [
  {
    id: "google",
    name: "Google Calendar",
    icon: "google",
    color: "#4285F4",
    isConnected: true,
    account: "user@gmail.com",
  },
  {
    id: "apple",
    name: "Apple Calendar",
    icon: "apple",
    color: "#000000",
    isConnected: false,
  },
];

export default function CalendarSyncScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";

  const [calendarServices, setCalendarServices] = useState<CalendarService[]>(mockCalendarServices);
  const [autoSync, setAutoSync] = useState(true);
  const [syncNotifications, setSyncNotifications] = useState(true);

  const toggleCalendarConnection = (id: string) => {
    setCalendarServices((prev) => prev.map((service) => (service.id === id ? { ...service, isConnected: !service.isConnected } : service)));
  };

  const connectCalendar = (service: CalendarService) => {
    if (service.isConnected) {
      Alert.alert("연동 해제", `${service.name} 연동을 해제하시겠습니까?`, [
        { text: "취소", style: "cancel" },
        {
          text: "해제",
          style: "destructive",
          onPress: () => toggleCalendarConnection(service.id),
        },
      ]);
    } else {
      Alert.alert("캘린더 연동", `${service.name}에 로그인하여 연동하시겠습니까?`, [
        { text: "취소", style: "cancel" },
        {
          text: "연동",
          onPress: () => toggleCalendarConnection(service.id),
        },
      ]);
    }
  };

  const renderCalendarService = (service: CalendarService) => (
    <View key={service.id} style={[styles.serviceCard, { backgroundColor: cardColor }]}>
      <View style={styles.serviceInfo}>
        <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
          <MaterialCommunityIcons name={service.icon as any} size={24} color="#fff" />
        </View>
        <View style={styles.serviceDetails}>
          <Text style={[styles.serviceName, { color: textColor }]}>{service.name}</Text>
          {service.account && <Text style={[styles.serviceAccount, { color: infoColor }]}>{service.account}</Text>}
        </View>
      </View>

      <View style={styles.serviceActions}>
        <Switch
          value={service.isConnected}
          onValueChange={() => connectCalendar(service)}
          trackColor={{ false: "#767577", true: service.color }}
          thumbColor={service.isConnected ? "#fff" : "#f4f3f4"}
        />
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        {/* 헤더 */}
        <View style={[styles.header, { backgroundColor: cardColor }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>캘린더 연동</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* 연동된 캘린더 */}
          <View style={[styles.section, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>연동된 캘린더</Text>
            <Text style={[styles.sectionDescription, { color: infoColor }]}>모임 일정이 자동으로 캘린더에 추가됩니다</Text>

            {calendarServices.map(renderCalendarService)}
          </View>

          {/* 동기화 설정 */}
          <View style={[styles.section, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>동기화 설정</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="sync" size={20} color={infoColor} />
                <Text style={[styles.settingText, { color: textColor }]}>자동 동기화</Text>
              </View>
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: "#767577", true: "#4F8EF7" }}
                thumbColor={autoSync ? "#fff" : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="bell" size={20} color={infoColor} />
                <Text style={[styles.settingText, { color: textColor }]}>동기화 알림</Text>
              </View>
              <Switch
                value={syncNotifications}
                onValueChange={setSyncNotifications}
                trackColor={{ false: "#767577", true: "#4F8EF7" }}
                thumbColor={syncNotifications ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* 동기화 정보 */}
          <View style={[styles.section, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>동기화 정보</Text>

            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar-check" size={20} color="#4CAF50" />
              <Text style={[styles.infoText, { color: textColor }]}>마지막 동기화: 2024년 1월 15일 오후 3:30</Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar-plus" size={20} color="#4F8EF7" />
              <Text style={[styles.infoText, { color: textColor }]}>동기화된 모임: 12개</Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar-remove" size={20} color="#F44336" />
              <Text style={[styles.infoText, { color: textColor }]}>동기화 실패: 0개</Text>
            </View>
          </View>

          {/* 동기화 버튼 */}
          <TouchableOpacity style={styles.syncButton}>
            <MaterialCommunityIcons name="sync" size={20} color="#fff" />
            <Text style={styles.syncButtonText}>지금 동기화</Text>
          </TouchableOpacity>
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  serviceAccount: {
    fontSize: 14,
  },
  serviceActions: {
    marginLeft: 12,
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
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F8EF7",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 40,
    gap: 8,
  },
  syncButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
