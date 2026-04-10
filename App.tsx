import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import "./lib/match-media";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useColorScheme,
} from "react-native";
import {
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TamaguiProvider, View, styled } from "@tamagui/core";
import type { Session } from "@supabase/supabase-js";

import AuthScreen from "./src/screens/AuthScreen";
import BulkUploadScreen from "./src/screens/BulkUploadScreen";
import DashboardScreen, { type TabKey } from "./src/screens/DashboardScreen";
import ExpiredItemsScreen from "./src/screens/ExpiredItemsScreen";
import PantryItemFormScreen from "./src/screens/PantryItemFormScreen";
import SplashScreen from "./src/screens/SplashScreen";
import { COLORS } from "./src/theme/colors";
import type { InventorySpaceKey } from "./lib/inventory-spaces";
import type { PantryItemRecord } from "./lib/pantry-items";
import { getOrCreateProfile, type ProfileRecord } from "./lib/profiles";
import { signOutCurrentUser, supabase } from "./lib/supabase";
import { tamaguiConfig } from "./tamagui.config";

const Screen = styled(View, {
  flex: 1,
});

type RootStackParamList = {
  BulkUpload: { inventorySpace: InventorySpaceKey };
  CreateItem:
    | {
        prefill?: {
          barcode?: string | null;
          category?: string | null;
          inventorySpace?: InventorySpaceKey | null;
          name?: string | null;
        };
      }
    | undefined;
  DashboardMain: undefined;
  EditItem: { item: PantryItemRecord };
  ExpiredItems: { inventorySpace: InventorySpaceKey };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.page,
    border: COLORS.pageLine,
    card: COLORS.page,
    notification: COLORS.leaf,
    primary: COLORS.deepGreen,
    text: COLORS.textDark,
  },
};

