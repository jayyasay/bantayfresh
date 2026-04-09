import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import type {
  BarcodeScanningResult,
  BarcodeType,
} from "expo-camera";
import { Text, View, styled } from "@tamagui/core";

import { COLORS } from "../theme/colors";

type BarcodeScannerModalProps = {
  onClose: () => void;
  onScanned: (result: BarcodeScanningResult) => void;
  visible: boolean;
};

const SUPPORTED_MOBILE_BARCODE_TYPES: BarcodeType[] = [
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "code128",
  "code39",
  "code93",
  "itf14",
  "codabar",
  "pdf417",
  "aztec",
  "datamatrix",
  "qr",
];

const Overlay = styled(View, {
  flex: 1,
  backgroundColor: "rgba(3,16,13,0.78)",
  justifyContent: "center",
  paddingTop: 34,
  paddingRight: 18,
  paddingBottom: 34,
  paddingLeft: 18,
});

const ScannerCard = styled(View, {
  borderRadius: 30,
  backgroundColor: COLORS.night,
  overflow: "hidden",
});

const Header = styled(View, {
  paddingTop: 18,
  paddingRight: 18,
  paddingBottom: 14,
  paddingLeft: 18,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
});

const HeaderTitle = styled(Text, {
  color: COLORS.white,
  fontSize: 22,
  lineHeight: 26,
  fontWeight: "800",
});

const HeaderBody = styled(Text, {
  color: "rgba(234,251,241,0.8)",
  fontSize: 14,
  lineHeight: 20,
});

const CloseButton = styled(Pressable, {
  width: 40,
  height: 40,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.08)",
  alignItems: "center",
  justifyContent: "center",
});

const CameraShell = styled(View, {
  marginTop: 4,
  marginRight: 14,
  marginBottom: 0,
  marginLeft: 14,
  borderRadius: 26,
  overflow: "hidden",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
  backgroundColor: "#08130F",
});

const ScannerFooter = styled(View, {
  paddingTop: 14,
  paddingRight: 18,
  paddingBottom: 18,
  paddingLeft: 18,
  gap: 12,
});

const FooterCopy = styled(Text, {
  color: "rgba(234,251,241,0.74)",
  fontSize: 13,
  lineHeight: 18,
});

const ActionRow = styled(View, {
  flexDirection: "row",
  gap: 10,
});

const ActionButton = styled(Pressable, {
  flex: 1,
  borderRadius: 18,
  paddingVertical: 14,
  paddingHorizontal: 16,
  alignItems: "center",
  justifyContent: "center",
});

const ActionText = styled(Text, {
  fontSize: 15,
  lineHeight: 19,
  fontWeight: "800",
});

const NoticeCard = styled(View, {
  borderRadius: 22,
  backgroundColor: COLORS.surface,
  paddingTop: 18,
  paddingRight: 18,
  paddingBottom: 18,
  paddingLeft: 18,
  gap: 10,
});

const NoticeTitle = styled(Text, {
  color: COLORS.textDark,
  fontSize: 18,
  lineHeight: 22,
  fontWeight: "800",
});

const NoticeBody = styled(Text, {
  color: COLORS.textSoft,
  fontSize: 14,
  lineHeight: 20,
});

