import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { AuthService } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";

export default function EmailAuth() {
  const router = useRouter();
  const { setLoading } = useAuthStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // 다크모드 색상 설정
  const bgColor = isDark ? "#181A20" : "#f5f5f5";
  const cardColor = isDark ? "#23262F" : "#fff";
  const textColor = isDark ? "#fff" : "#333";
  const labelColor = isDark ? "#fff" : "#333";
  const inputBgColor = isDark ? "#2A2D3A" : "#fff";
  const inputBorderColor = isDark ? "#3A3F4B" : "#ddd";
  const placeholderColor = isDark ? "#9BA1A6" : "#999";
  const iconColor = isDark ? "#9BA1A6" : "#666";
  const linkColor = isDark ? "#4F8EF7" : "#4F8EF7";

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!email || !password) {
      Alert.alert("오류", "이메일과 비밀번호를 입력해주세요.");
      return false;
    }

    if (!isLogin && !name) {
      Alert.alert("오류", "이름을 입력해주세요.");
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("오류", "비밀번호는 6자 이상이어야 합니다.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("오류", "올바른 이메일 형식을 입력해주세요.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      if (isLogin) {
        // 로그인
        await AuthService.signInWithEmail(email, password);
        Alert.alert("성공", "로그인되었습니다.");
        router.replace("/(tabs)/home");
      } else {
        // 회원가입
        await AuthService.signUpWithEmail(email, password, name);
        Alert.alert("성공", "회원가입이 완료되었습니다.");
        router.replace("/(tabs)/home");
      }
    } catch (error: any) {
      console.error("인증 오류:", error);
      let errorMessage = "오류가 발생했습니다. 다시 시도해주세요.";
      let shouldSwitchToSignup = false;

      if (error.code === "auth/user-not-found") {
        errorMessage = "등록되지 않은 이메일입니다.";
        shouldSwitchToSignup = true;
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "비밀번호가 올바르지 않습니다.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.";
        shouldSwitchToSignup = true;
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "이미 사용 중인 이메일입니다.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "비밀번호가 너무 약합니다.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "올바르지 않은 이메일 형식입니다.";
      }

      if (shouldSwitchToSignup) {
        Alert.alert("계정이 없습니다", "등록되지 않은 이메일이거나 잘못된 정보입니다. 회원가입을 진행하시겠습니까?", [
          {
            text: "취소",
            style: "cancel",
          },
          {
            text: "회원가입",
            onPress: () => {
              setIsLogin(false);
              setName("");
              setConfirmPassword("");
              setShowConfirmPassword(false);
            },
          },
        ]);
      } else if (error.code === "auth/email-already-in-use" && !isLogin) {
        Alert.alert("이미 가입된 이메일입니다", "이 이메일로 이미 가입된 계정이 있습니다. 로그인을 시도하시겠습니까?", [
          {
            text: "취소",
            style: "cancel",
          },
          {
            text: "로그인",
            onPress: () => {
              setIsLogin(true);
              setName("");
              setConfirmPassword("");
              setShowConfirmPassword(false);
            },
          },
        ]);
      } else {
        Alert.alert("오류", errorMessage);
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: bgColor }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>{isLogin ? "로그인" : "회원가입"}</Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: labelColor }]}>이름</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBgColor, borderColor: inputBorderColor, color: textColor }]}
                value={name}
                onChangeText={setName}
                placeholder="이름을 입력하세요"
                placeholderTextColor={placeholderColor}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: labelColor }]}>이메일</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBgColor, borderColor: inputBorderColor, color: textColor }]}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일을 입력하세요"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: labelColor }]}>비밀번호</Text>
            <View style={[styles.passwordContainer, { backgroundColor: inputBgColor, borderColor: inputBorderColor }]}>
              <TextInput
                style={[styles.input, styles.passwordInput, { backgroundColor: "transparent", color: textColor }]}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={placeholderColor}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: labelColor }]}>비밀번호 확인</Text>
              <View style={[styles.passwordContainer, { backgroundColor: inputBgColor, borderColor: inputBorderColor }]}>
                <TextInput
                  style={[styles.input, styles.passwordInput, { backgroundColor: "transparent", color: textColor }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="비밀번호를 다시 입력하세요"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={iconColor} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>{isLogin ? "로그인" : "회원가입"}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeToggle} onPress={toggleMode}>
            <Text style={[styles.modeToggleText, { color: linkColor }]}>
              {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
  },
  eyeButton: {
    padding: 12,
  },
  submitButton: {
    backgroundColor: "#4F8EF7",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modeToggle: {
    alignItems: "center",
    paddingVertical: 16,
  },
  modeToggleText: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
