import "react-native-url-polyfill/auto";
import "expo-sqlite/localStorage/install";
import { AppState, Platform } from "react-native";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabasePublishableKey.length > 0;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

const SUPABASE_CONFIGURATION_ERROR =
  "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your .env file.";

if (supabase && Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

function requireSupabaseClient() {
  if (!supabase) {
    throw new Error(SUPABASE_CONFIGURATION_ERROR);
  }

  return supabase;
}

export async function signInWithEmailPassword(credentials: {
  email: string;
  password: string;
}) {
  return requireSupabaseClient().auth.signInWithPassword(credentials);
}

export async function signUpWithEmailPassword(credentials: {
  email: string;
  password: string;
  options?: {
    data?: {
      full_name?: string;
    };
  };
}) {
  return requireSupabaseClient().auth.signUp(credentials);
}

export async function signOutCurrentUser() {
  return requireSupabaseClient().auth.signOut();
}
