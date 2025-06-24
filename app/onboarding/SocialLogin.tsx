import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SocialLogin({ isDark }: { isDark?: boolean }) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const checkboxBg = "#fff";
  const textColor = isDark ? "#fff" : "#222";

  const handleEmailLogin = () => {
    if (!agreed) return;
    router.push("/onboarding/EmailAuth");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.snsBtn, { backgroundColor: "#4F8EF7" }]}
        onPress={agreed ? handleEmailLogin : undefined}
        disabled={!agreed}
      >
        <MaterialCommunityIcons name="email" size={24} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.snsText, { color: "#fff" }]}>이메일로 시작</Text>
      </TouchableOpacity>

      <View style={styles.agreeRow}>
        <TouchableOpacity onPress={() => setAgreed((v) => !v)} style={[styles.checkbox, { backgroundColor: checkboxBg }]}>
          {agreed && <MaterialCommunityIcons name="check" size={18} color="#4F8EF7" />}
        </TouchableOpacity>
        <Text style={[styles.agreeText, { color: "#4F8EF7" }]}>개인정보 처리방침 및 이용약관 동의</Text>
      </View>
      <Text style={[styles.pushInfo, { color: textColor }]}>서비스 이용을 위해 푸시 알림 권한이 필요할 수 있습니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 32, alignItems: "center" },
  snsBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  snsText: { fontSize: 17, fontWeight: "bold" },
  agreeRow: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#4F8EF7",
    borderRadius: 6,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  agreeText: { fontSize: 15 },
  pushInfo: { fontSize: 14, marginTop: 8, textAlign: "center" },
});
