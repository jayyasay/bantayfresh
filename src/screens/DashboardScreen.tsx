import {
  type ComponentProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
  findPantryItemByBarcode,
  getPantryItemBarcode,
  getPantryItemDisplayNotes,
  getPantryItemInventorySpace,
  getPantryItemIsLowStock,
  listPantryItems,
  type PantryItemRecord,
  updatePantryItem,
} from "../../lib/pantry-items";
import {
  INVENTORY_SPACE_CONFIG,
  INVENTORY_SPACE_OPTIONS,
  INVENTORY_SPACE_PALETTES,
  type InventorySpaceKey,
} from "../../lib/inventory-spaces";
import BarcodeScannerModal from "../components/BarcodeScannerModal";
import {
  type ProfileRecord,
  updateProfile,
  uploadProfileAvatar,
} from "../../lib/profiles";
import { COLORS } from "../theme/colors";

export type TabKey = "home" | "inventory" | "low_stock" | "alerts" | "profile";
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

const SpaceSwitcher = styled(View, {
  flexDirection: "row",
  marginTop: 16,
  gap: 10,
});

const SpaceTab = styled(Pressable, {
  flex: 1,
  minHeight: 68,
  borderRadius: 22,
  borderWidth: 1,
  paddingTop: 12,
  paddingRight: 12,
  paddingBottom: 12,
  paddingLeft: 12,
  justifyContent: "space-between",
});

const SpaceTabLabel = styled(Text, {
  fontSize: 15,
  lineHeight: 18,
  fontWeight: "800",
});

