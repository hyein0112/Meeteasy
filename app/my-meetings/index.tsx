import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface Meeting {
  id: string;
  name: string;
  date: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  type: "participating" | "created";
  participantCount: number;
  isConfirmed: boolean;
}

const mockMeetings: Meeting[] = [
  {
    id: "1",
    name: "React Native 스터디",
    date: "1월 25일 (목) 오후 3시",
    status: "upcoming",
    type: "created",
    participantCount: 5,
    isConfirmed: true,
  },
  {
    id: "2",
    name: "주말 등산 모임",
    date: "1월 27일 (토) 오전 9시",
    status: "upcoming",
    type: "participating",
    participantCount: 8,
    isConfirmed: true,
  },
  {
    id: "3",
    name: "프로젝트 회의",
    date: "1월 20일 (토) 오후 2시",
    status: "completed",
    type: "created",
    participantCount: 4,
    isConfirmed: true,
  },
  {
    id: "4",
    name: "친구들과 저녁 식사",
    date: "1월 22일 (월) 오후 7시",
    status: "cancelled",
    type: "participating",
    participantCount: 6,
    isConfirmed: false,
  },
];

export default function MyMeetingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";

  const [activeTab, setActiveTab] = useState<"all" | "participating" | "created">("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "#4CAF50";
      case "ongoing":
        return "#FF9800";
      case "completed":
        return "#2196F3";
      case "cancelled":
        return "#F44336";
      default:
        return infoColor;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "예정";
      case "ongoing":
        return "진행중";
      case "completed":
        return "완료";
      case "cancelled":
        return "취소됨";
      default:
        return "미정";
    }
  };

  const getTypeText = (type: string) => {
    return type === "created" ? "개설" : "참여";
  };

  const filteredMeetings = mockMeetings.filter((meeting) => {
    if (activeTab === "all") return true;
    return meeting.type === activeTab;
  });

  const renderMeeting = ({ item }: { item: Meeting }) => (
    <TouchableOpacity
      style={[styles.meetingCard, { backgroundColor: cardColor }]}
      onPress={() =>
        router.push({
          pathname: "/meeting-detail",
          params: { meetingName: item.name },
        } as any)
      }
    >
      <View style={styles.meetingHeader}>
        <View style={styles.meetingInfo}>
          <Text style={[styles.meetingName, { color: textColor }]}>{item.name}</Text>
          <View style={styles.meetingMeta}>
            <MaterialCommunityIcons name="calendar" size={14} color={infoColor} />
            <Text style={[styles.meetingDate, { color: infoColor }]}>{item.date}</Text>
          </View>
        </View>
        <View style={styles.meetingStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: item.type === "created" ? "#4F8EF7" : "#4CAF50" }]}>
            <Text style={styles.typeText}>{getTypeText(item.type)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.meetingFooter}>
        <View style={styles.participantInfo}>
          <MaterialCommunityIcons name="account-group" size={16} color={infoColor} />
          <Text style={[styles.participantCount, { color: infoColor }]}>참석자 {item.participantCount}명</Text>
        </View>

        <View style={styles.meetingActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="chat" size={16} color="#4F8EF7" />
            <Text style={[styles.actionText, { color: "#4F8EF7" }]}>채팅</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color="#FF9800" />
            <Text style={[styles.actionText, { color: "#FF9800" }]}>일정</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        {/* 헤더 */}
        <View style={[styles.header, { backgroundColor: cardColor }]}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>내 모임 관리</Text>
          <TouchableOpacity>
            <MaterialCommunityIcons name="plus" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* 탭 버튼 */}
        <View style={[styles.tabContainer, { backgroundColor: cardColor }]}>
          <TouchableOpacity style={[styles.tabButton, activeTab === "all" && styles.activeTabButton]} onPress={() => setActiveTab("all")}>
            <Text style={[styles.tabText, { color: activeTab === "all" ? "#4F8EF7" : infoColor }]}>전체 ({mockMeetings.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "participating" && styles.activeTabButton]}
            onPress={() => setActiveTab("participating")}
          >
            <Text style={[styles.tabText, { color: activeTab === "participating" ? "#4F8EF7" : infoColor }]}>
              참여 ({mockMeetings.filter((m) => m.type === "participating").length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "created" && styles.activeTabButton]}
            onPress={() => setActiveTab("created")}
          >
            <Text style={[styles.tabText, { color: activeTab === "created" ? "#4F8EF7" : infoColor }]}>
              개설 ({mockMeetings.filter((m) => m.type === "created").length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 모임 목록 */}
        <FlatList
          data={filteredMeetings}
          renderItem={renderMeeting}
          keyExtractor={(item) => item.id}
          style={styles.meetingList}
          contentContainerStyle={styles.meetingListContent}
          showsVerticalScrollIndicator={false}
        />
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
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#f0f8ff",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  meetingList: {
    flex: 1,
  },
  meetingListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  meetingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  meetingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  meetingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  meetingDate: {
    fontSize: 14,
  },
  meetingStatus: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  meetingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  participantCount: {
    fontSize: 14,
  },
  meetingActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
