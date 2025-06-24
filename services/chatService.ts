import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { removeUndefined } from "../services/meetingService";
import { ChatRoom, Message, useChatStore } from "../stores/chatStore";

const PRESIGN_SERVER = process.env.EXPO_PUBLIC_PRESIGN_SERVER || "http://localhost:3001";

export class ChatService {
  // 메시지 전송
  static async sendMessage(
    meetingId: string,
    senderId: string,
    senderName: string,
    senderPhotoURL: string | undefined,
    content: string,
    type: Message["type"] = "text",
    imageURL?: string
  ): Promise<string> {
    try {
      const messageData = {
        meetingId,
        senderId,
        senderName,
        senderPhotoURL,
        type,
        content,
        imageURL,
        isNotice: false,
        createdAt: serverTimestamp(),
      };

      const messageRef = await addDoc(collection(db!, "messages"), removeUndefined(messageData));

      const newMessage: Message = {
        ...messageData,
        id: messageRef.id,
        createdAt: new Date(),
      } as Message;

      useChatStore.getState().addMessage(meetingId, newMessage);
      return messageRef.id;
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      throw error;
    }
  }

  // 공지 메시지 전송
  static async sendNotice(
    meetingId: string,
    senderId: string,
    senderName: string,
    senderPhotoURL: string | undefined,
    content: string
  ): Promise<string> {
    try {
      const messageData = {
        meetingId,
        senderId,
        senderName,
        senderPhotoURL,
        type: "notice" as const,
        content,
        isNotice: true,
        createdAt: serverTimestamp(),
      };

      const messageRef = await addDoc(collection(db!, "messages"), removeUndefined(messageData));

      const newMessage: Message = {
        ...messageData,
        id: messageRef.id,
        createdAt: new Date(),
      } as Message;

      useChatStore.getState().addMessage(meetingId, newMessage);
      return messageRef.id;
    } catch (error) {
      console.error("공지 전송 오류:", error);
      throw error;
    }
  }

  // 이미지 업로드
  static async uploadImage(meetingId: string, imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const fileName = `chat-images/${meetingId}/${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
      // 1. presign 서버에서 presigned URL 요청
      const presignRes = await fetch(`${PRESIGN_SERVER}/presign?fileName=${encodeURIComponent(fileName)}&contentType=image/jpeg`);
      const { url } = await presignRes.json();
      // 2. presigned URL로 업로드
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      if (!uploadRes.ok) throw new Error("R2 presigned URL 업로드 실패");
      // 3. R2 public URL 생성 (endpoint는 .env에 EXPO_PUBLIC_R2_PUBLIC_ENDPOINT로 지정)
      const publicEndpoint = process.env.EXPO_PUBLIC_R2_PUBLIC_ENDPOINT || "https://<accountid>.r2.cloudflarestorage.com";
      const imageUrl = `${publicEndpoint}/${fileName}`;
      return imageUrl;
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      throw error;
    }
  }

  // 이미지 메시지 전송
  static async sendImageMessage(
    meetingId: string,
    senderId: string,
    senderName: string,
    senderPhotoURL: string | undefined,
    imageUri: string
  ): Promise<string> {
    try {
      const imageURL = await this.uploadImage(meetingId, imageUri);

      return await this.sendMessage(meetingId, senderId, senderName, senderPhotoURL, "이미지를 전송했습니다.", "image", imageURL);
    } catch (error) {
      console.error("이미지 메시지 전송 오류:", error);
      throw error;
    }
  }

  // 메시지 조회
  static async getMessages(meetingId: string, limitCount: number = 50): Promise<Message[]> {
    try {
      const messagesQuery = query(
        collection(db!, "messages"),
        where("meetingId", "==", meetingId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(messagesQuery);
      const messages: Message[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const message: Message = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Message;

        messages.push(message);
      });

      // 최신 메시지가 맨 아래에 오도록 역순 정렬
      const sortedMessages = messages.reverse();
      useChatStore.getState().setMessages(meetingId, sortedMessages);

      return sortedMessages;
    } catch (error) {
      console.error("메시지 조회 오류:", error);
      throw error;
    }
  }

  // 메시지 업데이트
  static async updateMessage(meetingId: string, messageId: string, updates: Partial<Message>): Promise<void> {
    try {
      await updateDoc(doc(db!, "messages", messageId), updates);
      useChatStore.getState().updateMessage(meetingId, messageId, updates);
    } catch (error) {
      console.error("메시지 업데이트 오류:", error);
      throw error;
    }
  }

  // 메시지 삭제
  static async deleteMessage(meetingId: string, messageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db!, "messages", messageId));
      useChatStore.getState().deleteMessage(meetingId, messageId);
    } catch (error) {
      console.error("메시지 삭제 오류:", error);
      throw error;
    }
  }

  // 채팅방 생성
  static async createChatRoom(chatRoom: Omit<ChatRoom, "unreadCount">): Promise<void> {
    try {
      const chatRoomData = {
        ...chatRoom,
        unreadCount: 0,
        isActive: true,
      };

      useChatStore.getState().addChatRoom(chatRoomData);
    } catch (error) {
      console.error("채팅방 생성 오류:", error);
      throw error;
    }
  }

  // 사용자의 채팅방 목록 조회
  static async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    try {
      const chatRoomsQuery = query(
        collection(db!, "chatRooms"),
        where("participants", "array-contains", userId),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(chatRoomsQuery);
      const chatRooms: ChatRoom[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const chatRoom: ChatRoom = {
          ...data,
          meetingId: doc.id,
        } as ChatRoom;

        chatRooms.push(chatRoom);
      });

      useChatStore.getState().setChatRooms(chatRooms);
      return chatRooms;
    } catch (error) {
      console.error("채팅방 목록 조회 오류:", error);
      throw error;
    }
  }

  // 채팅방 업데이트
  static async updateChatRoom(meetingId: string, updates: Partial<ChatRoom>): Promise<void> {
    try {
      useChatStore.getState().updateChatRoom(meetingId, updates);
    } catch (error) {
      console.error("채팅방 업데이트 오류:", error);
      throw error;
    }
  }

  // 채팅방 삭제
  static async deleteChatRoom(meetingId: string): Promise<void> {
    try {
      useChatStore.getState().removeChatRoom(meetingId);
    } catch (error) {
      console.error("채팅방 삭제 오류:", error);
      throw error;
    }
  }

  // 메시지 읽음 처리
  static async markAsRead(meetingId: string): Promise<void> {
    try {
      useChatStore.getState().markAsRead(meetingId);
    } catch (error) {
      console.error("읽음 처리 오류:", error);
      throw error;
    }
  }

  // 실시간 메시지 리스너 설정
  static setupMessageListener(meetingId: string): () => void {
    return onSnapshot(query(collection(db!, "messages"), where("meetingId", "==", meetingId), orderBy("createdAt", "asc")), (snapshot) => {
      const messages: Message[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const message: Message = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Message;

        messages.push(message);
      });

      useChatStore.getState().setMessages(meetingId, messages);
    });
  }

  // 실시간 채팅방 리스너 설정
  static setupChatRoomListener(userId: string): () => void {
    return onSnapshot(
      query(collection(db!, "chatRooms"), where("participants", "array-contains", userId), where("isActive", "==", true)),
      (snapshot) => {
        const chatRooms: ChatRoom[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const chatRoom: ChatRoom = {
            ...data,
            meetingId: doc.id,
          } as ChatRoom;

          chatRooms.push(chatRoom);
        });

        useChatStore.getState().setChatRooms(chatRooms);
      }
    );
  }
}
