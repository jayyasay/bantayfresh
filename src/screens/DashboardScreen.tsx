import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
import { Text, View, styled } from "@tamagui/core";

import { MOCK_ITEMS } from "../data/mockItems";
import { COLORS } from "../theme/colors";

export type TabKey = "home" | "inventory" | "alerts" | "profile";

const Eyebrow = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 12,
  lineHeight: 16,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  textAlign: "center",
});

const InlineRow = styled(View, {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

const DashboardShell = styled(View, {
  paddingTop: 44,
  flex: 1,
  backgroundColor: COLORS.page,
});

const DashboardHeader = styled(View, {
  paddingTop: 22,
  paddingRight: 20,
  paddingBottom: 18,
  paddingLeft: 20,
  gap: 10,
});

const DashboardGreeting = styled(Text, {
  color: COLORS.textDark,
  fontSize: 30,
  lineHeight: 34,
  fontWeight: "800",
});

const DashboardSubcopy = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 15,
  lineHeight: 22,
});

const SearchShell = styled(View, {
  marginTop: 6,
  borderRadius: 18,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingVertical: 14,
  paddingHorizontal: 16,
});

const GlassPanel = styled(View, {
  borderRadius: 28,
  backgroundColor: "rgba(255,255,255,0.86)",
  borderWidth: 1,
  borderColor: "rgba(216,231,221,0.92)",
  shadowColor: COLORS.shadow,
  shadowOpacity: 0.06,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
});

const StatPanel = styled(GlassPanel, {
  paddingTop: 18,
  paddingRight: 18,
  paddingBottom: 18,
  paddingLeft: 18,
  gap: 10,
});

const StatValue = styled(Text, {
  color: COLORS.textDark,
  fontSize: 34,
  lineHeight: 38,
  fontWeight: "800",
});

const StatLabel = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 14,
  lineHeight: 20,
});

const StatBadge = styled(View, {
  alignSelf: "flex-start",
  borderRadius: 999,
  backgroundColor: "#FDEEEE",
  paddingVertical: 6,
  paddingHorizontal: 10,
});

const StatBadgeText = styled(Text, {
  color: "#C94B4B",
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "800",
});

const SectionHeader = styled(View, {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 24,
  marginBottom: 14,
});

const SectionTitle = styled(Text, {
  color: COLORS.textDark,
  fontSize: 20,
  lineHeight: 24,
  fontWeight: "800",
});

const SectionLink = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 14,
  lineHeight: 18,
  fontWeight: "700",
});

const ActionsGrid = styled(View, {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
});

const ActionCard = styled(GlassPanel, {
  width: "48%",
  minHeight: 130,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
  gap: 10,
});

const ActionIcon = styled(View, {
  width: 40,
  height: 40,
  borderRadius: 14,
  backgroundColor: COLORS.surfaceSoft,
  alignItems: "center",
  justifyContent: "center",
});

const ActionIconText = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 18,
  lineHeight: 20,
  fontWeight: "800",
});

const ActionTitle = styled(Text, {
  color: COLORS.textDark,
  fontSize: 16,
  lineHeight: 20,
  fontWeight: "800",
});

const ActionBody = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 13,
  lineHeight: 19,
});

const ItemCard = styled(GlassPanel, {
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16,
  marginBottom: 10,
  gap: 8,
});

const ItemRow = styled(View, {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

const ItemName = styled(Text, {
  color: COLORS.textDark,
  fontSize: 16,
  lineHeight: 20,
  fontWeight: "800",
});

const ItemMeta = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 13,
  lineHeight: 18,
});

const ItemBadge = styled(View, {
  borderRadius: 999,
  paddingVertical: 6,
  paddingHorizontal: 10,
  backgroundColor: COLORS.surfaceSoft,
});

const ItemBadgeText = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "800",
});

const BottomBar = styled(View, {
  position: "absolute",
  left: 14,
  right: 14,
  bottom: 14,
  borderRadius: 28,
  backgroundColor: "rgba(255,255,255,0.94)",
  borderWidth: 1,
  borderColor: "rgba(216,231,221,0.92)",
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: 10,
  paddingHorizontal: 10,
  shadowColor: COLORS.shadow,
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
});

const BottomTab = styled(Pressable, {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 18,
  paddingVertical: 10,
  gap: 4,
});

const BottomTabIcon = styled(Text, {
  fontSize: 15,
  lineHeight: 18,
  fontWeight: "800",
});

const BottomTabText = styled(Text, {
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "700",
});

type DashboardScreenProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

