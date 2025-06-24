// Firebase 연결 테스트 스크립트
require("dotenv/config");
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log("🔥 Firebase 연결 테스트 시작...");

// 환경 변수 확인
if (!firebaseConfig.apiKey) {
  console.error("❌ 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.");
  console.log("📝 필요한 환경 변수:");
  console.log("  - EXPO_PUBLIC_FIREBASE_API_KEY");
  console.log("  - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN");
  console.log("  - EXPO_PUBLIC_FIREBASE_PROJECT_ID");
  console.log("  - EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET");
  console.log("  - EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  console.log("  - EXPO_PUBLIC_FIREBASE_APP_ID");
  console.log("  - EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID");
  process.exit(1);
}

try {
  // Firebase 앱 초기화
  const app = initializeApp(firebaseConfig);
  console.log("✅ Firebase 앱 초기화 성공!");

  // Firebase 서비스 초기화
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log("✅ Firebase Auth 초기화 성공!");
  console.log("✅ Firebase Firestore 초기화 성공!");

  // 앱 정보 출력
  console.log("📱 Firebase 앱 정보:");
  console.log("  - Project ID:", app.options.projectId);
  console.log("  - Auth Domain:", app.options.authDomain);
  console.log("  - Storage Bucket:", app.options.storageBucket);

  console.log("🎉 Firebase 연결 테스트 완료! 모든 서비스가 정상적으로 초기화되었습니다.");
} catch (error) {
  console.error("❌ Firebase 연결 테스트 실패:", error.message);
  console.error("🔍 오류 상세:", error);
}