export default function BarcodeScannerModal({
  onClose,
  onScanned,
  visible,
}: BarcodeScannerModalProps) {
  const dismissingRef = useRef(false);
  const scanLockRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [hasCameraReady, setHasCameraReady] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isCameraAvailable, setIsCameraAvailable] = useState<boolean | null>(null);
  const [mountError, setMountError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);

  const isWeb = Platform.OS === "web";
  const barcodeTypes = useMemo<BarcodeType[]>(
    () => (isWeb ? ["qr"] : SUPPORTED_MOBILE_BARCODE_TYPES),
    [isWeb],
  );

  useEffect(() => {
    if (!visible) {
      dismissingRef.current = false;
      scanLockRef.current = false;
      setHasCameraReady(false);
      setHasScanned(false);
      setMountError(null);
      setTorchEnabled(false);
      setIsCameraAvailable(null);
      return;
    }

    let isMounted = true;
    dismissingRef.current = false;

    if (permission && !permission.granted && permission.canAskAgain !== false) {
      void requestPermission();
    }

    setMountError(null);
    setHasScanned(false);
    setIsCheckingAvailability(true);

    if (isWeb) {
      CameraView.isAvailableAsync()
        .then((available) => {
          if (!isMounted) {
            return;
          }

          setIsCameraAvailable(available);
        })
        .catch(() => {
          if (isMounted) {
            setIsCameraAvailable(false);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsCheckingAvailability(false);
          }
        });
    } else {
      setIsCameraAvailable(true);
      setIsCheckingAvailability(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isWeb, permission, requestPermission, visible]);

  function handleDismiss() {
    dismissingRef.current = true;
    onClose();
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (
      !visible ||
      !hasCameraReady ||
      hasScanned ||
      scanLockRef.current ||
      dismissingRef.current
    ) {
      return;
    }

    scanLockRef.current = true;
    dismissingRef.current = true;
    setHasScanned(true);
    onScanned(result);
    onClose();
  }

  const showWebFallback =
    isWeb && isCameraAvailable !== null && permission?.granted !== false;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Overlay>
        <ScannerCard>
          <Header>
            <View flex={1} gap={4}>
              <HeaderTitle>Scan Barcode</HeaderTitle>
              <HeaderBody>
                Point the back camera at a barcode and we’ll capture it automatically.
              </HeaderBody>
            </View>

            <CloseButton accessibilityLabel="Close barcode scanner" onPress={handleDismiss}>
              <Ionicons color={COLORS.white} name="close" size={20} />
            </CloseButton>
          </Header>

          <CameraShell minHeight={410}>
            {!permission || isCheckingAvailability ? (
              <View flex={1} alignItems="center" justifyContent="center" padding={24} gap={8}>
                <Ionicons color={COLORS.mist} name="scan-outline" size={28} />
                <NoticeTitle color={COLORS.white}>Preparing camera…</NoticeTitle>
                <NoticeBody color="rgba(234,251,241,0.76)">
                  Getting the scanner ready.
                </NoticeBody>
              </View>
            ) : !permission.granted ? (
              <View flex={1} justifyContent="center" padding={20}>
                <NoticeCard>
                  <NoticeTitle>Camera permission needed</NoticeTitle>
                  <NoticeBody>
                    Allow camera access to scan barcodes automatically with your device.
                  </NoticeBody>
                  <ActionButton
                    accessibilityLabel="Grant camera access"
                    backgroundColor={COLORS.night}
                    onPress={() => {
                      void requestPermission();
                    }}
                  >
                    <ActionText color={COLORS.white}>Grant Access</ActionText>
                  </ActionButton>
                </NoticeCard>
              </View>
            ) : mountError ? (
              <View flex={1} justifyContent="center" padding={20}>
                <NoticeCard>
                  <NoticeTitle>Camera unavailable</NoticeTitle>
                  <NoticeBody>{mountError}</NoticeBody>
                </NoticeCard>
              </View>
            ) : isCameraAvailable === false ? (
              <View flex={1} justifyContent="center" padding={20}>
                <NoticeCard>
                  <NoticeTitle>No camera found</NoticeTitle>
                  <NoticeBody>
                    We couldn’t access a working camera on this device or browser.
                  </NoticeBody>
                </NoticeCard>
              </View>
            ) : showWebFallback ? (
              <View flex={1} justifyContent="center" padding={20}>
                <NoticeCard>
                  <NoticeTitle>Use mobile for barcode scanning</NoticeTitle>
                  <NoticeBody>
                    In this Expo web build, browser scanning is limited. For standard retail
                    barcodes like EAN, UPC, and Code 128, open the mobile app and scan there.
                  </NoticeBody>
                </NoticeCard>
              </View>
            ) : (
              <View flex={1}>
                <CameraView
                  active={visible && !hasScanned}
                  barcodeScannerSettings={{ barcodeTypes }}
                  enableTorch={torchEnabled}
                  facing="back"
                  onCameraReady={() => {
                    setHasCameraReady(true);
                  }}
                  onBarcodeScanned={handleBarcodeScanned}
                  onMountError={(event) => {
                    setMountError(event.message);
                  }}
                  style={StyleSheet.absoluteFillObject}
                />

                <View pointerEvents="none" style={styles.overlayFrame}>
                  <View style={styles.frame} />
                </View>
              </View>
            )}
          </CameraShell>

          <ScannerFooter>
            <FooterCopy>
              Supported mobile formats: EAN, UPC, Code 39, Code 93, Code 128, ITF-14, Codabar,
              PDF417, Data Matrix, Aztec, and QR.
            </FooterCopy>

            {!isWeb && permission?.granted ? (
              <ActionRow>
                <ActionButton
                  accessibilityLabel={torchEnabled ? "Turn torch off" : "Turn torch on"}
                  backgroundColor="rgba(255,255,255,0.08)"
                  onPress={() => setTorchEnabled((current) => !current)}
                >
                  <ActionText color={COLORS.white}>
                    {torchEnabled ? "Torch On" : "Torch Off"}
                  </ActionText>
                </ActionButton>

                <ActionButton
                  accessibilityLabel="Cancel barcode scanning"
                  backgroundColor={COLORS.surface}
                  onPress={handleDismiss}
                >
                  <ActionText color={COLORS.textDark}>Cancel</ActionText>
                </ActionButton>
              </ActionRow>
            ) : (
              <ActionButton
                accessibilityLabel="Close barcode scanner"
                backgroundColor={COLORS.surface}
                onPress={handleDismiss}
              >
                <ActionText color={COLORS.textDark}>Close</ActionText>
              </ActionButton>
            )}
          </ScannerFooter>
        </ScannerCard>
      </Overlay>
    </Modal>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderColor: "rgba(255,255,255,0.92)",
    borderRadius: 26,
    borderWidth: 2.5,
    height: 220,
    width: "72%",
  },
  overlayFrame: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