export default function App() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [dashboardRefreshToken, setDashboardRefreshToken] = useState(0);
  const [dashboardToastMessage, setDashboardToastMessage] = useState<string | null>(
    null,
  );
  const hasAlertedAuthError = useRef(false);
  const hasAlertedProfileError = useRef(false);
  const [fontsLoaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2400);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error && !hasAlertedAuthError.current) {
          hasAlertedAuthError.current = true;
          Alert.alert("Auth Error", error.message);
        }

        setSession(data.session ?? null);
        setAuthReady(true);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        if (!hasAlertedAuthError.current) {
          hasAlertedAuthError.current = true;
          Alert.alert(
            "Auth Error",
            error instanceof Error ? error.message : "Couldn't restore your session.",
          );
        }

        setAuthReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setAuthReady(true);

      if (!nextSession) {
        setActiveTab("home");
        setDashboardToastMessage(null);
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      setIsProfileLoading(false);
      return;
    }

    let isMounted = true;
    setIsProfileLoading(true);

    getOrCreateProfile(session.user)
      .then(({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error && !hasAlertedProfileError.current) {
          hasAlertedProfileError.current = true;
          Alert.alert(
            "Profile Error",
            error.message || "Couldn't load your profile details.",
          );
        }

        setProfile(data);
      })
      .finally(() => {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!dashboardToastMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setDashboardToastMessage(null);
    }, 1600);

    return () => clearTimeout(timer);
  }, [dashboardToastMessage]);

  if (!fontsLoaded) {
    return null;
  }

  const splashVisible = showSplash || !authReady;
  const displayName =
    profile?.full_name?.trim() ||
    session?.user.user_metadata.full_name?.trim() ||
    session?.user.email?.split("@")[0] ||
    "there";
  const userEmail = session?.user.email ?? null;

  async function handleLogout() {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);
      const { error } = await signOutCurrentUser();

      if (error) {
        throw error;
      }
    } catch (error) {
      Alert.alert(
        "Couldn't Log Out",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  function handlePantryItemSaved(message: string) {
    setActiveTab("home");
    setDashboardRefreshToken((current) => current + 1);
    setDashboardToastMessage(message);
  }

  function handlePantryItemsChanged(message: string) {
    setDashboardRefreshToken((current) => current + 1);
    setDashboardToastMessage(message);
  }

  function handleProfileUpdated(nextProfile: ProfileRecord) {
    setProfile(nextProfile);
  }

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme === "dark" ? "dark" : "light"}
    >
      <StatusBar style={splashVisible ? "light" : "dark"} />
      <Screen backgroundColor={splashVisible ? COLORS.night : COLORS.page}>
        {splashVisible ? <SplashScreen /> : null}
        {!splashVisible && !session ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardShell}
          >
            <AuthScreen />
          </KeyboardAvoidingView>
        ) : null}
        {!splashVisible && session ? (
          <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator
              initialRouteName="DashboardMain"
              screenOptions={{
                animation: "slide_from_right",
                gestureEnabled: true,
                headerShown: false,
              }}
            >
              <Stack.Screen name="DashboardMain">
                {({ navigation }) => (
                  <DashboardScreen
                    activeTab={activeTab}
                    displayName={displayName}
                    isLoggingOut={isSigningOut}
                    isProfileLoading={isProfileLoading}
                    onLogout={handleLogout}
                    onOpenBulkUpload={(inventorySpace) =>
                      navigation.navigate("BulkUpload", {
                        inventorySpace,
                      })
                    }
                    onOpenCreate={(prefill) =>
                      navigation.navigate("CreateItem", {
                        prefill,
                      })
                    }
                    onOpenEdit={(item) =>
                      navigation.navigate("EditItem", {
                        item,
                      })
                    }
                    onOpenExpired={(inventorySpace) =>
                      navigation.navigate("ExpiredItems", {
                        inventorySpace,
                      })
                    }
                    onProfileUpdated={handleProfileUpdated}
                    onShowToast={setDashboardToastMessage}
                    onTabChange={setActiveTab}
                    profile={profile}
                    refreshToken={dashboardRefreshToken}
                    toastMessage={dashboardToastMessage}
                    userEmail={userEmail}
                    userId={session.user.id}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="BulkUpload"
                options={{
                  animation: "slide_from_right",
                  fullScreenGestureEnabled: false,
                  gestureEnabled: true,
                }}
              >
                {({ navigation, route }) => (
                  <BulkUploadScreen
                    inventorySpace={route.params.inventorySpace}
                    onBack={() => navigation.goBack()}
                    onImported={(message) => {
                      handlePantryItemSaved(message);
                      navigation.popToTop();
                    }}
                    userId={session.user.id}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="CreateItem"
                options={{
                  animation: "slide_from_right",
                  fullScreenGestureEnabled: false,
                  gestureEnabled: true,
                }}
              >
                {({ navigation, route }) => (
                  <PantryItemFormScreen
                    mode="create"
                    onBack={() => navigation.goBack()}
                    prefill={route.params?.prefill}
                    onSaved={(message) => {
                      handlePantryItemSaved(message);
                      navigation.popToTop();
                    }}
                    userId={session.user.id}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="EditItem"
                options={{
                  animation: "slide_from_right",
                  fullScreenGestureEnabled: false,
                  gestureEnabled: true,
                }}
              >
                {({ navigation, route }) => (
                  <PantryItemFormScreen
                    initialItem={route.params.item}
                    mode="edit"
                    onBack={() => navigation.goBack()}
                    onDeleted={(message) => {
                      handlePantryItemsChanged(message);
                      navigation.popToTop();
                    }}
                    onSaved={(message) => {
                      handlePantryItemSaved(message);
                      navigation.popToTop();
                    }}
                    userId={session.user.id}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="ExpiredItems"
                options={{
                  animation: "slide_from_right",
                  fullScreenGestureEnabled: false,
                  gestureEnabled: true,
                }}
              >
                {({ navigation, route }) => (
                  <ExpiredItemsScreen
                    inventorySpace={route.params.inventorySpace}
                    onBack={() => navigation.goBack()}
                    onItemsChanged={handlePantryItemsChanged}
                    onOpenEdit={(item) =>
                      navigation.navigate("EditItem", {
                        item,
                      })
                    }
                    refreshToken={dashboardRefreshToken}
                    userId={session.user.id}
                  />
                )}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        ) : null}
      </Screen>
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  keyboardShell: {
    flex: 1,
  },
});
