import { Redirect } from "expo-router";
import { useAuthStore } from "../stores/authStore";

export default function Index() {
  const { user, isLoading } = useAuthStore();

  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return null; // 또는 로딩 컴포넌트
  }

  // 로그인된 사용자는 홈 화면으로, 아니면 온보딩으로
  if (user) {
    return <Redirect href="/(tabs)/home" />;
  } else {
    return <Redirect href="/onboarding" />;
  }
}
