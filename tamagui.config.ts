process.env.TAMAGUI_TARGET = 'native';

import { defaultConfig } from '@tamagui/config/v5';
import { animations } from '@tamagui/config/v5-rn';
import { createTamagui } from '@tamagui/core';

const { media, ...configWithoutMedia } = defaultConfig;

export const tamaguiConfig = createTamagui({
  ...configWithoutMedia,
  animations: animations as never,
});

export default tamaguiConfig;
