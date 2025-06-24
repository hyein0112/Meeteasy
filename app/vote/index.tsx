import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";

interface DateCandidate {
  id: string;
  date: string;
  time: string;
  votes: string[]; // 참석자 이름 배열
}

interface Participant {
  name: string;
  color: string;
  availableDates: string[]; // 가능한 날짜들 (YYYY-MM-DD 형식)
}

interface CalendarDate {
  date: string; // YYYY-MM-DD 형식
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
}

const mockParticipants: Participant[] = [
  {
    name: "김철수",
    color: "#FF6B6B",
    availableDates: ["2024-01-20", "2024-01-21", "2024-01-25", "2024-01-26"],
  },
  {
    name: "이영희",
    color: "#4ECDC4",
    availableDates: ["2024-01-20", "2024-01-22", "2024-01-23", "2024-01-25"],
  },
  {
    name: "박민수",
    color: "#45B7D1",
    availableDates: ["2024-01-21", "2024-01-22", "2024-01-24", "2024-01-25"],
  },
  {
    name: "나",
    color: "#96CEB4",
    availableDates: ["2024-01-20", "2024-01-22", "2024-01-25", "2024-01-26"],
  },
];

const mockDateCandidates: DateCandidate[] = [
  {
    id: "1",
    date: "1월 20일 (토)",
    time: "오후 2시",
    votes: ["김철수", "이영희", "나"],
  },
  {
    id: "2",
    date: "1월 25일 (목)",
    time: "오후 3시",
    votes: ["김철수", "이영희", "박민수", "나"],
  },
];