const SpaceTabMeta = styled(Text, {
  fontSize: 11,
  lineHeight: 14,
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

const StatusToggleChip = styled(Pressable, {
  borderRadius: 999,
  borderWidth: 1,
  paddingVertical: 8,
  paddingHorizontal: 12,
  alignItems: "center",
  justifyContent: "center",
});

const StatusToggleChipText = styled(Text, {
  fontSize: 12,
  lineHeight: 16,
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

const LowStockSummaryCard = styled(View, {
  marginTop: 18,
  borderRadius: 26,
  backgroundColor: "#FFF6EB",
  borderWidth: 1,
  borderColor: "#F0D5A1",
  paddingTop: 18,
  paddingRight: 18,
  paddingBottom: 18,
  paddingLeft: 18,
  gap: 8,
});

const LowStockSummaryEyebrow = styled(Text, {
  color: "#A86518",
  fontSize: 12,
  lineHeight: 16,
  letterSpacing: 1.2,
  textTransform: "uppercase",
});

const LowStockSummaryValue = styled(Text, {
  color: COLORS.textDark,
  fontSize: 28,
  lineHeight: 32,
  fontWeight: "800",
});

const LowStockSummaryCopy = styled(Text, {
  color: "#8A5A14",
  fontSize: 14,
  lineHeight: 20,
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

const InlineActionCaption = styled(Text, {
  color: COLORS.mist,
  fontSize: 13,
  lineHeight: 18,
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
  gap: 6,
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
  minWidth: 0,
  paddingHorizontal: 14,
  paddingVertical: 10,
  gap: 4,
  flexShrink: 0,
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

const LoadMoreFooter = styled(View, {
  minHeight: 56,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  marginTop: 12,
  marginBottom: 8,
});

const LoadMoreText = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 14,
  lineHeight: 19,
  fontWeight: "700",
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
  onOpenBulkUpload: (inventorySpace: InventorySpaceKey) => void;
  onOpenCreate: (prefill?: {
    barcode?: string | null;
    category?: string | null;
    inventorySpace?: InventorySpaceKey | null;
    name?: string | null;
  }) => void;
  onOpenEdit: (item: PantryItemRecord) => void;
  onOpenExpired: (inventorySpace: InventorySpaceKey) => void;
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

type InventoryItemSummary = {
  badgeBackgroundColor: string;
  badgeTextColor: string;
  badgeLabel: string;
  categoryLabel: string;
  displayNotes: string | null;
  expiryLabel: string;
  item: PantryItemRecord;
  lowStock: boolean;
  searchText: string;
  status: PantryItemStatus;
};

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

function getInventoryBadgeDetails(expiryDate: string | null) {
  const status = getPantryItemStatus(expiryDate);
  const daysLeft = getDaysLeft(expiryDate);

  if (status === "expired") {
    return {
      backgroundColor: "#FFF1F1",
      textColor: "#B34242",
      label: "Expired",
    };
  }

  if (status === "expiring_soon") {
    return {
      backgroundColor: "#FFF6EB",
      textColor: "#A86518",
      label: daysLeft === 0 ? "Due Today" : `${daysLeft}d left`,
    };
  }

  return {
    backgroundColor: COLORS.surfaceSoft,
    textColor: COLORS.deepGreen,
    label: daysLeft === null ? "No date" : `${daysLeft}d left`,
  };
}

function getInventoryBadgeCopy(item: PantryItemRecord) {
  return getInventoryBadgeDetails(item.expiry_date).label;
}

function getInventoryBadgeColors(item: PantryItemRecord) {
  const details = getInventoryBadgeDetails(item.expiry_date);

  return {
    backgroundColor: details.backgroundColor,
    textColor: details.textColor,
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

function buildInventoryItemSummary(item: PantryItemRecord): InventoryItemSummary {
  const categoryLabel = item.category?.trim() || "Uncategorized";
  const displayNotes = getPantryItemDisplayNotes(item);
  const lowStock = getPantryItemIsLowStock(item);
  const badgeDetails = getInventoryBadgeDetails(item.expiry_date);
  const expiryLabel = formatExpiryCopy(item.expiry_date);
  const status = getPantryItemStatus(item.expiry_date);
  const searchText = [
    item.name,
    item.category,
    item.id,
    getPantryItemBarcode(item),
    displayNotes,
    categoryLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    badgeBackgroundColor: badgeDetails.backgroundColor,
    badgeTextColor: badgeDetails.textColor,
    badgeLabel: badgeDetails.label,
    categoryLabel,
    displayNotes,
    expiryLabel,
    item,
    lowStock,
    searchText,
    status,
  };
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
  const PAGE_SIZE = 20;
  const quickScanHandledRef = useRef(false);
  const [activeInventorySpace, setActiveInventorySpace] =
    useState<InventorySpaceKey>("kitchen");
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [inventoryVisibleCount, setInventoryVisibleCount] = useState(PAGE_SIZE);
  const [alertsVisibleCount, setAlertsVisibleCount] = useState(PAGE_SIZE);
  const [lowStockVisibleCount, setLowStockVisibleCount] = useState(PAGE_SIZE);
  const [loadingMoreTarget, setLoadingMoreTarget] = useState<
    "inventory" | "alerts" | "low_stock" | null
  >(null);
  const [pantryItems, setPantryItems] = useState<PantryItemRecord[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [updatingQuantityId, setUpdatingQuantityId] = useState<string | null>(null);
  const [updatingLowStockId, setUpdatingLowStockId] = useState<string | null>(null);
  const [previewImageItem, setPreviewImageItem] = useState<PantryItemRecord | null>(
    null,
  );
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [showQuickScanModal, setShowQuickScanModal] = useState(false);
  const [isResolvingScannedBarcode, setIsResolvingScannedBarcode] = useState(false);
  const [savingPreferenceKey, setSavingPreferenceKey] = useState<
    "one_day" | "three_days" | "fifteen_days" | "thirty_days" | null
  >(null);
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const loadMoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60_000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (loadMoreTimerRef.current) {
        clearTimeout(loadMoreTimerRef.current);
      }
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

  useEffect(() => {
    setSearch("");
    setSelectedCategoryFilter("all");
  }, [activeInventorySpace]);

  const activeSpaceItems = useMemo(
    () =>
      pantryItems.filter(
        (item) => getPantryItemInventorySpace(item) === activeInventorySpace,
      ),
    [activeInventorySpace, pantryItems],
  );
  const inventoryItems = useMemo(
    () => activeSpaceItems.map((item) => buildInventoryItemSummary(item)),
    [activeSpaceItems],
  );
  const activeSpaceConfig = INVENTORY_SPACE_CONFIG[activeInventorySpace];
  const activeSpacePalette = INVENTORY_SPACE_PALETTES[activeInventorySpace];

  const categoryFilters = useMemo(() => {
    const categoryCounts = inventoryItems.reduce<Record<string, number>>(
      (accumulator, item) => {
        const key = item.categoryLabel;
        accumulator[key] = (accumulator[key] ?? 0) + 1;
        return accumulator;
      },
      {},
    );

    const orderedCategories = Object.keys(categoryCounts).sort((left, right) =>
      left.localeCompare(right),
    );

    return [
      {
        count: inventoryItems.length,
        key: "all",
        label: "All",
      },
      ...orderedCategories.map((category) => ({
        count: categoryCounts[category],
        key: category,
        label: category,
      })),
    ];
  }, [inventoryItems]);

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

    return inventoryItems.filter((item) => {
      const categoryLabel = item.categoryLabel;
      const matchesCategory =
        selectedCategoryFilter === "all" || categoryLabel === selectedCategoryFilter;
      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      return item.searchText.includes(query);
    });
  }, [inventoryItems, search, selectedCategoryFilter]);

  useEffect(() => {
    if (search.trim().length > 0) {
      setInventoryVisibleCount(filteredItems.length);
      return;
    }

    setInventoryVisibleCount(PAGE_SIZE);
  }, [activeInventorySpace, filteredItems.length, search, selectedCategoryFilter]);

  useEffect(() => {
    cancelLoadMoreTimer();
  }, [activeTab, activeInventorySpace, search, selectedCategoryFilter]);

  const upcomingExpiryItems = inventoryItems.filter((item) => {
    return item.status === "expiring_soon";
  });
  const expiredItems = inventoryItems.filter((item) => {
    return item.status === "expired";
  });
  const lowStockItems = inventoryItems.filter((item) => {
    return item.lowStock;
  });
  useEffect(() => {
    setAlertsVisibleCount(PAGE_SIZE);
  }, [activeInventorySpace, upcomingExpiryItems.length]);

  useEffect(() => {
    setLowStockVisibleCount(PAGE_SIZE);
  }, [activeInventorySpace, lowStockItems.length]);

  const paginatedFilteredItems = useMemo(
    () => filteredItems.slice(0, inventoryVisibleCount),
    [filteredItems, inventoryVisibleCount],
  );
  const paginatedUpcomingExpiryItems = useMemo(
    () => upcomingExpiryItems.slice(0, alertsVisibleCount),
    [alertsVisibleCount, upcomingExpiryItems],
  );
  const paginatedLowStockItems = useMemo(
    () => lowStockItems.slice(0, lowStockVisibleCount),
    [lowStockItems, lowStockVisibleCount],
  );
  const nearExpiryCount = upcomingExpiryItems.length;
  const totalItems = inventoryItems.length;
  const greetingTimeOfDay = getTimeOfDayGreeting(currentHour);
  const greetingSubtitle =
    nearExpiryCount === 0
      ? `Your ${activeSpaceConfig.label.toLowerCase()} inventory is clear right now. Keep this momentum and stay ahead of waste.`
      : `You have ${nearExpiryCount} ${activeSpaceConfig.shortLabel.toLowerCase()} item${nearExpiryCount === 1 ? "" : "s"} entering the 3-day expiry window.`;
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
        "notify_fifteen_days_before_expiry",
      ) &&
      Object.prototype.hasOwnProperty.call(
        profile,
        "notify_three_days_before_expiry",
      ) &&
      Object.prototype.hasOwnProperty.call(
        profile,
        "notify_one_day_before_expiry",
      ) &&
      Object.prototype.hasOwnProperty.call(
        profile,
        "notify_thirty_days_before_expiry",
      )
    : false;
  const notifyFifteenDaysBeforeExpiry =
    profile?.notify_fifteen_days_before_expiry !== false;
  const notifyThreeDaysBeforeExpiry =
    profile?.notify_three_days_before_expiry !== false;
  const notifyOneDayBeforeExpiry = profile?.notify_one_day_before_expiry !== false;
  const notifyThirtyDaysBeforeExpiry =
    profile?.notify_thirty_days_before_expiry !== false;
  const activityEntries = useMemo(() => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    const addedItems = activeSpaceItems
      .filter((item) => new Date(item.created_at).getTime() >= twentyFourHoursAgo)
      .sort(
        (left, right) =>
          new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
      );

    const updatedItems = activeSpaceItems
      .filter((item) => {
        const createdAt = new Date(item.created_at).getTime();
        const updatedAt = new Date(item.updated_at).getTime();
        return updatedAt >= twentyFourHoursAgo && updatedAt - createdAt > 60 * 1000;
      })
      .sort(
        (left, right) =>
          new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
      );

    const recentlyExpiredItems = activeSpaceItems
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
  }, [activeSpaceItems]);

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
      key: "low_stock",
      icon: "alert-circle-outline",
      activeIcon: "alert-circle",
      label: "Low Stock",
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

    if (tab.key === "low_stock") {
      return lowStockItems.length > 0;
    }

    return true;
  });
  const navTabCount = visibleTabs.length;
  const shouldCompactTabs = navTabCount > 4;
  const navPaddingHorizontal = shouldCompactTabs ? 10 : 12;
  const navPaddingVertical = shouldCompactTabs ? 6 : 7;
  const navTabPaddingHorizontal = shouldCompactTabs ? 8 : 12;
  const navTabPaddingVertical = shouldCompactTabs ? 7 : 9;
  const navTabGap = shouldCompactTabs ? 3 : 4;
  const navIconSize = shouldCompactTabs ? 16 : 18;
  const navLabelFontSize = shouldCompactTabs ? 10 : 11;
  const navLabelLineHeight = shouldCompactTabs ? 12 : 14;
  const navBottomOffset = shouldCompactTabs ? 12 : 16;
  const navBarGap = shouldCompactTabs ? 3 : 8;

  useEffect(() => {
    if (activeTab === "alerts" && nearExpiryCount === 0) {
      onTabChange("home");
    }
  }, [activeTab, nearExpiryCount, onTabChange]);

  useEffect(() => {
    if (activeTab === "low_stock" && lowStockItems.length === 0) {
      onTabChange("home");
    }
  }, [activeTab, lowStockItems.length, onTabChange]);

  function startCreateFlow() {
    onOpenCreate({
      inventorySpace: activeInventorySpace,
    });
  }

  function startQuickScanFlow() {
    quickScanHandledRef.current = false;
    setShowQuickScanModal(true);
  }

  function startEditFlow(item: PantryItemRecord) {
    onOpenEdit(item);
  }

  function handleTabPress(nextTab: TabKey) {
    onTabChange(nextTab);
  }

  function cancelLoadMoreTimer() {
    if (loadMoreTimerRef.current) {
      clearTimeout(loadMoreTimerRef.current);
      loadMoreTimerRef.current = null;
    }
    setLoadingMoreTarget(null);
  }

  function scheduleLoadMore(target: "inventory" | "alerts" | "low_stock", updateCount: () => void) {
    if (loadingMoreTarget !== null) {
      return;
    }

    setLoadingMoreTarget(target);

    if (loadMoreTimerRef.current) {
      clearTimeout(loadMoreTimerRef.current);
    }

    loadMoreTimerRef.current = setTimeout(() => {
      updateCount();
      loadMoreTimerRef.current = null;
      setLoadingMoreTarget(null);
    }, 220);
  }

  const handleDashboardScroll: NonNullable<
    ComponentProps<typeof ScrollView>["onScroll"]
  > = (event) => {
    if (search.trim().length > 0) {
      return;
    }

    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);
    const isNearBottom = distanceFromBottom < 320;

    if (!isNearBottom) {
      return;
    }

    if (activeTab === "inventory" && inventoryVisibleCount < filteredItems.length) {
      const nextLimit = filteredItems.length;
      scheduleLoadMore("inventory", () => {
        setInventoryVisibleCount((existingCount) =>
          Math.min(existingCount + PAGE_SIZE, nextLimit),
        );
      });
      return;
    }

    if (activeTab === "alerts" && alertsVisibleCount < upcomingExpiryItems.length) {
      const nextLimit = upcomingExpiryItems.length;
      scheduleLoadMore("alerts", () => {
        setAlertsVisibleCount((existingCount) =>
          Math.min(existingCount + PAGE_SIZE, nextLimit),
        );
      });
      return;
    }

    if (activeTab === "low_stock" && lowStockVisibleCount < lowStockItems.length) {
      const nextLimit = lowStockItems.length;
      scheduleLoadMore("low_stock", () => {
        setLowStockVisibleCount((existingCount) =>
          Math.min(existingCount + PAGE_SIZE, nextLimit),
        );
      });
    }
  };

  function renderLoadMoreFooter(target: "inventory" | "alerts" | "low_stock") {
    if (loadingMoreTarget !== target) {
      return null;
    }

    return (
      <LoadMoreFooter>
        <ActivityIndicator color={activeSpacePalette.accent} size="small" />
        <LoadMoreText>Loading more…</LoadMoreText>
      </LoadMoreFooter>
    );
  }

  async function handleQuickBarcodeScanned(scannedBarcode: string) {
    const normalizedBarcode = scannedBarcode.trim();

    if (!normalizedBarcode || quickScanHandledRef.current) {
      return;
    }

    quickScanHandledRef.current = true;
    setShowQuickScanModal(false);
    setIsResolvingScannedBarcode(true);

    const existingItem =
      pantryItems.find((item) => getPantryItemBarcode(item) === normalizedBarcode) ??
      null;

    let resolvedName: string | null = existingItem?.name ?? null;

    try {
      const { data, error } = await findPantryItemByBarcode(normalizedBarcode);

      if (error) {
        throw error;
      }

      if (data?.product_name?.trim()) {
        resolvedName = data.product_name.trim();
      }
    } catch {
      if (!resolvedName) {
        onShowToast("Barcode captured. Name lookup is unavailable right now.");
      }
    } finally {
      setIsResolvingScannedBarcode(false);
    }

    const prefill = {
      barcode: normalizedBarcode,
      category: existingItem?.category ?? null,
      inventorySpace: activeInventorySpace,
      name: resolvedName,
    };

    if (existingItem) {
      Alert.alert(
        "Barcode Already In Pantry",
        `${existingItem.name} already exists in your pantry. Would you like to create a new item anyway or update the existing record?`,
        [
          {
            style: "cancel",
            text: "Cancel",
          },
          {
            text: "Create New",
            onPress: () => {
              onOpenCreate(prefill);
            },
          },
          {
            text: "Update Existing",
            onPress: () => {
              onOpenEdit(existingItem);
            },
          },
        ],
      );
      return;
    }

    onOpenCreate(prefill);
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

  async function handleLowStockChange(item: PantryItemRecord, nextValue: boolean) {
    if (updatingLowStockId) {
      return;
    }

    setUpdatingLowStockId(item.id);
    setPantryItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              stock_status: nextValue ? "low_stock" : "in_stock",
            }
          : currentItem,
      ),
    );

    try {
      const { data, error } = await updatePantryItem(userId, item.id, {
        stock_status: nextValue ? "low_stock" : "in_stock",
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
                  stock_status: item.stock_status ?? "in_stock",
                }
            : currentItem,
        ),
      );

      Alert.alert(
        "Couldn't Update Stock Status",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setUpdatingLowStockId(null);
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
    key:
      | "notify_one_day_before_expiry"
      | "notify_three_days_before_expiry"
      | "notify_fifteen_days_before_expiry"
      | "notify_thirty_days_before_expiry",
    value: boolean,
  ) {
    if (!profile) {
      return;
    }

    const savingKey =
      key === "notify_one_day_before_expiry"
        ? "one_day"
        : key === "notify_three_days_before_expiry"
          ? "three_days"
          : key === "notify_fifteen_days_before_expiry"
            ? "fifteen_days"
            : "thirty_days";
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

  function renderSpaceTabs() {
    return (
      <SpaceSwitcher>
        {INVENTORY_SPACE_OPTIONS.map((space) => {
          const active = activeInventorySpace === space.key;

          return (
            <SpaceTab
              key={space.key}
              accessibilityLabel={`Open ${space.label} inventory space`}
              backgroundColor={
                active
                  ? INVENTORY_SPACE_PALETTES[space.key].tabActiveBackground
                  : COLORS.surface
              }
              borderColor={
                active
                  ? INVENTORY_SPACE_PALETTES[space.key].accentSoftBorder
                  : COLORS.pageLine
              }
              onPress={() => setActiveInventorySpace(space.key)}
            >
              <SpaceTabLabel
                color={
                  active
                    ? INVENTORY_SPACE_PALETTES[space.key].tabActiveText
                    : COLORS.textDark
                }
              >
                {space.shortLabel}
              </SpaceTabLabel>
              <SpaceTabMeta
                color={
                  active
                    ? INVENTORY_SPACE_PALETTES[space.key].tabActiveMeta
                    : COLORS.textSoft
                }
              >
                {space.label}
              </SpaceTabMeta>
            </SpaceTab>
          );
        })}
      </SpaceSwitcher>
    );
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

          <InlineActionCard
            accessibilityLabel="Open barcode scanner"
            backgroundColor={activeSpacePalette.inlineActionBackground}
            borderColor={activeSpacePalette.accentSoftBorder}
            onPress={startQuickScanFlow}
          >
            <InlineActionGlow backgroundColor={activeSpacePalette.glowPrimary} />
            <View flex={1} gap={5}>
              <InlineActionTitle color={activeSpacePalette.inlineActionForeground}>
                Scan Barcode
              </InlineActionTitle>
              <InlineActionCaption color={activeSpacePalette.primaryActionMutedText}>
                Use the camera to jump straight into add or update.
              </InlineActionCaption>
            </View>

            <View alignItems="center" gap={8}>
              <QuickActionBubble backgroundColor={activeSpacePalette.accentSurface}>
                <Ionicons color={activeSpacePalette.accent} name="scan-outline" size={24} />
              </QuickActionBubble>
            </View>
          </InlineActionCard>

          {renderSpaceTabs()}

          <HeroCard
            backgroundColor={activeSpacePalette.heroBackground}
            borderColor={activeSpacePalette.accentSoftBorder}
          >
            <HeroGlow backgroundColor={activeSpacePalette.glowPrimary} />
            <HeroGlowSecondary backgroundColor={activeSpacePalette.glowSecondary} />
            <HeroStripe backgroundColor={activeSpacePalette.heroStripe} top={28} left={122} />
            <HeroStripe backgroundColor={activeSpacePalette.heroStripe} top={104} left={-26} />

            <HeroBottom>
              <HeroLabel color={activeSpacePalette.heroMeta}>{activeSpaceConfig.label} Snapshot</HeroLabel>
              <HeroValue color={activeSpacePalette.heroText}>{totalItems} Active Items</HeroValue>
              <HeroMeta color={activeSpacePalette.heroMeta}>
                {lowStockItems.length === 0
                  ? `Keep your ${activeSpaceConfig.label.toLowerCase()} records current so nothing critical slips through.`
                  : `${lowStockItems.length} item${lowStockItems.length === 1 ? "" : "s"} are marked low stock in this space.`}
              </HeroMeta>
              <HeroMetaRow>
                <HeroBadge
                  accessibilityLabel="Open expired items"
                  backgroundColor={activeSpacePalette.pillBackground}
                  borderColor={activeSpacePalette.pillBorder}
                  onPress={() => onOpenExpired(activeInventorySpace)}
                >
                  <HeroBadgeText color={activeSpacePalette.pillText}>
                    {expiredItems.length === 0
                      ? "No expired items, nice!"
                      : `${expiredItems.length} Expired`}
                  </HeroBadgeText>
                </HeroBadge>
                <HeroStatPill
                  backgroundColor={activeSpacePalette.pillBackground}
                  borderColor={activeSpacePalette.pillBorder}
                >
                  <HeroStatText color={activeSpacePalette.pillText}>
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
              backgroundColor={activeSpacePalette.actionBackground}
              width="48%"
              onPress={startCreateFlow}
            >
              <QuickActionBubble backgroundColor={activeSpacePalette.accentSurface}>
                <Ionicons color={activeSpacePalette.accent} name="nutrition-outline" size={24} />
              </QuickActionBubble>
              <View gap={6}>
                <QuickActionLabel color={activeSpacePalette.actionText}>Add Item</QuickActionLabel>
                <QuickActionCaption color={activeSpacePalette.primaryActionMutedText}>
                  {activeSpaceConfig.quickActionLabel}
                </QuickActionCaption>
                <View alignItems="center" flexDirection="row" gap={6}>
                  <QuickActionHint color={activeSpacePalette.primaryActionMutedText}>
                    Tap to Add
                  </QuickActionHint>
                  <Ionicons
                    color={activeSpacePalette.primaryActionMutedText}
                    name="arrow-forward"
                    size={14}
                  />
                </View>
              </View>
            </QuickActionButton>

            <QuickActionButton
              accessibilityLabel="View inventory"
              backgroundColor={activeSpacePalette.secondaryActionBackground}
              borderColor={activeSpacePalette.secondaryActionBorder}
              borderWidth={1}
              width="48%"
              onPress={() => onTabChange("inventory")}
            >
              <QuickActionBubble backgroundColor={activeSpacePalette.secondaryActionBubble}>
                <Ionicons color={activeSpacePalette.accent} name="layers-outline" size={24} />
              </QuickActionBubble>
              <View gap={6}>
                <QuickActionLabel color={activeSpacePalette.secondaryActionText}>
                  View Inventory
                </QuickActionLabel>
                <QuickActionCaption color={activeSpacePalette.secondaryActionText}>
                  Scan all active pantry rows
                </QuickActionCaption>
                <View alignItems="center" flexDirection="row" gap={6}>
                  <QuickActionHint color={activeSpacePalette.secondaryActionMutedText}>
                    Open Inventory
                  </QuickActionHint>
                  <Ionicons
                    color={activeSpacePalette.secondaryActionMutedText}
                    name="arrow-forward"
                    size={14}
                  />
                </View>
              </View>
            </QuickActionButton>

            <QuickActionButton
              accessibilityLabel="Bulk upload inventory spreadsheet"
              backgroundColor={COLORS.surface}
              borderColor={activeSpacePalette.accentSoftBorder}
              borderWidth={1}
              width="48%"
              onPress={() => onOpenBulkUpload(activeInventorySpace)}
            >
              <QuickActionBubble backgroundColor={activeSpacePalette.accentSurface}>
                <Ionicons color={activeSpacePalette.accent} name="cloud-upload-outline" size={24} />
              </QuickActionBubble>
              <View gap={6}>
                <QuickActionLabel color={COLORS.textDark}>Bulk Upload</QuickActionLabel>
                <QuickActionCaption color={COLORS.textSoft}>
                  Import `.xls`, `.xlsx`, or `.csv` files into {activeSpaceConfig.shortLabel.toLowerCase()}
                </QuickActionCaption>
                <View alignItems="center" flexDirection="row" gap={6}>
                  <QuickActionHint color={activeSpacePalette.accent}>Upload</QuickActionHint>
                  <Ionicons color={activeSpacePalette.accent} name="arrow-forward" size={14} />
                </View>
              </View>
            </QuickActionButton>

            <QuickActionButton
              accessibilityLabel="Scan a product barcode"
              backgroundColor={COLORS.surface}
              borderColor={activeSpacePalette.accentSoftBorder}
              borderWidth={1}
              width="48%"
              opacity={isResolvingScannedBarcode ? 0.72 : 1}
              onPress={startQuickScanFlow}
            >
              <QuickActionBubble backgroundColor={activeSpacePalette.accentSurface}>
                <Ionicons color={activeSpacePalette.accent} name="scan-outline" size={24} />
              </QuickActionBubble>
              <View gap={6}>
                <QuickActionLabel color={COLORS.textDark}>Barcode Scanner</QuickActionLabel>
                <QuickActionCaption color={COLORS.textSoft}>
                  {isResolvingScannedBarcode
                    ? "Checking your pantry and product lookup…"
                    : "Scan a code and jump into the right item flow"}
                </QuickActionCaption>
                <View alignItems="center" flexDirection="row" gap={6}>
                  <QuickActionHint color={activeSpacePalette.accent}>Scan</QuickActionHint>
                  <Ionicons color={activeSpacePalette.accent} name="arrow-forward" size={14} />
                </View>
              </View>
            </QuickActionButton>
          </QuickActionsRow>

        </Section>

        {activityEntries.length > 0 ? (
          <FullBleedSection
            backgroundColor={activeSpacePalette.sectionTint}
            borderColor={activeSpacePalette.sectionTintBorder}
          >
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
    if (inventoryError) {
      return (
        <Section>
          <DashboardHeader paddingLeft={0} paddingRight={0}>
            {renderSpaceTabs()}

            <View gap={8}>
              <SectionTitle>{activeSpaceConfig.label} Inventory</SectionTitle>
              <SectionBody>
                Look up stock by item name, category, or internal code inside this
                inventory space before you edit the next record.
              </SectionBody>
            </View>
          </DashboardHeader>

          <EmptyCard>
            <SectionHeading>Inventory Unavailable</SectionHeading>
            <SectionBody>{inventoryError}</SectionBody>
          </EmptyCard>
        </Section>
      );
    }

    if (isItemsLoading && pantryItems.length === 0) {
      return (
        <Section>
          <DashboardHeader paddingLeft={0} paddingRight={0}>
            {renderSpaceTabs()}

            <View gap={8}>
              <SectionTitle>{activeSpaceConfig.label} Inventory</SectionTitle>
              <SectionBody>
                Look up stock by item name, category, or internal code inside this
                inventory space before you edit the next record.
              </SectionBody>
            </View>
          </DashboardHeader>

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
        </Section>
      );
    }

    return (
      <FlatList<InventoryItemSummary>
        style={styles.inventoryList}
        contentContainerStyle={styles.inventoryListContent}
        data={paginatedFilteredItems}
        initialNumToRender={8}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Section>
            <EmptyCard>
              <SectionHeading>No Matching Items</SectionHeading>
              <SectionBody>
                Try another keyword or open Add Item to write your first pantry
                row.
              </SectionBody>
            </EmptyCard>
          </Section>
        }
        ListFooterComponent={renderLoadMoreFooter("inventory")}
        ListHeaderComponent={
          <Section>
            <DashboardHeader paddingLeft={0} paddingRight={0}>
              {renderSpaceTabs()}

              <View gap={8}>
                <SectionTitle>{activeSpaceConfig.label} Inventory</SectionTitle>
                <SectionBody>
                  Look up stock by item name, category, or internal code inside this
                  inventory space before you edit the next record.
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
              backgroundColor={activeSpacePalette.inlineActionBackground}
              borderColor={activeSpacePalette.accentSoftBorder}
              onPress={startCreateFlow}
            >
              <InlineActionGlow backgroundColor={activeSpacePalette.glowPrimary} />
              <View flex={1} gap={5}>
                <InlineActionTitle color={activeSpacePalette.inlineActionForeground}>
                  {activeSpaceConfig.quickActionLabel}
                </InlineActionTitle>
              </View>

              <View alignItems="center" gap={8}>
                <QuickActionBubble
                  width={52}
                  height={52}
                  backgroundColor={activeSpacePalette.accentSurface}
                >
                  <Ionicons color={activeSpacePalette.accent} name="add" size={24} />
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
                    backgroundColor={
                      active ? activeSpacePalette.accent : COLORS.surface
                    }
                    borderColor={active ? activeSpacePalette.accent : COLORS.pageLine}
                    onPress={() => setSelectedCategoryFilter(category.key)}
                  >
                    <FilterChipLabel color={active ? COLORS.white : COLORS.textDark}>
                      {category.label} · {category.count}
                    </FilterChipLabel>
                  </FilterChip>
                );
              })}
            </FilterWrap>
          </Section>
        }
        keyExtractor={(item) => item.item.id}
        onEndReached={() => {
          if (search.trim().length > 0) {
            return;
          }

          if (inventoryVisibleCount >= filteredItems.length) {
            return;
          }

          const nextLimit = filteredItems.length;
          scheduleLoadMore("inventory", () => {
            setInventoryVisibleCount((existingCount) =>
              Math.min(existingCount + PAGE_SIZE, nextLimit),
            );
          });
        }}
        onEndReachedThreshold={0.6}
        removeClippedSubviews
        updateCellsBatchingPeriod={32}
        windowSize={7}
        maxToRenderPerBatch={8}
        renderItem={({ item }) => {
          const inventory = item.item;

          return (
            <Section>
              <InventoryCardPressable
                accessibilityLabel={`Edit ${inventory.name}`}
                accessibilityRole="button"
                onPress={() => startEditFlow(inventory)}
              >
                <InventoryCard>
                  <InventoryRow alignItems="flex-start">
                    <InventoryMedia>
                      {inventory.photo_url ? (
                        <Pressable
                          accessibilityLabel={`Preview ${inventory.name} photo`}
                          style={styles.inventoryImageButton}
                          onPress={(event) => {
                            event.stopPropagation();
                            setPreviewImageItem(inventory);
                          }}
                        >
                          <Image
                            accessibilityLabel={`${inventory.name} photo`}
                            resizeMode="cover"
                            source={{ uri: inventory.photo_url }}
                            style={styles.inventoryImage}
                          />
                        </Pressable>
                      ) : (
                        <InventoryImageFallback>◔</InventoryImageFallback>
                      )}
                    </InventoryMedia>

                    <View gap={8} flex={1} minWidth={0}>
                      <View gap={4}>
                        <Eyebrow color={activeSpacePalette.accent}>
                          {item.categoryLabel}
                        </Eyebrow>
                        <InventoryName>{inventory.name}</InventoryName>
                        <InventoryMeta>{item.expiryLabel}</InventoryMeta>
                      </View>

                      <QuantityControl>
                        <QuantityButton
                          accessibilityLabel={`Decrease quantity for ${inventory.name}`}
                          opacity={
                            inventory.quantity <= 1 ||
                            updatingQuantityId === inventory.id
                              ? 0.45
                              : 1
                          }
                          onPress={() => void handleQuantityChange(inventory, -1)}
                        >
                          <QuantityButtonText>−</QuantityButtonText>
                        </QuantityButton>

                        <QuantityValue>
                          {updatingQuantityId === inventory.id
                            ? "Saving…"
                            : `Qty ${inventory.quantity}`}
                        </QuantityValue>

                        <QuantityButton
                          accessibilityLabel={`Increase quantity for ${inventory.name}`}
                          opacity={updatingQuantityId === inventory.id ? 0.45 : 1}
                          onPress={() => void handleQuantityChange(inventory, 1)}
                        >
                          <QuantityButtonText>+</QuantityButtonText>
                        </QuantityButton>
                      </QuantityControl>

                      <View alignItems="flex-start">
                        <StatusToggleChip
                          accessibilityLabel={
                            item.lowStock
                              ? `Mark ${inventory.name} as not low stock`
                              : `Mark ${inventory.name} as low stock`
                          }
                          backgroundColor={
                            item.lowStock ? "#FFE7DF" : COLORS.surfaceSoft
                          }
                          borderColor={
                            item.lowStock ? "#F0B2A4" : COLORS.pageLine
                          }
                          opacity={updatingLowStockId === inventory.id ? 0.6 : 1}
                          onPress={(event) => {
                            event.stopPropagation();
                            void handleLowStockChange(inventory, !item.lowStock);
                          }}
                        >
                          <StatusToggleChipText
                            color={item.lowStock ? "#B34242" : COLORS.textDark}
                          >
                            {updatingLowStockId === inventory.id
                              ? "Saving…"
                              : item.lowStock
                                ? "Low Stock"
                                : "Mark Low Stock"}
                          </StatusToggleChipText>
                        </StatusToggleChip>
                      </View>

                      {item.displayNotes ? (
                        <InventoryMeta numberOfLines={2}>
                          {item.displayNotes}
                        </InventoryMeta>
                      ) : null}
                    </View>

                    <InventoryActionRow>
                      <InventoryBadge backgroundColor={item.badgeBackgroundColor}>
                        <InventoryBadgeText color={item.badgeTextColor}>
                          {item.badgeLabel}
                        </InventoryBadgeText>
                      </InventoryBadge>
                      <DeleteChip
                        accessibilityLabel={`Delete ${inventory.name}`}
                        onPress={(event) => {
                          event.stopPropagation();
                          confirmDeleteItem(inventory);
                        }}
                      >
                        <DeleteChipText>
                          {deletingItemId === inventory.id ? "Deleting…" : "Delete"}
                        </DeleteChipText>
                      </DeleteChip>
                      <InventoryMeta color={activeSpacePalette.accent}>
                        Edit →
                      </InventoryMeta>
                    </InventoryActionRow>
                  </InventoryRow>
                </InventoryCard>
              </InventoryCardPressable>
            </Section>
          );
        }}
      />
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
          {renderSpaceTabs()}

          <View gap={8}>
            <SectionTitle>{activeSpaceConfig.label} Alerts</SectionTitle>
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
              onPress={() => onOpenExpired(activeInventorySpace)}
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
          paginatedUpcomingExpiryItems.map((item) => {
            const record = item.item;

            return (
            <InventoryCardPressable
              key={record.id}
              accessibilityLabel={`Edit ${record.name} from upcoming expiry list`}
              accessibilityRole="button"
              onPress={() => startEditFlow(record)}
            >
              <InventoryCard>
                <InventoryRow alignItems="flex-start">
                  <InventoryMedia>
                    {record.photo_url ? (
                      <Image
                        accessibilityLabel={`${record.name} photo`}
                        resizeMode="cover"
                        source={{ uri: record.photo_url }}
                        style={styles.inventoryImage}
                      />
                    ) : (
                      <InventoryImageFallback>◔</InventoryImageFallback>
                    )}
                  </InventoryMedia>

                  <View gap={8} flex={1} minWidth={0}>
                    <View gap={4}>
                      <Eyebrow color={activeSpacePalette.accent}>
                        {item.categoryLabel}
                      </Eyebrow>
                      <InventoryName>{record.name}</InventoryName>
                      <InventoryMeta>
                        Qty {record.quantity} · {item.expiryLabel}
                      </InventoryMeta>
                    </View>

                    {item.displayNotes ? (
                      <InventoryMeta numberOfLines={2}>
                        {item.displayNotes}
                      </InventoryMeta>
                    ) : null}
                  </View>

                  <InventoryActionRow>
                    <InventoryBadge backgroundColor={item.badgeBackgroundColor}>
                      <InventoryBadgeText color={item.badgeTextColor}>
                        {item.badgeLabel}
                      </InventoryBadgeText>
                    </InventoryBadge>
                    <DeleteChip
                      accessibilityLabel={`Delete ${record.name}`}
                      onPress={(event) => {
                        event.stopPropagation();
                        confirmDeleteItem(record);
                      }}
                    >
                      <DeleteChipText>
                        {deletingItemId === record.id ? "Deleting…" : "Delete"}
                      </DeleteChipText>
                    </DeleteChip>
                    <InventoryMeta color={activeSpacePalette.accent}>Edit →</InventoryMeta>
                  </InventoryActionRow>
                </InventoryRow>
              </InventoryCard>
            </InventoryCardPressable>
            );
          })
        )}
        {renderLoadMoreFooter("alerts")}
      </Section>
    );
  }

  function renderLowStockView() {
    if (isItemsLoading && pantryItems.length === 0) {
      return (
        <Section>
          <DashboardHeader paddingLeft={0} paddingRight={0}>
            {renderSpaceTabs()}

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
          {renderSpaceTabs()}

          <View gap={8}>
            <SectionTitle>{activeSpaceConfig.label} Low Stock</SectionTitle>
            <SectionBody>
              Review the items currently marked low stock so you can replenish them
              before the shelf goes empty.
            </SectionBody>
          </View>
        </DashboardHeader>

        <LowStockSummaryCard>
          <LowStockSummaryEyebrow>{activeSpaceConfig.shortLabel} Queue</LowStockSummaryEyebrow>
          <LowStockSummaryValue>
            {lowStockItems.length} {lowStockItems.length === 1 ? "Item" : "Items"}
          </LowStockSummaryValue>
          <LowStockSummaryCopy>
            Keep this queue light so your inventory stays easy to trust.
          </LowStockSummaryCopy>
        </LowStockSummaryCard>

        {lowStockItems.length === 0 ? (
          <EmptyCard>
            <SectionHeading>No Low Stock Items</SectionHeading>
            <SectionBody>
              You do not currently have any items marked low stock in this space.
            </SectionBody>
          </EmptyCard>
        ) : (
          paginatedLowStockItems.map((item) => {
            const record = item.item;

            return (
            <InventoryCardPressable
              key={record.id}
              accessibilityLabel={`Open ${record.name}`}
              accessibilityRole="button"
              onPress={() => startEditFlow(record)}
            >
              <InventoryCard>
                <InventoryRow alignItems="flex-start">
                  <InventoryMedia>
                    {record.photo_url ? (
                      <Image
                        accessibilityLabel={`${record.name} photo`}
                        resizeMode="cover"
                        source={{ uri: record.photo_url }}
                        style={styles.inventoryImage}
                      />
                    ) : (
                      <InventoryImageFallback>◔</InventoryImageFallback>
                    )}
                  </InventoryMedia>

                  <View gap={8} flex={1} minWidth={0}>
                    <View gap={4}>
                      <Eyebrow color={activeSpacePalette.accent}>
                        {item.categoryLabel}
                      </Eyebrow>
                      <InventoryName>{record.name}</InventoryName>
                      <InventoryMeta>
                        Qty {record.quantity} · {item.expiryLabel}
                      </InventoryMeta>
                    </View>

                    {item.displayNotes ? (
                      <InventoryMeta numberOfLines={2}>
                        {item.displayNotes}
                      </InventoryMeta>
                    ) : null}
                  </View>

                  <InventoryActionRow>
                    <InventoryBadge backgroundColor="#E8FAF0">
                      <InventoryBadgeText color="#0B7B44">Low Stock</InventoryBadgeText>
                    </InventoryBadge>
                    <DeleteChip
                      accessibilityLabel={`Delete ${record.name}`}
                      onPress={(event) => {
                        event.stopPropagation();
                        confirmDeleteItem(record);
                      }}
                    >
                      <DeleteChipText>
                        {deletingItemId === record.id ? "Deleting…" : "Delete"}
                      </DeleteChipText>
                    </DeleteChip>
                    <InventoryMeta color={activeSpacePalette.accent}>Open →</InventoryMeta>
                  </InventoryActionRow>
                </InventoryRow>
              </InventoryCard>
            </InventoryCardPressable>
            );
          })
        )}
        {renderLoadMoreFooter("low_stock")}
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
                <SettingTitle>Notify me 30 days before expiry</SettingTitle>
                <SettingBody>
                  Get an early reminder when an item enters the 30-day window.
                </SettingBody>
              </View>

              <Switch
                disabled={!profileSupportsReminderSettings || savingPreferenceKey !== null}
                ios_backgroundColor="#D9E5DD"
                onValueChange={(value) =>
                  void handleNotificationPreferenceChange(
                    "notify_thirty_days_before_expiry",
                    value,
                  )
                }
                thumbColor={COLORS.white}
                trackColor={{ false: "#D9E5DD", true: COLORS.leaf }}
                value={notifyThirtyDaysBeforeExpiry}
              />
            </SettingRow>

            <View height={1} backgroundColor={COLORS.pageLine} />

            <SettingRow>
              <View flex={1} gap={4}>
                <SettingTitle>Notify me 15 days before expiry</SettingTitle>
                <SettingBody>
                  Get a mid-range reminder when an item enters the 15-day window.
                </SettingBody>
              </View>

              <Switch
                disabled={!profileSupportsReminderSettings || savingPreferenceKey !== null}
                ios_backgroundColor="#D9E5DD"
                onValueChange={(value) =>
                  void handleNotificationPreferenceChange(
                    "notify_fifteen_days_before_expiry",
                    value,
                  )
                }
                thumbColor={COLORS.white}
                trackColor={{ false: "#D9E5DD", true: COLORS.leaf }}
                value={notifyFifteenDaysBeforeExpiry}
              />
            </SettingRow>

            <View height={1} backgroundColor={COLORS.pageLine} />

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

    if (activeTab === "low_stock") {
      return renderLowStockView();
    }

    if (activeTab === "alerts") {
      return renderAlertsView();
    }

    return renderProfileView();
  }

  return (
    <DashboardShell>
      {activeTab === "inventory" ? (
        renderInventoryView()
      ) : (
        <ScrollView
          key={activeTab}
          contentContainerStyle={styles.dashboardContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          onScroll={handleDashboardScroll}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {renderContent()}
        </ScrollView>
      )}

      <BottomBar
        alignSelf="center"
        gap={navBarGap}
        justifyContent="center"
        bottom={navBottomOffset}
        paddingVertical={navPaddingVertical}
        paddingHorizontal={navPaddingHorizontal}
      >
        {visibleTabs.map((tab) => {
          const active = tab.key === activeTab;
          const iconName = active ? tab.activeIcon : tab.icon;
          const isAlertsTab = tab.key === "alerts";
          const isLowStockTab = tab.key === "low_stock";
          const badgeCount = isAlertsTab ? nearExpiryCount : isLowStockTab ? lowStockItems.length : 0;
          const tabBackgroundColor = active
            ? isAlertsTab
              ? "#FFE7DF"
              : isLowStockTab
                ? "#FFF3E7"
                : COLORS.white
            : isAlertsTab
              ? "rgba(214,90,90,0.14)"
              : isLowStockTab
                ? "rgba(242,167,64,0.14)"
              : "transparent";
          const iconColor = active
            ? isAlertsTab
              ? "#B34242"
              : isLowStockTab
                ? "#A86518"
                : COLORS.night
            : isAlertsTab
              ? "#FFC9B8"
              : isLowStockTab
                ? "#E0B15F"
              : "rgba(255,255,255,0.74)";
          const labelColor = active
            ? isAlertsTab
              ? "#B34242"
              : isLowStockTab
                ? "#A86518"
                : COLORS.night
            : isAlertsTab
              ? "#FFD8CC"
              : isLowStockTab
                ? "#E6C486"
              : "rgba(255,255,255,0.74)";
          const badgeBackgroundColor = active
            ? isLowStockTab
              ? "#A86518"
              : "#B34242"
            : isLowStockTab
              ? "#D89A34"
              : "#F06A52";
          const badgeTextColor = COLORS.white;

          return (
            <BottomTab
              key={tab.key}
              accessibilityLabel={`Open ${tab.label}`}
              backgroundColor={tabBackgroundColor}
              borderColor={isAlertsTab ? "rgba(240,106,82,0.26)" : "transparent"}
              borderWidth={isAlertsTab ? 1 : 0}
              minWidth={
                isAlertsTab
                  ? shouldCompactTabs
                    ? 88
                    : 96
                  : isLowStockTab
                    ? shouldCompactTabs
                      ? 92
                      : 100
                    : shouldCompactTabs
                      ? 70
                      : 78
              }
              paddingHorizontal={navTabPaddingHorizontal}
              paddingVertical={navTabPaddingVertical}
              gap={navTabGap}
              onPress={() => handleTabPress(tab.key)}
            >
              <BottomTabInner>
                <Ionicons
                  color={iconColor}
                  name={iconName}
                  size={navIconSize}
                />
                {badgeCount > 0 ? (
                  <BottomTabBadge backgroundColor={badgeBackgroundColor}>
                    <BottomTabBadgeText color={badgeTextColor}>
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </BottomTabBadgeText>
                  </BottomTabBadge>
                ) : null}
              </BottomTabInner>
              <BottomTabText
                color={labelColor}
                fontSize={navLabelFontSize}
                lineHeight={navLabelLineHeight}
                ellipsizeMode="tail"
                numberOfLines={1}
              >
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

      <BarcodeScannerModal
        visible={showQuickScanModal}
        onClose={() => setShowQuickScanModal(false)}
        onScanned={(result) => {
          void handleQuickBarcodeScanned(result.data);
        }}
      />

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
  inventoryList: {
    flex: 1,
  },
  inventoryListContent: {
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
