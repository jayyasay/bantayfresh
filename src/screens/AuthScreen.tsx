import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { Text, View, styled } from "@tamagui/core";

import BrandMark from "../components/BrandMark";
import { COLORS } from "../theme/colors";

type AuthMode = "login" | "register";

const Eyebrow = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 12,
  lineHeight: 16,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  textAlign: "center",
});

const FormBody = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 14,
  lineHeight: 22,
  textAlign: "center",
});

const AuthShell = styled(View, {
  overflow: "hidden",
  borderRadius: 34,
  backgroundColor: COLORS.surface,
});

const AuthBanner = styled(View, {
  backgroundColor: COLORS.leaf,
  paddingTop: 28,
  paddingRight: 22,
  paddingBottom: 32,
  paddingLeft: 22,
  alignItems: "center",
  justifyContent: "center",
  minHeight: 220,
  position: "relative",
});

const BannerGlow = styled(View, {
  position: "absolute",
  width: 320,
  height: 320,
  borderRadius: 999,
  backgroundColor: COLORS.freshGreen,
  opacity: 0.18,
  top: -140,
  right: -90,
});

const BannerStripe = styled(View, {
  position: "absolute",
  width: 220,
  height: 54,
  backgroundColor: "rgba(255,255,255,0.05)",
  transform: [{ rotate: "-38deg" }],
  borderRadius: 16,
});

const BannerStripeSecondary = styled(View, {
  position: "absolute",
  width: 240,
  height: 46,
  backgroundColor: "rgba(255,255,255,0.04)",
  transform: [{ rotate: "-38deg" }],
  borderRadius: 16,
});

const BannerMarkWrap = styled(View, {
  transform: [{ scale: 1.24 }],
});

const FormSection = styled(View, {
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 24,
  paddingLeft: 0,
  gap: 0,
});

const WelcomeCard = styled(View, {
  marginTop: -34,
  marginRight: 18,
  marginBottom: 0,
  marginLeft: 18,
  borderRadius: 28,
  backgroundColor: COLORS.surface,
  paddingTop: 18,
  paddingRight: 18,
  paddingBottom: 18,
  paddingLeft: 18,
  gap: 8,
  shadowColor: COLORS.shadow,
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
});

const FormCard = styled(View, {
  paddingTop: 18,
  paddingRight: 18,
  paddingBottom: 0,
  paddingLeft: 18,
  gap: 16,
});

const FormHeading = styled(View, {
  gap: 8,
});

const FormTitle = styled(Text, {
  color: COLORS.textDark,
  fontSize: 32,
  lineHeight: 36,
  fontWeight: "800",
  textAlign: "center",
});

const FieldStack = styled(View, {
  gap: 12,
});

const FieldShell = styled(View, {
  borderRadius: 18,
  backgroundColor: COLORS.inputBg,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingTop: 10,
  paddingRight: 14,
  paddingBottom: 10,
  paddingLeft: 14,
  gap: 6,
});

const FieldLabel = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 11,
  lineHeight: 15,
  letterSpacing: 1,
  textTransform: "uppercase",
});

const InlineRow = styled(View, {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

const InlineMuted = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 13,
  lineHeight: 18,
});

const InlineLink = styled(Text, {
  color: COLORS.deepGreen,
  fontSize: 13,
  lineHeight: 18,
  fontWeight: "700",
});

const PrimaryButton = styled(Pressable, {
  borderRadius: 18,
  backgroundColor: COLORS.freshGreen,
  paddingVertical: 16,
  paddingHorizontal: 18,
  alignItems: "center",
  justifyContent: "center",
});

const PrimaryButtonText = styled(Text, {
  color: COLORS.night,
  fontSize: 16,
  lineHeight: 20,
  fontWeight: "800",
});

const GhostButton = styled(Pressable, {
  borderRadius: 18,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
  paddingVertical: 14,
  paddingHorizontal: 16,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.surfaceSoft,
});

const GhostButtonText = styled(Text, {
  color: COLORS.textDark,
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "700",
});

const AuthSwitch = styled(View, {
  flexDirection: "row",
  gap: 8,
  padding: 6,
  borderRadius: 18,
  backgroundColor: COLORS.surfaceSoft,
  borderWidth: 1,
  borderColor: COLORS.pageLine,
});

const SwitchButton = styled(Pressable, {
  flex: 1,
  borderRadius: 14,
  paddingVertical: 12,
  alignItems: "center",
  justifyContent: "center",
});

const SwitchButtonText = styled(Text, {
  fontSize: 14,
  lineHeight: 18,
  fontWeight: "800",
});

