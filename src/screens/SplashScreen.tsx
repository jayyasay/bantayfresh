import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Text, View, styled } from "@tamagui/core";

import BrandMark from "../components/BrandMark";
import { COLORS } from "../theme/colors";

const SplashShell = styled(View, {
  flex: 1,
  backgroundColor: COLORS.night,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 28,
});

const SplashCenter = styled(View, {
  alignItems: "center",
  gap: 18,
});

const SplashMarkWrap = styled(View, {
  width: 180,
  height: 180,
  borderRadius: 46,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#101F18",
  borderWidth: 1,
  borderColor: "#23352C",
});

const SplashGlow = styled(View, {
  position: "absolute",
  width: 240,
  height: 240,
  borderRadius: 999,
  backgroundColor: COLORS.freshGreen,
  opacity: 0.08,
});

const SplashTitle = styled(Text, {
  color: COLORS.white,
  fontSize: 38,
  lineHeight: 42,
  fontWeight: "800",
  textAlign: "center",
});

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(wordOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoScale, wordOpacity]);

  return (
    <SplashShell>
      <SplashCenter>
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <SplashMarkWrap>
            <SplashGlow />
            <BrandMark showFrame={false} fillParent />
          </SplashMarkWrap>
        </Animated.View>

        <Animated.View style={{ opacity: wordOpacity }}>
          <SplashTitle>BantayFresh</SplashTitle>
        </Animated.View>
      </SplashCenter>
    </SplashShell>
  );
}
