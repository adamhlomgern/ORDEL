import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Ordel',
  slug: 'ordel',
  scheme: 'ordel',
  version: '0.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'se.ordel.app',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    package: 'se.ordel.app',
  },
  web: {
    favicon: './assets/favicon.png',
  },
};

export default config;
