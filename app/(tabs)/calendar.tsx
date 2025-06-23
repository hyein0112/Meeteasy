import React from "react";
import { SafeAreaView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Calendar } from "react-native-calendars";

export default function CalendarTab() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const textColor = isDark ? "#fff" : "#222";
  const placeholderColor = isDark ? "#888" : "#bbb";
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>캘린더</Text>
        </View>
        <View style={styles.calendarBox}>
          <Calendar
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
            // Placeholder: In the future, mark meeting/schedule dates here
          />
          <View style={styles.placeholderBox}>
            <Text style={[styles.placeholderText, { color: placeholderColor }]}>곧 이곳에 모임/일정이 표시됩니다!</Text>
          </View>
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
});