export default function DashboardScreen({
  activeTab,
  onTabChange,
}: DashboardScreenProps) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return MOCK_ITEMS;
    }

    return MOCK_ITEMS.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const nearExpiryCount = MOCK_ITEMS.filter((item) => item.daysLeft <= 3).length;

  const tabs: Array<{ key: TabKey; icon: string; label: string }> = [
    { key: "home", icon: "⌂", label: "Home" },
    { key: "inventory", icon: "◫", label: "Inventory" },
    { key: "alerts", icon: "!", label: "Alerts" },
    { key: "profile", icon: "◌", label: "Profile" },
  ];

  return (
    <DashboardShell>
      <ScrollView
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader>
          <Eyebrow>Inventory Overview</Eyebrow>
          <DashboardGreeting>Good morning, Jay.</DashboardGreeting>
          <DashboardSubcopy>
            Hardcoded demo mode is active, so you can start building your UI
            beyond auth while Supabase is still being wired.
          </DashboardSubcopy>

          <SearchShell>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search item, category, or code"
              placeholderTextColor={COLORS.softGray}
              style={styles.searchInput}
            />
          </SearchShell>
        </DashboardHeader>

        <View paddingHorizontal={20} paddingBottom={120}>
          <StatPanel>
            <InlineRow>
              <View gap={6}>
                <StatLabel>Items near expiry</StatLabel>
                <StatValue>{nearExpiryCount}</StatValue>
              </View>
              <StatBadge>
                <StatBadgeText>Needs action</StatBadgeText>
              </StatBadge>
            </InlineRow>
            <StatLabel>
              Keep an eye on stock with 3 days or less remaining so the team can
              move faster on markdowns or disposal.
            </StatLabel>
          </StatPanel>

          <SectionHeader>
            <SectionTitle>Quick actions</SectionTitle>
            <SectionLink>See all</SectionLink>
          </SectionHeader>

          <ActionsGrid>
            <ActionCard>
              <ActionIcon>
                <ActionIconText>+</ActionIconText>
              </ActionIcon>
              <ActionTitle>Add new item</ActionTitle>
              <ActionBody>
                Create a new inventory record and assign expiry details.
              </ActionBody>
            </ActionCard>

            <ActionCard>
              <ActionIcon>
                <ActionIconText>✎</ActionIconText>
              </ActionIcon>
              <ActionTitle>Edit item</ActionTitle>
              <ActionBody>
                Update quantity, freshness status, or supplier notes.
              </ActionBody>
            </ActionCard>

            <ActionCard>
              <ActionIcon>
                <ActionIconText>⌕</ActionIconText>
              </ActionIcon>
              <ActionTitle>Search item</ActionTitle>
              <ActionBody>
                Find records quickly using code, category, or item name.
              </ActionBody>
            </ActionCard>

            <ActionCard>
              <ActionIcon>
                <ActionIconText>≣</ActionIconText>
              </ActionIcon>
              <ActionTitle>View all items</ActionTitle>
              <ActionBody>
                Review the full stock list and sort by urgency or freshness.
              </ActionBody>
            </ActionCard>
          </ActionsGrid>

          <SectionHeader>
            <SectionTitle>Inventory snapshot</SectionTitle>
            <SectionLink>{filteredItems.length} items</SectionLink>
          </SectionHeader>

          {filteredItems.map((item) => (
            <ItemCard key={item.id}>
              <ItemRow>
                <View gap={4} flex={1}>
                  <ItemName>{item.name}</ItemName>
                  <ItemMeta>
                    {item.category} · {item.id}
                  </ItemMeta>
                </View>
                <ItemBadge>
                  <ItemBadgeText>{item.daysLeft}d left</ItemBadgeText>
                </ItemBadge>
              </ItemRow>
            </ItemCard>
          ))}

          <SectionHeader>
            <SectionTitle>Placeholder modules</SectionTitle>
            <SectionLink>Next screens</SectionLink>
          </SectionHeader>

          <ActionsGrid>
            <ActionCard>
              <ActionTitle>Analytics</ActionTitle>
              <ActionBody>
                Placeholder for charts, spoilage trends, and category health.
              </ActionBody>
            </ActionCard>
            <ActionCard>
              <ActionTitle>Suppliers</ActionTitle>
              <ActionBody>
                Placeholder for vendor scorecards and shipment quality history.
              </ActionBody>
            </ActionCard>
          </ActionsGrid>
        </View>
      </ScrollView>

      <BottomBar>
        {tabs.map((tab) => {
          const active = tab.key === activeTab;

          return (
            <BottomTab
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              backgroundColor={active ? COLORS.surfaceSoft : "transparent"}
            >
              <BottomTabIcon color={active ? COLORS.deepGreen : COLORS.textSoft}>
                {tab.icon}
              </BottomTabIcon>
              <BottomTabText color={active ? COLORS.textDark : COLORS.textSoft}>
                {tab.label}
              </BottomTabText>
            </BottomTab>
          );
        })}
      </BottomBar>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  dashboardContent: {
    paddingBottom: 20,
  },
  searchInput: {
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.textDark,
  },
});
