import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";

const mockMeetings = [
  { id: "1", name: "스터디 모임", date: "2024-07-10", status: "일정 조율 중", lastMsg: "내일 일정 투표해 주세요!", dday: 3, unread: 2 },
  { id: "2", name: "친구 번개", date: "2024-07-15", status: "확정", lastMsg: "장소 확정!", dday: 8, unread: 0 },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <TouchableOpacity style={styles.createBtn}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.createBtnText}>새 모임 만들기</Text>
        </TouchableOpacity>
        <FlatList
          data={mockMeetings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: cardColor }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: textColor }]}>{item.name}</Text>
                <Text style={[styles.info, { color: infoColor }]}>
                  {item.date} · {item.status}
                </Text>
                <Text style={[styles.lastMsg, { color: "#4F8EF7" }]}>{item.lastMsg}</Text>
              </View>
              <View style={styles.rightBox}>
                <Text style={styles.dday}>{`D-${item.dday}`}</Text>
                {item.unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
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
  createBtnText: { color: "#fff", fontSize: 17, fontWeight: "bold", marginLeft: 8 },
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
  name: { fontSize: 18, fontWeight: "600" },
  info: { fontSize: 14, marginTop: 2 },
  lastMsg: { fontSize: 14, marginTop: 6 },
  rightBox: { alignItems: "flex-end", justifyContent: "space-between", height: 48 },
  dday: { color: "#4F8EF7", fontWeight: "bold", fontSize: 15 },
  badge: {
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
});
