import {
  type ComponentProps,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, styled } from "@tamagui/core";
import * as ImagePicker from "expo-image-picker";

import {
  deletePantryItem,
  listPantryItems,
  type PantryItemRecord,
  updatePantryItem,
} from "../../lib/pantry-items";
import {
  type ProfileRecord,
  updateProfile,
  uploadProfileAvatar,
} from "../../lib/profiles";
import { COLORS } from "../theme/colors";

export type TabKey = "home" | "inventory" | "alerts" | "profile";
type IoniconName = ComponentProps<typeof Ionicons>["name"];

const Eyebrow = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 12,
  lineHeight: 16,
  letterSpacing: 1.4,
  textTransform: "uppercase",
});

const DashboardShell = styled(View, {
  flex: 1,
  backgroundColor: COLORS.page,
  paddingTop: 52,
});

const DashboardHeader = styled(View, {
  gap: 6,
  paddingTop: 26,
  paddingRight: 20,
  paddingBottom: 18,
  paddingLeft: 20,
});

const HeaderRow = styled(View, {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
});

const HeaderActionRow = styled(View, {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
});

const GreetingTitle = styled(Text, {
  color: COLORS.textDark,
  fontSize: 31,
  lineHeight: 35,
  fontWeight: "800",
});

const GreetingBody = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 15,
  lineHeight: 22,
});

const NotificationButton = styled(Pressable, {
  width: 42,
  height: 42,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  shadowColor: COLORS.shadow,
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
});

const NotificationGlyph = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 18,
  lineHeight: 20,
  fontWeight: "800",
});

const HeaderDangerAction = styled(Pressable, {
  borderRadius: 999,
  paddingVertical: 11,
  paddingHorizontal: 14,
  backgroundColor: "#FFF1F1",
  borderWidth: 1,
  borderColor: "#F1BDBD",
  alignItems: "center",
  justifyContent: "center",
});

const HeaderDangerActionText = styled(Text, {
  color: "#B34242",
  fontSize: 13,
  lineHeight: 16,
  fontWeight: "800",
});

const HeaderAvatarButton = styled(Pressable, {
  width: 44,
  height: 44,
  borderRadius: 999,
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  shadowColor: COLORS.shadow,
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
});

const HeaderAvatarFallback = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 16,
  lineHeight: 18,
  fontWeight: "800",
});

const HeroCard = styled(View, {
  overflow: "hidden",
  borderRadius: 30,
  backgroundColor: COLORS.night,
  marginTop: 14,
  minHeight: 214,
  paddingTop: 22,
  paddingRight: 20,
  paddingBottom: 22,
  paddingLeft: 20,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
  shadowColor: "#000000",
  shadowOpacity: 0.24,
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 12 },
});

const HeroGlow = styled(View, {
  position: "absolute",
  width: 260,
  height: 260,
  borderRadius: 999,
  backgroundColor: COLORS.leaf,
  opacity: 0.26,
  top: -72,
  right: -78,
});

const HeroGlowSecondary = styled(View, {
  position: "absolute",
  width: 210,
  height: 210,
  borderRadius: 999,
  backgroundColor: COLORS.freshGreen,
  opacity: 0.2,
  bottom: -95,
  left: 120,
});

const HeroStripe = styled(View, {
  position: "absolute",
  width: 220,
  height: 56,
  backgroundColor: "rgba(255,255,255,0.06)",
  borderRadius: 18,
  transform: [{ rotate: "-26deg" }],
});

const HeroChip = styled(Pressable, {
  borderRadius: 999,
  paddingVertical: 10,
  paddingHorizontal: 14,
  alignItems: "center",
  justifyContent: "center",
});

const HeroChipText = styled(Text, {
  fontSize: 13,
  lineHeight: 16,
  fontWeight: "800",
});

const HeroBottom = styled(View, {
  flex: 1,
  justifyContent: "flex-end",
  gap: 10,
});

const HeroLabel = styled(Text, {
  color: "rgba(234,251,241,0.9)",
  fontSize: 12,
  lineHeight: 16,
  letterSpacing: 1,
  textTransform: "uppercase",
});

const HeroValue = styled(Text, {
  color: COLORS.white,
  fontSize: 40,
  lineHeight: 44,
  fontWeight: "800",
});

const HeroMetaRow = styled(View, {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
});

const HeroMeta = styled(Text, {
  color: "rgba(234,251,241,0.82)",
  fontSize: 14,
  lineHeight: 18,
});

const HeroBadge = styled(Pressable, {
  borderRadius: 999,
  backgroundColor: "rgba(62,229,142,0.2)",
  borderWidth: 1,
  borderColor: "rgba(62,229,142,0.28)",
  paddingVertical: 6,
  paddingHorizontal: 10,
});

const HeroBadgeText = styled(Text, {
  color: COLORS.mist,
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "700",
});

const HeroStatPill = styled(View, {
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.1)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.16)",
  paddingVertical: 6,
  paddingHorizontal: 10,
});

const HeroStatText = styled(Text, {
  color: "rgba(255,255,255,0.88)",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "700",
});

const ExpiryBanner = styled(Pressable, {
  marginTop: 16,
  borderRadius: 24,
  backgroundColor: "#FFE6E6",
  borderWidth: 1,
  borderColor: "#E89999",
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
  gap: 8,
  shadowColor: "#8C2F2F",
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
});

const ExpiryBannerTitle = styled(Text, {
  color: "#962D2D",
  fontSize: 16,
  lineHeight: 20,
  fontWeight: "800",
});

const ExpiryBannerBody = styled(Text, {
  color: "#7A3737",
  fontSize: 14,
  lineHeight: 20,
});

const ExpiryBannerButton = styled(Pressable, {
  alignSelf: "flex-start",
  marginTop: 4,
  borderRadius: 999,
  backgroundColor: "#B53A3A",
  paddingVertical: 10,
  paddingHorizontal: 14,
});

const ExpiryBannerButtonText = styled(Text, {
  color: COLORS.white,
  fontSize: 13,
  lineHeight: 16,
  fontWeight: "800",
});

const Section = styled(View, {
  paddingRight: 20,
  paddingLeft: 20,
});

const FullBleedSection = styled(View, {
  marginTop: 28,
  backgroundColor: "#F2F7F4",
  paddingTop: 20,
  paddingRight: 20,
  paddingBottom: 22,
  paddingLeft: 20,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: COLORS.pageLine,
});

const SectionTitle = styled(Text, {
  color: COLORS.textDark,
  fontSize: 27,
  lineHeight: 31,
  fontWeight: "800",
});

const SectionHeading = styled(Text, {
  color: COLORS.textDark,
  fontSize: 20,
  lineHeight: 24,
  fontWeight: "800",
});

const SectionBody = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 15,
  lineHeight: 22,
});

const QuickActionsRow = styled(View, {
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 18,
  gap: 12,
});

const QuickActionButton = styled(Pressable, {
  width: "48%",
  minHeight: 154,
  borderRadius: 22,
  backgroundColor: COLORS.deepGreen,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  pressStyle: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

const QuickActionBubble = styled(View, {
  width: 54,
  height: 54,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.16)",
});

const QuickActionLabel = styled(Text, {
  color: COLORS.white,
  fontSize: 16,
  lineHeight: 20,
  fontWeight: "800",
});

const QuickActionCaption = styled(Text, {
  color: COLORS.mist,
  fontSize: 13,
  lineHeight: 18,
});

const QuickActionHint = styled(Text, {
  color: COLORS.mist,
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: 0.8,
});

const InlineActionCard = styled(Pressable, {
  marginTop: 18,
  borderRadius: 22,
  overflow: "hidden",
  backgroundColor: COLORS.night,
  borderWidth: 1,
  borderColor: "rgba(11,123,68,0.16)",
  paddingTop: 18,
  paddingRight: 16,
  paddingBottom: 18,
  paddingLeft: 16,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  shadowColor: "#000000",
  shadowOpacity: 0.16,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  pressStyle: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
});

const InlineActionGlow = styled(View, {
  position: "absolute",
  width: 180,
  height: 180,
  borderRadius: 999,
  backgroundColor: COLORS.leaf,
  opacity: 0.2,
  right: -42,
  top: -56,
});

const InlineActionTitle = styled(Text, {
  color: COLORS.white,
  fontSize: 17,
  lineHeight: 21,
  fontWeight: "800",
});

const ActivityList = styled(View, {
  marginTop: 16,
  gap: 12,
});

const ActivityRow = styled(View, {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 12,
});

const ActivityDot = styled(View, {
  width: 10,
  height: 10,
  borderRadius: 999,
  marginTop: 7,
});

const ActivityTitle = styled(Text, {
  color: COLORS.textDark,
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "700",
});

const ActivityBody = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 13,
  lineHeight: 18,
});

