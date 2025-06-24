import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, disableNetwork, enableNetwork, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

// 환경 변수에서 Firebase 설정 가져오기 (실제 프로젝트에서 설정 필요)
const firebaseConfig = {
  apiKey: "AIzaSyDvwl6KpZ4GtxkU8NIHJfXHWDOvw3EkN2A",
  authDomain: "meeteasy-86b9d.firebaseapp.com",
  projectId: "meeteasy-86b9d",
  storageBucket: "meeteasy-86b9d.firebasestorage.app",
  messagingSenderId: "624147132797",
  appId: "1:624147132797:web:17803c4af4f573286edc14",
  measurementId: "G-EPL2VPG2RV",
};

// Firebase 앱 초기화 (이미 초기화된 경우 기존 앱 사용)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  const apps = getApps();
  if (apps.length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase 앱 초기화 완료");
  } else {
    app = getApp();
    console.log("✅ 기존 Firebase 앱 사용");
  }

  // Firebase 서비스 초기화
  if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Firestore 오프라인 지원 활성화
    if (db) {
      // 개발 환경에서 에뮬레이터 연결 (필요시)
      // if (__DEV__) {
      //   connectFirestoreEmulator(db, 'localhost', 8080);
      // }
    }

    console.log("✅ Firebase 서비스 초기화 완료");
    console.log("✅ Firebase 연결됨:", firebaseConfig.projectId);
  }
} catch (error) {
  console.error("❌ Firebase 초기화 오류:", error);
  // 기본값 설정
  app = null;
  auth = null;
  db = null;
  storage = null;
}

// Firestore 연결 상태 관리 함수들
export const enableFirestoreNetwork = async () => {
  if (db) {
    try {
      await enableNetwork(db);
      console.log("✅ Firestore 네트워크 활성화");
    } catch (error) {
      console.error("❌ Firestore 네트워크 활성화 오류:", error);
    }
  }
};

export const disableFirestoreNetwork = async () => {
  if (db) {
    try {
      await disableNetwork(db);
      console.log("✅ Firestore 네트워크 비활성화");
    } catch (error) {
      console.error("❌ Firestore 네트워크 비활성화 오류:", error);
    }
  }
};

export { auth, db, storage };
export default app;
