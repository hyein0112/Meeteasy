import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  inviteCode: string;
  status: "planning" | "confirmed" | "cancelled";
  confirmedDate?: Date;
  confirmedTime?: string;
  location?: {
    name: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  participants: Participant[];
  scheduleOptions: ScheduleOption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  status: "pending" | "accepted" | "declined";
  joinedAt: Date;
}

export interface ScheduleOption {
  id: string;
  date: Date;
  time: string;
  votes: string[]; // 참석자 ID 배열
}

interface MeetingState {
  meetings: Meeting[];
  currentMeeting: Meeting | null;
  isLoading: boolean;

  // Actions
  setMeetings: (meetings: Meeting[]) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  setCurrentMeeting: (meeting: Meeting | null) => void;
  setLoading: (loading: boolean) => void;

  // Participant actions
  addParticipant: (meetingId: string, participant: Participant) => void;
  updateParticipantStatus: (meetingId: string, participantId: string, status: Participant["status"]) => void;

  // Schedule actions
  addScheduleOption: (meetingId: string, option: ScheduleOption) => void;
  removeScheduleOption: (meetingId: string, optionId: string) => void;
  voteSchedule: (meetingId: string, optionId: string, participantId: string) => void;
  confirmSchedule: (meetingId: string, optionId: string) => void;
}

export const useMeetingStore = create<MeetingState>()(
  persist(
    (set, get) => ({
      meetings: [],
      currentMeeting: null,
      isLoading: false,

      setMeetings: (meetings) => set({ meetings }),

      addMeeting: (meeting) =>
        set((state) => ({
          meetings: [...state.meetings, meeting],
        })),

      updateMeeting: (id, updates) =>
        set((state) => ({
          meetings: state.meetings.map((meeting) => (meeting.id === id ? { ...meeting, ...updates, updatedAt: new Date() } : meeting)),
          currentMeeting:
            state.currentMeeting?.id === id ? { ...state.currentMeeting, ...updates, updatedAt: new Date() } : state.currentMeeting,
        })),

      deleteMeeting: (id) =>
        set((state) => ({
          meetings: state.meetings.filter((meeting) => meeting.id !== id),
          currentMeeting: state.currentMeeting?.id === id ? null : state.currentMeeting,
        })),

      setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),

      setLoading: (loading) => set({ isLoading: loading }),

      addParticipant: (meetingId, participant) =>
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === meetingId ? { ...meeting, participants: [...meeting.participants, participant] } : meeting
          ),
        })),

      updateParticipantStatus: (meetingId, participantId, status) =>
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === meetingId
              ? {
                  ...meeting,
                  participants: meeting.participants.map((p) => (p.id === participantId ? { ...p, status } : p)),
                }
              : meeting
          ),
        })),

      addScheduleOption: (meetingId, option) =>
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === meetingId ? { ...meeting, scheduleOptions: [...meeting.scheduleOptions, option] } : meeting
          ),
        })),

      removeScheduleOption: (meetingId, optionId) =>
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === meetingId
              ? {
                  ...meeting,
                  scheduleOptions: meeting.scheduleOptions.filter((option) => option.id !== optionId),
                }
              : meeting
          ),
        })),

      voteSchedule: (meetingId, optionId, participantId) =>
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === meetingId
              ? {
                  ...meeting,
                  scheduleOptions: meeting.scheduleOptions.map((option) =>
                    option.id === optionId
                      ? {
                          ...option,
                          votes: option.votes.includes(participantId)
                            ? option.votes.filter((id) => id !== participantId)
                            : [...option.votes, participantId],
                        }
                      : option
                  ),
                }
              : meeting
          ),
        })),

      confirmSchedule: (meetingId, optionId) =>
        set((state) => {
          const meeting = state.meetings.find((m) => m.id === meetingId);
          const option = meeting?.scheduleOptions.find((o) => o.id === optionId);

          if (!meeting || !option) return state;

          return {
            meetings: state.meetings.map((m) =>
              m.id === meetingId
                ? {
                    ...m,
                    status: "confirmed" as const,
                    confirmedDate: option.date,
                    confirmedTime: option.time,
                  }
                : m
            ),
          };
        }),
    }),
    {
      name: "meeting-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
