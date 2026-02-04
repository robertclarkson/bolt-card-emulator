export default {
  expo: {
    name: "Bolt Card Emulator",
    slug: "bolt-card-emulator",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.boltcard.emulator"
    },
    android: {
      package: "com.boltcard.emulator",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "android.permission.NFC"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "./plugins/react-native-hce-plugin",
      "expo-dev-client"
    ]
  }
};