export default function VoteScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";

  const params = useLocalSearchParams();
  const [dateCandidates, setDateCandidates] = useState<DateCandidate[]>(mockDateCandidates);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("오후 2시");

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

  // 팀원들의 가능한 날짜 찾기
  const findCommonDates = () => {
    const allDates = new Set<string>();
    mockParticipants.forEach((participant) => {
      participant.availableDates.forEach((date) => allDates.add(date));
    });

    const commonDates: string[] = [];
    allDates.forEach((date) => {
      const availableCount = mockParticipants.filter((participant) => participant.availableDates.includes(date)).length;
      if (availableCount >= 2) {
        // 최소 2명 이상 가능한 날짜
        commonDates.push(date);
      }
    });

    return commonDates.sort();
  };

  const commonDates = findCommonDates();

  // 선택된 날짜들을 일정 후보로 추가
  const addSelectedDates = () => {
    if (selectedDates.length === 0) {
      Alert.alert("알림", "날짜를 선택해주세요.");
      return;
    }

    const newCandidates: DateCandidate[] = selectedDates.map((date) => {
      const dateObj = new Date(date);
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][dateObj.getDay()];

      return {
        id: Date.now().toString() + Math.random(),
        date: `${month}월 ${day}일 (${dayOfWeek})`,
        time: selectedTime,
        votes: [],
      };
    });

    setDateCandidates([...dateCandidates, ...newCandidates]);
    setSelectedDates([]);
    setShowCalendar(false);
  };

  const toggleVote = (dateId: string, participantName: string) => {
    setDateCandidates((prev) =>
      prev.map((date) => {
        if (date.id === dateId) {
          const isVoted = date.votes.includes(participantName);
          return {
            ...date,
            votes: isVoted ? date.votes.filter((v) => v !== participantName) : [...date.votes, participantName],
          };
        }
        return date;
      })
    );
  };

  const removeDateCandidate = (dateId: string) => {
    Alert.alert("일정 삭제", "이 일정을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          setDateCandidates((prev) => prev.filter((date) => date.id !== dateId));
        },
      },
    ]);
  };

  const getBestDate = () => {
    if (dateCandidates.length === 0) {
      return null;
    }
    return dateCandidates.reduce((best, current) => (current.votes.length > best.votes.length ? current : best));
  };

  const bestDate = getBestDate();

  const calendarDates = generateCalendarDates(currentMonth);

  const confirmSchedule = () => {
    // 일정 확정 후 모임 상세 화면으로 이동
    router.push({
      pathname: "/meeting-detail",
      params: {
        meetingName: params.meetingName || "모임",
        confirmedDate: bestDate?.date,
        confirmedTime: bestDate?.time,
      },
    } as any);
  };

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
        {/* 팀원 가능 일정 */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>팀원 가능 일정</Text>
          <View style={styles.participantSchedule}>
            {mockParticipants.map((participant) => (
              <View key={participant.name} style={styles.participantRow}>
                <View style={[styles.participantDot, { backgroundColor: participant.color }]} />
                <Text style={[styles.participantName, { color: textColor }]}>{participant.name}</Text>
                <Text style={[styles.availableDates, { color: infoColor }]}>{participant.availableDates.length}일 가능</Text>
              </View>
            ))}
          </View>
          {commonDates.length > 0 && (
            <View style={styles.commonDates}>
              <Text style={[styles.commonDatesTitle, { color: textColor }]}>모두 가능한 날짜: {commonDates.length}일</Text>
            </View>
          )}
        </View>

        {/* AI 추천 일정 */}
        {bestDate && bestDate.votes.length > 0 && (
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <View style={styles.aiRecommendation}>
              <MaterialCommunityIcons name="robot" size={24} color="#4CAF50" />
              <Text style={[styles.aiTitle, { color: textColor }]}>AI 추천 일정</Text>
            </View>
            <View style={[styles.recommendedDate, { backgroundColor: "#4CAF50" }]}>
              <Text style={styles.recommendedDateText}>
                {bestDate.date} {bestDate.time}
              </Text>
              <Text style={styles.recommendedVotes}>{bestDate.votes.length}명 참석 가능</Text>
            </View>
          </View>
        )}

        {/* 일정 후보 리스트 */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>일정 후보</Text>

          {dateCandidates.map((date) => (
            <View key={date.id} style={styles.dateCandidate}>
              <View style={styles.dateInfo}>
                <Text style={[styles.dateText, { color: textColor }]}>
                  {date.date} {date.time}
                </Text>
                <Text style={[styles.voteCount, { color: infoColor }]}>{date.votes.length}명 참석 가능</Text>
              </View>

              <View style={styles.voteSection}>
                {mockParticipants.map((participant) => (
                  <TouchableOpacity
                    key={participant.name}
                    style={[
                      styles.voteButton,
                      {
                        backgroundColor: date.votes.includes(participant.name) ? participant.color : "transparent",
                        borderColor: participant.color,
                      },
                    ]}
                    onPress={() => toggleVote(date.id, participant.name)}
                  >
                    <Text
                      style={[
                        styles.voteButtonText,
                        {
                          color: date.votes.includes(participant.name) ? "#fff" : participant.color,
                        },
                      ]}
                    >
                      {participant.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.deleteButton} onPress={() => removeDateCandidate(date.id)}>
                <MaterialCommunityIcons name="delete" size={16} color="#ff3b30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 일정 확정 버튼 */}
        {bestDate && bestDate.votes.length > 0 && (
          <TouchableOpacity style={styles.confirmButton} onPress={confirmSchedule}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.confirmButtonText}>일정 확정하기</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

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
                <Text style={[styles.selectedDatesTitle, { color: textColor }]}>선택된 날짜 ({selectedDates.length}일)</Text>
                <View style={styles.selectedDatesList}>
                  {selectedDates.map((date, index) => {
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
  availableDates: {
    fontSize: 12,
  },
  commonDates: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
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
    borderBottomColor: "#f0f0f0",
  },
  dateInfo: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },
  voteCount: {
    fontSize: 14,
    marginTop: 4,
  },
  voteSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  voteButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  voteButtonText: {
    fontSize: 12,
    fontWeight: "500",
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
    backgroundColor: "#4CAF50",
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
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    backgroundColor: "#4F8EF7",
  },
  selectedDay: {
    backgroundColor: "#4CAF50",
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
    borderColor: "#e0e0e0",
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
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
