import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Text, View, styled } from "@tamagui/core";

import {
  deletePantryItem,
  getPantryItemDisplayNotes,
  listPantryItems,
  type PantryItemRecord,
} from "../../lib/pantry-items";
import { COLORS } from "../theme/colors";

const ScreenShell = styled(View, {
  flex: 1,
  backgroundColor: COLORS.page,
  paddingTop: 52,
});

const Section = styled(View, {
  paddingRight: 20,
  paddingLeft: 20,
});

const ScreenHeader = styled(View, {
  gap: 6,
  paddingTop: 26,
  paddingRight: 20,
  paddingBottom: 18,
  paddingLeft: 20,
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

const SectionTitle = styled(Text, {
  color: COLORS.textDark,
  fontSize: 27,
  lineHeight: 31,
  fontWeight: "800",
});

const SectionBody = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 15,
  lineHeight: 22,
});

const SummaryCard = styled(View, {
  marginTop: 18,
  borderRadius: 26,
  backgroundColor: "#FFF1F1",
  borderWidth: 1,
  borderColor: "#F1BDBD",
  paddingTop: 18,
  paddingRight: 18,
  paddingBottom: 18,
  paddingLeft: 18,
  gap: 8,
});

const SummaryEyebrow = styled(Text, {
  color: "#B34242",
  fontSize: 12,
  lineHeight: 16,
  letterSpacing: 1.2,
  textTransform: "uppercase",
});

const SummaryValue = styled(Text, {
  color: COLORS.textDark,
  fontSize: 28,
  lineHeight: 32,
  fontWeight: "800",
});

const SummaryCopy = styled(Text, {
  color: "#8F4D4D",
  fontSize: 14,
  lineHeight: 20,
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

const Eyebrow = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 12,
  lineHeight: 16,
  letterSpacing: 1.4,
  textTransform: "uppercase",
});

const InventoryBadge = styled(View, {
  borderRadius: 999,
  paddingVertical: 6,
  paddingHorizontal: 10,
  backgroundColor: "#FFF1F1",
});

const InventoryBadgeText = styled(Text, {
  color: "#B34242",
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

type ExpiredItemsScreenProps = {
  onBack: () => void;
  onOpenEdit: (item: PantryItemRecord) => void;
  onItemsChanged: (message: string) => void;
  refreshToken: number;
  userId: string;
};

function getExpiredDays(expiryDate: string | null) {
  if (!expiryDate) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsedExpiry = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(parsedExpiry.getTime())) {
    return null;
  }

  return Math.max(
    0,
    Math.round((today.getTime() - parsedExpiry.getTime()) / (1000 * 60 * 60 * 24)),
  );
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

export default function ExpiredItemsScreen({
  onBack,
  onItemsChanged,
  onOpenEdit,
  refreshToken,
  userId,
}: ExpiredItemsScreenProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [pantryItems, setPantryItems] = useState<PantryItemRecord[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

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
            : "Couldn't load your expired items.",
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

  const expiredItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return pantryItems.filter((item) => {
      if (!item.expiry_date) {
        return false;
      }

      const parsedExpiry = new Date(`${item.expiry_date}T00:00:00`);
      if (Number.isNaN(parsedExpiry.getTime())) {
        return false;
      }

      return parsedExpiry < today;
    });
  }, [pantryItems]);

  function confirmDeleteItem(item: PantryItemRecord) {
    Alert.alert(
      "Delete Expired Item",
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
      onItemsChanged(`${item.name} deleted.`);
    } catch (error) {
      Alert.alert(
        "Couldn't Delete Item",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setDeletingItemId(null);
    }
  }

  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({
          animated: false,
          y: 0,
        });
      });
    }, []),
  );

  return (
    <ScreenShell>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Section>
          <ScreenHeader paddingLeft={0} paddingRight={0}>
            <BackButton accessibilityLabel="Back to dashboard" onPress={onBack}>
              <BackGlyph>←</BackGlyph>
            </BackButton>

            <View gap={8}>
              <SectionTitle>Expired Items</SectionTitle>
              <SectionBody>
                Review products that have already passed their expiry date, then
                either delete them or open the full item details.
              </SectionBody>
            </View>
          </ScreenHeader>

          <SummaryCard>
            <SummaryEyebrow>Expired Inventory</SummaryEyebrow>
            <SummaryValue>
              {expiredItems.length} {expiredItems.length === 1 ? "Item" : "Items"}
            </SummaryValue>
            <SummaryCopy>
              Keep this queue clean so the active inventory view stays focused on
              what can still move.
            </SummaryCopy>
          </SummaryCard>

          {inventoryError ? (
            <EmptyCard>
              <SectionTitle fontSize={20} lineHeight={24}>Expired View Unavailable</SectionTitle>
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
                    </View>
                    <View gap={10} alignItems="flex-end">
                      <SkeletonBlock height={28} width={74} borderRadius={999} />
                      <SkeletonBlock height={30} width={74} borderRadius={999} />
                    </View>
                  </InventoryRow>
                </SkeletonCard>
              ))}
            </>
          ) : expiredItems.length === 0 ? (
            <EmptyCard>
              <SectionTitle fontSize={20} lineHeight={24}>No Expired Items</SectionTitle>
              <SectionBody>
                Everything currently in your pantry is still active or inside the
                upcoming expiry window.
              </SectionBody>
            </EmptyCard>
          ) : (
            expiredItems.map((item) => {
              const expiredDays = getExpiredDays(item.expiry_date);

              return (
                <InventoryCardPressable
                  key={item.id}
                  accessibilityLabel={`Open ${item.name}`}
                  accessibilityRole="button"
                  onPress={() => onOpenEdit(item)}
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
                            Qty {item.quantity} · Expired {expiredDays ?? 0}d ago
                          </InventoryMeta>
                        </View>

                        <InventoryMeta numberOfLines={2}>
                          {getPantryItemDisplayNotes(item.notes) ??
                            `Expired on ${formatExpiryCopy(item.expiry_date)}.`}
                        </InventoryMeta>
                      </View>

                      <InventoryActionRow>
                        <InventoryBadge>
                          <InventoryBadgeText>Expired</InventoryBadgeText>
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

                        <InventoryMeta color={COLORS.deepGreen}>Open →</InventoryMeta>
                      </InventoryActionRow>
                    </InventoryRow>
                  </InventoryCard>
                </InventoryCardPressable>
              );
            })
          )}
        </Section>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  inventoryImage: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingBottom: 44,
  },
});
