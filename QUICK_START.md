# Bolt Card Emulator - Quick Start Guide

## 🚀 Fast Track to Testing

### Prerequisites
- Physical Android device with NFC (Android 4.4+)
- USB cable for connecting to computer
- Node.js 18+ installed
- Android debugging enabled on device

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Build the App
```bash
# Generate Android project
npx expo prebuild --platform android --clean

# Build and install on connected device
npx expo run:android
```

### 3. First Time Setup in App

#### a. Generate Keys
1. Open app on your device
2. Tap "Configure Card"
3. Tap "Generate New Keys"
4. Tap "Generate Card ID"
5. Tap "Save Configuration"

#### b. Note Your Keys
- Copy K1 and K2 (you'll need these for server setup)
- Optionally use "Export All to Clipboard"

### 4. Register with LNbits (Optional for Testing)

If you want full LNURL-withdraw functionality:

1. Go to your LNbits instance
2. Enable "Bolt Cards" extension
3. Create new card
4. Enter your K1 and K2 from the app
5. Note the callback URL
6. Update "LNURL Base URL" in app Config screen

### 5. Test the Emulation

#### a. Enable Card
1. Return to Home screen
2. Toggle "Card Active" to ON
3. Green indicator shows it's active

#### b. Expected NFC Behavior

When you tap to an NFC reader:
1. ✅ Android may show "Complete action using..." dialog
2. ✅ Select "Bolt Card Emulator"
3. ✅ NFC communication proceeds normally

This dialog is **Android's security mechanism** and is expected behavior for apps in the "other" category (non-payment HCE apps).

To reduce dialog frequency, uninstall competing NFC apps.

#### c. Test with NFC Reader
1. Open "NFC Tools" or similar app on another phone
2. Tap your phone to the reader
3. Should detect NDEF tag
4. View LNURL data in tag contents

#### d. Test with Lightning Wallet
1. Open Lightning wallet with LNURL support (BlueWallet, Phoenix, Zeus)
2. Tap wallet to your phone
3. Should show withdraw request
4. If server is configured, withdrawal should work

### 6. Debug and Monitor

1. Tap "Debug Log" from Home screen
2. See real-time APDU transactions
3. Monitor counter increments
4. Check SDM generation

---

## 📱 App Screens Overview

### Home Screen
- **Toggle**: Enable/disable card emulation
- **Counter Display**: Shows tap count
- **Card ID**: Your unique identifier
- **Buttons**: Navigate to Config and Debug

### Config Screen
- **Generate Keys**: Create new random keys
- **Key Display**: View K0, K1, K2, UID in hex
- **LNURL Setup**: Configure callback URL
- **Card ID**: Generate or enter manually
- **Export**: Copy all config to clipboard

### Debug Screen
- **Transaction Log**: Real-time APDU commands
- **Color Coded**: APDU, SDM, Counter, Error types
- **Clear**: Reset log
- **Direction**: Incoming/Outgoing indicators

---

## 🔧 Troubleshooting

### App Won't Build
```bash
# Clean and retry
rm -rf node_modules android
npm install
npx expo prebuild --platform android --clean
npx expo run:android
```

### HCE Not Supported
- Check device has NFC hardware
- Verify Android version (4.4+)
- Some devices don't support HCE (check manufacturer specs)

### NFC Not Detecting
1. Enable NFC in Android Settings
2. Ensure app is open and emulation is ON
3. Try positioning phone differently on reader
4. Check Debug Log for APDU activity

### Keys Not Saving
- Grant storage permission to app
- Check available storage space
- Try "Export All" and save externally

### LNURL Not Working
- Verify server URL is reachable
- Ensure K1 and K2 match server registration
- Check CMAC validation on server side
- Test URL manually in browser first

---

## 💡 Usage Tips

### Testing Without Server
You can test basic NFC functionality without a Lightning server:
1. Use NFC reader apps to verify NDEF data
2. Check LNURL URL format is correct
3. Verify counter increments on each tap
4. Use Debug Log to see APDU exchanges

### Security Best Practices
- ✅ Generate new keys for each card
- ✅ Back up keys securely (offline)
- ✅ Never share keys publicly
- ✅ Use HTTPS for LNURL callbacks
- ✅ Monitor counter for unexpected changes
- ❌ Don't screenshot keys
- ❌ Don't send keys over unencrypted channels

### Counter Management
- Counter increments on each NFC tap
- Resets only when you generate new keys
- Used in CMAC calculation (prevents replay)
- Monitor for suspicious jumps

### Multiple Cards
Currently, the app supports one card at a time. To use multiple cards:
1. Export current configuration
2. Generate new keys
3. Save as new card
4. Import previous config when needed

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] App installs successfully
- [ ] Keys generate without errors
- [ ] Config saves and persists
- [ ] Home screen shows status
- [ ] Toggle switch works

### NFC/HCE
- [ ] HCE is supported on device
- [ ] NFC is enabled in settings
- [ ] App appears as card in NFC settings
- [ ] Emulation toggle works
- [ ] Green indicator shows when active

### NFC Reading
- [ ] NFC reader detects tag
- [ ] NDEF data is readable
- [ ] LNURL URL is present
- [ ] Counter increments on tap
- [ ] Encrypted data changes each tap

### LNURL (if server configured)
- [ ] Lightning wallet detects LNURL
- [ ] Withdraw request appears
- [ ] Amount is configurable
- [ ] Server validates CMAC
- [ ] Withdrawal completes

### Debug Logging
- [ ] Debug screen opens
- [ ] APDU commands logged
- [ ] SDM events logged
- [ ] Counter events logged
- [ ] Timestamps accurate

---

## 📊 Expected Values

### Key Lengths (Hex)
- K0: 32 characters (16 bytes)
- K1: 32 characters (16 bytes)
- K2: 32 characters (16 bytes)
- UID: 14 characters (7 bytes)

### LNURL URL Format
```
https://domain.com/path/CARD_ID?p=ENCRYPTED_DATA&c=CMAC_VALUE
```

Where:
- `ENCRYPTED_DATA`: 20 hex characters (10 bytes encrypted)
- `CMAC_VALUE`: 16 hex characters (8 bytes)

### APDU Commands to Expect
1. SELECT AID: `00 A4 04 00 07 D2760000850101`
2. SELECT File 02: `00 A4 00 00 02 0002`
3. READ BINARY: `00 B0 00 00 [length]`

### Status Words
- `9000`: Success
- `6A82`: File not found
- `6700`: Wrong length
- `6D00`: Instruction not supported

---

## 🎯 Next Steps

Once basic testing works:

1. **Register with Production Server**
   - Use real LNbits or Bolt Card server
   - Test real Lightning withdrawals

2. **Security Audit**
   - Review key storage
   - Test CMAC validation
   - Verify counter increment logic

3. **Extended Testing**
   - Test with multiple wallets
   - Verify reader compatibility
   - Test edge cases (low battery, airplane mode, etc.)

4. **Backup Strategy**
   - Export and save keys
   - Document recovery process
   - Test key import

---

## 📞 Support

### Resources
- README.md: Full documentation
- IMPLEMENTATION_STATUS.md: Technical details
- GitHub Issues: Report bugs
- Bolt Card Discord: Community support

### Common Commands
```bash
# Check logs
npx react-native log-android

# Rebuild
npx expo prebuild --platform android --clean

# Clean install
rm -rf node_modules && npm install

# Check TypeScript
npx tsc --noEmit
```

---

**Ready to test!** 🎉

Connect your Android device and run:
```bash
npx expo run:android
```
