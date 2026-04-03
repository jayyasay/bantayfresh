import { setupMatchMedia } from "@tamagui/core";
import { matchMedia } from "@tamagui/react-native-media-driver";

setupMatchMedia(matchMedia as never);

if (typeof globalThis.matchMedia !== "function") {
  globalThis.matchMedia = matchMedia as typeof globalThis.matchMedia;
}
