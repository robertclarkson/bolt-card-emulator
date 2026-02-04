# Ralph Wiggum Command for Bolt Card Emulator

## Command

```bash
ralph "Implement a complete Bolt Card emulator in React Native with Expo that fully emulates NTAG424 DNA cryptographic operations via Android HCE" \
  --max-iterations 50 \
  --completion-promise "All 8 critical files are implemented, the Expo project builds successfully, and HCE integration is complete"
```

## Task Description

Implement a React Native + Expo app that emulates an NTAG424 DNA NFC card for Bolt Card functionality using Host Card Emulation (HCE). The phone will cryptographically emulate all NTAG424 DNA operations, responding to NFC readers as if it were a physical Bolt Card.

## Implementation Requirements

### Phase 1: Project Setup
1. Initialize Expo TypeScript project
2. Install dependencies: react-native-hce, expo-crypto, async-storage, react-native-paper, navigation
3. Set up project structure with src/ directory

### Phase 2: HCE Integration
4. Create Expo config plugin (plugins/react-native-hce-plugin.js)
5. Configure app.config.js with HCE plugin
6. Run expo prebuild to generate Android manifest

### Phase 3: Cryptography
7. Implement AES-128 operations (src/crypto/aes.ts)
8. Implement CMAC per NIST SP 800-38B (src/crypto/cmac.ts)
9. Implement session key derivation per NIST SP 800-108 (src/crypto/sessionKeys.ts)
10. Create crypto utilities (src/crypto/utils.ts)

### Phase 4: APDU Handling
11. Create APDU parser (src/apdu/APDUParser.ts)
12. Create APDU response builder (src/apdu/APDUBuilder.ts)
13. Define APDU constants (src/apdu/commands.ts, src/constants/apdu.ts)
14. Implement SELECT handler (src/apdu/handlers/SelectHandler.ts)
15. Implement READ handler (src/apdu/handlers/ReadHandler.ts)

### Phase 5: NTAG424 & SDM
16. Implement NTAG424 service coordinator (src/services/NTAG424Service.ts)
17. Implement SDM message generation (src/services/SDMService.ts)
18. Define NTAG424 constants (src/constants/ntag424.ts)
19. Create TypeScript types (src/types/*.ts)

### Phase 6: Key Management & Storage
20. Implement CryptoService with key generation (src/services/CryptoService.ts)
21. Implement StorageService wrapper (src/services/StorageService.ts)

### Phase 7: HCE Bridge
22. Implement HCEService bridge (src/services/HCEService.ts)

### Phase 8: UI
23. Create HomeScreen with enable/disable toggle (src/screens/HomeScreen.tsx)
24. Create ConfigScreen for key management (src/screens/ConfigScreen.tsx)
25. Create DebugScreen for APDU logs (src/screens/DebugScreen.tsx)
26. Implement App.tsx with navigation

## Critical Files (8 required)

1. **plugins/react-native-hce-plugin.js** - Expo config plugin for Android manifest
2. **src/services/NTAG424Service.ts** - Main APDU handler
3. **src/crypto/cmac.ts** - CMAC implementation
4. **src/crypto/sessionKeys.ts** - Session key derivation
5. **src/services/SDMService.ts** - SDM message generation
6. **src/apdu/handlers/ReadHandler.ts** - READ command handler
7. **src/services/HCEService.ts** - HCE bridge
8. **src/screens/ConfigScreen.tsx** - Key management UI

## Success Criteria

- ✅ All 8 critical files implemented
- ✅ All TypeScript files compile without errors
- ✅ Expo project structure is complete
- ✅ HCE plugin correctly configures Android manifest
- ✅ Cryptographic functions (AES, CMAC, key derivation) implemented
- ✅ APDU parsing and handling logic complete
- ✅ SDM generation with counter, encryption, and CMAC working
- ✅ UI screens implemented with proper navigation

## Technical Specifications

**Framework**: Expo with Development Builds
**Scope**: SDM read-only mode for Bolt Card tap-to-pay
**Platform**: Android-only (iOS doesn't support HCE)
**Crypto**: AES-128, CMAC (NIST SP 800-38B), Key derivation (NIST SP 800-108)
**Protocol**: ISO-DEP (ISO 14443-4 Type 4), NTAG424 DNA emulation
**AID**: D2760000850101 (standard NDEF tag)

## References

- Plan file: /home/tinfoil/.claude/plans/nifty-splashing-tome.md
- NTAG424 DNA Datasheet: https://www.nxp.com/docs/en/data-sheet/NT4H2421Gx.pdf
- Reference implementation: https://github.com/MxAshUp/ntag424-js
- Bolt Card spec: https://github.com/boltcard/boltcard
