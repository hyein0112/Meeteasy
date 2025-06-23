import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text, View, useColorScheme } from "react-native";
import IntroSlides from "./IntroSlides";
import SocialLogin from "./SocialLogin";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const [slideIdx, setSlideIdx] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#181A20" : "#f8f9fb";
  const gradientColors = isDark ? (["#23262F", "#181A20"] as const) : (["#eaf2ff", "#ffffff"] as const);
  const titleColor = "#4F8EF7";
  const indicatorColor = isDark ? "#444" : "#d0e2ff";
  const indicatorActiveColor = "#4F8EF7";

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.7 }} />
      <View style={{ flex: 1, paddingBottom: 32, justifyContent: "flex-start" }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.logoBox}>
            <Text style={[styles.appTitle, { color: titleColor }]}>Meeteasy</Text>
          </View>
          <View style={styles.slideWrap}>
            <IntroSlides onChangeIndex={setSlideIdx} isDark={isDark} />
          </View>
          <View style={styles.indicatorRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.indicator,
                  { backgroundColor: indicatorColor },
                  slideIdx === i && { backgroundColor: indicatorActiveColor, width: 22 },
                ]}
              />
            ))}
          </View>
          <View style={styles.loginBox}>
            <SocialLogin onLogin={() => router.replace("/home")} isDark={isDark} />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoBox: { alignItems: "center", marginTop: 32, marginBottom: 8 },
  appTitle: { fontSize: 32, fontWeight: "bold", letterSpacing: 1 },
  slideWrap: { height: 180, justifyContent: "center", marginTop: 12, marginBottom: 0 },
  indicatorRow: { flexDirection: "row", justifyContent: "center", marginTop: 18, marginBottom: 8 },
  indicator: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 5 },
  indicatorActive: { backgroundColor: "#4F8EF7", width: 22 },
  loginBox: { marginTop: 8, paddingHorizontal: 16 },
});
