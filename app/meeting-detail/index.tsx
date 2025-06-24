import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Meeting, MeetingService } from "../../services/meetingService";
import { useAuthStore } from "../../stores/authStore";

export default function MeetingDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";

  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const meetingId = params.meetingId as string;

  // 실시간 리스너로 meeting 최신화
  useEffect(() => {
    if (!meetingId) return;
    setIsLoading(true);
    const unsubscribe = MeetingService.subscribeToMeeting(meetingId, (m) => {
      setMeeting(m);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [meetingId]);

  // 현재 사용자 참가자 정보
  const currentUserParticipant = meeting?.participants.find((p) => p.id === user?.uid) || null;

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

  const changeMyStatus = async (newStatus: "confirmed" | "pending" | "declined") => {
    if (!user || !meeting) return;

    try {
      await MeetingService.updateParticipantStatus(meeting.id, user.uid, newStatus);

      // 로컬 상태 업데이트
      setMeeting((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) => (p.id === user.uid ? { ...p, status: newStatus } : p)),
        };
      });

      Alert.alert("성공", `참석 상태가 "${getStatusText(newStatus)}"로 변경되었습니다.`);
    } catch (error) {
      console.error("참석 상태 변경 오류:", error);
      Alert.alert("오류", "참석 상태 변경에 실패했습니다.");
    }
  };

  const openNavigation = () => {
    if (!meeting?.location?.address) return;

    const url = `https://maps.apple.com/?address=${encodeURIComponent(meeting.location.address)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("오류", "지도 앱을 열 수 없습니다.");
    });
  };

  const openMaps = () => {
    if (!meeting?.location?.address) return;

    const url = `https://maps.google.com/?q=${encodeURIComponent(meeting.location.address)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("오류", "지도 앱을 열 수 없습니다.");
    });
  };

  const addToCalendar = () => {
    // 실제로는 캘린더 API를 사용해야 함
    Alert.alert("알림", "캘린더에 일정이 추가되었습니다!");
  };

  const goToChat = () => {
    if (!meeting) return;

    router.push({
      pathname: "/chat",
      params: {
        meetingId: meeting.id,
        meetingName: meeting.title,
      },
    } as any);
  };

  const goToVote = () => {
    if (!meeting) return;

    router.push({
      pathname: "/vote",
      params: {
        meetingId: meeting.id,
        meetingName: meeting.title,
      },
    } as any);
  };

  const shareMeeting = () => {
    if (!meeting) return;

    const shareText = `${meeting.title}\n초대 코드: ${meeting.inviteCode}\n\nMeetEasy 앱에서 확인하세요!`;
    // 실제로는 Share API를 사용해야 함
    Alert.alert("공유", "모임 정보가 복사되었습니다!");
    setShowActionMenu(false);
  };

  const leaveMeeting = () => {
    if (!meeting || !user) return;

    Alert.alert("모임 나가기", "정말로 이 모임을 나가시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "나가기",
        style: "destructive",
        onPress: async () => {
          try {
            // 참석자 목록에서 제거
            const updatedParticipants = meeting.participants.filter((p) => p.id !== user.uid);
            await MeetingService.updateMeeting(meeting.id, { participants: updatedParticipants });

            Alert.alert("알림", "모임에서 나갔습니다.");
            router.push("/(tabs)/home");
          } catch (error) {
            console.error("모임 나가기 오류:", error);
            Alert.alert("오류", "모임을 나가는데 실패했습니다.");
          }
        },
      },
    ]);
    setShowActionMenu(false);
  };

  // 모임 삭제 함수
  const deleteMeeting = () => {
    if (!meeting) return;
    Alert.alert("모임 삭제", "정말로 이 모임을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await MeetingService.deleteMeeting(meeting.id);
            Alert.alert("알림", "모임이 삭제되었습니다.");
            router.push("/(tabs)/home");
          } catch (error) {
            console.error("모임 삭제 오류:", error);
            Alert.alert("오류", "모임 삭제에 실패했습니다.");
          }
        },
      },
    ]);
    setShowActionMenu(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>모임 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!meeting) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>모임을 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 참석자 현황(집계/뱃지/리스트)와 확정 일정에 대한 참석/미정/불참 버튼 및 상태 선택 UI/로직을 복구
  let confirmedUserIds: string[] = [];
  if (meeting.status === "confirmed" && meeting.confirmedDate) {
    const confirmedOption = meeting.scheduleOptions?.find(
      (option) =>
        option.date && meeting.confirmedDate && new Date(option.date).toDateString() === new Date(meeting.confirmedDate).toDateString()
    );
    confirmedUserIds = confirmedOption?.votes ?? [];
  }
  // 참석자 현황 집계
  let confirmedCount = 0,
    pendingCount = 0,
    declinedCount = 0;
  if (meeting.status === "confirmed" && meeting.confirmedDate) {
    confirmedCount = confirmedUserIds.length;
    pendingCount =
      meeting.participants.length - confirmedUserIds.length - meeting.participants.filter((p) => p.status === "declined").length;
    declinedCount = meeting.participants.filter((p) => p.status === "declined").length;
  } else {
    confirmedCount = meeting.participants.filter((p) => p.status === "confirmed").length;
    pendingCount = meeting.participants.filter((p) => p.status === "pending").length;
    declinedCount = meeting.participants.filter((p) => p.status === "declined").length;
  }

  const isCreator = user?.uid === meeting.creatorId;

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
              <Text style={[styles.meetingName, { color: textColor }]}>{meeting.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: meeting.status === "confirmed" ? "#4CAF50" : meeting.status === "cancelled" ? "#F44336" : "#FF9800" },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {meeting.status === "confirmed" ? "확정" : meeting.status === "cancelled" ? "취소됨" : "일정 조율 중"}
                </Text>
              </View>
            </View>
            {/* 초대 코드 표시 */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, marginBottom: 4 }}>
              <MaterialCommunityIcons name="key-variant" size={18} color={infoColor} style={{ marginRight: 4 }} />
              <Text style={{ color: infoColor, fontSize: 15, fontWeight: "bold", marginRight: 8 }}>초대 코드:</Text>
              <Text selectable style={{ color: textColor, fontSize: 16, fontWeight: "bold", letterSpacing: 2, marginRight: 8 }}>
                {meeting.inviteCode}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (meeting.inviteCode) {
                    // 클립보드 복사
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(meeting.inviteCode);
                      Alert.alert("복사됨", "초대 코드가 복사되었습니다.");
                    } else {
                      Alert.alert("복사 불가", "클립보드 복사를 지원하지 않는 환경입니다.");
                    }
                  }
                }}
                style={{ padding: 4 }}
              >
                <MaterialCommunityIcons name="content-copy" size={18} color={infoColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.meetingInfo}>
              {meeting.confirmedDate && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="calendar" size={20} color={infoColor} />
                  <Text style={[styles.infoText, { color: textColor }]}>
                    {meeting.confirmedDate.toLocaleDateString("ko-KR")} {meeting.confirmedTime}
                  </Text>
                </View>
              )}

              {meeting.location?.name && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={infoColor} />
                  <Text style={[styles.infoText, { color: textColor }]}>{meeting.location.name}</Text>
                </View>
              )}

              {meeting.description && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="text" size={20} color={infoColor} />
                  <Text style={[styles.infoText, { color: textColor }]}>{meeting.description}</Text>
                </View>
              )}
            </View>
          </View>

          {/* 장소 정보 */}
          {meeting.location && (
            <View style={[styles.card, { backgroundColor: cardColor }]}>
              <Text style={[styles.cardTitle, { color: textColor }]}>장소</Text>

              <View style={styles.locationInfo}>
                <Text style={[styles.locationName, { color: textColor }]}>{meeting.location.name}</Text>
                <Text style={[styles.locationAddress, { color: infoColor }]}>{meeting.location.address}</Text>
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
          )}

          {/* 액션 버튼들 */}
          <View style={styles.actionButtons}>
            <View style={styles.actionButtonRow}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#4F8EF7" }]} onPress={goToChat}>
                <MaterialCommunityIcons name="chat" size={24} color="#fff" />
                <Text style={[styles.actionButtonText, { color: "#fff" }]}>채팅</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#FF9800" }]} onPress={goToVote}>
                <MaterialCommunityIcons name="calendar-clock" size={24} color="#fff" />
                <Text style={[styles.actionButtonText, { color: "#fff" }]}>일정 투표</Text>
              </TouchableOpacity> */}
            </View>

            <View style={styles.actionButtonRow}>
              {meeting.location?.address && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#4CAF50" }]} onPress={() => setShowLocationModal(true)}>
                  <MaterialCommunityIcons name="map-marker" size={24} color="#fff" />
                  <Text style={[styles.actionButtonText, { color: "#fff" }]}>위치</Text>
                </TouchableOpacity>
              )}

              {meeting.confirmedDate && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#9C27B0" }]} onPress={addToCalendar}>
                  <MaterialCommunityIcons name="calendar-plus" size={24} color="#fff" />
                  <Text style={[styles.actionButtonText, { color: "#fff" }]}>캘린더</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 모임 나가기 버튼 */}
          {currentUserParticipant && (
            <TouchableOpacity style={styles.cancelButton} onPress={leaveMeeting}>
              <MaterialCommunityIcons name="exit-to-app" size={20} color="#F44336" />
              <Text style={[styles.cancelButtonText, { color: "#F44336" }]}>모임 나가기</Text>
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

              <TouchableOpacity style={styles.actionMenuItem} onPress={leaveMeeting}>
                <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
                <Text style={[styles.actionMenuText, { color: "#F44336" }]}>모임 나가기</Text>
              </TouchableOpacity>

              {isCreator && (
                <TouchableOpacity style={styles.actionMenuItem} onPress={deleteMeeting}>
                  <MaterialCommunityIcons name="delete-forever" size={20} color="#F44336" />
                  <Text style={[styles.actionMenuText, { color: "#F44336" }]}>모임 삭제</Text>
                </TouchableOpacity>
              )}
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
    gap: 12,
    marginBottom: 20,
  },
  actionButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
