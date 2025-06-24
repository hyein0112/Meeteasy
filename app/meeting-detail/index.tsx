import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";

interface Participant {
  name: string;
  color: string;
  status: "confirmed" | "pending" | "declined"; // 확정, 미정, 불참
  profileImage?: string;
}

interface MeetingDetail {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  locationAddress: string;
  description: string;
  participants: Participant[];
  isConfirmed: boolean;
}

const mockMeeting: MeetingDetail = {
  id: "1",
  name: "스터디 모임",
  date: "1월 25일 (목)",
  time: "오후 3시",
  location: "스타벅스 강남점",
  locationAddress: "서울특별시 강남구 테헤란로 123",
  description: "React Native 스터디 모임입니다. 각자 준비한 내용을 공유하고 토론해보겠습니다.",
  participants: [
    { name: "김철수", color: "#FF6B6B", status: "confirmed" },
    { name: "이영희", color: "#4ECDC4", status: "confirmed" },
    { name: "박민수", color: "#45B7D1", status: "pending" },
    { name: "나", color: "#96CEB4", status: "confirmed" },
  ],
  isConfirmed: true,
};

export default function MeetingDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";

  const params = useLocalSearchParams();
  const [meeting, setMeeting] = useState<MeetingDetail>(mockMeeting);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "declined":
        return "#F44336";
      default:
        return infoColor;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "확정";
      case "pending":
        return "미정";
      case "declined":
        return "불참";
      default:
        return "미정";
    }
  };

  const openNavigation = () => {
    const url = `https://maps.apple.com/?address=${encodeURIComponent(meeting.locationAddress)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("오류", "지도 앱을 열 수 없습니다.");
    });
  };

  const openMaps = () => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(meeting.locationAddress)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("오류", "지도 앱을 열 수 없습니다.");
    });
  };

  const addToCalendar = () => {
    // 실제로는 캘린더 API를 사용해야 함
    Alert.alert("알림", "캘린더에 일정이 추가되었습니다!");
  };

  const changeStatus = (participantName: string, newStatus: "confirmed" | "pending" | "declined") => {
    setMeeting((prev) => ({
      ...prev,
      participants: prev.participants.map((p) => (p.name === participantName ? { ...p, status: newStatus } : p)),
    }));
  };

  const cancelMeeting = () => {
    Alert.alert("모임 취소", "정말로 이 모임을 취소하시겠습니까?", [
      { text: "아니오", style: "cancel" },
      {
        text: "취소",
        style: "destructive",
        onPress: () => {
          setMeeting((prev) => ({ ...prev, isConfirmed: false }));
          Alert.alert("알림", "모임이 취소되었습니다.");
        },
      },
    ]);
  };

  const goToChat = () => {
    router.push({
      pathname: "/chat",
      params: { meetingName: meeting.name },
    } as any);
  };

  const shareMeeting = () => {
    const shareText = `${meeting.name}\n${meeting.date} ${meeting.time}\n${meeting.location}\n\nMeetEasy 앱에서 확인하세요!`;
    // 실제로는 Share API를 사용해야 함
    Alert.alert("공유", "모임 정보가 복사되었습니다!");
    setShowActionMenu(false);
  };

  const editMeeting = () => {
    Alert.alert("편집", "모임 편집 기능은 준비 중입니다.");
    setShowActionMenu(false);
  };

  const deleteMeeting = () => {
    Alert.alert("모임 삭제", "정말로 이 모임을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          Alert.alert("알림", "모임이 삭제되었습니다.");
          router.back();
        },
      },
    ]);
    setShowActionMenu(false);
  };

  const exportToCalendar = () => {
    Alert.alert("알림", "캘린더 파일이 생성되었습니다!");
    setShowActionMenu(false);
  };

  const confirmedCount = meeting.participants.filter((p) => p.status === "confirmed").length;
  const pendingCount = meeting.participants.filter((p) => p.status === "pending").length;
  const declinedCount = meeting.participants.filter((p) => p.status === "declined").length;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>모임 상세</Text>
          <TouchableOpacity onPress={() => setShowActionMenu(true)}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* 모임 정보 */}
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <View style={styles.meetingHeader}>
              <Text style={[styles.meetingName, { color: textColor }]}>{meeting.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: meeting.isConfirmed ? "#4CAF50" : "#F44336" }]}>
                <Text style={styles.statusBadgeText}>{meeting.isConfirmed ? "확정" : "취소됨"}</Text>
              </View>
            </View>

            <View style={styles.meetingInfo}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar" size={20} color={infoColor} />
                <Text style={[styles.infoText, { color: textColor }]}>
                  {meeting.date} {meeting.time}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color={infoColor} />
                <Text style={[styles.infoText, { color: textColor }]}>{meeting.location}</Text>
              </View>

              <Text style={[styles.description, { color: infoColor }]}>{meeting.description}</Text>
            </View>
          </View>

          {/* 참석자 현황 */}
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>참석자 현황</Text>

            <View style={styles.participantStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#4CAF50" }]}>{confirmedCount}</Text>
                <Text style={[styles.statLabel, { color: infoColor }]}>확정</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#FF9800" }]}>{pendingCount}</Text>
                <Text style={[styles.statLabel, { color: infoColor }]}>미정</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#F44336" }]}>{declinedCount}</Text>
                <Text style={[styles.statLabel, { color: infoColor }]}>불참</Text>
              </View>
            </View>

            <View style={styles.participantList}>
              {meeting.participants.map((participant) => (
                <View key={participant.name} style={styles.participantItem}>
                  <View style={styles.participantInfo}>
                    <View style={[styles.participantDot, { backgroundColor: participant.color }]} />
                    <Text style={[styles.participantName, { color: textColor }]}>{participant.name}</Text>
                  </View>

                  <View style={styles.participantActions}>
                    <View style={[styles.statusChip, { backgroundColor: getStatusColor(participant.status) }]}>
                      <Text style={styles.statusChipText}>{getStatusText(participant.status)}</Text>
                    </View>

                    {participant.name === "나" && (
                      <View style={styles.statusButtons}>
                        <TouchableOpacity
                          style={[styles.statusButton, { backgroundColor: "#4CAF50" }]}
                          onPress={() => changeStatus("나", "confirmed")}
                        >
                          <Text style={styles.statusButtonText}>참석</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.statusButton, { backgroundColor: "#FF9800" }]}
                          onPress={() => changeStatus("나", "pending")}
                        >
                          <Text style={styles.statusButtonText}>미정</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.statusButton, { backgroundColor: "#F44336" }]}
                          onPress={() => changeStatus("나", "declined")}
                        >
                          <Text style={styles.statusButtonText}>불참</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 장소 정보 */}
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>장소</Text>

            <View style={styles.locationInfo}>
              <Text style={[styles.locationName, { color: textColor }]}>{meeting.location}</Text>
              <Text style={[styles.locationAddress, { color: infoColor }]}>{meeting.locationAddress}</Text>
            </View>

            <View style={styles.locationActions}>
              <TouchableOpacity style={styles.locationButton} onPress={openMaps}>
                <MaterialCommunityIcons name="map" size={20} color="#4F8EF7" />
                <Text style={[styles.locationButtonText, { color: "#4F8EF7" }]}>지도 보기</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.locationButton} onPress={openNavigation}>
                <MaterialCommunityIcons name="navigation" size={20} color="#4CAF50" />
                <Text style={[styles.locationButtonText, { color: "#4CAF50" }]}>길찾기</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 액션 버튼들 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={addToCalendar}>
              <MaterialCommunityIcons name="calendar-plus" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>캘린더에 추가</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={goToChat}>
              <MaterialCommunityIcons name="chat" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>채팅방 입장</Text>
            </TouchableOpacity>
          </View>

          {/* 모임 취소 버튼 */}
          {meeting.isConfirmed && (
            <TouchableOpacity style={styles.cancelButton} onPress={cancelMeeting}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />
              <Text style={[styles.cancelButtonText, { color: "#F44336" }]}>모임 취소</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* 액션 메뉴 모달 */}
        <Modal visible={showActionMenu} transparent={true} animationType="fade" onRequestClose={() => setShowActionMenu(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowActionMenu(false)}>
            <View style={[styles.actionMenu, { backgroundColor: cardColor }]}>
              <TouchableOpacity style={styles.actionMenuItem} onPress={shareMeeting}>
                <MaterialCommunityIcons name="share-variant" size={20} color={textColor} />
                <Text style={[styles.actionMenuText, { color: textColor }]}>모임 공유</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionMenuItem} onPress={editMeeting}>
                <MaterialCommunityIcons name="pencil" size={20} color={textColor} />
                <Text style={[styles.actionMenuText, { color: textColor }]}>모임 편집</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionMenuItem} onPress={exportToCalendar}>
                <MaterialCommunityIcons name="calendar-export" size={20} color={textColor} />
                <Text style={[styles.actionMenuText, { color: textColor }]}>캘린더 내보내기</Text>
              </TouchableOpacity>

              <View style={styles.actionMenuDivider} />

              <TouchableOpacity style={styles.actionMenuItem} onPress={deleteMeeting}>
                <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
                <Text style={[styles.actionMenuText, { color: "#F44336" }]}>모임 삭제</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  meetingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  meetingName: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  meetingInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  participantStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  participantList: {
    gap: 12,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  participantDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "500",
  },
  participantActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusChipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusButtons: {
    flexDirection: "row",
    gap: 4,
  },
  statusButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    lineHeight: 20,
  },
  locationActions: {
    flexDirection: "row",
    gap: 12,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4F8EF7",
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F44336",
    marginBottom: 40,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  actionMenu: {
    marginTop: 100,
    marginRight: 20,
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  actionMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionMenuText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
  actionMenuDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 4,
  },
});
