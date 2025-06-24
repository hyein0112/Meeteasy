import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";

export default function InviteScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";

  const params = useLocalSearchParams();
  const [meetingData, setMeetingData] = useState<any>(null);
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    if (params.meetingData && !meetingData) {
      const data = JSON.parse(params.meetingData as string);
      setMeetingData(data);

      // 실제 초대 코드를 사용하여 링크 생성
      const inviteCode = data.inviteCode || "ABC123"; // 기본값
      setInviteLink(`https://meeteasy.app/join/${inviteCode}`);
    }
  }, [params.meetingData, meetingData]);

  const shareInviteLink = async () => {
    try {
      const shareMessage = `MeetEasy에서 모임에 초대합니다!

모임명: ${meetingData?.name}
초대 코드: ${meetingData?.inviteCode}
초대 링크: ${inviteLink}

앱에서 "모임 참여" 버튼을 눌러 초대 코드를 입력하거나 링크를 클릭하세요!`;

      await Share.share({
        message: shareMessage,
        title: "MeetEasy 모임 초대",
      });
    } catch (error) {
      Alert.alert("오류", "공유하기를 실패했습니다.");
    }
  };

  const copyInviteCode = () => {
    // 실제로는 클립보드에 복사하는 로직 필요
    Alert.alert("알림", "초대 코드가 복사되었습니다!");
  };

  const copyInviteLink = () => {
    // 실제로는 클립보드에 복사하는 로직 필요
    Alert.alert("알림", "초대 링크가 복사되었습니다!");
  };

  const goToChat = () => {
    // 채팅방으로 이동
    router.push({
      pathname: "/chat",
      params: { meetingName: meetingData?.name },
    } as any);
  };

  if (!meetingData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <Text style={[styles.loadingText, { color: textColor }]}>로딩 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>모임 생성 완료!</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 모임 정보 */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check-circle" size={60} color="#4CAF50" />
          </View>
          <Text style={[styles.meetingName, { color: textColor }]}>{meetingData.name}</Text>
          {meetingData.purpose && <Text style={[styles.purpose, { color: infoColor }]}>{meetingData.purpose}</Text>}
          <Text style={[styles.info, { color: infoColor }]}>모임이 성공적으로 생성되었습니다!</Text>
        </View>

        {/* 초대 코드 */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>초대 코드</Text>
          <View style={[styles.codeContainer, { borderColor: isDark ? "#333" : "#e0e0e0" }]}>
            <Text style={[styles.codeText, { color: textColor }]}>{meetingData?.inviteCode || "ABC123"}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={copyInviteCode}>
              <MaterialCommunityIcons name="content-copy" size={20} color="#4F8EF7" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.codeDescription, { color: infoColor }]}>
            이 코드를 친구들에게 알려주세요. 앱에서 "모임 참여" 버튼을 눌러 코드를 입력하면 모임에 참여할 수 있습니다.
          </Text>
        </View>

        {/* 초대 링크 */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>초대 링크</Text>
          <View style={[styles.linkContainer, { borderColor: isDark ? "#333" : "#e0e0e0" }]}>
            <Text style={[styles.linkText, { color: textColor }]} numberOfLines={2}>
              {inviteLink}
            </Text>
            <TouchableOpacity style={styles.copyButton} onPress={copyInviteLink}>
              <MaterialCommunityIcons name="content-copy" size={20} color="#4F8EF7" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={shareInviteLink}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
            <Text style={styles.shareButtonText}>초대 링크 공유하기</Text>
          </TouchableOpacity>
        </View>

        {/* 채팅방 입장 */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>채팅방</Text>
          <Text style={[styles.chatDescription, { color: infoColor }]}>참석자들과 일정을 조율하고 소통할 수 있습니다.</Text>
          <TouchableOpacity style={styles.chatButton} onPress={goToChat}>
            <MaterialCommunityIcons name="chat" size={20} color="#fff" />
            <Text style={styles.chatButtonText}>채팅방 입장하기</Text>
          </TouchableOpacity>
        </View>

        {/* 완료 버튼 */}
        <TouchableOpacity style={styles.completeButton} onPress={() => router.push("/(tabs)/home")}>
          <Text style={styles.completeButtonText}>완료</Text>
        </TouchableOpacity>
      </ScrollView>
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
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
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
  successIcon: {
    alignItems: "center",
    marginBottom: 16,
  },
  meetingName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  purpose: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    textAlign: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  codeText: {
    flex: 1,
    fontSize: 14,
  },
  copyButton: {
    padding: 8,
  },
  codeDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F8EF7",
    borderRadius: 8,
    paddingVertical: 12,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  chatDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: "#4F8EF7",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
