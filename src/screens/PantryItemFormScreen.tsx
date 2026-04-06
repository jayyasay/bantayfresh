import { type ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Text, View, styled } from "@tamagui/core";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

import {
  createPantryItem,
  deletePantryItem,
  type PantryItemPhotoUpload,
  type PantryItemRecord,
  updatePantryItem,
  uploadPantryItemPhoto,
} from "../../lib/pantry-items";
import { COLORS } from "../theme/colors";

type CategoryValue = "Fruits & Veggies" | "Fridge Items" | "Pantry";
type IoniconName = ComponentProps<typeof Ionicons>["name"];

const CATEGORY_OPTIONS = [
  {
    accent: "#DDE7FF",
    caption: "Dry Storage",
    cardColor: "#EEF3FF",
    icon: "cube-outline" as IoniconName,
    selectedCardColor: "#D9E6FF",
    value: "Pantry",
    title: "Pantry",
  },
  {
    accent: "#FFE4BF",
    caption: "Chilled",
    cardColor: "#FFF3E4",
    icon: "snow-outline" as IoniconName,
    selectedCardColor: "#FFE8CC",
    value: "Fridge Items",
    title: "Fridge Items",
  },
  {
    accent: "#C8F3DA",
    caption: "Fresh Produce",
    cardColor: "#E8FAF0",
    icon: "leaf-outline" as IoniconName,
    selectedCardColor: "#D3F3E0",
    value: "Fruits & Veggies",
    title: "Fruits & Veggies",
  },
] as const;

const ScreenShell = styled(View, {
  flex: 1,
  backgroundColor: COLORS.page,
  paddingTop: 52,
});

const Section = styled(View, {
  paddingRight: 20,
  paddingLeft: 20,
});

