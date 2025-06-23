import React from "react";
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from "react-native";

const slides = [
  {
    key: "1",
    emoji: "🎉",
    title: "모임 생성 & 초대",
    desc: "간편하게 모임을 만들고, 링크로 친구를 초대하세요.",
  },
  {
    key: "2",
    emoji: "📅",
    title: "일정 조율 & 투표",
    desc: "참석자들이 가능한 날짜/시간을 입력하고, 투표로 최적 일정을 정해요.",
  },
  {
    key: "3",
    emoji: "🤖",
    title: "AI 추천 일정",
    desc: "AI가 모두에게 가장 좋은 일정을 추천해줍니다.",
  },
  {
    key: "4",
    emoji: "💬",
    title: "실시간 채팅 & 후기",
    desc: "모임 채팅, 준비물, 후기까지 한 곳에서!",
  },
];

const { width } = Dimensions.get("window");

export default function IntroSlides({ onChangeIndex }: { onChangeIndex?: (idx: number) => void }) {
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!onChangeIndex) return;
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    onChangeIndex(idx);
  };
  return (
    <FlatList
      data={slides}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => (
        <View style={[styles.slide, { width }]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.desc}</Text>
        </View>
      )}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    />
  );
}

const styles = StyleSheet.create({
  slide: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emoji: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#4F8EF7", marginBottom: 12 },
  desc: { fontSize: 17, color: "#444", textAlign: "center" },
});
