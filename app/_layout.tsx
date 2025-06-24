import { Stack } from "expo-router";
import { useEffect } from "react";
import { AuthService } from "../services/authService";

// Firebase 초기화를 안전하게 처리
let firebaseInitialized = false;
try {
  require("../config/firebase");
  firebaseInitialized = true;
  console.log("✅ Firebase 초기화 성공");
} catch (error) {
  console.error("❌ Firebase 초기화 오류:", error);
}

export default function RootLayout() {
  useEffect(() => {
    console.log("🔄 RootLayout 마운트됨");

    if (firebaseInitialized) {
      // Firebase Auth 리스너 설정
      const unsubscribe = AuthService.setupAuthListener();

      return () => {
        unsubscribe();
      };
    }
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="onboarding/EmailAuth" />
      <Stack.Screen name="create-meeting" />
      <Stack.Screen name="meeting-detail" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="vote" />
      <Stack.Screen name="invite" />
      <Stack.Screen name="my-meetings" />
      <Stack.Screen name="profile-edit" />
      <Stack.Screen name="calendar-sync" />
      <Stack.Screen name="notification-settings" />
    </Stack>
  );
}
