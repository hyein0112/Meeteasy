import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { enableFirestoreNetwork } from "../../config/firebase";
import { MeetingService } from "../../services/meetingService";
import { useAuthStore } from "../../stores/authStore";
import { useMeetingStore } from "../../stores/meetingStore";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";

  const { user, userProfile } = useAuthStore();
  const { meetings, setMeetings, setLoading } = useMeetingStore();
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "error" | "loading">("loading");

  useEffect(() => {
    if (user) {
      setConnectionStatus("loading");
      const unsubscribe = MeetingService.subscribeToUserMeetings(user.uid, (meetings) => {
        setMeetings(meetings);
        setConnectionStatus("connected");
      });
      return () => unsubscribe();
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const handleReconnect = async () => {
    try {
      await enableFirestoreNetwork();
    } catch (error) {
      console.error("재연결 실패:", error);
      Alert.alert("재연결 실패", "네트워크 연결을 확인하고 다시 시도해주세요.");
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "planning":
        return "일정 조율 중";
      case "confirmed":
        return "확정";
      case "cancelled":
        return "취소됨";
      default:
        return "준비 중";
    }
  };

  const getDday = (date?: Date | Timestamp | null) => {
    if (!date) return null;

    let dateObj: Date;

    // Timestamp 객체인 경우 Date로 변환
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return null;
    }

    // 유효한 날짜인지 확인
    if (isNaN(dateObj.getTime())) {
      return null;
    }

    const today = new Date();
    const diffTime = dateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date?: Date | Timestamp | null) => {
    if (!date) return "일정 미정";

    let dateObj: Date;

    // Timestamp 객체인 경우 Date로 변환
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return "일정 미정";
    }

    // 유효한 날짜인지 확인
    if (isNaN(dateObj.getTime())) {
      return "일정 미정";
    }

    return dateObj.toLocaleDateString("ko-KR");
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <View style={[styles.container, { backgroundColor: bgColor }]}>
          <Text style={[styles.noAuthText, { color: textColor }]}>로그인이 필요합니다</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/onboarding")}>
            <Text style={styles.loginButtonText}>로그인하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        {connectionStatus === "loading" && (
          <View style={[styles.statusContainer, { backgroundColor: "#e3f2fd" }]}>
            <MaterialCommunityIcons name="wifi" size={20} color="#1976d2" />
            <Text style={[styles.statusText, { color: "#1976d2" }]}>Firestore 연결 중...</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.createBtn} onPress={() => router.push("/create-meeting")}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            <Text style={styles.createBtnText}>새 모임 만들기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.joinBtn}
            onPress={() => {
              Alert.prompt(
                "모임 참여",
                "초대 코드를 입력하세요",
                [
                  { text: "취소", style: "cancel" },
                  {
                    text: "참여",
                    onPress: async (inviteCode) => {
                      if (!inviteCode || !user) return;

                      try {
                        const meeting = await MeetingService.findMeetingByInviteCode(inviteCode);

                        if (!meeting) {
                          Alert.alert("오류", "유효하지 않은 초대 코드입니다.");
                          return;
                        }

                        const isAlreadyParticipant = meeting.participants.some((p) => p.id === user.uid);
                        if (isAlreadyParticipant) {
                          Alert.alert("알림", "이미 참여 중인 모임입니다.");
                          router.push({
                            pathname: "/meeting-detail",
                            params: { meetingId: meeting.id },
                          } as any);
                          return;
                        }

                        await MeetingService.addParticipant(meeting.id, {
                          id: user.uid,
                          name: userProfile?.name || user.displayName || user.email || "알 수 없음",
                          email: user.email || undefined,
                          profileImage: user.photoURL || undefined,
                          status: "pending",
                          joinedAt: new Date(),
                        });

                        Alert.alert("성공", "모임에 참여했습니다!", [
                          {
                            text: "확인",
                            onPress: () => {
                              router.push({
                                pathname: "/meeting-detail",
                                params: { meetingId: meeting.id },
                              } as any);
                            },
                          },
                        ]);
                      } catch (error) {
                        console.error("모임 참여 오류:", error);
                        Alert.alert("오류", "모임 참여에 실패했습니다.");
                      }
                    },
                  },
                ],
                "plain-text"
              );
            }}
          >
            <MaterialCommunityIcons name="account-group" size={20} color="#4F8EF7" />
            <Text style={styles.joinBtnText}>모임 참여</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={meetings}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const dday = getDday(item.confirmedDate);
            const isCreator = user?.uid === item.creatorId;
            const currentUserParticipant = item.participants.find((p) => p.id === user?.uid);

            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: cardColor }]}
                onPress={() =>
                  router.push({
                    pathname: "/meeting-detail",
                    params: { meetingId: item.id },
                  } as any)
                }
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.name, { color: textColor }]} numberOfLines={1} ellipsizeMode="tail">
                      {item.title}
                    </Text>
                  </View>
                  <Text style={[styles.info, { color: infoColor }]}>
                    {formatDate(item.confirmedDate)} · {getStatusText(item.status)}
                  </Text>
                  <Text style={[styles.description, { color: infoColor }]}>{item.description || "설명 없음"}</Text>
                  <Text style={[styles.creatorInfo, { color: infoColor }]}>방장: {item.creatorName}</Text>
                </View>
                <View style={styles.rightBox}>
                  {dday !== null && <Text style={styles.dday}>{`D-${dday}`}</Text>}
                  <Text style={[styles.participantCount, { color: infoColor }]}>{item.participants.length}명</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-outline" size={64} color={infoColor} />
              <Text style={[styles.emptyText, { color: textColor }]}>아직 모임이 없습니다</Text>
              <Text style={[styles.emptySubText, { color: infoColor }]}>새로운 모임을 만들어보세요!</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
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
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  reconnectButton: {
    backgroundColor: "#d32f2f",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  reconnectButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F8EF7",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  info: {
    fontSize: 14,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  rightBox: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 48,
  },
  dday: {
    color: "#4F8EF7",
    fontWeight: "bold",
    fontSize: 15,
  },
  participantCount: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
  },
  noAuthText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#4F8EF7",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignSelf: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#4F8EF7",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 8,
  },
  joinBtnText: {
    color: "#4F8EF7",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 8,
  },
  roleBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  creatorInfo: {
    fontSize: 12,
    marginTop: 4,
  },
});