type AuthScreenProps = {
  onAuthSuccess: () => void;
};

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const modeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    modeAnim.setValue(0);
    Animated.timing(modeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [authMode, modeAnim]);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <AuthShell>
        <AuthBanner>
          <BannerGlow />
          <BannerStripe top={48} left={-24} />
          <BannerStripeSecondary top={118} right={-38} />
          <BannerStripe top={162} left={72} />
          <BannerMarkWrap>
            <BrandMark />
          </BannerMarkWrap>
        </AuthBanner>

        <FormSection>
          <Animated.View
            style={{
              opacity: modeAnim,
              transform: [
                {
                  translateX: modeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [authMode === "login" ? 18 : -18, 0],
                  }),
                },
              ],
            }}
          >
            <WelcomeCard>
              <Eyebrow>
                {authMode === "login" ? "Welcome back" : "Join BantayFresh"}
              </Eyebrow>
              <FormBody>
                {authMode === "login"
                  ? "Sign in to manage freshness alerts, supplier updates, and stock visibility."
                  : "Create your access and start tracking inventory health with your team."}
              </FormBody>
            </WelcomeCard>

            <FormCard>
              <FormHeading>
                <FormTitle>
                  {authMode === "login" ? "Sign In" : "Create Account"}
                </FormTitle>
              </FormHeading>

              <AuthSwitch>
                <SwitchButton
                  onPress={() => setAuthMode("login")}
                  backgroundColor={
                    authMode === "login" ? COLORS.freshGreen : "transparent"
                  }
                >
                  <SwitchButtonText
                    color={authMode === "login" ? COLORS.night : COLORS.textSoft}
                  >
                    Login
                  </SwitchButtonText>
                </SwitchButton>
                <SwitchButton
                  onPress={() => setAuthMode("register")}
                  backgroundColor={
                    authMode === "register" ? COLORS.freshGreen : "transparent"
                  }
                >
                  <SwitchButtonText
                    color={
                      authMode === "register" ? COLORS.night : COLORS.textSoft
                    }
                  >
                    Register
                  </SwitchButtonText>
                </SwitchButton>
              </AuthSwitch>

              <FieldStack>
                {authMode === "register" ? (
                  <FieldShell>
                    <FieldLabel>Full name</FieldLabel>
                    <TextInput
                      autoCapitalize="words"
                      placeholder="Your full name"
                      placeholderTextColor={COLORS.softGray}
                      style={styles.input}
                    />
                  </FieldShell>
                ) : null}

                <FieldShell>
                  <FieldLabel>
                    {authMode === "login" ? "Username or email" : "Email address"}
                  </FieldLabel>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder={
                      authMode === "login"
                        ? "Username or email"
                        : "you@company.com"
                    }
                    placeholderTextColor={COLORS.softGray}
                    style={styles.input}
                  />
                </FieldShell>

                {authMode === "register" ? (
                  <FieldShell>
                    <FieldLabel>Organization</FieldLabel>
                    <TextInput
                      autoCapitalize="words"
                      placeholder="Your company or team"
                      placeholderTextColor={COLORS.softGray}
                      style={styles.input}
                    />
                  </FieldShell>
                ) : null}

                <FieldShell>
                  <FieldLabel>Password</FieldLabel>
                  <TextInput
                    secureTextEntry
                    placeholder={
                      authMode === "login"
                        ? "Enter your password"
                        : "Create a password"
                    }
                    placeholderTextColor={COLORS.softGray}
                    style={styles.input}
                  />
                </FieldShell>

                {authMode === "register" ? (
                  <FieldShell>
                    <FieldLabel>Confirm password</FieldLabel>
                    <TextInput
                      secureTextEntry
                      placeholder="Confirm your password"
                      placeholderTextColor={COLORS.softGray}
                      style={styles.input}
                    />
                  </FieldShell>
                ) : null}
              </FieldStack>

              <InlineRow>
                <InlineMuted>
                  {authMode === "login"
                    ? "Keep me signed in"
                    : "I agree to the terms and conditions"}
                </InlineMuted>
                <InlineLink>
                  {authMode === "login" ? "Forgot password?" : "View terms"}
                </InlineLink>
              </InlineRow>

              <PrimaryButton onPress={onAuthSuccess}>
                <PrimaryButtonText>
                  {authMode === "login" ? "Sign In" : "Sign Up"}
                </PrimaryButtonText>
              </PrimaryButton>

              <GhostButton
                onPress={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
              >
                <GhostButtonText>
                  {authMode === "login"
                    ? "Need access? Switch to Register"
                    : "Already have an account? Switch to Login"}
                </GhostButtonText>
              </GhostButton>
            </FormCard>
          </Animated.View>
        </FormSection>
      </AuthShell>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textDark,
    paddingVertical: 2,
  },
});
