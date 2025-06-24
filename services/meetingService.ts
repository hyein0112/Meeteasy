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
import { Meeting, Participant, ScheduleOption } from "../stores/meetingStore";

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

  // 모임 생성
  static async createMeeting(meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">): Promise<string> {
    return this.withRetry(async () => {
      if (!db) {
        throw new Error("Firestore가 초기화되지 않았습니다.");
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...meetingData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ 모임 생성 완료:", docRef.id);
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
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

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
    try {
      const meeting = await this.getMeeting(meetingId);
      if (!meeting) throw new Error("모임을 찾을 수 없습니다.");

      const updatedParticipants = [...meeting.participants, participant];

      await this.updateMeeting(meetingId, { participants: updatedParticipants });
    } catch (error) {
      console.error("참석자 추가 오류:", error);
      throw error;
    }
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
    try {
      const meeting = await this.getMeeting(meetingId);
      if (!meeting) throw new Error("모임을 찾을 수 없습니다.");

      const updatedOptions = [...meeting.scheduleOptions, option];

      await this.updateMeeting(meetingId, { scheduleOptions: updatedOptions });
    } catch (error) {
      console.error("일정 옵션 추가 오류:", error);
      throw error;
    }
  }

  // 일정 옵션 삭제
  static async removeScheduleOption(meetingId: string, optionId: string): Promise<void> {
    try {
      const meeting = await this.getMeeting(meetingId);
      if (!meeting) throw new Error("모임을 찾을 수 없습니다.");

      const updatedOptions = meeting.scheduleOptions.filter((option) => option.id !== optionId);

      await this.updateMeeting(meetingId, { scheduleOptions: updatedOptions });
    } catch (error) {
      console.error("일정 옵션 삭제 오류:", error);
      throw error;
    }
  }

  // 일정 투표
  static async voteSchedule(meetingId: string, optionId: string, participantId: string): Promise<void> {
    try {
      const meeting = await this.getMeeting(meetingId);
      if (!meeting) throw new Error("모임을 찾을 수 없습니다.");

      const updatedOptions = meeting.scheduleOptions.map((option) => {
        if (option.id === optionId) {
          const votes = option.votes.includes(participantId)
            ? option.votes.filter((id) => id !== participantId)
            : [...option.votes, participantId];

          return { ...option, votes };
        }
        return option;
      });

      await this.updateMeeting(meetingId, { scheduleOptions: updatedOptions });
    } catch (error) {
      console.error("일정 투표 오류:", error);
      throw error;
    }
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

      const q = query(collection(db, this.COLLECTION_NAME), where("creatorId", "==", userId), orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
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
}