const PromoCard = styled(View, {
  overflow: "hidden",
  borderRadius: 24,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  marginTop: 26,
});

const PromoStrip = styled(View, {
  height: 10,
  backgroundColor: COLORS.leaf,
});

const PromoBody = styled(View, {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
  backgroundColor: "#FFF6EB",
});

const PromoIconWrap = styled(View, {
  width: 42,
  height: 42,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.white,
  borderWidth: 1,
  borderColor: "#F1DEC7",
});

const PromoIcon = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 18,
  lineHeight: 20,
  fontWeight: "800",
});

const PromoTitle = styled(Text, {
  color: COLORS.textDark,
  fontSize: 16,
  lineHeight: 22,
  fontWeight: "800",
});

const PromoCopy = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 14,
  lineHeight: 20,
});

const PromoDismiss = styled(Pressable, {
  width: 28,
  height: 28,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.7)",
});

const PromoDismissText = styled(Text, {
  color: COLORS.textDark,
  fontSize: 16,
  lineHeight: 16,
  fontWeight: "700",
});

const PromoFooter = styled(Pressable, {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#EAF4FF",
  paddingTop: 14,
  paddingRight: 16,
  paddingBottom: 14,
  paddingLeft: 16,
});

const PromoFooterText = styled(Text, {
  color: "#2565A8",
  fontSize: 14,
  lineHeight: 18,
  fontWeight: "700",
});

const PromoFooterArrow = styled(Text, {
  color: "#2565A8",
  fontSize: 18,
  lineHeight: 18,
  fontWeight: "800",
});

const CardGrid = styled(View, {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 18,
});

const InfoCard = styled(View, {
  width: "48%",
  minHeight: 174,
  borderRadius: 24,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 18,
  paddingLeft: 16,
  gap: 10,
});

const InfoIconWrap = styled(View, {
  width: 40,
  height: 40,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.surfaceSoft,
});

const InfoIcon = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 18,
  lineHeight: 20,
  fontWeight: "800",
});

const InfoTitle = styled(Text, {
  color: COLORS.textDark,
  fontSize: 18,
  lineHeight: 22,
  fontWeight: "800",
});

const InfoBody = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 14,
  lineHeight: 20,
});

const InfoLink = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 14,
  lineHeight: 18,
  fontWeight: "700",
});

const SearchShell = styled(View, {
  marginTop: 18,
  borderRadius: 22,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingVertical: 15,
  paddingHorizontal: 16,
});

const FilterWrap = styled(View, {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 16,
});

const FilterChip = styled(Pressable, {
  borderRadius: 18,
  borderWidth: 1,
  paddingTop: 10,
  paddingRight: 12,
  paddingBottom: 10,
  paddingLeft: 12,
});

const FilterChipLabel = styled(Text, {
  fontSize: 13,
  lineHeight: 17,
  fontWeight: "800",
});

const QuantityControl = styled(View, {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  marginTop: 4,
});

const QuantityButton = styled(Pressable, {
  width: 30,
  height: 30,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.surfaceSoft,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
});

const QuantityButtonText = styled(Text, {
  color: COLORS.textDark,
  fontSize: 16,
  lineHeight: 16,
  fontWeight: "800",
});

const QuantityValue = styled(Text, {
  color: COLORS.textDark,
  fontSize: 14,
  lineHeight: 18,
  fontWeight: "800",
  minWidth: 48,
});

const InventoryCard = styled(View, {
  borderRadius: 24,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
  gap: 10,
  marginTop: 14,
});

const InventoryCardPressable = styled(Pressable, {
  borderRadius: 24,
});

const InventoryRow = styled(View, {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

const InventoryMedia = styled(View, {
  width: 68,
  height: 68,
  borderRadius: 18,
  overflow: "hidden",
  backgroundColor: COLORS.surfaceSoft,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: COLORS.pageLine,
});

const InventoryImageFallback = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 22,
  lineHeight: 24,
  fontWeight: "800",
});

const InventoryName = styled(Text, {
  color: COLORS.textDark,
  fontSize: 16,
  lineHeight: 20,
  fontWeight: "800",
});

const InventoryMeta = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 13,
  lineHeight: 18,
});

const InventoryBadge = styled(View, {
  borderRadius: 999,
  paddingVertical: 6,
  paddingHorizontal: 10,
  backgroundColor: COLORS.surfaceSoft,
});

const InventoryBadgeText = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "800",
});

const InventoryActionRow = styled(View, {
  gap: 10,
  alignItems: "flex-end",
});

const DeleteChip = styled(Pressable, {
  borderRadius: 999,
  backgroundColor: "#FFF1F1",
  borderWidth: 1,
  borderColor: "#F1BDBD",
  paddingVertical: 8,
  paddingHorizontal: 12,
  alignItems: "center",
  justifyContent: "center",
});

const DeleteChipText = styled(Text, {
  color: "#B34242",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "800",
});

const EmptyCard = styled(View, {
  borderRadius: 24,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingTop: 20,
  paddingRight: 20,
  paddingBottom: 20,
  paddingLeft: 20,
  marginTop: 16,
  gap: 8,
  alignItems: "flex-start",
});

const BackButton = styled(Pressable, {
  width: 40,
  height: 40,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
});

const BackGlyph = styled(Text, {
  color: COLORS.textDark,
  fontSize: 22,
  lineHeight: 22,
  fontWeight: "700",
});

const FormSection = styled(View, {
  marginTop: 22,
  gap: 14,
});

const FormLabel = styled(Text, {
  color: COLORS.textDark,
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "700",
});

const InputShell = styled(View, {
  borderRadius: 22,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
});

const CategoryGrid = styled(View, {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 4,
});

const CategoryCard = styled(Pressable, {
  width: "48%",
  minHeight: 122,
  borderRadius: 22,
  paddingTop: 14,
  paddingRight: 14,
  paddingBottom: 14,
  paddingLeft: 14,
  justifyContent: "space-between",
  borderWidth: 1,
});

const CategoryGlyphWrap = styled(View, {
  width: 52,
  height: 52,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.58)",
});

const CategoryGlyph = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 22,
  lineHeight: 24,
  fontWeight: "800",
});

const CategoryTitle = styled(Text, {
  color: COLORS.textDark,
  fontSize: 15,
  lineHeight: 19,
  fontWeight: "800",
});

const CategoryCaption = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 12,
  lineHeight: 16,
});

const PickerButton = styled(Pressable, {
  borderRadius: 22,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
  minHeight: 84,
  justifyContent: "center",
});

const PickerValue = styled(Text, {
  color: COLORS.textDark,
  fontSize: 16,
  lineHeight: 22,
});

const PickerHint = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 12,
  lineHeight: 17,
  marginTop: 6,
});

const SecondaryButton = styled(Pressable, {
  borderRadius: 18,
  backgroundColor: COLORS.surfaceSoft,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingVertical: 14,
  paddingHorizontal: 16,
  alignItems: "center",
  justifyContent: "center",
});

const SecondaryButtonText = styled(Text, {
  color: COLORS.textDark,
  fontSize: 15,
  lineHeight: 19,
  fontWeight: "700",
});

const PhotoPreviewCard = styled(View, {
  borderRadius: 22,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingTop: 12,
  paddingRight: 12,
  paddingBottom: 12,
  paddingLeft: 12,
  gap: 10,
});

const SubmitButton = styled(Pressable, {
  borderRadius: 24,
  backgroundColor: COLORS.night,
  paddingVertical: 18,
  paddingHorizontal: 18,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 12,
});

const SubmitButtonText = styled(Text, {
  color: COLORS.white,
  fontSize: 18,
  lineHeight: 22,
  fontWeight: "800",
});

