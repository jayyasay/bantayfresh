import { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Text, View, styled } from "@tamagui/core";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as XLSX from "xlsx";

import {
  bulkCreatePantryItems,
  composePantryItemNotes,
  type PantryItemInsert,
} from "../../lib/pantry-items";
import {
  INVENTORY_SPACE_CONFIG,
  INVENTORY_SPACE_PALETTES,
  normalizeInventorySpace,
  type InventorySpaceKey,
} from "../../lib/inventory-spaces";
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

const Header = styled(View, {
  gap: 8,
  paddingTop: 26,
  paddingBottom: 18,
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

const SurfaceCard = styled(View, {
  marginTop: 18,
  borderRadius: 24,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingTop: 18,
  paddingRight: 18,
  paddingBottom: 18,
  paddingLeft: 18,
  gap: 14,
});

const ActionButton = styled(Pressable, {
  borderRadius: 20,
  paddingVertical: 16,
  paddingHorizontal: 16,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  gap: 10,
});

const PrimaryButton = styled(ActionButton, {
  backgroundColor: COLORS.night,
});

const SecondaryButton = styled(ActionButton, {
  backgroundColor: COLORS.surfaceSoft,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
});

const ButtonText = styled(Text, {
  fontSize: 15,
  lineHeight: 19,
  fontWeight: "800",
});

const FieldChipWrap = styled(View, {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
});

const FieldChip = styled(View, {
  borderRadius: 999,
  backgroundColor: COLORS.surfaceSoft,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingVertical: 9,
  paddingHorizontal: 12,
});

const FieldChipText = styled(Text, {
  color: COLORS.textDark,
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "700",
});

const Notice = styled(View, {
  borderRadius: 18,
  borderWidth: 1,
  paddingTop: 12,
  paddingRight: 14,
  paddingBottom: 12,
  paddingLeft: 14,
  gap: 5,
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

type BulkUploadScreenProps = {
  inventorySpace: InventorySpaceKey;
  onBack: () => void;
  onImported: (message: string) => void;
  userId: string;
};

type ParsedBulkRow = PantryItemInsert & {
  previewKey: string;
};

const EXPECTED_FIELDS = [
  "barcode",
  "category",
  "name",
  "quantity",
  "expiry_date",
  "notes",
  "photo_url",
  "space",
  "stock_status",
];

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function parseQuantity(value: unknown) {
  const normalized = formatCellValue(value);
  if (!normalized) {
    return 1;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseExpiryDate(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) {
      return null;
    }

    return `${String(parsed.y).padStart(4, "0")}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
  }

  const normalized = formatCellValue(value);
  if (!normalized) {
    return null;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function parseStockStatus(value: unknown) {
  const normalized = formatCellValue(value).toLowerCase();
  if (
    normalized === "low_stock" ||
    normalized === "low stock" ||
    normalized === "low" ||
    normalized === "yes" ||
    normalized === "true" ||
    normalized === "1"
  ) {
    return "low_stock" as const;
  }

  return "in_stock" as const;
}

function parseWorkbookRows(
  workbook: XLSX.WorkBook,
  inventorySpace: InventorySpaceKey,
) {
  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: "",
    raw: true,
  });

  const normalizedRows = rawRows.map((row) => {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]),
    );
  });

  const issues: string[] = [];
  const parsedRows: ParsedBulkRow[] = [];

  normalizedRows.forEach((row, index) => {
    const category = formatCellValue(row.category) || "Pantry";
    const name = formatCellValue(row.name);
    const quantity = parseQuantity(row.quantity);
    const expiryDate = parseExpiryDate(
      row.expiry_date || row.expiry || row.expiration_date,
    );
    const space = normalizeInventorySpace(
      formatCellValue(row.space) || inventorySpace,
    );
    const barcode = formatCellValue(row.barcode) || null;
    const stockStatus = parseStockStatus(
      row.stock_status || row.stock || row.low_stock || row.is_low_stock,
    );
    const notes = formatCellValue(row.notes) || null;
    const photoUrl = formatCellValue(row.photo_url) || null;

    const rowLabel = `Row ${index + 2}`;

    if (!name && !formatCellValue(row.notes) && !formatCellValue(row.category)) {
      return;
    }

    if (!name) {
      issues.push(`${rowLabel} is missing a name.`);
      return;
    }

    if (quantity === null) {
      issues.push(`${rowLabel} has an invalid quantity.`);
      return;
    }

    parsedRows.push({
      barcode,
      category,
      expiry_date: expiryDate,
      name,
      notes,
      photo_url: photoUrl,
      previewKey: `${rowLabel}-${name}`,
      quantity,
      space: space ?? inventorySpace,
      stock_status: stockStatus,
      unit: null,
    });
  });

  return { issues, parsedRows };
}

export default function BulkUploadScreen({
  inventorySpace,
  onBack,
  onImported,
  userId,
}: BulkUploadScreenProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedBulkRow[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [isPickingFile, setIsPickingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activeSpacePalette = INVENTORY_SPACE_PALETTES[inventorySpace];

  async function handleChooseFile() {
    try {
      setIsPickingFile(true);
      setErrorMessage(null);

      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/csv",
        ],
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const workbook = XLSX.read(base64, { type: "base64" });
      const parsed = parseWorkbookRows(workbook, inventorySpace);

      setFileName(asset.name ?? "Selected spreadsheet");
      setIssues(parsed.issues);
      setParsedRows(parsed.parsedRows);

      if (parsed.parsedRows.length === 0) {
        setErrorMessage("We couldn’t find any importable rows in that spreadsheet.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn’t read that spreadsheet. Please try another file.",
      );
    } finally {
      setIsPickingFile(false);
    }
  }

  async function handleImport() {
    if (parsedRows.length === 0 || issues.length > 0) {
      return;
    }

    try {
      setIsImporting(true);
      setErrorMessage(null);

      const payload: PantryItemInsert[] = parsedRows.map(
        ({ previewKey: _previewKey, ...item }) => ({
          ...item,
          notes: composePantryItemNotes(item.notes, null),
        }),
      );
      const { data, error } = await bulkCreatePantryItems(userId, payload);

      if (error) {
        throw error;
      }

      onImported(`${data?.length ?? payload.length} items imported.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn’t import the spreadsheet. Please try again.",
      );
    } finally {
      setIsImporting(false);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardShell}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Section>
            <Header>
              <BackButton
                accessibilityLabel="Back to dashboard home"
                onPress={onBack}
              >
                <Text color={COLORS.textDark} fontSize={22} lineHeight={22} fontWeight="700">
                  ←
                </Text>
              </BackButton>

              <SectionTitle>{INVENTORY_SPACE_CONFIG[inventorySpace].label} Bulk Upload</SectionTitle>
              <SectionBody>
                Import an `.xls`, `.xlsx`, or `.csv` file and turn spreadsheet rows
                into {INVENTORY_SPACE_CONFIG[inventorySpace].label.toLowerCase()} items in one go.
              </SectionBody>
            </Header>

            <SurfaceCard>
              <View gap={8}>
                <Text color={COLORS.textDark} fontSize={16} lineHeight={20} fontWeight="800">
                  Expected columns
                </Text>
                <SectionBody>
                  Keep the first row as headers. Extra columns are ignored, and missing
                  optional fields stay empty.
                </SectionBody>
              </View>

              <FieldChipWrap>
                {EXPECTED_FIELDS.map((field) => (
                  <FieldChip key={field}>
                    <FieldChipText>{field}</FieldChipText>
                  </FieldChip>
                ))}
              </FieldChipWrap>
            </SurfaceCard>

            <SurfaceCard>
              <View gap={8}>
                <Text color={COLORS.textDark} fontSize={16} lineHeight={20} fontWeight="800">
                  Spreadsheet file
                </Text>
                <SectionBody>
                  Choose a file from your phone, then preview the rows before importing.
                </SectionBody>
              </View>

              <SecondaryButton onPress={() => void handleChooseFile()}>
                <Ionicons color={COLORS.textDark} name="document-text-outline" size={18} />
                <ButtonText color={COLORS.textDark}>
                  {isPickingFile ? "Opening Files…" : "Choose Spreadsheet"}
                </ButtonText>
              </SecondaryButton>

              {fileName ? (
                <Notice backgroundColor={COLORS.surfaceSoft} borderColor={COLORS.pageLine}>
                  <NoticeTitle color={COLORS.textDark}>{fileName}</NoticeTitle>
                  <NoticeBody color={COLORS.textSoft}>
                    {parsedRows.length} importable row{parsedRows.length === 1 ? "" : "s"} found.
                  </NoticeBody>
                </Notice>
              ) : null}

              {issues.length > 0 ? (
                <Notice backgroundColor="#FFF8E8" borderColor="#F0D5A1">
                  <NoticeTitle color="#8A5A14">Fix these rows first</NoticeTitle>
                  <NoticeBody color="#8A5A14">
                    {issues.slice(0, 4).join(" ")}
                  </NoticeBody>
                </Notice>
              ) : null}

              {errorMessage ? (
                <Notice backgroundColor="#FFF1F1" borderColor="#F4C6C6">
                  <NoticeTitle color="#B34242">Couldn’t Continue</NoticeTitle>
                  <NoticeBody color="#8F4D4D">{errorMessage}</NoticeBody>
                </Notice>
              ) : null}
            </SurfaceCard>

            {parsedRows.length > 0 ? (
              <SurfaceCard>
                <View gap={8}>
                  <Text color={COLORS.textDark} fontSize={16} lineHeight={20} fontWeight="800">
                    Preview
                  </Text>
                  <SectionBody>
                    We’ll import the first sheet only. Here’s a quick snapshot of the rows.
                  </SectionBody>
                </View>

                <View gap={12}>
                  {parsedRows.slice(0, 5).map((row) => (
                    <View
                      key={row.previewKey}
                      borderRadius={18}
                      borderWidth={1}
                      borderColor={COLORS.pageLine}
                      padding={14}
                      gap={4}
                    >
                      <Text color={COLORS.textDark} fontSize={16} lineHeight={20} fontWeight="800">
                        {row.name}
                      </Text>
                      <Text color={COLORS.textSoft} fontSize={14} lineHeight={18}>
                        {row.category || "Pantry"} · Qty {row.quantity}
                      </Text>
                      <Text color={COLORS.textSoft} fontSize={13} lineHeight={18}>
                        {row.expiry_date ? `Expires ${row.expiry_date}` : "No expiry date"}
                      </Text>
                    </View>
                  ))}
                </View>
              </SurfaceCard>
            ) : null}

            <PrimaryButton
              backgroundColor={activeSpacePalette.actionBackground}
              marginTop={20}
              opacity={parsedRows.length === 0 || issues.length > 0 || isImporting ? 0.6 : 1}
              onPress={() => void handleImport()}
            >
              <Ionicons color={activeSpacePalette.actionText} name="cloud-upload-outline" size={18} />
              <ButtonText color={activeSpacePalette.actionText}>
                {isImporting ? "Importing…" : "Import Items"}
              </ButtonText>
            </PrimaryButton>
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  keyboardShell: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
});
