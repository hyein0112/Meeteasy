import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SocialLogin({ onLogin }: { onLogin: () => void }) {
  const [agreed, setAgreed] = useState(false);
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.snsBtn} disabled>
        <MaterialCommunityIcons name="message-processing" size={24} color="#3C1E1E" style={{ marginRight: 8 }} />
        <Text style={styles.snsText}>카카오로 시작 (준비중)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.snsBtn} disabled>
        <MaterialCommunityIcons name="google" size={24} color="#EA4335" style={{ marginRight: 8 }} />
        <Text style={styles.snsText}>구글로 시작 (준비중)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.snsBtn} disabled>
        <MaterialCommunityIcons name="apple" size={24} color="#222" style={{ marginRight: 8 }} />
        <Text style={styles.snsText}>애플로 시작 (준비중)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.snsBtn, { backgroundColor: "#4F8EF7" }]} onPress={agreed ? onLogin : undefined} disabled={!agreed}>
        <MaterialCommunityIcons name="account" size={24} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.snsText, { color: "#fff" }]}>비회원으로 시작</Text>
      </TouchableOpacity>
      <View style={styles.agreeRow}>
        <TouchableOpacity onPress={() => setAgreed((v) => !v)} style={styles.checkbox}>
          {agreed && <MaterialCommunityIcons name="check" size={18} color="#4F8EF7" />}
        </TouchableOpacity>
        <Text style={styles.agreeText}>개인정보 처리방침 및 이용약관 동의</Text>
      </View>
      <Text style={styles.pushInfo}>서비스 이용을 위해 푸시 알림 권한이 필요할 수 있습니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 32, alignItems: "center" },
  snsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  snsText: { fontSize: 17, fontWeight: "bold", color: "#222" },
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
    backgroundColor: "#fff",
  },
  agreeText: { fontSize: 15, color: "#4F8EF7" },
  pushInfo: { color: "#888", fontSize: 14, marginTop: 8, textAlign: "center" },
});
