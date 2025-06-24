import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
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

  const { user } = useAuthStore();
  const { meetings, setMeetings, setLoading } = useMeetingStore();
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "error" | "loading">("loading");

  useEffect(() => {
    if (user) {
      loadUserMeetings();
      setupRealtimeListener();
    }
  }, [user]);

  const loadUserMeetings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setConnectionStatus("loading");
      const userMeetings = await MeetingService.fetchUserMeetings(user.uid);
      setMeetings(userMeetings);
      setConnectionStatus("connected");
    } catch (error) {
      console.error("모임 목록 로드 오류:", error);
      setConnectionStatus("error");
      Alert.alert("연결 오류", "Firestore 연결에 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.", [
        { text: "취소", style: "cancel" },
        { text: "재시도", onPress: loadUserMeetings },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    if (!user) return;

    const unsubscribe = MeetingService.subscribeToUserMeetings(user.uid, (meetings) => {
      setMeetings(meetings);
      setConnectionStatus("connected");
    });

    return unsubscribe;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserMeetings();
    setRefreshing(false);
  };

  const handleReconnect = async () => {
    try {
      await enableFirestoreNetwork();
      await loadUserMeetings();
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

  const getDday = (date?: Date) => {
    if (!date) return null;
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date?: Date) => {
    if (!date) return "일정 미정";
    return date.toLocaleDateString("ko-KR");
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

        <TouchableOpacity style={styles.createBtn} onPress={() => router.push("/create-meeting/index")}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.createBtnText}>새 모임 만들기</Text>
        </TouchableOpacity>

        <FlatList
          data={meetings}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const dday = getDday(item.confirmedDate);
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: cardColor }]}
                onPress={() =>
                  router.push({
                    pathname: "/meeting-detail/index",
                    params: { meetingId: item.id },
                  } as any)
                }
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: textColor }]}>{item.title}</Text>
                  <Text style={[styles.info, { color: infoColor }]}>
                    {formatDate(item.confirmedDate)} · {getStatusText(item.status)}
                  </Text>
                  <Text style={[styles.description, { color: infoColor }]}>{item.description || "설명 없음"}</Text>
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
    alignSelf: "center",
    marginBottom: 18,
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
});
