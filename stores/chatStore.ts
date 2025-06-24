import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Message {
  id: string;
  meetingId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  type: "text" | "image" | "notice";
  content: string;
  imageURL?: string;
  isNotice: boolean;
  createdAt: Date;
}

export interface ChatRoom {
  meetingId: string;
  meetingTitle: string;
  lastMessage?: Message;
  unreadCount: number;
  participants: string[];
  isActive: boolean;
}

interface ChatState {
  messages: Record<string, Message[]>; // meetingId -> messages
  chatRooms: ChatRoom[];
  currentChatRoom: string | null;
  isLoading: boolean;

  // Actions
  setMessages: (meetingId: string, messages: Message[]) => void;
  addMessage: (meetingId: string, message: Message) => void;
  updateMessage: (meetingId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (meetingId: string, messageId: string) => void;

  setChatRooms: (chatRooms: ChatRoom[]) => void;
  addChatRoom: (chatRoom: ChatRoom) => void;
  updateChatRoom: (meetingId: string, updates: Partial<ChatRoom>) => void;
  removeChatRoom: (meetingId: string) => void;

  setCurrentChatRoom: (meetingId: string | null) => void;
  setLoading: (loading: boolean) => void;

  // Utility actions
  markAsRead: (meetingId: string) => void;
  getUnreadCount: (meetingId: string) => number;
  getLastMessage: (meetingId: string) => Message | undefined;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: {},
      chatRooms: [],
      currentChatRoom: null,
      isLoading: false,

      setMessages: (meetingId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [meetingId]: messages },
        })),

      addMessage: (meetingId, message) =>
        set((state) => {
          const currentMessages = state.messages[meetingId] || [];
          if (currentMessages.some((m) => m.id === message.id)) {
            return {};
          }
          const updatedMessages = [...currentMessages, message];

          // 채팅방 정보 업데이트
          const chatRoom = state.chatRooms.find((room) => room.meetingId === meetingId);
          const updatedChatRoom = chatRoom
            ? {
                ...chatRoom,
                lastMessage: message,
                unreadCount: chatRoom.unreadCount + 1,
              }
            : undefined;

          return {
            messages: { ...state.messages, [meetingId]: updatedMessages },
            chatRooms: updatedChatRoom
              ? state.chatRooms.map((room) => (room.meetingId === meetingId ? updatedChatRoom : room))
              : state.chatRooms,
          };
        }),

      updateMessage: (meetingId, messageId, updates) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [meetingId]: (state.messages[meetingId] || []).map((message) =>
              message.id === messageId ? { ...message, ...updates } : message
            ),
          },
        })),

      deleteMessage: (meetingId, messageId) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [meetingId]: (state.messages[meetingId] || []).filter((message) => message.id !== messageId),
          },
        })),

      setChatRooms: (chatRooms) => set({ chatRooms }),

      addChatRoom: (chatRoom) =>
        set((state) => ({
          chatRooms: [...state.chatRooms, chatRoom],
        })),

      updateChatRoom: (meetingId, updates) =>
        set((state) => ({
          chatRooms: state.chatRooms.map((room) => (room.meetingId === meetingId ? { ...room, ...updates } : room)),
        })),

      removeChatRoom: (meetingId) =>
        set((state) => ({
          chatRooms: state.chatRooms.filter((room) => room.meetingId !== meetingId),
          messages: Object.fromEntries(Object.entries(state.messages).filter(([id]) => id !== meetingId)),
        })),

      setCurrentChatRoom: (meetingId) => set({ currentChatRoom: meetingId }),

      setLoading: (loading) => set({ isLoading: loading }),

      markAsRead: (meetingId) =>
        set((state) => ({
          chatRooms: state.chatRooms.map((room) => (room.meetingId === meetingId ? { ...room, unreadCount: 0 } : room)),
        })),

      getUnreadCount: (meetingId) => {
        const state = get();
        const chatRoom = state.chatRooms.find((room) => room.meetingId === meetingId);
        return chatRoom?.unreadCount || 0;
      },

      getLastMessage: (meetingId) => {
        const state = get();
        const messages = state.messages[meetingId] || [];
        return messages[messages.length - 1];
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
