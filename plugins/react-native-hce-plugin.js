const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

/**
 * Expo config plugin to configure Android HCE (Host Card Emulation) for NTAG424 DNA emulation
 *
 * This plugin modifies the AndroidManifest.xml to:
 * - Add NFC permission
 * - Add HCE feature requirement
 * - Register HCE service with AID filter
 */
const withHCE = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;

    // Add NFC permission
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    // Check if NFC permission already exists
    const hasNFCPermission = androidManifest['uses-permission'].some(
      perm => perm.$?.['android:name'] === 'android.permission.NFC'
    );

    if (!hasNFCPermission) {
      androidManifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.NFC' }
      });
    }

    // Add HCE feature requirement
    if (!androidManifest['uses-feature']) {
      androidManifest['uses-feature'] = [];
    }

    // Check if HCE feature already exists
    const hasHCEFeature = androidManifest['uses-feature'].some(
      feature => feature.$?.['android:name'] === 'android.hardware.nfc.hce'
    );

    if (!hasHCEFeature) {
      androidManifest['uses-feature'].push({
        $: {
          'android:name': 'android.hardware.nfc.hce',
          'android:required': 'true'
        }
      });
    }

    // Add HCE service to application
    const application = androidManifest.application[0];
    if (!application.service) {
      application.service = [];
    }

    // Check if HCE service already exists
    const hasHCEService = application.service.some(
      service => service.$?.['android:name'] === 'com.reactnativehce.services.CardService'
    );

    if (!hasHCEService) {
      application.service.push({
        $: {
          'android:name': 'com.reactnativehce.services.CardService',
          'android:exported': 'true',
          'android:permission': 'android.permission.BIND_NFC_SERVICE'
        },
        'intent-filter': [{
          action: [{
            $: { 'android:name': 'android.nfc.cardemulation.action.HOST_APDU_SERVICE' }
          }]
        }],
        'meta-data': [{
          $: {
            'android:name': 'android.nfc.cardemulation.host_apdu_service',
            'android:resource': '@xml/aid_list'
          }
        }]
      });
    }

    return config;
  });
};

module.exports = withHCE;
