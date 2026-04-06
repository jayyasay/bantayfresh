import { View, styled } from "@tamagui/core";
import { Image } from "react-native";

import { COLORS } from "../theme/colors";

const MarkFrame = styled(View, {
  width: 108,
  height: 108,
  borderRadius: 30,
  backgroundColor: COLORS.leaf,
  position: "relative",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
});

const MarkIconWrap = styled(View, {
  position: "absolute",
  alignItems: "center",
  justifyContent: "center",
});

type BrandMarkProps = {
  size?: number;
  showFrame?: boolean;
  fillParent?: boolean;
};

export default function BrandMark({ size = 108, showFrame = true, fillParent = false }: BrandMarkProps) {
  if (!showFrame) {
    return (
      <View
        accessibilityLabel="BantayFresh brand mark"
        style={{
          width: fillParent ? "100%" : size,
          height: fillParent ? "100%" : size,
        }}
      >
        <Image
          source={require("../../assets/bantay-logo.webp")}
          resizeMode="contain"
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    );
  }

  const scale = size / 108;
  const frameRadius = 30 * scale;
  const innerInset = 12 * scale;
  const innerRadius = 24 * scale;
  const iconInset = 18 * scale;

  return (
    <MarkFrame
      accessibilityLabel="BantayFresh brand mark"
      style={{ width: size, height: size, borderRadius: frameRadius }}
    >
      <View
        style={{
          position: "absolute",
          inset: innerInset,
          borderRadius: innerRadius,
          borderWidth: 1,
          borderColor: "rgba(234,251,241,0.22)",
        }}
      />
      <MarkIconWrap style={{ inset: iconInset }}>
        <Image
          source={require("../../assets/bantay-logo.webp")}
          resizeMode="contain"
          style={{ width: "100%", height: "100%" }}
        />
      </MarkIconWrap>
    </MarkFrame>
  );
}
