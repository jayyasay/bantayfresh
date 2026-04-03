import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import "./lib/match-media";
import { KeyboardAvoidingView, Platform, StyleSheet, useColorScheme } from "react-native";
import { TamaguiProvider, View, styled } from "@tamagui/core";

import DashboardScreen, { type TabKey } from "./src/screens/DashboardScreen";
import SplashScreen from "./src/screens/SplashScreen";
import AuthScreen from "./src/screens/AuthScreen";
import { COLORS } from "./src/theme/colors";
import { tamaguiConfig } from "./tamagui.config";

type ScreenName = "splash" | "auth" | "dashboard";

const Screen = styled(View, {
  flex: 1,
});

export default function App() {
  const colorScheme = useColorScheme();
  const [screen, setScreen] = useState<ScreenName>("splash");
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const hasAutoAdvanced = useRef(false);
  const [fontsLoaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (!fontsLoaded || hasAutoAdvanced.current) {
      return;
    }

    const timer = setTimeout(() => {
      hasAutoAdvanced.current = true;
      setScreen("auth");
    }, 2400);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme === "dark" ? "dark" : "light"}
    >
      <StatusBar style={screen === "splash" ? "light" : "dark"} />
      <Screen backgroundColor={screen === "splash" ? COLORS.night : COLORS.page}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardShell}
        >
          {screen === "splash" ? <SplashScreen /> : null}
          {screen === "auth" ? (
            <AuthScreen onAuthSuccess={() => setScreen("dashboard")} />
          ) : null}
          {screen === "dashboard" ? (
            <DashboardScreen activeTab={activeTab} onTabChange={setActiveTab} />
          ) : null}
        </KeyboardAvoidingView>
      </Screen>
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  keyboardShell: {
    flex: 1,
  },
});
