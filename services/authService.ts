import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useAuthStore } from "../stores/authStore";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string | null;
  phoneNumber?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  // 이메일/비밀번호 로그인
  static async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      if (!auth) {
        throw new Error("Firebase Auth가 초기화되지 않았습니다.");
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 사용자 프로필 정보 가져오기
      await this.loadUserProfile(user.uid);

      return user;
    } catch (error) {
      console.error("로그인 오류:", error);
      throw error;
    }
  }

  // 이메일/비밀번호 회원가입
  static async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
    try {
      if (!auth) {
        throw new Error("Firebase Auth가 초기화되지 않았습니다.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 사용자 프로필 생성 (photoURL이 undefined인 경우 제외)
      const userProfile: UserProfile = {
        id: user.uid,
        name,
        email,
        photoURL: user.photoURL || null, // undefined 대신 null 사용
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.createUserProfile(userProfile);
      useAuthStore.getState().setUserProfile(userProfile);

      return user;
    } catch (error) {
      console.error("회원가입 오류:", error);
      throw error;
    }
  }

  // 로그아웃
  static async signOut(): Promise<void> {
    try {
      if (!auth) {
        throw new Error("Firebase Auth가 초기화되지 않았습니다.");
      }

      await signOut(auth);
      useAuthStore.getState().logout();
    } catch (error) {
      console.error("로그아웃 오류:", error);
      throw error;
    }
  }

  // 사용자 프로필 생성
  static async createUserProfile(profile: UserProfile): Promise<void> {
    try {
      if (!db) {
        throw new Error("Firebase Firestore가 초기화되지 않았습니다.");
      }

      // undefined 값을 가진 필드들을 제거
      const cleanProfile = { ...profile };
      Object.keys(cleanProfile).forEach((key) => {
        if (cleanProfile[key as keyof UserProfile] === undefined) {
          delete cleanProfile[key as keyof UserProfile];
        }
      });

      await setDoc(doc(db, "users", profile.id), {
        ...cleanProfile,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      });
    } catch (error) {
      console.error("프로필 생성 오류:", error);
      throw error;
    }
  }

  // 사용자 프로필 로드
  static async loadUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!db || !auth) {
        throw new Error("Firebase가 초기화되지 않았습니다.");
      }

      const userDoc = await getDoc(doc(db, "users", userId));

      if (userDoc.exists()) {
        const data = userDoc.data();
        const profile: UserProfile = {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        } as UserProfile;

        useAuthStore.getState().setUserProfile(profile);
        return profile;
      } else {
        // 프로필이 없으면 기본 프로필 생성
        const user = auth.currentUser;
        if (user) {
          const defaultProfile: UserProfile = {
            id: user.uid,
            name: user.displayName || "사용자",
            email: user.email || "",
            photoURL: user.photoURL || null, // undefined 대신 null 사용
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await this.createUserProfile(defaultProfile);
          useAuthStore.getState().setUserProfile(defaultProfile);
          return defaultProfile;
        }
      }

      return null;
    } catch (error) {
      console.error("프로필 로드 오류:", error);
      throw error;
    }
  }

  // 사용자 프로필 업데이트
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      if (!db) {
        throw new Error("Firebase Firestore가 초기화되지 않았습니다.");
      }

      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, "users", userId), updateData);

      // 로컬 상태 업데이트
      const currentProfile = useAuthStore.getState().userProfile;
      if (currentProfile) {
        const updatedProfile = { ...currentProfile, ...updates, updatedAt: new Date() };
        useAuthStore.getState().setUserProfile(updatedProfile);
      }
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      throw error;
    }
  }

  // 인증 상태 리스너 설정
  static setupAuthListener(): () => void {
    try {
      if (!auth) {
        console.error("❌ Firebase Auth가 초기화되지 않았습니다.");
        return () => {};
      }

      console.log("🔄 Firebase Auth 리스너 설정 시작");

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log("🔄 Auth 상태 변경:", user ? "로그인됨" : "로그아웃됨");
        console.log("🔄 Auth 상태 변경:", user);
        useAuthStore.getState().setLoading(true);

        if (user) {
          useAuthStore.getState().setUser(user);
          await this.loadUserProfile(user.uid);
        } else {
          useAuthStore.getState().logout();
        }

        useAuthStore.getState().setLoading(false);
      });

      console.log("✅ Firebase Auth 리스너 설정 완료");
      return unsubscribe;
    } catch (error) {
      console.error("❌ Firebase Auth 리스너 설정 오류:", error);
      // 오류가 발생해도 빈 함수 반환
      return () => {};
    }
  }

  static async deleteAccount(): Promise<void> {
    if (!auth || !db) throw new Error("Firebase가 초기화되지 않았습니다.");
    const user = auth.currentUser;
    if (!user) throw new Error("로그인된 사용자가 없습니다.");

    // Firestore 사용자 데이터 삭제
    await deleteDoc(doc(db, "users", user.uid));
    // Firebase Auth 계정 삭제
    await deleteUser(user);
    // 상태 초기화
    useAuthStore.getState().logout();
  }
}
