import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { Text, View, styled } from "@tamagui/core";

import {
  isSupabaseConfigured,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from "../../lib/supabase";
import BrandMark from "../components/BrandMark";
import { COLORS } from "../theme/colors";

type AuthMode = "login" | "register";
type FieldKey = "email" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<FieldKey, string>>;

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
  width: 136,
  height: 136,
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

const StatusCard = styled(View, {
  borderRadius: 18,
  paddingTop: 12,
  paddingRight: 14,
  paddingBottom: 12,
  paddingLeft: 14,
  gap: 6,
});

const StatusTitle = styled(Text, {
  fontSize: 13,
  lineHeight: 17,
  fontWeight: "800",
});

const StatusBody = styled(Text, {
  fontSize: 13,
  lineHeight: 19,
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
  onAuthSuccess?: () => void;
};

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailConfirmationNotice, setEmailConfirmationNotice] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    modeAnim.setValue(0);
    setFieldErrors({});
    setErrorMessage(null);
    setSuccessMessage(null);
    if (authMode === "register") {
      setEmailConfirmationNotice(null);
    }

    Animated.timing(modeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [authMode, modeAnim]);

  function validateForm() {
    const nextErrors: FieldErrors = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = "Use a valid email format.";
    }

    if (!password) {
      nextErrors.password = "Enter your password.";
    } else if (authMode === "register" && password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    if (authMode === "register") {
      if (!confirmPassword) {
        nextErrors.confirmPassword = "Confirm your password.";
      } else if (confirmPassword !== password) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    return nextErrors;
  }

  async function handleSubmit() {
    const nextErrors = validateForm();
    setFieldErrors(nextErrors);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (authMode === "register") {
      setEmailConfirmationNotice(null);
    }

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!isSupabaseConfigured) {
      setErrorMessage(
        "Supabase is not configured yet. Add your Expo public keys in .env and restart the app.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      if (authMode === "login") {
        const { error } = await signInWithEmailPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          throw error;
        }

        setEmailConfirmationNotice(null);
        onAuthSuccess?.();
        return;
      }

      const { data, error } = await signUpWithEmailPassword({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || undefined,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        setSuccessMessage("Account created. You’re signed in.");
        setEmailConfirmationNotice(null);
        onAuthSuccess?.();
        return;
      }

      setEmailConfirmationNotice(
        `Email confirmation has been sent to ${email.trim().toLowerCase()}. Please confirm your email before proceeding to login.`,
      );
      setSuccessMessage(null);
      setFullName("");
      setPassword("");
      setConfirmPassword("");
      setAuthMode("login");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
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
            <BrandMark showFrame={false} fillParent />
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
                  ? "Sign in to check what needs using soon, keep your pantry in order, and stay on top of what matters."
                  : "Create your account to start tracking what you have, what is running low, and what needs attention next."}
              </FormBody>
            </WelcomeCard>

            <FormCard>
              <FormHeading>
                <FormTitle>
                  {authMode === "login" ? "Sign In" : "Create Account"}
                </FormTitle>
              </FormHeading>

              {authMode === "login" && emailConfirmationNotice ? (
                <StatusCard backgroundColor="#EEF9F2" borderWidth={1} borderColor="#CFE8D8">
                  <StatusTitle color={COLORS.deepGreen}>Confirm your email first</StatusTitle>
                  <StatusBody color={COLORS.textSoft}>
                    {emailConfirmationNotice}
                  </StatusBody>
                </StatusCard>
              ) : null}

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
                      autoComplete="name"
                      placeholder="Your full name"
                      placeholderTextColor={COLORS.softGray}
                      style={styles.input}
                      textContentType="name"
                      value={fullName}
                      onChangeText={setFullName}
                    />
                  </FieldShell>
                ) : null}

                <FieldShell>
                  <FieldLabel>Email address</FieldLabel>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor={COLORS.softGray}
                    style={styles.input}
                    textContentType="emailAddress"
                    value={email}
                    onChangeText={setEmail}
                  />
                  {fieldErrors.email ? (
                    <InlineLink color="#C94B4B">{fieldErrors.email}</InlineLink>
                  ) : null}
                </FieldShell>

                <FieldShell>
                  <FieldLabel>Password</FieldLabel>
                  <TextInput
                    autoComplete={authMode === "login" ? "current-password" : "new-password"}
                    secureTextEntry
                    placeholder={
                      authMode === "login"
                        ? "Enter your password"
                        : "Create a password"
                    }
                    placeholderTextColor={COLORS.softGray}
                    style={styles.input}
                    textContentType={authMode === "login" ? "password" : "newPassword"}
                    value={password}
                    onChangeText={setPassword}
                  />
                  {fieldErrors.password ? (
                    <InlineLink color="#C94B4B">{fieldErrors.password}</InlineLink>
                  ) : null}
                </FieldShell>

                {authMode === "register" ? (
                  <FieldShell>
                    <FieldLabel>Confirm password</FieldLabel>
                    <TextInput
                      autoComplete="new-password"
                      secureTextEntry
                      placeholder="Confirm your password"
                      placeholderTextColor={COLORS.softGray}
                      style={styles.input}
                      textContentType="newPassword"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    {fieldErrors.confirmPassword ? (
                      <InlineLink color="#C94B4B">
                        {fieldErrors.confirmPassword}
                      </InlineLink>
                    ) : null}
                  </FieldShell>
                ) : null}
              </FieldStack>

              <InlineRow flexDirection={authMode === "register" ? "column" : "row"} alignItems={authMode === "register" ? "flex-start" : "center"}>
                <InlineMuted>
                  {authMode === "login"
                    ? "Session stays saved on this device"
                    : "Password needs at least 8 characters"}
                </InlineMuted>
                <InlineLink>
                  {authMode === "login"
                    ? "Email + Password"
                    : "Email verification may be required"}
                </InlineLink>
              </InlineRow>

              {errorMessage ? (
                <StatusCard backgroundColor="#FFF1F1" borderWidth={1} borderColor="#F4C6C6">
                  <StatusTitle color="#B34242">Couldn’t continue</StatusTitle>
                  <StatusBody color="#8F4D4D">{errorMessage}</StatusBody>
                </StatusCard>
              ) : null}

              {successMessage ? (
                <StatusCard backgroundColor="#EEF9F2" borderWidth={1} borderColor="#CFE8D8">
                  <StatusTitle color={COLORS.deepGreen}>Success</StatusTitle>
                  <StatusBody color={COLORS.textSoft}>{successMessage}</StatusBody>
                </StatusCard>
              ) : null}

              <PrimaryButton
                disabled={isSubmitting}
                onPress={handleSubmit}
                opacity={isSubmitting ? 0.7 : 1}
              >
                <PrimaryButtonText>
                  {isSubmitting
                    ? authMode === "login"
                      ? "Signing In…"
                      : "Creating Account…"
                    : authMode === "login"
                      ? "Sign In"
                      : "Sign Up"}
                </PrimaryButtonText>
              </PrimaryButton>

              <GhostButton
                disabled={isSubmitting}
                onPress={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
                opacity={isSubmitting ? 0.6 : 1}
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
    paddingBottom: 32,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textDark,
    paddingVertical: 2,
  },
});
