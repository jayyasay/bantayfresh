import { View, styled } from "@tamagui/core";

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

const MarkInner = styled(View, {
  position: "absolute",
  inset: 12,
  borderRadius: 24,
  borderWidth: 1,
  borderColor: "rgba(234,251,241,0.22)",
});

const MarkCircle = styled(View, {
  position: "absolute",
  top: 16,
  left: 16,
  width: 28,
  height: 28,
  borderRadius: 999,
  borderWidth: 3,
  borderColor: COLORS.mist,
});

const MarkRing = styled(View, {
  position: "absolute",
  width: 52,
  height: 52,
  borderRadius: 999,
  borderWidth: 9,
  borderColor: COLORS.mist,
  borderRightColor: "transparent",
  transform: [{ rotate: "18deg" }],
});

const MarkStem = styled(View, {
  position: "absolute",
  bottom: 14,
  width: 11,
  height: 40,
  borderRadius: 999,
  backgroundColor: COLORS.mist,
});

const MarkLeaf = styled(View, {
  position: "absolute",
  right: 20,
  top: 38,
  width: 34,
  height: 22,
  borderRadius: 999,
  backgroundColor: COLORS.mist,
  transform: [{ rotate: "-36deg" }],
});

export default function BrandMark() {
  return (
    <MarkFrame accessibilityLabel="BantayFresh brand mark">
      <MarkInner />
      <MarkCircle />
      <MarkRing />
      <MarkStem />
      <MarkLeaf />
    </MarkFrame>
  );
}
