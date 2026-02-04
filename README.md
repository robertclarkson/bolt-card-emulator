# Bolt Card Emulator

A React Native + Expo application that emulates an NTAG424 DNA NFC card for Bitcoin Lightning Network Bolt Card functionality using Android Host Card Emulation (HCE).

## Overview

This app turns your Android phone into a virtual Bolt Card by:
- Emulating NTAG424 DNA NFC chip cryptographic operations
- Implementing SDM (Secure Dynamic Messaging) with AES-128 encryption and CMAC
- Responding to NFC readers as if it were a physical Bolt Card
- Supporting LNURL-withdraw protocol for Lightning Network payments

## Features

- ✅ Full NTAG424 DNA APDU command handling
- ✅ AES-128 encryption and CMAC per NIST specifications
- ✅ SDM counter with automatic increment on each tap
- ✅ Encrypted PICCData (UID + Counter)
- ✅ Key generation and management
- ✅ LNURL-withdraw URL building
- ✅ Real-time debug logging
- ✅ Android HCE integration

## Requirements

### Device Requirements
- Android 4.4 (KitKat) or higher
- NFC hardware
- HCE (Host Card Emulation) support
- Physical device (emulators don't support NFC/HCE)

### Development Requirements
- Node.js 18+
- npm or yarn
- Android development environment (for building)
- Expo CLI

## Installation

### 1. Clone and Install Dependencies

```bash
cd bolt-card-emulator
npm install
```

### 2. Generate Android Project

```bash
npx expo prebuild --platform android --clean
```

### 3. Build Development Client

Option A: Build locally (requires Android SDK)
```bash
npx expo run:android
```

Option B: Build with EAS (cloud building)
```bash
npm install -g eas-cli
eas build --profile development --platform android
```

### 4. Install on Device

- For local builds, app will be installed automatically
- For EAS builds, download APK and install manually

## Usage

### First Time Setup

1. **Generate Keys**
   - Open the app and navigate to "Configure Card"
   - Tap "Generate New Keys"
   - Keys are randomly generated:
     - K0: Master/Authentication key
     - K1: Encryption key (SDMMetaReadKey)
     - K2: CMAC key (SDMFileReadKey)
     - UID: 7-byte unique identifier

2. **Configure LNURL**
   - Enter your LNURL callback base URL (e.g., `https://lnbits.com/boltcards/api/v1/scan`)
   - Generate or enter a Card ID
   - Save configuration

3. **Register with Server**
   - Copy your keys (K1, K2) from the Config screen
   - Register them with your LNbits or Bolt Card server
   - Server needs K1 and K2 to verify SDM signatures

### Using the Card

1. **Enable Emulation**
   - Return to Home screen
   - Toggle "Card Active" switch
   - Your phone is now emulating an NFC card

2. **Tap to Pay**
   - Tap your phone to an NFC reader or Lightning wallet
   - The counter increments automatically
   - SDM generates unique encrypted data and CMAC for each tap
   - Lightning wallet receives LNURL-withdraw request

3. **Debug Logging**
   - View real-time APDU transactions in Debug screen
   - Monitor SDM generation
   - Track counter increments

## Architecture

### Crypto Layer
- `src/crypto/aes.ts` - AES-128 ECB and CTR modes
- `src/crypto/cmac.ts` - CMAC per NIST SP 800-38B
- `src/crypto/sessionKeys.ts` - Session key derivation per NIST SP 800-108
- `src/crypto/utils.ts` - Hex conversion, byte manipulation

### APDU Layer
- `src/apdu/APDUParser.ts` - Parse incoming APDU commands
- `src/apdu/APDUBuilder.ts` - Build APDU responses
- `src/apdu/handlers/SelectHandler.ts` - Handle SELECT commands
- `src/apdu/handlers/ReadHandler.ts` - Handle READ commands with SDM

### Services
- `src/services/NTAG424Service.ts` - Main APDU coordinator
- `src/services/SDMService.ts` - SDM message generation
- `src/services/HCEService.ts` - Bridge to native HCE
- `src/services/CryptoService.ts` - Key generation
- `src/services/StorageService.ts` - Persistent storage

### UI
- `src/screens/HomeScreen.tsx` - Main dashboard
- `src/screens/ConfigScreen.tsx` - Key management
- `src/screens/DebugScreen.tsx` - APDU logs

### Native Integration
- `plugins/react-native-hce-plugin.js` - Expo config plugin
- `android/app/src/main/res/xml/apduservice.xml` - HCE AID filter

## Technical Details

### NTAG424 DNA Emulation

The app emulates NTAG424 DNA chip behavior:

1. **ISO-DEP Protocol**: ISO 14443-4 Type 4 tag
2. **Application ID (AID)**: `D2760000850101` (standard NDEF)
3. **File Structure**:
   - File 01: Capability Container
   - File 02: NDEF with SDM

### SDM (Secure Dynamic Messaging)

Each NFC tap generates a unique secure message:

```
PICCData = UID (7 bytes) + Counter (3 bytes)
KSesEnc = CMAC(K1, "SDMENCFileData" || SV)
KSesMac = CMAC(K2, "SDMFileReadMAC" || SV)
EncPiccData = AES-CTR(KSesEnc, PICCData)
CMAC = AES-CMAC(KSesMac, PICCData)[0:8]
```

### LNURL-Withdraw URL Format

```
https://domain.com/path/cardId?p=ENCRYPTED_PICC_DATA&c=CMAC
```

Where:
- `p`: Hex-encoded encrypted PICCData
- `c`: Hex-encoded 8-byte CMAC

Server validates CMAC to ensure tap authenticity.

## Security

### Key Storage
- Keys stored encrypted in AsyncStorage
- Never transmitted except when explicitly exported
- Generate new keys if compromised

### CMAC Verification
- Each tap produces unique CMAC due to counter increment
- Prevents replay attacks
- Server-side validation required

### Recommendations
- Keep keys secure and backed up
- Use HTTPS for LNURL callbacks
- Regularly monitor counter values
- Reset card if keys are exposed

## Troubleshooting

### HCE Not Supported
- Ensure device has NFC hardware
- Check Android version (4.4+)
- Verify HCE capability in device specs

### Emulation Not Working
- Enable NFC in Android settings
- Check permissions in app settings
- Ensure HCE service is registered (check AndroidManifest.xml)

### Reader Can't Detect Card
- Ensure emulation is enabled
- Position phone correctly on reader
- Check debug logs for APDU communication

### LNURL Not Recognized
- Verify server is reachable
- Check K1 and K2 are registered on server
- Ensure CMAC validation is working server-side

## Development

### Run in Development Mode

```bash
npm start
# or
npx expo start --dev-client
```

### TypeScript Compilation Check

```bash
npx tsc --noEmit
```

### Rebuild Android Project

```bash
npx expo prebuild --platform android --clean
```

## References

### Specifications
- [NTAG424 DNA Datasheet](https://www.nxp.com/docs/en/data-sheet/NT4H2421Gx.pdf)
- [NTAG424 DNA Application Note AN12196](https://www.nxp.com/docs/en/application-note/AN12196.pdf)
- [NIST SP 800-38B (CMAC)](https://csrc.nist.gov/publications/detail/sp/800-38b/final)
- [NIST SP 800-108 (KDF)](https://csrc.nist.gov/pubs/sp/800/108/r1/final)

### Bolt Card Protocol
- [Bolt Card Official Repo](https://github.com/boltcard/boltcard)
- [LNbits Bolt Cards Extension](https://github.com/lnbits/boltcards)

### Reference Implementations
- [ntag424-js](https://github.com/MxAshUp/ntag424-js) - JavaScript CMAC and SDM
- [Ntag424SdmFeature (Android)](https://github.com/AndroidCrypto/Ntag424SdmFeature)

## License

MIT

## Contributing

Contributions welcome! Please open issues or pull requests.

## Disclaimer

This is experimental software. Use at your own risk. Not responsible for lost funds.

## Credits

Built with:
- React Native
- Expo
- react-native-hce
- crypto-js
- expo-crypto
