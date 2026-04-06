import { supabase } from "./supabase";

export type PantryItemRecord = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PantryItemInsert = {
  name: string;
  category: string | null;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;
  photo_url: string | null;
  notes: string | null;
};

export type PantryItemUpdate = Partial<PantryItemInsert>;

export type PantryItemPhotoUpload = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
};

const PANTRY_ITEM_COLUMNS =
  "id, user_id, name, category, quantity, unit, expiry_date, photo_url, notes, created_at, updated_at";

const SUPABASE_CONFIGURATION_ERROR =
  "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your .env file.";

function requireSupabaseClient() {
  if (!supabase) {
    throw new Error(SUPABASE_CONFIGURATION_ERROR);
  }

  return supabase;
}

function getFileExtension(photo: PantryItemPhotoUpload) {
  const fromFileName = photo.fileName?.split(".").pop()?.toLowerCase();
  if (fromFileName) {
    return fromFileName;
  }

  const fromUri = photo.uri.split(".").pop()?.split("?")[0]?.toLowerCase();
  if (fromUri) {
    return fromUri;
  }

  if (photo.mimeType === "image/png") {
    return "png";
  }

  if (photo.mimeType === "image/heic") {
    return "heic";
  }

  return "jpg";
}

export async function listPantryItems(userId: string) {
  return requireSupabaseClient()
    .from("pantry_items")
    .select(PANTRY_ITEM_COLUMNS)
    .eq("user_id", userId)
    .order("expiry_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
}

export async function createPantryItem(
  userId: string,
  item: PantryItemInsert,
) {
  return requireSupabaseClient()
    .from("pantry_items")
    .insert({
      user_id: userId,
      ...item,
    })
    .select(PANTRY_ITEM_COLUMNS)
    .single();
}

export async function bulkCreatePantryItems(
  userId: string,
  items: PantryItemInsert[],
) {
  return requireSupabaseClient()
    .from("pantry_items")
    .insert(
      items.map((item) => ({
        user_id: userId,
        ...item,
      })),
    )
    .select(PANTRY_ITEM_COLUMNS);
}

export async function uploadPantryItemPhoto(
  userId: string,
  photo: PantryItemPhotoUpload,
) {
  const client = requireSupabaseClient();
  const arrayBuffer = await fetch(photo.uri).then((response) => response.arrayBuffer());
  const extension = getFileExtension(photo);
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  const { data, error } = await client.storage
    .from("pantry-items")
    .upload(path, arrayBuffer, {
      cacheControl: "3600",
      contentType: photo.mimeType ?? "image/jpeg",
      upsert: false,
    });

  if (error) {
    return { data: null, error };
  }

  const { data: publicUrlData } = client.storage
    .from("pantry-items")
    .getPublicUrl(data.path);

  return {
    data: {
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    },
    error: null,
  };
}

export async function updatePantryItem(
  userId: string,
  itemId: string,
  item: PantryItemUpdate,
) {
  return requireSupabaseClient()
    .from("pantry_items")
    .update({
      ...item,
      user_id: userId,
    })
    .eq("id", itemId)
    .eq("user_id", userId)
    .select(PANTRY_ITEM_COLUMNS)
    .single();
}

export async function deletePantryItem(userId: string, itemId: string) {
  return requireSupabaseClient()
    .from("pantry_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId);
}
