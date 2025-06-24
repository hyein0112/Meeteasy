import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
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

interface Message {
  id: string;
  type: "text" | "image" | "notice";
  text?: string;
  imageUrl?: string;
  sender: string;
  timestamp: string;
  isMe: boolean;
  isNotice?: boolean;
}

const mockMessages: Message[] = [
  {
    id: "1",
    type: "notice",
    text: "모임 일정 조율을 시작합니다! 토요일 오후 3시에 투표해주세요.",
    sender: "시스템",
    timestamp: "14:30",
    isMe: false,
    isNotice: true,
  },
  {
    id: "2",
    type: "text",
    text: "안녕하세요! 모임 일정 조율 시작해볼까요?",
    sender: "김철수",
    timestamp: "14:30",
    isMe: false,
  },
  {
    id: "3",
    type: "text",
    text: "네! 저는 토요일 오후가 좋을 것 같아요",
    sender: "나",
    timestamp: "14:32",
    isMe: true,
  },
  {
    id: "4",
    type: "image",
    imageUrl: "https://via.placeholder.com/300x200/4F8EF7/FFFFFF?text=모임+사진",
    text: "지난번 모임 사진입니다!",
    sender: "이영희",
    timestamp: "14:35",
    isMe: false,
  },
  {
    id: "5",
    type: "text",
    text: "저도 토요일 괜찮아요!",
    sender: "이영희",
    timestamp: "14:35",
    isMe: false,
  },
];

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#222";
  const infoColor = isDark ? "#bbb" : "#888";

  const params = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeText, setNoticeText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // 가장 최근 공지 찾기
  const latestNotice = messages
    .filter((msg) => msg.type === "notice")
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  // 일반 메시지만 필터링 (공지 제외)
  const regularMessages = messages.filter((msg) => msg.type !== "notice");

  // 새 메시지가 추가될 때 스크롤을 맨 아래로
  useEffect(() => {
    if (regularMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [regularMessages.length]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        type: "text",
        text: newMessage.trim(),
        sender: "나",
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const sendImage = async () => {
    try {
      // 갤러리 접근 권한 요청
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
        return;
      }

      // 이미지 피커 실행
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        const message: Message = {
          id: Date.now().toString(),
          type: "image",
          imageUrl: selectedImage.uri,
          text: "사진을 보냈습니다",
          sender: "나",
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: true,
        };
        setMessages([...messages, message]);
      }
    } catch (error) {
      console.error("이미지 선택 오류:", error);
      Alert.alert("오류", "이미지를 선택하는 중 오류가 발생했습니다.");
    }
  };

  const sendNotice = () => {
    if (noticeText.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        type: "notice",
        text: noticeText.trim(),
        sender: "시스템",
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: false,
        isNotice: true,
      };
      setMessages([...messages, message]);
      setNoticeText("");
      setShowNoticeModal(false);
    }
  };

  const goToMeetingDetail = () => {
    router.push({
      pathname: "/meeting-detail",
      params: { meetingName: params.meetingName },
    } as any);
    setShowActionMenu(false);
  };

  const goToVote = () => {
    router.push({
      pathname: "/vote",
      params: { meetingName: params.meetingName },
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
          setMessages([]);
          Alert.alert("알림", "채팅 기록이 삭제되었습니다.");
        },
      },
    ]);
    setShowActionMenu(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === "notice") {
      return (
        <View style={styles.noticeContainer}>
          <View style={[styles.noticeBubble, { backgroundColor: "#FFF3CD" }]}>
            <View style={styles.noticeHeader}>
              <MaterialCommunityIcons name="bullhorn" size={16} color="#856404" />
              <Text style={[styles.noticeText, { color: "#856404" }]}>공지</Text>
            </View>
            <Text style={[styles.noticeContent, { color: "#856404" }]}>{item.text}</Text>
            <Text style={[styles.noticeTimestamp, { color: "#856404" }]}>{item.timestamp}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.otherMessage]}>
        {!item.isMe && <Text style={[styles.senderName, { color: infoColor }]}>{item.sender}</Text>}

        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: item.isMe ? "#4F8EF7" : cardColor,
              alignSelf: item.isMe ? "flex-end" : "flex-start",
            },
          ]}
        >
          {item.type === "image" && item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} resizeMode="cover" />
          )}
          {item.text && <Text style={[styles.messageText, { color: item.isMe ? "#fff" : textColor }]}>{item.text}</Text>}
        </View>
        <Text style={[styles.timestamp, { color: infoColor }]}>{item.timestamp}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 100}
      >
        {/* 헤더 */}
        <View style={[styles.header, { backgroundColor: cardColor }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.meetingName, { color: textColor }]}>{params.meetingName || "모임 채팅"}</Text>
            <Text style={[styles.participantCount, { color: infoColor }]}>참석자 3명</Text>
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
          <View style={[styles.pinnedNotice, { backgroundColor: "#FFF3CD" }]}>
            <View style={styles.pinnedNoticeHeader}>
              <MaterialCommunityIcons name="pin" size={16} color="#856404" />
              <Text style={[styles.pinnedNoticeTitle, { color: "#856404" }]}>공지사항</Text>
            </View>
            <Text style={[styles.pinnedNoticeContent, { color: "#856404" }]} numberOfLines={2}>
              {latestNotice.text}
            </Text>
            <Text style={[styles.pinnedNoticeTime, { color: "#856404" }]}>{latestNotice.timestamp}</Text>
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
          <TouchableOpacity style={styles.attachButton} onPress={sendImage}>
            <MaterialCommunityIcons name="image" size={24} color={infoColor} />
          </TouchableOpacity>

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
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  noticeContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  noticeBubble: {
    maxWidth: "90%",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFEAA7",
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  noticeContent: {
    fontSize: 14,
    lineHeight: 18,
  },
  noticeTimestamp: {
    fontSize: 11,
    marginTop: 4,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FFEAA7",
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
