import React, { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Calendar } from "react-native-calendars";
import { useMeetingStore } from "../../stores/meetingStore";

export default function CalendarTab() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const textColor = isDark ? "#fff" : "#222";
  const placeholderColor = isDark ? "#888" : "#bbb";
  const meetingInfoBg = isDark ? "#23262e" : "#eaf1fb";
  const meetingInfoBorder = isDark ? "#333" : "#bcd6f7";

  const meetings = useMeetingStore((state) => state.meetings);
  const confirmedMeetings = useMemo(
    () => meetings.filter((meeting) => meeting.status === "confirmed" && meeting.confirmedDate),
    [meetings]
  );

  const markedDates = confirmedMeetings.reduce((acc, meeting) => {
    if (meeting.confirmedDate) {
      const dateStr = new Date(meeting.confirmedDate).toISOString().split("T")[0];
      acc[dateStr] = {
        marked: true,
        dotColor: "#4F8EF7",
        activeOpacity: 0,
      };
    }
    return acc;
  }, {} as Record<string, any>);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedMeeting = selectedDate
    ? confirmedMeetings.find((meeting) => {
        const dateStr = new Date(meeting.confirmedDate!).toISOString().split("T")[0];
        return dateStr === selectedDate;
      })
    : null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>캘린더</Text>
        </View>
        <View style={styles.calendarBox}>
          <Calendar
            key={colorScheme}
            theme={{
              backgroundColor: bgColor,
              calendarBackground: bgColor,
              textSectionTitleColor: "#4F8EF7",
              selectedDayBackgroundColor: "#4F8EF7",
              selectedDayTextColor: "#fff",
              todayTextColor: "#ff3b30",
              dayTextColor: textColor,
              arrowColor: "#4F8EF7",
              monthTextColor: "#4F8EF7",
              textMonthFontWeight: "bold",
              textDayFontWeight: "500",
              textDayHeaderFontWeight: "bold",
            }}
            markedDates={{
              ...markedDates,
              ...(selectedDate
                ? {
                    [selectedDate]: {
                      ...(markedDates[selectedDate] || {}),
                      selected: true,
                      selectedColor: "#4F8EF7",
                    },
                  }
                : {}),
            }}
            onDayPress={(day) => setSelectedDate(day.dateString)}
          />

          {selectedDate && (
            <View style={[styles.meetingInfoBox, { backgroundColor: meetingInfoBg, borderColor: meetingInfoBorder }]}>
              {selectedMeeting ? (
                <>
                  <Text style={[styles.meetingTitle, { color: textColor }]}>모임명: {selectedMeeting.title}</Text>
                  <Text style={{ color: textColor }}>시간: {selectedMeeting.confirmedTime || "시간 미정"}</Text>
                  {selectedMeeting.location?.name && <Text style={{ color: textColor }}>장소: {selectedMeeting.location.name}</Text>}
                </>
              ) : (
                <Text style={{ color: placeholderColor }}>이 날짜에는 확정된 일정이 없습니다.</Text>
              )}
            </View>
          )}
        </View>
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
  },
  header: {
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  calendarBox: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  placeholderBox: {
    marginTop: 18,
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
  },
  meetingInfoBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "flex-start",
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
});
