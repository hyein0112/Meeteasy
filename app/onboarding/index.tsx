import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from "react-native";
import IntroSlides from "./IntroSlides";
import SocialLogin from "./SocialLogin";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const [slideIdx, setSlideIdx] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fb" }}>
      <LinearGradient colors={["#eaf2ff", "#f8f9fb"]} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.7 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingBottom: 32, justifyContent: "flex-start" }}>
          <View style={styles.logoBox}>
            <Text style={styles.appTitle}>Meeteasy</Text>
          </View>
          <View style={styles.slideWrap}>
            <IntroSlides onChangeIndex={setSlideIdx} />
          </View>
          <View style={styles.indicatorRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.indicator, slideIdx === i && styles.indicatorActive]} />
            ))}
          </View>
          <View style={styles.loginBox}>
            <SocialLogin onLogin={() => router.replace("/home")} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  logoBox: { alignItems: "center", marginTop: 32, marginBottom: 8 },
  appTitle: { fontSize: 32, fontWeight: "bold", color: "#4F8EF7", letterSpacing: 1 },
  slideWrap: { height: 180, justifyContent: "center", marginTop: 12, marginBottom: 0 },
  indicatorRow: { flexDirection: "row", justifyContent: "center", marginTop: 18, marginBottom: 8 },
  indicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#d0e2ff", marginHorizontal: 5 },
  indicatorActive: { backgroundColor: "#4F8EF7", width: 22 },
  loginBox: { marginTop: 8, paddingHorizontal: 16 },
});