const InlineNotice = styled(View, {
  borderRadius: 18,
  borderWidth: 1,
  paddingTop: 12,
  paddingRight: 14,
  paddingBottom: 12,
  paddingLeft: 14,
  gap: 4,
  marginTop: 12,
});

const NoticeTitle = styled(Text, {
  fontSize: 13,
  lineHeight: 17,
  fontWeight: "800",
});

const NoticeBody = styled(Text, {
  fontSize: 13,
  lineHeight: 18,
});

const BottomBar = styled(View, {
  position: "absolute",
  alignSelf: "center",
  bottom: 20,
  borderRadius: 999,
  backgroundColor: COLORS.night,
  flexDirection: "row",
  justifyContent: "center",
  gap: 8,
  paddingVertical: 8,
  paddingHorizontal: 8,
  shadowColor: COLORS.shadow,
  shadowOpacity: 0.16,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
});

const ToastCard = styled(View, {
  position: "absolute",
  left: 20,
  right: 20,
  bottom: 108,
  borderRadius: 22,
  backgroundColor: COLORS.night,
  paddingTop: 14,
  paddingRight: 16,
  paddingBottom: 14,
  paddingLeft: 16,
  shadowColor: COLORS.shadow,
  shadowOpacity: 0.22,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
});

const ToastText = styled(Text, {
  color: COLORS.white,
  fontSize: 14,
  lineHeight: 19,
  fontWeight: "700",
});

const SkeletonCard = styled(View, {
  borderRadius: 24,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
  gap: 12,
  marginTop: 14,
});

const SkeletonBlock = styled(View, {
  borderRadius: 14,
  backgroundColor: COLORS.surfaceSoft,
});

const BottomTab = styled(Pressable, {
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  minWidth: 72,
  paddingHorizontal: 14,
  paddingVertical: 10,
  gap: 4,
});

const BottomTabInner = styled(View, {
  position: "relative",
  width: 28,
  height: 24,
  alignItems: "center",
  justifyContent: "center",
});

const BottomTabBadge = styled(View, {
  position: "absolute",
  top: -7,
  right: -10,
  minWidth: 20,
  height: 20,
  borderRadius: 999,
  paddingHorizontal: 6,
  alignItems: "center",
  justifyContent: "center",
});

const BottomTabBadgeText = styled(Text, {
  fontSize: 11,
  lineHeight: 12,
  fontWeight: "800",
});

const BottomTabText = styled(Text, {
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "700",
  textAlign: "center",
});

const ProfilePanel = styled(View, {
  borderRadius: 28,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingTop: 20,
  paddingRight: 20,
  paddingBottom: 20,
  paddingLeft: 20,
  gap: 16,
  marginTop: 18,
});

const ProfileIdentityRow = styled(View, {
  flexDirection: "row",
  alignItems: "center",
  gap: 14,
});

const ProfileIdentityCopy = styled(View, {
  flex: 1,
  minWidth: 0,
  justifyContent: "center",
  gap: 2,
});

const AvatarCircle = styled(View, {
  width: 76,
  height: 76,
  borderRadius: 999,
  backgroundColor: COLORS.surfaceSoft,
  alignItems: "center",
  justifyContent: "center",
});

const AvatarInitial = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 28,
  lineHeight: 32,
  fontWeight: "800",
});

const ProfileName = styled(Text, {
  color: COLORS.textDark,
  fontSize: 24,
  lineHeight: 26,
  fontWeight: "800",
});

const ProfileMeta = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 16,
  lineHeight: 24,
});

const ProfileContactMeta = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 14,
  lineHeight: 17,
});

const ProfileActionRow = styled(View, {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
});

const SettingsCard = styled(View, {
  borderRadius: 20,
  backgroundColor: COLORS.surfaceSoft,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingTop: 8,
  paddingRight: 16,
  paddingBottom: 8,
  paddingLeft: 16,
  gap: 2,
});

const SettingRow = styled(View, {
  minHeight: 70,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
});

const SettingTitle = styled(Text, {
  color: COLORS.textDark,
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "700",
});

const SettingBody = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 13,
  lineHeight: 18,
});

const DetailGrid = styled(View, {
  gap: 12,
});

const DetailCard = styled(View, {
  borderRadius: 20,
  backgroundColor: COLORS.surfaceSoft,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
  gap: 4,
});

const DetailLabel = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 12,
  lineHeight: 16,
  letterSpacing: 2,
  textTransform: "uppercase",
});

const DetailValue = styled(Text, {
  color: COLORS.textDark,
  fontSize: 16,
  lineHeight: 22,
  fontWeight: "700",
});

const DetailSectionTitle = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 16,
  lineHeight: 22,
  fontWeight: "600",
  marginTop: 10,
});

type DashboardScreenProps = {
  activeTab: TabKey;
  displayName: string;
  isLoggingOut: boolean;
  isProfileLoading: boolean;
  onLogout: () => void;
  onOpenBulkUpload: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (item: PantryItemRecord) => void;
  onOpenExpired: () => void;
  onProfileUpdated: (profile: ProfileRecord) => void;
  onShowToast: (message: string) => void;
  onTabChange: (tab: TabKey) => void;
  profile: ProfileRecord | null;
  refreshToken: number;
  toastMessage: string | null;
  userEmail: string | null;
  userId: string;
};

type PantryItemStatus = "expired" | "expiring_soon" | "safe";

