import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { ChatService } from "../../services/chatService";
import { Meeting, MeetingService } from "../../services/meetingService";
import { useAuthStore } from "../../stores/authStore";
import { Message, useChatStore } from "../../stores/chatStore";

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";

  const params = useLocalSearchParams();
  const { user, userProfile } = useAuthStore();
  const { messages, setMessages } = useChatStore();
  const [newMessage, setNewMessage] = useState("");
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeText, setNoticeText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const meetingId = params.meetingId as string;
  const meetingName = params.meetingName as string;

  // 모임 정보 실시간 구독
  useEffect(() => {
    if (!meetingId) return;
    const unsubscribe = MeetingService.subscribeToMeeting(meetingId, (m) => setMeeting(m));
    return () => unsubscribe();
  }, [meetingId]);

  useEffect(() => {
    if (meetingId && user) {
      loadMessages();
      // 실시간 메시지 구독
      const unsubscribe = ChatService.setupMessageListener(meetingId);
      return () => unsubscribe();
    }
  }, [meetingId, user]);

  const loadMessages = async () => {
    if (!meetingId || !user) return;

    try {
      setIsLoading(true);
      const chatMessages = await ChatService.getMessages(meetingId);
      setMessages(meetingId, chatMessages);
    } catch (error) {
      console.error("메시지 로드 오류:", error);
      Alert.alert("오류", "메시지를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 가장 최근 공지 찾기
  const latestNotice = messages[meetingId]
    ?.filter((msg) => msg.type === "notice")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  // 일반 메시지만 필터링 (공지 제외)
  const regularMessages = messages[meetingId]?.filter((msg) => msg.type !== "notice") || [];

  // 새 메시지가 추가될 때 스크롤을 맨 아래로
  useEffect(() => {
    if (regularMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [regularMessages.length]);

  const getSenderName = () => userProfile?.name || user?.displayName || user?.email || "알 수 없음";

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !meetingId) return;
    if (!userProfile?.name) {
      Alert.alert("알림", "이름 정보가 로드될 때까지 잠시만 기다려주세요.");
      return;
    }
    try {
      await ChatService.sendMessage(meetingId, user.uid, getSenderName(), user.photoURL || undefined, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      Alert.alert("오류", "메시지 전송에 실패했습니다.");
    }
  };

  const sendNotice = async () => {
    if (!noticeText.trim() || !user || !meetingId) return;
    if (!userProfile?.name) {
      Alert.alert("알림", "이름 정보가 로드될 때까지 잠시만 기다려주세요.");
      return;
    }
    try {
      await ChatService.sendNotice(meetingId, user.uid, getSenderName(), user.photoURL || undefined, noticeText.trim());
      setNoticeText("");
      setShowNoticeModal(false);
    } catch (error) {
      console.error("공지 전송 오류:", error);
      Alert.alert("오류", "공지 전송에 실패했습니다.");
    }
  };

  const goToMeetingDetail = () => {
    router.push({
      pathname: "/meeting-detail",
      params: { meetingId },
    } as any);
    setShowActionMenu(false);
  };

  const goToVote = () => {
    router.push({
      pathname: "/vote",
      params: { meetingId, meetingName },
    } as any);
    setShowActionMenu(false);
  };

  const shareChat = () => {
    // 실제로는 Share API를 사용해야 함
    Alert.alert("공유", "채팅방 링크가 복사되었습니다!");
    setShowActionMenu(false);
  };

  const clearChat = () => {
    Alert.alert("채팅 기록 삭제", "정말로 모든 채팅 기록을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          setMessages(meetingId, []);
          Alert.alert("알림", "채팅 기록이 삭제되었습니다.");
        },
      },
    ]);
    setShowActionMenu(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.uid;

    if (item.type === "notice") {
      return (
        <View style={styles.noticeContainer}>
          <View style={styles.noticeContent}>
            <MaterialCommunityIcons name="bullhorn" size={16} color="#856404" />
            <Text style={[styles.noticeContent, { color: "#856404" }]}>{item.content}</Text>
            <Text style={[styles.noticeTimestamp, { color: "#856404" }]}>
              {new Date(item.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        {!isMe && <Text style={[styles.senderName, { color: infoColor }]}>{item.senderName}</Text>}

        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isMe ? "#4F8EF7" : cardColor,
              borderColor: isMe ? "#4F8EF7" : "#e0e0e0",
            },
          ]}
        >
          {item.content && <Text style={[styles.messageText, { color: isMe ? "#fff" : textColor }]}>{item.content}</Text>}
        </View>
        <Text style={[styles.timestamp, { color: infoColor }]}>
          {new Date(item.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
      >
        {/* 헤더 */}
        <View style={[styles.header, { backgroundColor: cardColor }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.meetingName, { color: textColor }]}>{meetingName || "모임 채팅"}</Text>
            <Text style={[styles.participantCount, { color: infoColor }]}>참석자 {meeting?.participants.length}명</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.noticeButton} onPress={() => setShowNoticeModal(true)}>
              <MaterialCommunityIcons name="bullhorn" size={20} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={() => setShowActionMenu(true)}>
              <MaterialCommunityIcons name="dots-vertical" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 공지사항 */}
        {latestNotice && (
          <View
            style={[
              styles.pinnedNotice,
              {
                backgroundColor: isDark ? "#2d2d2d" : "#FFF3CD",
                borderColor: isDark ? "#FFD600" : "#FFEE58",
                borderWidth: 1.5,
                shadowColor: isDark ? "#FFD600" : "#856404",
                shadowOpacity: 0.15,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
              },
            ]}
          >
            <View style={styles.pinnedNoticeHeader}>
              <MaterialCommunityIcons name="pin" size={16} color={isDark ? "#FFD600" : "#856404"} />
              <Text style={[styles.pinnedNoticeTitle, { color: isDark ? "#FFD600" : "#856404" }]}>공지사항</Text>
            </View>
            <Text style={[styles.pinnedNoticeContent, { color: isDark ? "#FFD600" : "#856404" }]} numberOfLines={2}>
              {latestNotice.content}
            </Text>
            <Text style={[styles.pinnedNoticeTime, { color: isDark ? "#FFD600" : "#856404" }]}>
              {new Date(latestNotice.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        )}

        {/* 메시지 목록 */}
        <FlatList
          ref={flatListRef}
          data={regularMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* 메시지 입력 */}
        <View style={[styles.inputContainer, { backgroundColor: cardColor }]}>
          <TextInput
            style={[styles.textInput, { color: textColor, borderColor: isDark ? "#333" : "#e0e0e0" }]}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor={infoColor}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: newMessage.trim() ? "#4F8EF7" : "#ccc" }]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <MaterialCommunityIcons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 액션 메뉴 모달 */}
      <Modal visible={showActionMenu} transparent={true} animationType="fade" onRequestClose={() => setShowActionMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowActionMenu(false)}>
          <View style={[styles.actionMenu, { backgroundColor: cardColor }]}>
            <TouchableOpacity style={styles.actionMenuItem} onPress={goToMeetingDetail}>
              <MaterialCommunityIcons name="information-outline" size={20} color={textColor} />
              <Text style={[styles.actionMenuText, { color: textColor }]}>모임 상세</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionMenuItem} onPress={goToVote}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color={textColor} />
              <Text style={[styles.actionMenuText, { color: textColor }]}>일정 투표</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionMenuItem} onPress={shareChat}>
              <MaterialCommunityIcons name="share-variant" size={20} color={textColor} />
              <Text style={[styles.actionMenuText, { color: textColor }]}>채팅방 공유</Text>
            </TouchableOpacity>

            <View style={styles.actionMenuDivider} />

            <TouchableOpacity style={styles.actionMenuItem} onPress={clearChat}>
              <MaterialCommunityIcons name="delete-sweep" size={20} color="#F44336" />
              <Text style={[styles.actionMenuText, { color: "#F44336" }]}>채팅 기록 삭제</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 공지 작성 모달 */}
      <Modal visible={showNoticeModal} transparent={true} animationType="slide" onRequestClose={() => setShowNoticeModal(false)}>
        <View style={styles.noticeModalOverlay}>
          <View style={[styles.noticeModal, { backgroundColor: cardColor }]}>
            <View style={styles.noticeModalHeader}>
              <Text style={[styles.noticeModalTitle, { color: textColor }]}>공지 작성</Text>
              <TouchableOpacity onPress={() => setShowNoticeModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.noticeInput, { color: textColor, borderColor: isDark ? "#333" : "#e0e0e0" }]}
              placeholder="공지 내용을 입력하세요..."
              placeholderTextColor={infoColor}
              value={noticeText}
              onChangeText={setNoticeText}
              multiline
              numberOfLines={4}
            />

            <View style={styles.noticeModalActions}>
              <TouchableOpacity
                style={[styles.noticeCancelButton, { borderColor: isDark ? "#333" : "#e0e0e0" }]}
                onPress={() => setShowNoticeModal(false)}
              >
                <Text style={[styles.noticeButtonText, { color: textColor }]}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.noticeSendButton, { backgroundColor: noticeText.trim() ? "#4F8EF7" : "#ccc" }]}
                onPress={sendNotice}
                disabled={!noticeText.trim()}
              >
                <Text style={styles.noticeSendButtonText}>공지하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  meetingName: {
    fontSize: 18,
    fontWeight: "600",
  },
  participantCount: {
    fontSize: 14,
    marginTop: 2,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessage: {
    alignItems: "flex-end",
  },
  otherMessage: {
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
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
  actionMenuDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 4,
  },
  noticeContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  noticeContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  noticeTimestamp: {
    fontSize: 11,
    marginLeft: 8,
    alignSelf: "flex-end",
  },
  noticeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  noticeModal: {
    width: "90%",
    borderRadius: 12,
    padding: 20,
  },
  noticeModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  noticeModalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  noticeInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  noticeModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  noticeCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  noticeSendButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  noticeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  noticeSendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  noticeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  pinnedNotice: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    padding: 12,
    borderRadius: 10,
  },
  pinnedNoticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  pinnedNoticeTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  pinnedNoticeContent: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  pinnedNoticeTime: {
    fontSize: 11,
    alignSelf: "flex-end",
    opacity: 0.8,
  },
});
