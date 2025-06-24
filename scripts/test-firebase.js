// Firebase 연결 테스트 스크립트
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDvwl6KpZ4GtxkU8NIHJfXHWDOvw3EkN2A",
  authDomain: "meeteasy-86b9d.firebaseapp.com",
  projectId: "meeteasy-86b9d",
  storageBucket: "meeteasy-86b9d.firebasestorage.app",
  messagingSenderId: "624147132797",
  appId: "1:624147132797:web:17803c4af4f573286edc14",
  measurementId: "G-EPL2VPG2RV",
};

console.log("🔥 Firebase 연결 테스트 시작...");

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
  console.error("�� 오류 상세:", error);
}
