import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  enableNetwork,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Participant {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
  status: "confirmed" | "pending" | "declined";
  joinedAt: Date;
}

export interface ScheduleOption {
  id: string;
  date: Date;
  time: string;
  votes: string[]; // 참석자 ID 배열
}

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

// undefined 필드 제거 유틸
export function removeUndefined(obj: any): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
}
export function removeUndefinedFromArray(arr: any[]): any[] {
  return arr.map(removeUndefined);
}

export class MeetingService {
  private static COLLECTION_NAME = "meetings";
  private static MAX_RETRIES = 3;
  private static RETRY_DELAY = 1000; // 1초

  // 재시도 로직을 포함한 제네릭 함수
  private static async withRetry<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        console.warn(`${operationName} 시도 ${attempt}/${this.MAX_RETRIES} 실패:`, error.message);

        // 마지막 시도가 아니면 잠시 대기 후 재시도
        if (attempt < this.MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY * attempt));

          // 네트워크 재연결 시도
          try {
            if (db) {
              await enableNetwork(db);
            }
          } catch (networkError) {
            console.warn("네트워크 재연결 실패:", networkError);
          }
        }
      }
    }

    throw lastError || new Error(`${operationName} 최대 재시도 횟수 초과`);
  }

  // 모임 목록 조회 (사용자가 생성한 모임)
  static async fetchUserMeetings(userId: string): Promise<Meeting[]> {
    return this.withRetry(async () => {
      if (!db) {
        throw new Error("Firestore가 초기화되지 않았습니다.");
      }

      const q = query(collection(db, this.COLLECTION_NAME), where("creatorId", "==", userId), orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const meetings: Meeting[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        meetings.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          creatorId: data.creatorId,
          creatorName: data.creatorName,
          inviteCode: data.inviteCode,
          status: data.status,
          confirmedDate: data.confirmedDate ? new Date(data.confirmedDate.toDate()) : undefined,
          confirmedTime: data.confirmedTime,
          location: data.location,
          participants: data.participants || [],
          scheduleOptions: data.scheduleOptions || [],
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
        });
      });

      return meetings;
    }, "모임 목록 조회");
  }

  // 참여 중인 모임 목록 조회 (참석자로 포함된 모임)
  static async fetchParticipatingMeetings(userId: string): Promise<Meeting[]> {
    return this.withRetry(async () => {
      if (!db) {
        throw new Error("Firestore가 초기화되지 않았습니다.");
      }

      const q = query(collection(db, this.COLLECTION_NAME), orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const meetings: Meeting[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const participants = data.participants || [];

        // 현재 사용자가 참석자인지 확인
        const isParticipant = participants.some((p: any) => p.id === userId);

        if (isParticipant) {
          meetings.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            creatorId: data.creatorId,
            creatorName: data.creatorName,
            inviteCode: data.inviteCode,
            status: data.status,
            confirmedDate: data.confirmedDate ? new Date(data.confirmedDate.toDate()) : undefined,
            confirmedTime: data.confirmedTime,
            location: data.location,
            participants: participants,
            scheduleOptions: data.scheduleOptions || [],
            createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
          });
        }
      });

      return meetings;
    }, "참여 중인 모임 목록 조회");
  }

  // 모든 관련 모임 조회 (생성한 모임 + 참여 중인 모임)
  static async fetchAllUserMeetings(userId: string): Promise<Meeting[]> {
    return this.withRetry(async () => {
      if (!db) {
        throw new Error("Firestore가 초기화되지 않았습니다.");
      }

      const q = query(collection(db, this.COLLECTION_NAME), orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const meetings: Meeting[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const participants = data.participants || [];

        // 현재 사용자가 생성자이거나 참석자인지 확인
        const isCreator = data.creatorId === userId;
        const isParticipant = participants.some((p: any) => p.id === userId);

        if (isCreator || isParticipant) {
          meetings.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            creatorId: data.creatorId,
            creatorName: data.creatorName,
            inviteCode: data.inviteCode,
            status: data.status,
            confirmedDate: data.confirmedDate ? new Date(data.confirmedDate.toDate()) : undefined,
            confirmedTime: data.confirmedTime,
            location: data.location,
            participants: participants,
            scheduleOptions: data.scheduleOptions || [],
            createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
          });
        }
      });

      return meetings;
    }, "모든 관련 모임 목록 조회");
  }

  // 모임 생성
  static async createMeeting(meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt" | "inviteCode">): Promise<string> {
    return this.withRetry(async () => {
      if (!db) {
        throw new Error("Firestore가 초기화되지 않았습니다.");
      }

      // 고유한 초대 코드 생성
      const inviteCode = await this.generateUniqueInviteCode();

      // undefined 필드 제거
      const cleanMeetingData = removeUndefined(meetingData);
      if (cleanMeetingData.participants) {
        cleanMeetingData.participants = removeUndefinedFromArray(cleanMeetingData.participants);
      }
      if (cleanMeetingData.scheduleOptions) {
        cleanMeetingData.scheduleOptions = removeUndefinedFromArray(cleanMeetingData.scheduleOptions);
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...cleanMeetingData,
        inviteCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ 모임 생성 완료:", docRef.id, "초대 코드:", inviteCode);
      return docRef.id;
    }, "모임 생성");
  }

  // 모임 조회 (단일)
  static async getMeeting(meetingId: string): Promise<Meeting | null> {
    return this.withRetry(async () => {
      if (!db) {
        throw new Error("Firestore가 초기화되지 않았습니다.");
      }

      const docRef = doc(db, this.COLLECTION_NAME, meetingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title,
          description: data.description,
          creatorId: data.creatorId,
          creatorName: data.creatorName,
          inviteCode: data.inviteCode,
          status: data.status,
          confirmedDate: data.confirmedDate ? new Date(data.confirmedDate.toDate()) : undefined,
          confirmedTime: data.confirmedTime,
          location: data.location,
          participants: data.participants || [],
          scheduleOptions: data.scheduleOptions || [],
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
        };
      }

      return null;
    }, "모임 조회");
  }

  // 모임 업데이트
  static async updateMeeting(meetingId: string, updates: Partial<Meeting>): Promise<void> {
    return this.withRetry(async () => {
      if (!db) {
        throw new Error("Firestore가 초기화되지 않았습니다.");
      }

      const docRef = doc(db, this.COLLECTION_NAME, meetingId);
      // participants, scheduleOptions 등 배열 내부도 undefined 제거
      const cleanUpdates = { ...updates };
      if (cleanUpdates.participants) {
        cleanUpdates.participants = removeUndefinedFromArray(cleanUpdates.participants);
      }
      if (cleanUpdates.scheduleOptions) {
        cleanUpdates.scheduleOptions = removeUndefinedFromArray(cleanUpdates.scheduleOptions);
      }
      await updateDoc(
        docRef,
        removeUndefined({
          ...cleanUpdates,
          updatedAt: serverTimestamp(),
        })
      );
      console.log("✅ 모임 업데이트 완료:", meetingId);
    }, "모임 업데이트");
  }

  // 모임 삭제
  static async deleteMeeting(meetingId: string): Promise<void> {
    return this.withRetry(async () => {
      if (!db) {
        throw new Error("Firestore가 초기화되지 않았습니다.");
      }

      const docRef = doc(db, this.COLLECTION_NAME, meetingId);
      await deleteDoc(docRef);

      console.log("✅ 모임 삭제 완료:", meetingId);
    }, "모임 삭제");
  }

  // 참석자 추가
  static async addParticipant(meetingId: string, participant: Participant): Promise<void> {
    return this.withRetry(async () => {
      if (!db) {
        throw new Error("Firestore가 초기화되지 않았습니다.");
      }

      const docRef = doc(db, this.COLLECTION_NAME, meetingId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("모임을 찾을 수 없습니다.");
      const data = docSnap.data();
      const participants = data.participants || [];
      // undefined 필드 제거
      const cleanParticipant = removeUndefined(participant);
      await updateDoc(docRef, {
        participants: removeUndefinedFromArray([...participants, cleanParticipant]),
        updatedAt: serverTimestamp(),
      });
      console.log("✅ 참석자 추가 완료:", meetingId, cleanParticipant);
    }, "참석자 추가");
  }

  // 참석자 상태 업데이트
  static async updateParticipantStatus(meetingId: string, participantId: string, status: Participant["status"]): Promise<void> {
    try {
      const meeting = await this.getMeeting(meetingId);
      if (!meeting) throw new Error("모임을 찾을 수 없습니다.");

      const updatedParticipants = meeting.participants.map((p) => (p.id === participantId ? { ...p, status } : p));

      await this.updateMeeting(meetingId, { participants: updatedParticipants });
    } catch (error) {
      console.error("참석자 상태 업데이트 오류:", error);
      throw error;
    }
  }

  // 일정 옵션 추가
  static async addScheduleOption(meetingId: string, option: ScheduleOption): Promise<void> {
    return this.withRetry(async () => {
      if (!db) throw new Error("Firestore가 초기화되지 않았습니다.");
      const docRef = doc(db, this.COLLECTION_NAME, meetingId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("모임을 찾을 수 없습니다.");
      const data = docSnap.data();
      const scheduleOptions = data.scheduleOptions || [];
      const cleanOption = removeUndefined(option);
      await updateDoc(docRef, {
        scheduleOptions: removeUndefinedFromArray([...scheduleOptions, cleanOption]),
        updatedAt: serverTimestamp(),
      });
    }, "일정 후보 추가");
  }

  // 일정 옵션 삭제
  static async removeScheduleOption(meetingId: string, optionId: string): Promise<void> {
    return this.withRetry(async () => {
      if (!db) throw new Error("Firestore가 초기화되지 않았습니다.");
      const docRef = doc(db, this.COLLECTION_NAME, meetingId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("모임을 찾을 수 없습니다.");
      const data = docSnap.data();
      const scheduleOptions = (data.scheduleOptions || []).filter((o: any) => o.id !== optionId);
      await updateDoc(docRef, {
        scheduleOptions: removeUndefinedFromArray(scheduleOptions),
        updatedAt: serverTimestamp(),
      });
    }, "일정 후보 삭제");
  }

  // 일정 투표
  static async voteSchedule(meetingId: string, optionId: string, participantId: string): Promise<void> {
    return this.withRetry(async () => {
      if (!db) throw new Error("Firestore가 초기화되지 않았습니다.");
      const docRef = doc(db, this.COLLECTION_NAME, meetingId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("모임을 찾을 수 없습니다.");
      const data = docSnap.data();
      const scheduleOptions = (data.scheduleOptions || []).map((option: any) => {
        if (option.id === optionId) {
          const votes = option.votes || [];
          const isVoted = votes.includes(participantId);
          return removeUndefined({
            ...option,
            votes: isVoted ? votes.filter((v: string) => v !== participantId) : [...votes, participantId],
          });
        }
        return removeUndefined(option);
      });
      await updateDoc(docRef, {
        scheduleOptions: removeUndefinedFromArray(scheduleOptions),
        updatedAt: serverTimestamp(),
      });
    }, "일정 투표");
  }

  // 일정 확정
  static async confirmSchedule(meetingId: string, optionId: string): Promise<void> {
    try {
      const meeting = await this.getMeeting(meetingId);
      if (!meeting) throw new Error("모임을 찾을 수 없습니다.");

      const option = meeting.scheduleOptions.find((o) => o.id === optionId);
      if (!option) throw new Error("일정 옵션을 찾을 수 없습니다.");

      await this.updateMeeting(meetingId, {
        status: "confirmed",
        confirmedDate: option.date,
        confirmedTime: option.time,
      });
    } catch (error) {
      console.error("일정 확정 오류:", error);
      throw error;
    }
  }

  // 실시간 모임 업데이트 리스너
  static subscribeToMeeting(meetingId: string, callback: (meeting: Meeting | null) => void): () => void {
    try {
      if (!db) {
        console.error("Firestore가 초기화되지 않았습니다.");
        return () => {};
      }

      const docRef = doc(db, this.COLLECTION_NAME, meetingId);

      const unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const meeting: Meeting = {
              id: doc.id,
              title: data.title,
              description: data.description,
              creatorId: data.creatorId,
              creatorName: data.creatorName,
              inviteCode: data.inviteCode,
              status: data.status,
              confirmedDate: data.confirmedDate ? new Date(data.confirmedDate.toDate()) : undefined,
              confirmedTime: data.confirmedTime,
              location: data.location,
              participants: data.participants || [],
              scheduleOptions: data.scheduleOptions || [],
              createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
              updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
            };
            callback(meeting);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error("모임 실시간 업데이트 오류:", error);
          callback(null);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("모임 구독 설정 오류:", error);
      return () => {};
    }
  }

  // 실시간 사용자 모임 목록 리스너
  static subscribeToUserMeetings(userId: string, callback: (meetings: Meeting[]) => void): () => void {
    try {
      if (!db) {
        console.error("Firestore가 초기화되지 않았습니다.");
        return () => {};
      }

      const q = query(collection(db, this.COLLECTION_NAME), orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const meetings: Meeting[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const participants = data.participants || [];

            // 현재 사용자가 생성자이거나 참석자인지 확인
            const isCreator = data.creatorId === userId;
            const isParticipant = participants.some((p: any) => p.id === userId);

            if (isCreator || isParticipant) {
              meetings.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                creatorId: data.creatorId,
                creatorName: data.creatorName,
                inviteCode: data.inviteCode,
                status: data.status,
                confirmedDate: data.confirmedDate ? new Date(data.confirmedDate.toDate()) : undefined,
                confirmedTime: data.confirmedTime,
                location: data.location,
                participants: participants,
                scheduleOptions: data.scheduleOptions || [],
                createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
                updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
              });
            }
          });

          callback(meetings);
        },
        (error) => {
          console.error("사용자 모임 목록 실시간 업데이트 오류:", error);
          callback([]);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("사용자 모임 구독 설정 오류:", error);
      return () => {};
    }
  }

  // 초대 코드로 모임 찾기
  static async findMeetingByInviteCode(inviteCode: string): Promise<Meeting | null> {
    return this.withRetry(async () => {
      if (!db) {
        throw new Error("Firestore가 초기화되지 않았습니다.");
      }

      const q = query(collection(db, this.COLLECTION_NAME), where("inviteCode", "==", inviteCode));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          creatorId: data.creatorId,
          creatorName: data.creatorName,
          inviteCode: data.inviteCode,
          status: data.status,
          confirmedDate: data.confirmedDate ? new Date(data.confirmedDate.toDate()) : undefined,
          confirmedTime: data.confirmedTime,
          location: data.location,
          participants: data.participants || [],
          scheduleOptions: data.scheduleOptions || [],
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
        };
      }

      return null;
    }, "초대 코드로 모임 찾기");
  }

  // 초대 코드 생성 (6자리 영문+숫자)
  private static generateInviteCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 초대 코드 중복 확인
  private static async isInviteCodeUnique(code: string): Promise<boolean> {
    const existingMeeting = await this.findMeetingByInviteCode(code);
    return !existingMeeting;
  }

  // 고유한 초대 코드 생성
  private static async generateUniqueInviteCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = this.generateInviteCode();
      attempts++;
      if (attempts > maxAttempts) {
        throw new Error("초대 코드 생성에 실패했습니다. 다시 시도해주세요.");
      }
    } while (!(await this.isInviteCodeUnique(code)));

    return code;
  }
}
