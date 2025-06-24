import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Meeting, MeetingService, ScheduleOption } from "../../services/meetingService";
import { useAuthStore } from "../../stores/authStore";

interface CalendarDate {
  date: string; // YYYY-MM-DD 형식
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
}

// 날짜 변환 유틸
function toDateString(date: any) {
  if (!date) return "";

  let dateObj: Date;

  // Timestamp 객체인 경우 Date로 변환
  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string") {
    dateObj = new Date(date);
  } else {
    return "";
  }

  // 유효한 날짜인지 확인
  if (isNaN(dateObj.getTime())) {
    return "";
  }

  return dateObj.toLocaleDateString("ko-KR");
}

export default function VoteScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";

  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("오후 2시");
  const [isLoading, setIsLoading] = useState(true);

  const meetingId = params.meetingId as string;
  const meetingName = params.meetingName as string;

  useEffect(() => {
    if (meetingId) {
      loadMeetingData();
    }
  }, [meetingId]);

  const loadMeetingData = async () => {
    if (!meetingId) return;

    try {
      setIsLoading(true);
      const meetingData = await MeetingService.getMeeting(meetingId);

      if (!meetingData) {
        Alert.alert("오류", "모임을 찾을 수 없습니다.");
        router.back();
        return;
      }

      setMeeting(meetingData);
      setScheduleOptions(meetingData.scheduleOptions || []);
    } catch (error) {
      console.error("모임 데이터 로드 오류:", error);
      Alert.alert("오류", "모임 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const timeOptions = [
    "상관없음",
    "오전 9시",
    "오전 10시",
    "오전 11시",
    "오후 12시",
    "오후 1시",
    "오후 2시",
    "오후 3시",
    "오후 4시",
    "오후 5시",
    "오후 6시",
    "오후 7시",
    "오후 8시",
  ];

  // 캘린더 날짜 생성
  const generateCalendarDates = (date: Date): CalendarDate[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const dates: CalendarDate[] = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dateString = currentDate.toISOString().split("T")[0];
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = dateString === today.toISOString().split("T")[0];

      dates.push({
        date: dateString,
        day: currentDate.getDate(),
        isCurrentMonth,
        isSelected: selectedDates.includes(dateString),
        isToday,
      });
    }

    return dates;
  };

  // 날짜 선택/해제
  const toggleDate = (date: string) => {
    setSelectedDates((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]));
  };

  // 선택된 날짜들을 일정 후보로 추가
  const addSelectedDates = async () => {
    if (!meetingId || selectedDates.length === 0) {
      Alert.alert("알림", "날짜를 선택해주세요.");
      return;
    }

    try {
      const newOptions: ScheduleOption[] = selectedDates.map((date) => {
        const dateObj = new Date(date);
        return {
          id: Date.now().toString() + Math.random(),
          date: dateObj,
          time: selectedTime,
          votes: [],
        };
      });

      // 각 옵션을 Firestore에 추가
      for (const option of newOptions) {
        await MeetingService.addScheduleOption(meetingId, option);
      }

      setScheduleOptions([...scheduleOptions, ...newOptions]);
      setSelectedDates([]);
      setShowCalendar(false);

      Alert.alert("성공", "일정 후보가 추가되었습니다.");
    } catch (error) {
      console.error("일정 추가 오류:", error);
      Alert.alert("오류", "일정 추가에 실패했습니다.");
    }
  };

  const toggleVote = async (optionId: string) => {
    if (!user || !meetingId) return;

    try {
      await MeetingService.voteSchedule(meetingId, optionId, user.uid);

      // 로컬 상태 업데이트
      setScheduleOptions((prev) =>
        prev.map((option) => {
          if (option.id === optionId) {
            const isVoted = option.votes.includes(user.uid);
            return {
              ...option,
              votes: isVoted ? option.votes.filter((v) => v !== user.uid) : [...option.votes, user.uid],
            };
          }
          return option;
        })
      );
    } catch (error) {
      console.error("투표 오류:", error);
      Alert.alert("오류", "투표에 실패했습니다.");
    }
  };

  const removeDateCandidate = async (optionId: string) => {
    if (!meetingId) return;

    Alert.alert("일정 삭제", "이 일정을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await MeetingService.removeScheduleOption(meetingId, optionId);
            setScheduleOptions((prev) => prev.filter((option) => option.id !== optionId));
            Alert.alert("알림", "일정이 삭제되었습니다.");
          } catch (error) {
            console.error("일정 삭제 오류:", error);
            Alert.alert("오류", "일정 삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const getBestDate = () => {
    if (scheduleOptions.length === 0) return null;

    return scheduleOptions.reduce((best, current) => {
      return current.votes.length > best.votes.length ? current : best;
    });
  };

  const confirmSchedule = async (optionId: string) => {
    if (!meetingId) return;

    Alert.alert("일정 확정", "이 일정으로 확정하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확정",
        onPress: async () => {
          try {
            await MeetingService.confirmSchedule(meetingId, optionId);
            Alert.alert("성공", "일정이 확정되었습니다!");
            router.back();
          } catch (error) {
            console.error("일정 확정 오류:", error);
            Alert.alert("오류", "일정 확정에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const bestDate = getBestDate();

  const calendarDates = generateCalendarDates(currentMonth);

  // participants, scheduleOptions 등 안전하게 접근
  const participantCount = meeting?.participants?.length ?? 0;
  const optionCount = scheduleOptions?.length ?? 0;

  // 내가 투표한 일정 후보 id 리스트
  const myVotedOptionIds = (scheduleOptions ?? [])
    .filter((option) => (option.votes ?? []).includes(user?.uid || ""))
    .map((option) => option.id);

  // 확정 일정 후보 (status가 confirmed인 경우)
  const confirmedOption = (scheduleOptions ?? []).find(
    (option) =>
      meeting?.status === "confirmed" &&
      meeting?.confirmedDate &&
      option.date &&
      toDateString(option.date) === toDateString(meeting.confirmedDate)
  );

  // 내 참가자 정보
  const currentUserParticipant = meeting?.participants?.find((p) => p.id === user?.uid);

  // 참석 여부 로컬 상태
  const [localStatus, setLocalStatus] = useState<"confirmed" | "pending" | "declined" | undefined>(currentUserParticipant?.status);

  // Firestore participants가 바뀔 때 localStatus도 동기화
  useEffect(() => {
    setLocalStatus(currentUserParticipant?.status);
  }, [currentUserParticipant?.status]);

  // 참석 여부 변경 함수
  const handleStatusChange = async (status: "confirmed" | "pending" | "declined") => {
    if (!meetingId || !user) return;
    try {
      setLocalStatus(status); // UI 즉시 반영
      await MeetingService.updateParticipantStatus(meetingId, user.uid, status);
    } catch (e) {
      Alert.alert("오류", "참석 여부 변경에 실패했습니다.");
      setLocalStatus(currentUserParticipant?.status); // 실패 시 롤백
    }
  };

  // StyleSheet를 함수 내부에서 동적으로 생성
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
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
          shadowColor: isDark ? "#000" : "#000",
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
          backgroundColor: cardColor,
        },
        participantSchedule: {
          marginBottom: 12,
        },
        participantRow: {
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        },
        participantDot: {
          width: 12,
          height: 12,
          borderRadius: 6,
          marginRight: 8,
        },
        participantName: {
          fontSize: 14,
          fontWeight: "500",
          flex: 1,
        },
        weekHeader: {
          flexDirection: "row",
          marginBottom: 10,
          paddingHorizontal: 10,
        },
        weekDay: {
          flex: 1,
          textAlign: "center",
          fontSize: 14,
          fontWeight: "600",
        },
        calendarGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 30,
          paddingHorizontal: 10,
        },
        calendarDayContainer: {
          width: "14.285%", // 100% / 7 = 14.285%
          aspectRatio: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
        },
        calendarDay: {
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 20,
          overflow: "hidden",
        },
        otherMonthDay: {
          opacity: 0.3,
        },
        today: {
          backgroundColor: isDark ? "#2466d1" : "#4F8EF7",
        },
        selectedDay: {
          backgroundColor: isDark ? "#388e3c" : "#4CAF50",
        },
        dayText: {
          fontSize: 16,
          fontWeight: "500",
          textAlign: "center",
        },
        todayText: {
          color: "#fff",
        },
        selectedDayText: {
          color: "#fff",
        },
        timeSelection: {
          marginTop: 20,
          paddingHorizontal: 10,
        },
        timeTitle: {
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 12,
        },
        timeGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        },
        timeOption: {
          borderWidth: 1,
          borderColor: isDark ? "#444" : "#e0e0e0",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          minWidth: 80,
          alignItems: "center",
        },
        timeText: {
          fontSize: 14,
          fontWeight: "500",
        },
        selectedDatesContainer: {
          marginBottom: 20,
          padding: 16,
          borderRadius: 8,
          marginHorizontal: 10,
          backgroundColor: cardColor,
        },
        selectedDatesTitle: {
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 12,
        },
        selectedDatesList: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        },
        selectedDateItem: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isDark ? "#333" : "#f0f0f0",
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 6,
          gap: 8,
        },
        selectedDateText: {
          fontSize: 14,
          fontWeight: "500",
        },
        emptyBox: {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 40,
        },
        emptyText: {
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 8,
        },
        emptySubText: {
          fontSize: 14,
          color: infoColor,
          marginBottom: 8,
        },
        confirmedCard: {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 2,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderColor: isDark ? "#388e3c" : "#4CAF50",
          backgroundColor: isDark ? "#23322a" : "#E3FCEC",
        },
        confirmedText: {
          fontSize: 16,
          fontWeight: "bold",
        },
        fabContainer: {
          position: "absolute",
          bottom: 30,
          left: 0,
          right: 0,
          alignItems: "center",
          zIndex: 10,
        },
        fab: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isDark ? "#2466d1" : "#4F8EF7",
          borderRadius: 24,
          paddingHorizontal: 24,
          paddingVertical: 14,
          elevation: 4,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        fabText: {
          color: "#fff",
          fontSize: 17,
          fontWeight: "bold",
          marginLeft: 8,
        },
        voteAvatarBox: {
          alignItems: "center",
          marginRight: 12,
        },
        voteAvatar: {
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 2,
          backgroundColor: isDark ? "#444" : "#eee",
        },
        voteAvatarName: {
          fontSize: 12,
          color: isDark ? "#fff" : "#222",
        },
        voteButtonRow: {
          flexDirection: "row",
          alignItems: "center",
          marginTop: 12,
          gap: 8,
        },
        voteButton: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: cardColor,
          borderWidth: 1,
          borderColor: isDark ? "#2466d1" : "#4F8EF7",
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginRight: 8,
        },
        voteButtonText: {
          color: isDark ? "#2466d1" : "#4F8EF7",
          fontWeight: "bold",
          marginLeft: 4,
        },
        availableDates: {
          fontSize: 12,
        },
        commonDates: {
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#333" : "#f0f0f0",
        },
        commonDatesTitle: {
          fontSize: 14,
          fontWeight: "600",
        },
        aiRecommendation: {
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        },
        aiTitle: {
          fontSize: 16,
          fontWeight: "600",
          marginLeft: 8,
        },
        recommendedDate: {
          borderRadius: 8,
          padding: 16,
          alignItems: "center",
          backgroundColor: isDark ? "#2466d1" : "#4F8EF7",
        },
        recommendedDateText: {
          color: "#fff",
          fontSize: 18,
          fontWeight: "bold",
        },
        recommendedVotes: {
          color: "#fff",
          fontSize: 14,
          marginTop: 4,
        },
        cardTitle: {
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 16,
        },
        dateCandidate: {
          marginBottom: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#333" : "#f0f0f0",
        },
        dateInfo: {
          marginBottom: 12,
        },
        dateText: {
          fontSize: 16,
          fontWeight: "600",
          color: textColor,
        },
        voteCount: {
          fontSize: 14,
          marginTop: 4,
          color: infoColor,
        },
        voteSection: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        },
        deleteButton: {
          position: "absolute",
          top: 0,
          right: 0,
          padding: 8,
        },
        confirmButton: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark ? "#388e3c" : "#4CAF50",
          borderRadius: 12,
          paddingVertical: 16,
          marginTop: 20,
          marginBottom: 40,
        },
        confirmButtonText: {
          color: "#fff",
          fontSize: 18,
          fontWeight: "bold",
          marginLeft: 8,
        },
        modalContainer: {
          flex: 1,
          backgroundColor: bgColor,
        },
        modalHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#222" : "#e0e0e0",
        },
        modalTitle: {
          fontSize: 18,
          fontWeight: "600",
          color: textColor,
        },
        modalButton: {
          fontSize: 16,
          fontWeight: "600",
        },
        calendarContainer: {
          flex: 1,
          padding: 20,
        },
        monthNavigation: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        },
        monthTitle: {
          fontSize: 18,
          fontWeight: "600",
          color: textColor,
        },
      }),
    [isDark, cardColor, infoColor, textColor, bgColor]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>{params.meetingName || "모임"} 일정 조율</Text>
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <MaterialCommunityIcons name="calendar-plus" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 확정 일정 강조 */}
        {confirmedOption && (
          <View
            style={[
              styles.confirmedCard,
              {
                backgroundColor: isDark ? "#23322a" : "#E3FCEC",
                borderColor: isDark ? "#388e3c" : "#4CAF50",
              },
            ]}
          >
            <MaterialCommunityIcons name="check-circle" size={20} color={isDark ? "#388e3c" : "#4CAF50"} style={{ marginRight: 8 }} />
            <Text style={[styles.confirmedText, { color: isDark ? "#fff" : "#222" }]}>
              확정 일정: {String(toDateString(confirmedOption.date))} {String(confirmedOption.time ?? "")}
            </Text>
          </View>
        )}
        {/* 일정 후보가 없을 때 안내 */}
        {optionCount === 0 && (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="calendar-plus" size={48} color="#4F8EF7" style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: textColor }]}>아직 일정 후보가 없습니다.</Text>
            <Text style={[styles.emptySubText, { color: infoColor }]}>아래 버튼을 눌러 일정을 추가해보세요!</Text>
          </View>
        )}
        {/* 일정 후보 리스트 */}
        {(scheduleOptions ?? []).map((option) => {
          const isMyVote = (option.votes ?? []).includes(user?.uid || "");
          const isConfirmed = confirmedOption && confirmedOption.id === option.id;
          return (
            <View
              key={option.id}
              style={[
                styles.dateCandidate,
                isConfirmed
                  ? {
                      borderColor: isDark ? "#388e3c" : "#4CAF50",
                      backgroundColor: isDark ? "#23322a" : "#E3FCEC",
                    }
                  : isMyVote
                  ? {
                      borderColor: isDark ? "#2466d1" : "#4F8EF7",
                      backgroundColor: isDark ? "#232a33" : "#F0F6FF",
                    }
                  : {},
              ]}
            >
              <View style={styles.dateInfo}>
                <Text
                  style={[
                    styles.dateText,
                    { color: isConfirmed ? (isDark ? "#fff" : "#222") : textColor, fontWeight: isConfirmed ? "bold" : "600" },
                  ]}
                >
                  {String(toDateString(option.date))} {String(option.time ?? "")}
                </Text>
                <Text style={[styles.voteCount, { color: infoColor }]}>{(option.votes ?? []).length}명 참석 가능</Text>
              </View>
              <View style={styles.voteSection}>
                {(meeting?.participants ?? []).map((participant, index) => {
                  const voted = (option.votes ?? []).includes(participant.id);
                  return (
                    <View key={participant.id} style={styles.voteAvatarBox}>
                      <View
                        style={[styles.voteAvatar, { backgroundColor: voted ? `hsl(${index * 60}, 70%, 60%)` : isDark ? "#444" : "#eee" }]}
                      >
                        <Text style={{ color: voted ? "#fff" : "#aaa", fontWeight: "bold" }}>
                          {String(participant.name?.charAt(0) ?? "")}
                        </Text>
                      </View>
                      <Text style={styles.voteAvatarName}>{String(participant.name ?? "")}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.voteButtonRow}>
                <TouchableOpacity
                  style={[styles.voteButton, (option.votes ?? []).includes(user?.uid || "") && { backgroundColor: "#4F8EF7" }]}
                  onPress={() => toggleVote(option.id)}
                >
                  <MaterialCommunityIcons
                    name="thumb-up"
                    size={16}
                    color={(option.votes ?? []).includes(user?.uid || "") ? "#fff" : "#4F8EF7"}
                  />
                  <Text style={[styles.voteButtonText, (option.votes ?? []).includes(user?.uid || "") && { color: "#fff" }]}>참석</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => removeDateCandidate(option.id)}>
                  <MaterialCommunityIcons name="delete" size={16} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        {/* 일정 확정 버튼 */}
        {bestDate && (bestDate.votes ?? []).length > 0 && (
          <TouchableOpacity style={styles.confirmButton} onPress={() => confirmSchedule(bestDate.id)}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.confirmButtonText}>일정 투표하기</Text>
          </TouchableOpacity>
        )}
        {confirmedOption && (
          <View style={{ marginTop: 16, marginBottom: 16 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 8, color: textColor }}>확정 일정 참석 여부</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {["confirmed", "pending", "declined"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={{
                    backgroundColor:
                      localStatus === status
                        ? isDark
                          ? status === "confirmed"
                            ? "#2466d1"
                            : status === "pending"
                            ? "#444"
                            : "#333"
                          : status === "confirmed"
                          ? "#4F8EF7"
                          : "#eee"
                        : isDark
                        ? "#23262F"
                        : "#eee",
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    borderRadius: 8,
                    marginRight: 8,
                  }}
                  onPress={() => handleStatusChange(status as any)}
                  disabled={localStatus === status}
                >
                  <Text
                    style={{
                      color: localStatus === status ? "#fff" : isDark ? "#bbb" : "#222",
                      fontWeight: "bold",
                    }}
                  >
                    {status === "confirmed" ? "참석" : status === "pending" ? "미정" : "불참"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        <View style={{ height: 100 }} /> {/* 플로팅 버튼 영역 확보 */}
      </ScrollView>

      {/* 하단 플로팅 일정 추가 버튼 */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={() => setShowCalendar(true)}>
          <MaterialCommunityIcons name="plus" size={28} color="#fff" />
          <Text style={styles.fabText}>일정 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 캘린더 모달 */}
      <Modal visible={showCalendar} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: bgColor }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCalendar(false)}>
              <Text style={[styles.modalButton, { color: textColor }]}>취소</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>날짜 선택</Text>
            <TouchableOpacity onPress={addSelectedDates}>
              <Text style={[styles.modalButton, { color: "#4F8EF7" }]}>추가</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
            {/* 월 네비게이션 */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                <MaterialCommunityIcons name="chevron-left" size={24} color={textColor} />
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: textColor }]}>
                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
              </Text>
              <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                <MaterialCommunityIcons name="chevron-right" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* 요일 헤더 */}
            <View style={styles.weekHeader}>
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <Text key={day} style={[styles.weekDay, { color: infoColor }]}>
                  {day}
                </Text>
              ))}
            </View>

            {/* 캘린더 그리드 */}
            <View style={styles.calendarGrid}>
              {calendarDates.map((date, index) => (
                <View key={index} style={styles.calendarDayContainer}>
                  <TouchableOpacity
                    style={[
                      styles.calendarDay,
                      !date.isCurrentMonth && styles.otherMonthDay,
                      date.isToday && styles.today,
                      date.isSelected && styles.selectedDay,
                    ]}
                    onPress={() => date.isCurrentMonth && toggleDate(date.date)}
                    disabled={!date.isCurrentMonth}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: date.isCurrentMonth ? textColor : infoColor },
                        date.isToday && styles.todayText,
                        date.isSelected && styles.selectedDayText,
                      ]}
                    >
                      {date.day}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* 선택된 날짜 표시 */}
            {selectedDates.length > 0 && (
              <View style={[styles.selectedDatesContainer, { backgroundColor: cardColor }]}>
                <Text style={[styles.selectedDatesTitle, { color: textColor }]}>선택된 날짜 {(selectedDates ?? []).length}일</Text>
                <View style={styles.selectedDatesList}>
                  {(selectedDates ?? []).map((date, index) => {
                    const dateObj = new Date(date);
                    const month = dateObj.getMonth() + 1;
                    const day = dateObj.getDate();
                    const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][dateObj.getDay()];
                    return (
                      <View key={index} style={styles.selectedDateItem}>
                        <Text style={[styles.selectedDateText, { color: textColor }]}>
                          {month}월 {day}일 ({dayOfWeek})
                        </Text>
                        <TouchableOpacity onPress={() => toggleDate(date)}>
                          <MaterialCommunityIcons name="close" size={16} color="#ff3b30" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* 시간 선택 */}
            <View style={styles.timeSelection}>
              <Text style={[styles.timeTitle, { color: textColor }]}>시간 선택</Text>
              <View style={styles.timeGrid}>
                {timeOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      selectedTime === time && { backgroundColor: "#4F8EF7" },
                      time === "상관없음" && { backgroundColor: selectedTime === time ? "#4F8EF7" : "#f0f0f0" },
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        {
                          color: selectedTime === time ? "#fff" : time === "상관없음" ? "#666" : textColor,
                        },
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
