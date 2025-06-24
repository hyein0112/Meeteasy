import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";

export default function FirebaseTest() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking");

  useEffect(() => {
    checkFirebaseConnection();
  }, []);

  const checkFirebaseConnection = async () => {
    try {
      // Firebase 연결 상태 확인
      const apps = await import("firebase/app").then(({ getApps }) => getApps());
      if (apps.length > 0) {
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("error");
      }
    } catch (error) {
      console.error("Firebase 연결 확인 오류:", error);
      setConnectionStatus("error");
    }
  };

  const handleTestLogin = async () => {
    try {
      // 테스트용 이메일/비밀번호로 로그인 시도
      await AuthService.signInWithEmail("test@example.com", "password123");
      Alert.alert("성공", "Firebase 인증이 정상적으로 작동합니다!");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        Alert.alert("정보", "테스트 계정이 존재하지 않습니다. 이는 정상적인 동작입니다.");
      } else {
        Alert.alert("오류", `Firebase 연결 오류: ${error.message}`);
      }
    }
  };

  const handleTestLogout = async () => {
    try {
      await AuthService.signOut();
      Alert.alert("성공", "로그아웃이 완료되었습니다.");
    } catch (error: any) {
      Alert.alert("오류", `로그아웃 오류: ${error.message}`);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "#4CAF50";
      case "error":
        return "#F44336";
      default:
        return "#FF9800";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Firebase 연결됨";
      case "error":
        return "Firebase 연결 오류";
      default:
        return "연결 확인 중...";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase 연결 테스트</Text>

      {/* 연결 상태 */}
      <View style={styles.statusContainer}>
        <MaterialCommunityIcons name="circle" size={12} color={getStatusColor()} />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
      </View>

      {/* 인증 상태 */}
      <View style={styles.authContainer}>
        <Text style={styles.label}>인증 상태:</Text>
        <Text style={styles.value}>{isLoading ? "로딩 중..." : isAuthenticated ? "로그인 됨" : "로그아웃됨"}</Text>
      </View>

      {isAuthenticated && user && (
        <View style={styles.userContainer}>
          <Text style={styles.label}>사용자 정보:</Text>
          <Text style={styles.value}>이메일: {user.email}</Text>
          <Text style={styles.value}>UID: {user.uid}</Text>
        </View>
      )}

      {/* 테스트 버튼들 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleTestLogin}>
          <Text style={styles.buttonText}>테스트 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleTestLogout}>
          <Text style={styles.buttonText}>로그아웃</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.refreshButton]} onPress={checkFirebaseConnection}>
          <Text style={styles.buttonText}>연결 상태 새로고침</Text>
        </TouchableOpacity>
      </View>

      {/* 설정 안내 */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>설정 필요 사항:</Text>
        <Text style={styles.infoText}>
          1. Firebase Console에서 프로젝트 생성{"\n"}
          2. config/firebase.ts 파일에 실제 설정 정보 입력{"\n"}
          3. Authentication, Firestore, Storage 활성화{"\n"}
          4. 보안 규칙 설정
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  authContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  userContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4F8EF7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#F44336",
  },
  refreshButton: {
    backgroundColor: "#FF9800",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoContainer: {
    padding: 15,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1976D2",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#424242",
  },
});