function getPantryItemStatus(expiryDate: string | null): PantryItemStatus {
  if (!expiryDate) {
    return "safe";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsedExpiry = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(parsedExpiry.getTime())) {
    return "safe";
  }

  if (parsedExpiry < today) {
    return "expired";
  }

  const diffInDays = Math.round(
    (parsedExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  return diffInDays <= 3 ? "expiring_soon" : "safe";
}

function getDaysLeft(expiryDate: string | null) {
  if (!expiryDate) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsedExpiry = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(parsedExpiry.getTime())) {
    return null;
  }

  return Math.round(
    (parsedExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getInventoryBadgeCopy(item: PantryItemRecord) {
  const status = getPantryItemStatus(item.expiry_date);
  const daysLeft = getDaysLeft(item.expiry_date);

  if (status === "expired") {
    return "Expired";
  }

  if (status === "expiring_soon") {
    if (daysLeft === 0) {
      return "Due Today";
    }

    return `${daysLeft}d left`;
  }

  if (daysLeft === null) {
    return "No date";
  }

  return `${daysLeft}d left`;
}

function getInventoryBadgeColors(item: PantryItemRecord) {
  const status = getPantryItemStatus(item.expiry_date);

  if (status === "expired") {
    return {
      backgroundColor: "#FFF1F1",
      textColor: "#B34242",
    };
  }

  if (status === "expiring_soon") {
    return {
      backgroundColor: "#FFF6EB",
      textColor: "#A86518",
    };
  }

  return {
    backgroundColor: COLORS.surfaceSoft,
    textColor: COLORS.deepGreen,
  };
}

function formatExpiryCopy(expiryDate: string | null) {
  if (!expiryDate) {
    return "No expiry date";
  }

  const parsedExpiry = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(parsedExpiry.getTime())) {
    return "No expiry date";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedExpiry);
}

function parseIsoDateString(value: string | null) {
  if (!value) {
    return new Date();
  }

  const parsedDate = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

function getTimeOfDayGreeting(hour: number) {
  if (hour >= 5 && hour < 12) {
    return "Morning";
  }

  if (hour >= 12 && hour < 18) {
    return "Afternoon";
  }

  return "Evening";
}

export default function DashboardScreen({
  activeTab,
  displayName,
  isLoggingOut,
  isProfileLoading,
  onLogout,
  onOpenBulkUpload,
  onOpenCreate,
  onOpenEdit,
  onOpenExpired,
  onProfileUpdated,
  onShowToast,
  onTabChange,
  profile,
  refreshToken,
  toastMessage,
  userEmail,
  userId,
}: DashboardScreenProps) {
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [pantryItems, setPantryItems] = useState<PantryItemRecord[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [updatingQuantityId, setUpdatingQuantityId] = useState<string | null>(null);
  const [previewImageItem, setPreviewImageItem] = useState<PantryItemRecord | null>(
    null,
  );
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [savingPreferenceKey, setSavingPreferenceKey] = useState<
    "one_day" | "three_days" | null
  >(null);
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60_000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPantryItems() {
      try {
        setIsItemsLoading(true);
        setInventoryError(null);

        const { data, error } = await listPantryItems(userId);

        if (!isMounted) {
          return;
        }

        if (error) {
          throw error;
        }

        setPantryItems(data ?? []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setInventoryError(
          error instanceof Error
            ? error.message
            : "Couldn't load your pantry items.",
        );
      } finally {
        if (isMounted) {
          setIsItemsLoading(false);
        }
      }
    }

    loadPantryItems();

    return () => {
      isMounted = false;
    };
  }, [refreshToken, userId]);

  const categoryFilters = useMemo(() => {
    const categoryCounts = pantryItems.reduce<Record<string, number>>((accumulator, item) => {
      const key = item.category?.trim() || "Uncategorized";
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});

    const orderedCategories = Object.keys(categoryCounts).sort((left, right) =>
      left.localeCompare(right),
    );

    return [
      {
        count: pantryItems.length,
        key: "all",
        label: "All",
      },
      ...orderedCategories.map((category) => ({
        count: categoryCounts[category],
        key: category,
        label: category,
      })),
    ];
  }, [pantryItems]);

  useEffect(() => {
    const filterStillExists = categoryFilters.some(
      (category) => category.key === selectedCategoryFilter,
    );

    if (!filterStillExists) {
      setSelectedCategoryFilter("all");
    }
  }, [categoryFilters, selectedCategoryFilter]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pantryItems.filter((item) => {
      const categoryLabel = item.category?.trim() || "Uncategorized";
      const matchesCategory =
        selectedCategoryFilter === "all" || categoryLabel === selectedCategoryFilter;
      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        item.name.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    });
  }, [pantryItems, search, selectedCategoryFilter]);

  const upcomingExpiryItems = pantryItems.filter((item) => {
    return getPantryItemStatus(item.expiry_date) === "expiring_soon";
  });
  const expiredItems = pantryItems.filter((item) => {
    return getPantryItemStatus(item.expiry_date) === "expired";
  });
  const nearExpiryCount = upcomingExpiryItems.length;
  const totalItems = pantryItems.length;
  const greetingTimeOfDay = getTimeOfDayGreeting(currentHour);
  const greetingSubtitle =
    nearExpiryCount === 0
      ? "You are all clear right now. Keep this momentum and your shelves stay fresh."
      : `You have ${nearExpiryCount} item${nearExpiryCount === 1 ? "" : "s"} entering the 3-day expiry window. Let's move on them early.`;
  const formattedCreatedAt = profile?.created_at
    ? new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(profile.created_at))
    : "Not available yet";
  const formattedUpdatedAt = profile?.updated_at
    ? new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(profile.updated_at))
    : "Not available yet";
  const profileInitial = displayName.trim().charAt(0).toUpperCase() || "B";
  const profileAvatarUrl = profile?.avatar_url?.trim() || null;
  const profileSupportsReminderSettings = profile
    ? Object.prototype.hasOwnProperty.call(
        profile,
        "notify_three_days_before_expiry",
      ) &&
      Object.prototype.hasOwnProperty.call(
        profile,
        "notify_one_day_before_expiry",
      )
    : false;
  const notifyThreeDaysBeforeExpiry =
    profile?.notify_three_days_before_expiry !== false;
  const notifyOneDayBeforeExpiry = profile?.notify_one_day_before_expiry !== false;
  const activityEntries = useMemo(() => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    const addedItems = pantryItems
      .filter((item) => new Date(item.created_at).getTime() >= twentyFourHoursAgo)
      .sort(
        (left, right) =>
          new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
      );

    const updatedItems = pantryItems
      .filter((item) => {
        const createdAt = new Date(item.created_at).getTime();
        const updatedAt = new Date(item.updated_at).getTime();
        return updatedAt >= twentyFourHoursAgo && updatedAt - createdAt > 60 * 1000;
      })
      .sort(
        (left, right) =>
          new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
      );

    const recentlyExpiredItems = pantryItems
      .filter((item) => {
        if (!item.expiry_date) {
          return false;
        }

        const expiryTime = new Date(`${item.expiry_date}T00:00:00`).getTime();
        return expiryTime >= twentyFourHoursAgo && expiryTime <= now;
      })
      .sort((left, right) => {
        return (
          new Date(`${right.expiry_date}T00:00:00`).getTime() -
          new Date(`${left.expiry_date}T00:00:00`).getTime()
        );
      });

    const itemsForLabel = (items: PantryItemRecord[]) =>
      items
        .slice(0, 3)
        .map((item) => item.name)
        .join(", ");

    const entries = [];

    if (addedItems.length > 0) {
      entries.push({
        accent: COLORS.leaf,
        body:
          addedItems.length === 1
            ? `${addedItems[0].name} was added in the last 24 hours.`
            : `${addedItems.length} items were added recently: ${itemsForLabel(addedItems)}${addedItems.length > 3 ? "…" : ""}`,
        title: "New stock logged",
      });
    }

    if (updatedItems.length > 0) {
      entries.push({
        accent: "#D7A74A",
        body:
          updatedItems.length === 1
            ? `${updatedItems[0].name} was updated in the last 24 hours.`
            : `${updatedItems.length} items were updated recently: ${itemsForLabel(updatedItems)}${updatedItems.length > 3 ? "…" : ""}`,
        title: "Records updated",
      });
    }

    if (recentlyExpiredItems.length > 0) {
      entries.push({
        accent: "#D45A5A",
        body:
          recentlyExpiredItems.length === 1
            ? `${recentlyExpiredItems[0].name} crossed into expiry in the last 24 hours.`
            : `${recentlyExpiredItems.length} items expired recently: ${itemsForLabel(recentlyExpiredItems)}${recentlyExpiredItems.length > 3 ? "…" : ""}`,
        title: "Freshness changed",
      });
    }

    return entries.slice(0, 3);
  }, [pantryItems]);

  const tabs: Array<{
    key: TabKey;
    icon: IoniconName;
    activeIcon: IoniconName;
    label: string;
  }> = [
    { key: "home", icon: "home-outline", activeIcon: "home", label: "Home" },
    {
      key: "inventory",
      icon: "layers-outline",
      activeIcon: "layers",
      label: "Inventory",
    },
    {
      key: "alerts",
      icon: "notifications-outline",
      activeIcon: "notifications",
      label: "Alerts",
    },
    {
      key: "profile",
      icon: "person-circle-outline",
      activeIcon: "person-circle",
      label: "Profile",
    },
  ];
  const visibleTabs = tabs.filter((tab) => {
    if (tab.key === "alerts") {
      return nearExpiryCount > 0;
    }

    return true;
  });
  const shouldSpreadTabs = visibleTabs.length === 4;

  useEffect(() => {
    if (activeTab === "alerts" && nearExpiryCount === 0) {
      onTabChange("home");
    }
  }, [activeTab, nearExpiryCount, onTabChange]);

  function startCreateFlow() {
    onOpenCreate();
  }

  function startEditFlow(item: PantryItemRecord) {
    onOpenEdit(item);
  }

  function handleTabPress(nextTab: TabKey) {
    onTabChange(nextTab);
  }

  async function handleQuantityChange(item: PantryItemRecord, delta: number) {
    if (updatingQuantityId) {
      return;
    }

    const nextQuantity = Math.max(1, item.quantity + delta);
    if (nextQuantity === item.quantity) {
      return;
    }

    const previousQuantity = item.quantity;

    setUpdatingQuantityId(item.id);
    setPantryItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              quantity: nextQuantity,
            }
          : currentItem,
      ),
    );

    try {
      const { data, error } = await updatePantryItem(userId, item.id, {
        quantity: nextQuantity,
      });

      if (error) {
        throw error;
      }

      setPantryItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id ? data : currentItem,
        ),
      );
    } catch (error) {
      setPantryItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                quantity: previousQuantity,
              }
            : currentItem,
        ),
      );

      Alert.alert(
        "Couldn't Update Quantity",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setUpdatingQuantityId(null);
    }
  }

  function confirmDeleteItem(item: PantryItemRecord) {
    Alert.alert(
      "Delete Item",
      `Delete ${item.name}? This action cannot be undone.`,
      [
        {
          style: "cancel",
          text: "Cancel",
        },
        {
          style: "destructive",
          text: "Delete",
          onPress: () => {
            void handleDeleteItem(item);
          },
        },
      ],
    );
  }

  async function handleDeleteItem(item: PantryItemRecord) {
    try {
      setDeletingItemId(item.id);
      const { error } = await deletePantryItem(userId, item.id);

      if (error) {
        throw error;
      }

      setPantryItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.id !== item.id),
      );
      onShowToast(`${item.name} deleted.`);
    } catch (error) {
      Alert.alert(
        "Couldn't Delete Item",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setDeletingItemId(null);
    }
  }

  async function handlePickAvatar(source: "camera" | "library") {
    try {
      setIsUpdatingAvatar(true);

      const permissionResult =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          source === "camera"
            ? "Camera access is required to take a new avatar."
            : "Photo library access is required to choose an avatar.",
        );
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            })
          : await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      const asset = result.assets[0];
      const { data: uploadData, error: uploadError } = await uploadProfileAvatar(
        userId,
        {
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          uri: asset.uri,
        },
      );

      if (uploadError) {
        throw uploadError;
      }

      const { data, error } = await updateProfile(userId, {
        avatar_url: uploadData.publicUrl,
      });

      if (error) {
        throw error;
      }

      onProfileUpdated(data);
      onShowToast("Avatar updated.");
    } catch (error) {
      Alert.alert(
        "Couldn't Update Avatar",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsUpdatingAvatar(false);
    }
  }

  function openAvatarOptions() {
    const actions = [
      {
        text: "Take Photo",
        onPress: () => {
          void handlePickAvatar("camera");
        },
      },
      {
        text: "Choose Photo",
        onPress: () => {
          void handlePickAvatar("library");
        },
      },
      ...(profileAvatarUrl
        ? [
            {
              style: "destructive" as const,
              text: "Remove Photo",
              onPress: () => {
                confirmRemoveAvatar();
              },
            },
          ]
        : []),
      {
        style: "cancel" as const,
        text: "Cancel",
      },
    ];

    Alert.alert(
      profileAvatarUrl ? "Profile Photo" : "Add Profile Photo",
      profileAvatarUrl
        ? "Choose how you want to update your avatar."
        : "Choose how you want to add your avatar.",
      actions,
    );
  }

  function confirmRemoveAvatar() {
    Alert.alert("Remove Avatar", "Remove your avatar from the app profile?", [
      {
        style: "cancel",
        text: "Cancel",
      },
      {
        style: "destructive",
        text: "Remove",
        onPress: () => {
          void handleRemoveAvatar();
        },
      },
    ]);
  }

  async function handleRemoveAvatar() {
    try {
      setIsUpdatingAvatar(true);
      const { data, error } = await updateProfile(userId, {
        avatar_url: null,
      });

      if (error) {
        throw error;
      }

      onProfileUpdated(data);
      onShowToast("Avatar removed.");
    } catch (error) {
      Alert.alert(
        "Couldn't Remove Avatar",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsUpdatingAvatar(false);
    }
  }

  async function handleNotificationPreferenceChange(
    key: "notify_one_day_before_expiry" | "notify_three_days_before_expiry",
    value: boolean,
  ) {
    if (!profile) {
      return;
    }

    const savingKey = key === "notify_one_day_before_expiry" ? "one_day" : "three_days";
    const previousValue =
      key === "notify_one_day_before_expiry"
        ? notifyOneDayBeforeExpiry
        : notifyThreeDaysBeforeExpiry;

    setSavingPreferenceKey(savingKey);
    onProfileUpdated({
      ...profile,
      [key]: value,
    });

    try {
      const { data, error } = await updateProfile(userId, {
        [key]: value,
      });

      if (error) {
        throw error;
      }

      onProfileUpdated(data);
      onShowToast("Notification settings updated.");
    } catch (error) {
      onProfileUpdated({
        ...profile,
        [key]: previousValue,
      });
      const errorMessage =
        error instanceof Error ? error.message : "Please try again.";
      const needsDatabaseUpdate =
        errorMessage.toLowerCase().includes("column") ||
        errorMessage.toLowerCase().includes("schema cache") ||
        errorMessage.toLowerCase().includes("does not exist");

      Alert.alert(
        "Couldn't Update Setting",
        needsDatabaseUpdate
          ? "Notification settings need the latest database update before they can be used."
          : errorMessage,
      );
    } finally {
      setSavingPreferenceKey(null);
    }
  }

  function renderOverview() {
    if (isItemsLoading && pantryItems.length === 0) {
      return (
        <>
          <DashboardHeader>
            <View gap={12}>
              <SkeletonBlock height={34} width="62%" />
              <SkeletonBlock height={18} width="92%" />
            </View>

            <SkeletonCard marginTop={14}>
              <View flexDirection="row" justifyContent="space-between" gap={12}>
                <SkeletonBlock height={36} width={122} />
                <SkeletonBlock height={36} width={132} />
              </View>
              <View gap={10} marginTop={34}>
                <SkeletonBlock height={18} width="40%" />
                <SkeletonBlock height={40} width="58%" />
              </View>
            </SkeletonCard>
          </DashboardHeader>

          <Section>
            <View flexDirection="row" justifyContent="space-between" gap={12} marginTop={18}>
              {Array.from({ length: 4 }).map((_, index) => (
                <View key={index} alignItems="center" flex={1} gap={10}>
                  <SkeletonBlock height={58} width={58} borderRadius={999} />
                  <SkeletonBlock height={14} width="70%" />
                </View>
              ))}
            </View>

            {Array.from({ length: 2 }).map((_, index) => (
              <SkeletonCard key={index}>
                <SkeletonBlock height={16} width="36%" />
                <SkeletonBlock height={16} width="88%" />
                <SkeletonBlock height={16} width="72%" />
              </SkeletonCard>
            ))}
          </Section>
        </>
      );
    }

    return (
      <>
        <DashboardHeader>
          <HeaderRow>
            <View gap={4} flex={1}>
              <GreetingTitle>Good {greetingTimeOfDay}, {displayName}</GreetingTitle>
              <GreetingBody>
                {greetingSubtitle}
              </GreetingBody>
            </View>

            <HeaderActionRow>
              <HeaderAvatarButton
                accessibilityLabel="Open profile"
                onPress={() => onTabChange("profile")}
              >
                {profileAvatarUrl ? (
                  <Image
                    accessibilityLabel="Profile avatar"
                    resizeMode="cover"
                    source={{ uri: profileAvatarUrl }}
                    style={styles.headerAvatarImage}
                  />
                ) : (
                  <HeaderAvatarFallback>{profileInitial}</HeaderAvatarFallback>
                )}
              </HeaderAvatarButton>
            </HeaderActionRow>
          </HeaderRow>

          <HeroCard>
            <HeroGlow />
            <HeroGlowSecondary />
            <HeroStripe top={28} left={122} />
            <HeroStripe top={104} left={-26} />

            <HeroBottom>
              <HeroLabel>Freshness Snapshot</HeroLabel>
              <HeroValue>{totalItems} Active Items</HeroValue>
              <HeroMeta>
                Move fast on the soonest-to-expire items first so less stock goes to waste.
              </HeroMeta>
              <HeroMetaRow>
                <HeroBadge
                  accessibilityLabel="Open expired items"
                  onPress={onOpenExpired}
                >
                  <HeroBadgeText>
                    {expiredItems.length === 0
                      ? "No expired items, nice!"
                      : `${expiredItems.length} Expired`}
                  </HeroBadgeText>
                </HeroBadge>
                <HeroStatPill>
                  <HeroStatText>
                    {nearExpiryCount === 0
                      ? "Pantry health is good"
                      : `${nearExpiryCount} Near Expiry`}
                  </HeroStatText>
                </HeroStatPill>
              </HeroMetaRow>
            </HeroBottom>
          </HeroCard>

          {nearExpiryCount > 0 ? (
            <ExpiryBanner
              accessibilityLabel="Open upcoming expiry items"
              onPress={() => onTabChange("alerts")}
            >
              <ExpiryBannerTitle>
                {nearExpiryCount} Upcoming Expiry {nearExpiryCount === 1 ? "Item" : "Items"}
              </ExpiryBannerTitle>
              <ExpiryBannerBody>
                Open the alert list to review every item that is 3 days away from expiry.
              </ExpiryBannerBody>
              <ExpiryBannerButton
                accessibilityLabel="Review upcoming expiry items"
                onPress={() => onTabChange("alerts")}
              >
                <ExpiryBannerButtonText>Review Expiry Items</ExpiryBannerButtonText>
              </ExpiryBannerButton>
            </ExpiryBanner>
          ) : null}
        </DashboardHeader>

        <Section>
          <SectionHeading>Quick Actions</SectionHeading>

          <QuickActionsRow>
            <QuickActionButton
              accessibilityLabel="Add a new pantry item"
              width="48%"
              onPress={startCreateFlow}
            >
              <QuickActionBubble>
                <Ionicons color={COLORS.white} name="nutrition-outline" size={24} />
              </QuickActionBubble>
              <View gap={6}>
                <QuickActionLabel>Add Item</QuickActionLabel>
                <QuickActionCaption>Create a new pantry record</QuickActionCaption>
                <View alignItems="center" flexDirection="row" gap={6}>
                  <QuickActionHint>Tap to Add</QuickActionHint>
                  <Ionicons color={COLORS.mist} name="arrow-forward" size={14} />
                </View>
              </View>
            </QuickActionButton>

            <QuickActionButton
              accessibilityLabel="View inventory"
              backgroundColor={COLORS.night}
              width="48%"
              onPress={() => onTabChange("inventory")}
            >
              <QuickActionBubble>
                <Ionicons color={COLORS.white} name="layers-outline" size={24} />
              </QuickActionBubble>
              <View gap={6}>
                <QuickActionLabel>View Inventory</QuickActionLabel>
                <QuickActionCaption>Scan all active pantry rows</QuickActionCaption>
                <View alignItems="center" flexDirection="row" gap={6}>
                  <QuickActionHint>Open Inventory</QuickActionHint>
                  <Ionicons color={COLORS.mist} name="arrow-forward" size={14} />
                </View>
              </View>
            </QuickActionButton>

            <QuickActionButton
              accessibilityLabel="Bulk upload inventory spreadsheet"
              backgroundColor={COLORS.surface}
              borderColor={COLORS.pageLine}
              borderWidth={1}
              width="48%"
              onPress={onOpenBulkUpload}
            >
              <QuickActionBubble backgroundColor={COLORS.surfaceSoft}>
                <Ionicons color={COLORS.deepGreen} name="cloud-upload-outline" size={24} />
              </QuickActionBubble>
              <View gap={6}>
                <QuickActionLabel color={COLORS.textDark}>Bulk Upload</QuickActionLabel>
                <QuickActionCaption color={COLORS.textSoft}>
                  Import `.xls`, `.xlsx`, or `.csv` files in one flow
                </QuickActionCaption>
                <View alignItems="center" flexDirection="row" gap={6}>
                  <QuickActionHint color={COLORS.deepGreen}>Upload</QuickActionHint>
                  <Ionicons color={COLORS.deepGreen} name="arrow-forward" size={14} />
                </View>
              </View>
            </QuickActionButton>
          </QuickActionsRow>

        </Section>

        {activityEntries.length > 0 ? (
          <FullBleedSection>
            <SectionHeading>Today’s Activity</SectionHeading>
            <SectionBody>
              Added, updated, or newly expired items from the last 24 hours.
            </SectionBody>

            <ActivityList>
              {activityEntries.map((entry) => (
                <ActivityRow key={entry.title}>
                  <ActivityDot backgroundColor={entry.accent} />
                  <View flex={1} gap={2}>
                    <ActivityTitle>{entry.title}</ActivityTitle>
                    <ActivityBody>{entry.body}</ActivityBody>
                  </View>
                </ActivityRow>
              ))}
            </ActivityList>
          </FullBleedSection>
        ) : null}
      </>
    );
  }

  function renderInventoryView() {
    return (
      <Section>
        <DashboardHeader paddingLeft={0} paddingRight={0}>
          <View gap={8}>
            <SectionTitle>Search Inventory</SectionTitle>
            <SectionBody>
              Look up stock by item name, category, or internal code before you
              edit the next record.
            </SectionBody>
          </View>
        </DashboardHeader>

        <SearchShell>
          <TextInput
            accessibilityLabel="Search inventory"
            autoCapitalize="none"
            placeholder="Search item, category, or code…"
            placeholderTextColor={COLORS.softGray}
            spellCheck={false}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </SearchShell>

        <InlineActionCard
          accessibilityLabel="Add a new pantry item"
          onPress={startCreateFlow}
        >
          <InlineActionGlow />
          <View flex={1} gap={5}>
            <InlineActionTitle>Add New Item</InlineActionTitle>
          </View>

          <View alignItems="center" gap={8}>
            <QuickActionBubble
              width={52}
              height={52}
              backgroundColor="rgba(255,255,255,0.14)"
            >
              <Ionicons color={COLORS.white} name="add" size={24} />
            </QuickActionBubble>
          </View>
        </InlineActionCard>

        <FilterWrap>
          {categoryFilters.map((category) => {
            const active = selectedCategoryFilter === category.key;

            return (
              <FilterChip
                key={category.key}
                accessibilityLabel={`Filter inventory by ${category.label}`}
                backgroundColor={active ? COLORS.deepGreen : COLORS.surface}
                borderColor={active ? COLORS.deepGreen : COLORS.pageLine}
                onPress={() => setSelectedCategoryFilter(category.key)}
              >
                <FilterChipLabel color={active ? COLORS.white : COLORS.textDark}>
                  {category.label} · {category.count}
                </FilterChipLabel>
              </FilterChip>
            );
          })}
        </FilterWrap>

        {inventoryError ? (
          <EmptyCard>
            <SectionHeading>Inventory Unavailable</SectionHeading>
            <SectionBody>{inventoryError}</SectionBody>
          </EmptyCard>
        ) : isItemsLoading ? (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index}>
                <InventoryRow alignItems="flex-start">
                  <SkeletonBlock height={68} width={68} borderRadius={18} />
                  <View gap={8} flex={1}>
                    <SkeletonBlock height={12} width="28%" />
                    <SkeletonBlock height={18} width="58%" />
                    <SkeletonBlock height={14} width="76%" />
                    <SkeletonBlock height={14} width="64%" />
                  </View>
                  <View gap={10} alignItems="flex-end">
                    <SkeletonBlock height={28} width={74} borderRadius={999} />
                    <SkeletonBlock height={30} width={74} borderRadius={999} />
                  </View>
                </InventoryRow>
              </SkeletonCard>
            ))}
          </>
        ) : filteredItems.length === 0 ? (
          <EmptyCard>
            <SectionHeading>No Matching Items</SectionHeading>
            <SectionBody>
              Try another keyword or open Add Item to write your first pantry
              row.
            </SectionBody>
          </EmptyCard>
        ) : (
          filteredItems.map((item) => (
            <InventoryCardPressable
              key={item.id}
              accessibilityLabel={`Edit ${item.name}`}
              accessibilityRole="button"
              onPress={() => startEditFlow(item)}
            >
              <InventoryCard>
                <InventoryRow alignItems="flex-start">
                  <InventoryMedia>
                    {item.photo_url ? (
                      <Pressable
                        accessibilityLabel={`Preview ${item.name} photo`}
                        style={styles.inventoryImageButton}
                        onPress={(event) => {
                          event.stopPropagation();
                          setPreviewImageItem(item);
                        }}
                      >
                        <Image
                          accessibilityLabel={`${item.name} photo`}
                          resizeMode="cover"
                          source={{ uri: item.photo_url }}
                          style={styles.inventoryImage}
                        />
                      </Pressable>
                    ) : (
                      <InventoryImageFallback>◔</InventoryImageFallback>
                    )}
                  </InventoryMedia>

                  <View gap={8} flex={1} minWidth={0}>
                    <View gap={4}>
                      <Eyebrow>{item.category || "Uncategorized"}</Eyebrow>
                      <InventoryName>{item.name}</InventoryName>
                      <InventoryMeta>
                        {formatExpiryCopy(item.expiry_date)}
                      </InventoryMeta>
                    </View>

                    <QuantityControl>
                      <QuantityButton
                        accessibilityLabel={`Decrease quantity for ${item.name}`}
                        opacity={item.quantity <= 1 || updatingQuantityId === item.id ? 0.45 : 1}
                        onPress={() => void handleQuantityChange(item, -1)}
                      >
                        <QuantityButtonText>−</QuantityButtonText>
                      </QuantityButton>

                      <QuantityValue>
                        {updatingQuantityId === item.id
                          ? "Saving…"
                          : `Qty ${item.quantity}`}
                      </QuantityValue>

                      <QuantityButton
                        accessibilityLabel={`Increase quantity for ${item.name}`}
                        opacity={updatingQuantityId === item.id ? 0.45 : 1}
                        onPress={() => void handleQuantityChange(item, 1)}
                      >
                        <QuantityButtonText>+</QuantityButtonText>
                      </QuantityButton>
                    </QuantityControl>

                    {item.notes?.trim() ? (
                      <InventoryMeta numberOfLines={2}>{item.notes.trim()}</InventoryMeta>
                    ) : null}
                  </View>

                  <InventoryActionRow>
                    <InventoryBadge
                      backgroundColor={getInventoryBadgeColors(item).backgroundColor}
                    >
                      <InventoryBadgeText
                        color={getInventoryBadgeColors(item).textColor}
                    >
                      {getInventoryBadgeCopy(item)}
                    </InventoryBadgeText>
                    </InventoryBadge>
                    <DeleteChip
                      accessibilityLabel={`Delete ${item.name}`}
                      onPress={(event) => {
                        event.stopPropagation();
                        confirmDeleteItem(item);
                      }}
                    >
                      <DeleteChipText>
                        {deletingItemId === item.id ? "Deleting…" : "Delete"}
                      </DeleteChipText>
                    </DeleteChip>
                    <InventoryMeta color={COLORS.deepGreen}>Edit →</InventoryMeta>
                  </InventoryActionRow>
                </InventoryRow>
              </InventoryCard>
            </InventoryCardPressable>
          ))
        )}
      </Section>
    );
  }

  function renderAlertsView() {
    if (isItemsLoading && pantryItems.length === 0) {
      return (
        <Section>
          <DashboardHeader paddingLeft={0} paddingRight={0}>
            <View gap={12}>
              <SkeletonBlock height={30} width="52%" />
              <SkeletonBlock height={16} width="82%" />
            </View>
          </DashboardHeader>

          <SkeletonCard marginTop={0}>
            <SkeletonBlock height={18} width="44%" />
            <SkeletonBlock height={16} width="82%" />
          </SkeletonCard>

          {Array.from({ length: 2 }).map((_, index) => (
            <SkeletonCard key={index}>
              <InventoryRow alignItems="flex-start">
                <SkeletonBlock height={68} width={68} borderRadius={18} />
                <View gap={8} flex={1}>
                  <SkeletonBlock height={12} width="28%" />
                  <SkeletonBlock height={18} width="60%" />
                  <SkeletonBlock height={14} width="74%" />
                </View>
                <SkeletonBlock height={28} width={74} borderRadius={999} />
              </InventoryRow>
            </SkeletonCard>
          ))}
        </Section>
      );
    }

    return (
      <Section>
        <DashboardHeader paddingLeft={0} paddingRight={0}>
          <View gap={8}>
            <SectionTitle>Upcoming Expiry</SectionTitle>
            <SectionBody>
              Review every item that is within 3 days of expiry and prioritize the
              next moves before stock slips.
            </SectionBody>
          </View>
        </DashboardHeader>

        <ExpiryBanner
          accessibilityLabel="Upcoming expiry summary"
          disabled
          onPress={() => undefined}
        >
          <ExpiryBannerTitle>
            {nearExpiryCount} Upcoming Expiry {nearExpiryCount === 1 ? "Item" : "Items"}
          </ExpiryBannerTitle>
          <ExpiryBannerBody>
            These are the items currently sitting inside the 3-day expiry window.
          </ExpiryBannerBody>
        </ExpiryBanner>

        {expiredItems.length > 0 ? (
          <EmptyCard>
            <SectionHeading>Expired Items Need Review</SectionHeading>
            <SectionBody>
              {expiredItems.length} items have already expired. Open the expired
              queue to delete them or review their details.
            </SectionBody>
            <HeroChip
              accessibilityLabel="Open expired items"
              alignSelf="flex-start"
              backgroundColor={COLORS.surfaceSoft}
              marginTop={6}
              onPress={onOpenExpired}
            >
              <HeroChipText color={COLORS.textDark}>Open Expired Queue</HeroChipText>
            </HeroChip>
          </EmptyCard>
        ) : null}

        {nearExpiryCount === 0 ? (
          <EmptyCard>
            <SectionHeading>No Upcoming Expiry</SectionHeading>
            <SectionBody>
              You do not have any items in the 3-day expiry window right now.
            </SectionBody>
          </EmptyCard>
        ) : (
          upcomingExpiryItems.map((item) => (
            <InventoryCardPressable
              key={item.id}
              accessibilityLabel={`Edit ${item.name} from upcoming expiry list`}
              accessibilityRole="button"
              onPress={() => startEditFlow(item)}
            >
              <InventoryCard>
                <InventoryRow alignItems="flex-start">
                  <InventoryMedia>
                    {item.photo_url ? (
                      <Image
                        accessibilityLabel={`${item.name} photo`}
                        resizeMode="cover"
                        source={{ uri: item.photo_url }}
                        style={styles.inventoryImage}
                      />
                    ) : (
                      <InventoryImageFallback>◔</InventoryImageFallback>
                    )}
                  </InventoryMedia>

                  <View gap={8} flex={1} minWidth={0}>
                    <View gap={4}>
                      <Eyebrow>{item.category || "Uncategorized"}</Eyebrow>
                      <InventoryName>{item.name}</InventoryName>
                      <InventoryMeta>
                        Qty {item.quantity} · {formatExpiryCopy(item.expiry_date)}
                      </InventoryMeta>
                    </View>

                    {item.notes?.trim() ? (
                      <InventoryMeta numberOfLines={2}>{item.notes.trim()}</InventoryMeta>
                    ) : null}
                  </View>

                  <InventoryActionRow>
                    <InventoryBadge
                      backgroundColor={getInventoryBadgeColors(item).backgroundColor}
                    >
                      <InventoryBadgeText
                        color={getInventoryBadgeColors(item).textColor}
                      >
                        {getInventoryBadgeCopy(item)}
                      </InventoryBadgeText>
                    </InventoryBadge>
                    <DeleteChip
                      accessibilityLabel={`Delete ${item.name}`}
                      onPress={(event) => {
                        event.stopPropagation();
                        confirmDeleteItem(item);
                      }}
                    >
                      <DeleteChipText>
                        {deletingItemId === item.id ? "Deleting…" : "Delete"}
                      </DeleteChipText>
                    </DeleteChip>
                    <InventoryMeta color={COLORS.deepGreen}>Edit →</InventoryMeta>
                  </InventoryActionRow>
                </InventoryRow>
              </InventoryCard>
            </InventoryCardPressable>
          ))
        )}
      </Section>
    );
  }

  function renderProfileView() {
    return (
      <Section>
        <DashboardHeader paddingLeft={0} paddingRight={0}>
          <HeaderRow>
            <View gap={8} flex={1}>
              <SectionTitle>Profile & Access</SectionTitle>
              <SectionBody>
                View your personal profile details, update your avatar, and log
                out of the app on this screen.
              </SectionBody>
            </View>

            <HeaderDangerAction
              accessibilityLabel="Log out"
              onPress={onLogout}
              opacity={isLoggingOut ? 0.7 : 1}
            >
              <HeaderDangerActionText>
                {isLoggingOut ? "Logging Out…" : "Log Out"}
              </HeaderDangerActionText>
            </HeaderDangerAction>
          </HeaderRow>
        </DashboardHeader>

        <ProfilePanel>
          <ProfileIdentityRow>
            <Pressable
              accessibilityLabel={
                profileAvatarUrl ? "Update or remove avatar" : "Add avatar"
              }
              onPress={openAvatarOptions}
            >
              <AvatarCircle>
                {profileAvatarUrl ? (
                  <Image
                    accessibilityLabel="Profile avatar"
                    resizeMode="cover"
                    source={{ uri: profileAvatarUrl }}
                    style={styles.profileAvatarImage}
                  />
                ) : (
                  <AvatarInitial>{profileInitial}</AvatarInitial>
                )}
              </AvatarCircle>
            </Pressable>

            <ProfileIdentityCopy>
              <ProfileName>{displayName}</ProfileName>
              <ProfileContactMeta>{userEmail ?? "No email available"}</ProfileContactMeta>
              {isProfileLoading ? (
                <ProfileContactMeta>Refreshing profile…</ProfileContactMeta>
              ) : null}
            </ProfileIdentityCopy>
          </ProfileIdentityRow>

          <ProfileMeta>
            Tap the avatar to {profileAvatarUrl ? "update or remove it" : "upload a profile photo"}.
            {isUpdatingAvatar ? " Updating…" : ""}
          </ProfileMeta>

          <SettingsCard>
            <SettingRow>
              <View flex={1} gap={4}>
                <SettingTitle>Notify me 3 days before expiry</SettingTitle>
                <SettingBody>
                  Receive an email reminder when an item enters the 3-day window.
                </SettingBody>
              </View>

              <Switch
                disabled={!profileSupportsReminderSettings || savingPreferenceKey !== null}
                ios_backgroundColor="#D9E5DD"
                onValueChange={(value) =>
                  void handleNotificationPreferenceChange(
                    "notify_three_days_before_expiry",
                    value,
                  )
                }
                thumbColor={COLORS.white}
                trackColor={{ false: "#D9E5DD", true: COLORS.leaf }}
                value={notifyThreeDaysBeforeExpiry}
              />
            </SettingRow>

            <View height={1} backgroundColor={COLORS.pageLine} />

            <SettingRow>
              <View flex={1} gap={4}>
                <SettingTitle>Notify me 1 day before expiry</SettingTitle>
                <SettingBody>
                  Receive a final reminder one day before expiry.
                </SettingBody>
              </View>

              <Switch
                disabled={!profileSupportsReminderSettings || savingPreferenceKey !== null}
                ios_backgroundColor="#D9E5DD"
                onValueChange={(value) =>
                  void handleNotificationPreferenceChange(
                    "notify_one_day_before_expiry",
                    value,
                  )
                }
                thumbColor={COLORS.white}
                trackColor={{ false: "#D9E5DD", true: COLORS.leaf }}
                value={notifyOneDayBeforeExpiry}
              />
            </SettingRow>
          </SettingsCard>

          {!profileSupportsReminderSettings ? (
            <ProfileMeta>
              Notification preferences will unlock after you run the latest profile/settings SQL update in Supabase.
            </ProfileMeta>
          ) : null}

          <DetailSectionTitle>Personal details:</DetailSectionTitle>

          <DetailGrid>
            <DetailCard>
              <DetailLabel>Full Name</DetailLabel>
              <DetailValue>{profile?.full_name || displayName}</DetailValue>
            </DetailCard>
            <DetailCard>
              <DetailLabel>Created</DetailLabel>
              <DetailValue>{formattedCreatedAt}</DetailValue>
            </DetailCard>
            <DetailCard>
              <DetailLabel>Last Updated</DetailLabel>
              <DetailValue>{formattedUpdatedAt}</DetailValue>
            </DetailCard>
          </DetailGrid>
        </ProfilePanel>
      </Section>
    );
  }

  function renderContent() {
    if (activeTab === "home") {
      return renderOverview();
    }

    if (activeTab === "inventory") {
      return renderInventoryView();
    }

    if (activeTab === "alerts") {
      return renderAlertsView();
    }

    return renderProfileView();
  }

  return (
    <DashboardShell>
      <ScrollView
        key={activeTab}
        contentContainerStyle={styles.dashboardContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>

      <BottomBar
        alignSelf={shouldSpreadTabs ? undefined : "center"}
        gap={shouldSpreadTabs ? 0 : 8}
        justifyContent={shouldSpreadTabs ? "space-between" : "center"}
        left={shouldSpreadTabs ? 14 : undefined}
        right={shouldSpreadTabs ? 14 : undefined}
      >
        {visibleTabs.map((tab) => {
          const active = tab.key === activeTab;
          const iconName = active ? tab.activeIcon : tab.icon;
          const isAlertsTab = tab.key === "alerts";
          const badgeCount = isAlertsTab ? nearExpiryCount : 0;
          const tabBackgroundColor = active
            ? isAlertsTab
              ? "#FFE7DF"
              : COLORS.white
            : isAlertsTab
              ? "rgba(214,90,90,0.14)"
              : "transparent";
          const iconColor = active
            ? isAlertsTab
              ? "#B34242"
              : COLORS.night
            : isAlertsTab
              ? "#FFC9B8"
              : "rgba(255,255,255,0.74)";
          const labelColor = active
            ? isAlertsTab
              ? "#B34242"
              : COLORS.night
            : isAlertsTab
              ? "#FFD8CC"
              : "rgba(255,255,255,0.74)";
          const badgeBackgroundColor = active ? "#B34242" : "#F06A52";
          const badgeTextColor = COLORS.white;

          return (
            <BottomTab
              key={tab.key}
              accessibilityLabel={`Open ${tab.label}`}
              backgroundColor={tabBackgroundColor}
              borderColor={isAlertsTab ? "rgba(240,106,82,0.26)" : "transparent"}
              borderWidth={isAlertsTab ? 1 : 0}
              minWidth={shouldSpreadTabs ? 0 : 72}
              width={shouldSpreadTabs ? "24%" : undefined}
              onPress={() => handleTabPress(tab.key)}
            >
              <BottomTabInner>
                <Ionicons
                  color={iconColor}
                  name={iconName}
                  size={19}
                />
                {badgeCount > 0 ? (
                  <BottomTabBadge backgroundColor={badgeBackgroundColor}>
                    <BottomTabBadgeText color={badgeTextColor}>
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </BottomTabBadgeText>
                  </BottomTabBadge>
                ) : null}
              </BottomTabInner>
              <BottomTabText color={labelColor} numberOfLines={1}>
                {tab.label}
              </BottomTabText>
            </BottomTab>
          );
        })}
      </BottomBar>

      {toastMessage ? (
        <ToastCard>
          <ToastText>{toastMessage}</ToastText>
        </ToastCard>
      ) : null}

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(previewImageItem)}
      >
        <Pressable
          accessibilityLabel="Close image preview"
          style={styles.previewBackdrop}
          onPress={() => setPreviewImageItem(null)}
        >
          <Pressable
            accessibilityLabel="Previewed pantry item image"
            style={styles.previewCard}
            onPress={(event) => event.stopPropagation()}
          >
            {previewImageItem?.photo_url ? (
              <Image
                accessibilityLabel={`${previewImageItem.name} enlarged photo`}
                resizeMode="contain"
                source={{ uri: previewImageItem.photo_url }}
                style={styles.previewImage}
              />
            ) : null}

            <View gap={4} marginTop={14}>
              <InventoryName>{previewImageItem?.name}</InventoryName>
              <InventoryMeta>
                {previewImageItem?.category || "Uncategorized"}
              </InventoryMeta>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  dashboardContent: {
    paddingBottom: 128,
  },
  headerAvatarImage: {
    width: "100%",
    height: "100%",
  },
  formInput: {
    color: COLORS.textDark,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 2,
  },
  notesInput: {
    color: COLORS.textDark,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 96,
    paddingVertical: 2,
  },
  inventoryImage: {
    width: "100%",
    height: "100%",
  },
  inventoryImageButton: {
    width: "100%",
    height: "100%",
  },
  photoPreviewImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSoft,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(7,19,13,0.72)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  previewCard: {
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    padding: 18,
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceSoft,
  },
  profileAvatarImage: {
    width: "100%",
    height: "100%",
  },
  searchInput: {
    color: COLORS.textDark,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 2,
  },
});