const DashboardHeader = styled(View, {
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
  width: "31%",
  minHeight: 122,
  borderRadius: 22,
  paddingTop: 14,
  paddingRight: 14,
  paddingBottom: 14,
  paddingLeft: 14,
  justifyContent: "space-between",
  borderWidth: 2,
  pressStyle: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

const CategoryGlyphWrap = styled(View, {
  width: 52,
  height: 52,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.58)",
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
  minHeight: 60,
  justifyContent: "center",
});

const PickerValue = styled(Text, {
  color: COLORS.textDark,
  fontSize: 16,
  lineHeight: 22,
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

const DeleteButton = styled(Pressable, {
  borderRadius: 24,
  backgroundColor: "#FFF1F1",
  borderWidth: 1,
  borderColor: "#F1BDBD",
  paddingVertical: 18,
  paddingHorizontal: 18,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 10,
});

const DeleteButtonText = styled(Text, {
  color: "#B34242",
  fontSize: 17,
  lineHeight: 22,
  fontWeight: "800",
});

type PantryItemFormScreenProps = {
  initialItem?: PantryItemRecord | null;
  mode: "create" | "edit";
  onBack: () => void;
  onDeleted?: (message: string) => void;
  onSaved: (message: string) => void;
  userId: string;
};

function trimOptionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toIsoDateString(value: Date) {
  return value.toISOString().slice(0, 10);
}

function parseIsoDateString(value: string | null) {
  if (!value) {
    return new Date();
  }

  const parsedDate = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
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

export default function PantryItemFormScreen({
  initialItem,
  mode,
  onBack,
  onDeleted,
  onSaved,
  userId,
}: PantryItemFormScreenProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [itemName, setItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryValue>("Pantry");
  const [quantity, setQuantity] = useState("1");
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [pendingPhotoUpload, setPendingPhotoUpload] =
    useState<PantryItemPhotoUpload | null>(null);
  const [notes, setNotes] = useState("");
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initialItem) {
      return;
    }

    const nextCategory = CATEGORY_OPTIONS.some(
      (category) => category.value === initialItem.category,
    )
      ? (initialItem.category as CategoryValue)
      : "Pantry";

    setItemName(initialItem.name);
    setSelectedCategory(nextCategory);
    setQuantity(String(initialItem.quantity));
    setExpiryDate(initialItem.expiry_date);
    setPhotoUri(initialItem.photo_url);
    setNotes(initialItem.notes ?? "");
    setPendingPhotoUpload(null);
  }, [initialItem]);

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

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

  function handleExpiryChange(
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) {
    if (Platform.OS === "android") {
      setShowExpiryPicker(false);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    setExpiryDate(toIsoDateString(selectedDate));
  }

  async function handlePickPhoto(source: "camera" | "library") {
    try {
      setIsPickingPhoto(true);
      setErrorMessage(null);

      const permissionResult =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setErrorMessage(
          source === "camera"
            ? "Camera access is required. Allow camera permission in Settings and try again."
            : "Photo library access is required. Allow media access in Settings and try again.",
        );
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            })
          : await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [4, 3],
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const asset = result.assets[0];
      setPhotoUri(asset.uri);
      setPendingPhotoUpload({
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        uri: asset.uri,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Couldn't open the image picker. Please try again.",
      );
    } finally {
      setIsPickingPhoto(false);
    }
  }

  async function handleSave() {
    const trimmedName = itemName.trim();
    const parsedQuantity = Number(quantity);

    if (!trimmedName) {
      setErrorMessage("Add an item name to continue.");
      return;
    }

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setErrorMessage("Quantity needs to be greater than zero.");
      return;
    }

    try {
      setIsSavingItem(true);
      setErrorMessage(null);

      let nextPhotoUrl = photoUri;
      if (pendingPhotoUpload) {
        const { data: uploadData, error: uploadError } = await uploadPantryItemPhoto(
          userId,
          pendingPhotoUpload,
        );

        if (uploadError) {
          throw uploadError;
        }

        nextPhotoUrl = uploadData.publicUrl;
      }

      const payload = {
        name: trimmedName,
        category: selectedCategory,
        quantity: parsedQuantity,
        unit: null,
        expiry_date: expiryDate,
        photo_url: nextPhotoUrl,
        notes: trimOptionalValue(notes),
      };

      const result =
        mode === "edit" && initialItem
          ? await updatePantryItem(userId, initialItem.id, payload)
          : await createPantryItem(userId, payload);

      if (result.error) {
        throw result.error;
      }

      onSaved(
        mode === "edit"
          ? `${result.data.name} updated.`
          : `${result.data.name} added.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Couldn't save the pantry item.",
      );
    } finally {
      setIsSavingItem(false);
    }
  }

  function confirmDeleteItem() {
    if (!initialItem || mode !== "edit") {
      return;
    }

    Alert.alert(
      "Delete Item",
      `Delete ${initialItem.name}? This action cannot be undone.`,
      [
        {
          style: "cancel",
          text: "Cancel",
        },
        {
          style: "destructive",
          text: "Delete",
          onPress: () => {
            void handleDeleteItem();
          },
        },
      ],
    );
  }

  async function handleDeleteItem() {
    if (!initialItem || mode !== "edit") {
      return;
    }

    try {
      setIsDeletingItem(true);
      setErrorMessage(null);

      const { error } = await deletePantryItem(userId, initialItem.id);

      if (error) {
        throw error;
      }

      onDeleted?.(`${initialItem.name} deleted.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Couldn't delete the pantry item.",
      );
    } finally {
      setIsDeletingItem(false);
    }
  }

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
            <DashboardHeader paddingLeft={0} paddingRight={0}>
              <BackButton
                accessibilityLabel={mode === "edit" ? "Back to inventory list" : "Back to dashboard home"}
                onPress={onBack}
              >
                <BackGlyph>←</BackGlyph>
              </BackButton>

              <View gap={8}>
                <SectionTitle>{mode === "edit" ? "Edit Pantry Item" : "Add a Pantry Item"}</SectionTitle>
                <SectionBody>
                  {mode === "edit"
                    ? "Update the item details, expiry timing, and image, then save your changes."
                    : "Capture the item details, attach a photo, and save it into your pantry."}
                </SectionBody>
              </View>
            </DashboardHeader>

            <FormSection>
              <View gap={10}>
                <FormLabel>Category</FormLabel>
                <CategoryGrid>
                  {CATEGORY_OPTIONS.map((category) => {
                    const selected = category.value === selectedCategory;

                    return (
                      <CategoryCard
                        key={category.value}
                        accessibilityLabel={`Select ${category.title}`}
                        backgroundColor={selected ? category.selectedCardColor : category.cardColor}
                        borderColor={selected ? COLORS.deepGreen : "transparent"}
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setSelectedCategory(category.value);
                        }}
                      >
                        <CategoryGlyphWrap
                          backgroundColor={selected ? "rgba(255,255,255,0.9)" : category.accent}
                          borderWidth={selected ? 1 : 0}
                          borderColor={selected ? "rgba(11,123,68,0.25)" : "transparent"}
                        >
                          <Ionicons
                            color={selected ? COLORS.night : COLORS.deepGreen}
                            name={category.icon}
                            size={24}
                          />
                        </CategoryGlyphWrap>

                        <View gap={4}>
                          <CategoryTitle>{category.title}</CategoryTitle>
                          <CategoryCaption>{category.caption}</CategoryCaption>
                        </View>
                      </CategoryCard>
                    );
                  })}
                </CategoryGrid>
              </View>

              <View gap={8}>
                <FormLabel>Name</FormLabel>
                <InputShell>
                  <TextInput
                    accessibilityLabel="Item name"
                    autoCapitalize="words"
                    placeholder="E.g. Romaine lettuce…"
                    placeholderTextColor={COLORS.softGray}
                    spellCheck={false}
                    style={styles.formInput}
                    value={itemName}
                    onChangeText={setItemName}
                  />
                </InputShell>
              </View>

              <View gap={8}>
                <FormLabel>Quantity</FormLabel>
                <InputShell>
                  <TextInput
                    accessibilityLabel="Quantity received"
                    keyboardType="decimal-pad"
                    placeholder="24"
                    placeholderTextColor={COLORS.softGray}
                    spellCheck={false}
                    style={styles.formInput}
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </InputShell>
              </View>

              <View gap={8}>
                <FormLabel>Expiry Date</FormLabel>
                <PickerButton
                  accessibilityLabel="Open expiry date picker"
                  onPress={() => setShowExpiryPicker((current) => !current)}
                >
                  <View gap={6}>
                    <PickerValue color={expiryDate ? COLORS.textDark : COLORS.softGray}>
                      {expiryDate ? formatExpiryCopy(expiryDate) : "Choose a date…"}
                    </PickerValue>
                  </View>
                </PickerButton>

                {showExpiryPicker ? (
                  <View
                    borderRadius={22}
                    backgroundColor={COLORS.surface}
                    borderWidth={1}
                    borderColor={COLORS.pageLine}
                    padding={12}
                  >
                    <DateTimePicker
                      display={Platform.OS === "ios" ? "inline" : "default"}
                      mode="date"
                      value={parseIsoDateString(expiryDate)}
                      onChange={handleExpiryChange}
                    />
                  </View>
                ) : null}

                {expiryDate ? (
                  <SecondaryButton
                    accessibilityLabel="Clear expiry date"
                    onPress={() => setExpiryDate(null)}
                  >
                    <SecondaryButtonText>Clear Date</SecondaryButtonText>
                  </SecondaryButton>
                ) : null}
              </View>

              <View gap={8}>
                <FormLabel>Item Photo</FormLabel>
                <View flexDirection="row" gap={10}>
                  <SecondaryButton
                    accessibilityLabel="Take a photo"
                    flex={1}
                    onPress={() => handlePickPhoto("camera")}
                  >
                    <View alignItems="center" flexDirection="row" gap={8}>
                      <Ionicons color={COLORS.textDark} name="camera-outline" size={18} />
                      <SecondaryButtonText>
                        {isPickingPhoto ? "Opening…" : "Take Photo"}
                      </SecondaryButtonText>
                    </View>
                  </SecondaryButton>

                  <SecondaryButton
                    accessibilityLabel="Choose a photo from your library"
                    flex={1}
                    onPress={() => handlePickPhoto("library")}
                  >
                    <View alignItems="center" flexDirection="row" gap={8}>
                      <Ionicons color={COLORS.textDark} name="images-outline" size={18} />
                      <SecondaryButtonText>
                        {isPickingPhoto ? "Opening…" : "Choose Photo"}
                      </SecondaryButtonText>
                    </View>
                  </SecondaryButton>
                </View>

                {photoUri ? (
                  <PhotoPreviewCard>
                    <Image
                      accessibilityLabel="Selected pantry item photo"
                      resizeMode="cover"
                      source={{ uri: photoUri }}
                      style={styles.photoPreviewImage}
                    />
                  </PhotoPreviewCard>
                ) : null}
              </View>

              <View gap={8}>
                <FormLabel>Notes</FormLabel>
                <InputShell minHeight={132}>
                  <TextInput
                    accessibilityLabel="Notes"
                    multiline
                    placeholder="Storage notes, supplier notes, or handling instructions…"
                    placeholderTextColor={COLORS.softGray}
                    spellCheck={false}
                    style={styles.notesInput}
                    textAlignVertical="top"
                    value={notes}
                    onChangeText={setNotes}
                  />
                </InputShell>
              </View>

              {errorMessage ? (
                <InlineNotice backgroundColor="#FFF1F1" borderColor="#F4C6C6">
                  <NoticeTitle color="#B34242">Couldn’t Continue</NoticeTitle>
                  <NoticeBody color="#8F4D4D">{errorMessage}</NoticeBody>
                </InlineNotice>
              ) : null}

              <SubmitButton
                accessibilityLabel={mode === "edit" ? "Save pantry item changes" : "Create item"}
                opacity={isSavingItem ? 0.7 : 1}
                onPress={handleSave}
              >
                <SubmitButtonText>
                  {isSavingItem
                    ? "Saving Item…"
                    : mode === "edit"
                      ? "Save Changes"
                      : "Create Item"}
                </SubmitButtonText>
              </SubmitButton>

              {mode === "edit" && initialItem ? (
                <DeleteButton
                  accessibilityLabel={`Delete ${initialItem.name}`}
                  opacity={isDeletingItem ? 0.7 : 1}
                  onPress={confirmDeleteItem}
                >
                  <DeleteButtonText>
                    {isDeletingItem ? "Deleting Item…" : "Delete Item"}
                  </DeleteButtonText>
                </DeleteButton>
              ) : null}
            </FormSection>
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  formInput: {
    color: COLORS.textDark,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 2,
  },
  keyboardShell: {
    flex: 1,
  },
  notesInput: {
    color: COLORS.textDark,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 96,
    paddingVertical: 2,
  },
  photoPreviewImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSoft,
  },
  scrollContent: {
    paddingBottom: 48,
  },
});
