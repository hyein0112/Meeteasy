import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

export default function CalendarTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fb" }}>
      <View style={styles.header}>
        <Text style={styles.title}>캘린더</Text>
      </View>
      <View style={styles.calendarBox}>
        <Calendar
          theme={{
            backgroundColor: "#f8f9fb",
            calendarBackground: "#f8f9fb",
            textSectionTitleColor: "#4F8EF7",
            selectedDayBackgroundColor: "#4F8EF7",
            selectedDayTextColor: "#fff",
            todayTextColor: "#ff3b30",
            dayTextColor: "#222",
            arrowColor: "#4F8EF7",
            monthTextColor: "#4F8EF7",
            textMonthFontWeight: "bold",
            textDayFontWeight: "500",
            textDayHeaderFontWeight: "bold",
          }}
          // Placeholder: In the future, mark meeting/schedule dates here
        />
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>곧 이곳에 모임/일정이 표시됩니다!</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 24,
    backgroundColor: "#f8f9fb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4F8EF7",
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
    color: "#bbb",
    fontSize: 16,
  },
});
