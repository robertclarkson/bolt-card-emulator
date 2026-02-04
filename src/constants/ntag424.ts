/**
 * NTAG424 DNA constants
 * Application IDs, file IDs, and SDM configuration
 */

/**
 * NTAG424 DNA Application Identifier (AID)
 * Standard NDEF AID: D2760000850101
 */
export const NTAG424_AID = new Uint8Array([0xD2, 0x76, 0x00, 0x00, 0x85, 0x01, 0x01]);

/**
 * File IDs used in NTAG424 DNA
 */
export const FILE_ID = {
  CC: 0x01,              // Capability Container (NDEF)
  NDEF: 0x02,            // NDEF File
  PROPRIETARY: 0x03,     // Proprietary data
  SDM_FILE: 0x02,        // SDM is typically on NDEF file (02)
} as const;

/**
 * Key numbers for NTAG424 DNA
 */
export const KEY_NUMBER = {
  K0: 0x00,  // Master key / Authentication key
  K1: 0x01,  // SDM Encryption key (SDMMetaReadKey)
  K2: 0x02,  // SDM MAC key (SDMFileReadKey)
  K3: 0x03,  // Additional key
  K4: 0x04,  // Additional key
} as const;

/**
 * NTAG424 DNA memory and file sizes
 */
export const MEMORY = {
  BLOCK_SIZE: 16,        // AES block size (bytes)
  UID_SIZE: 7,           // UID size (bytes)
  COUNTER_SIZE: 3,       // Counter size (bytes)
  PICC_DATA_SIZE: 10,    // UID + Counter (7 + 3)
  CMAC_SIZE: 8,          // Truncated CMAC size for SDM (bytes)
  CMAC_FULL_SIZE: 16,    // Full CMAC size (bytes)
  MAX_NDEF_SIZE: 256,    // Maximum NDEF file size (bytes)
} as const;

/**
 * SDM (Secure Dynamic Messaging) configuration
 */
export const SDM = {
  // Default mirror offsets (can be configured)
  UID_MIRROR_OFFSET: 0x2E,
  COUNTER_MIRROR_OFFSET: 0x41,
  CMAC_OFFSET: 0x4D,

  // SDM read access mode
  FREE_READ: 0x00,       // Readable without authentication
  KEY_READ: 0x0E,        // Requires key for reading

  // SDM options
  ENABLE_UID: 0x80,      // Mirror UID
  ENABLE_COUNTER: 0x40,  // Mirror counter
  ENABLE_READ_CTR_LIMIT: 0x20,  // Enable read counter limit
  ENCRYPTED_PICC: 0x02,  // Encrypt PICCData
  TT_STATUS: 0x01,       // Include TT (transaction timer) status
} as const;

/**
 * NDEF record types
 */
export const NDEF = {
  TNF_WELL_KNOWN: 0x01,  // TNF = Well-known type
  TNF_ABSOLUTE_URI: 0x03, // TNF = Absolute URI
  RTD_URI: 0x55,         // Record Type Definition: URI
  RTD_TEXT: 0x54,        // Record Type Definition: Text

  // URI identifier codes (prepended to payload)
  URI_PREFIX_NONE: 0x00,
  URI_PREFIX_HTTP_WWW: 0x01,  // http://www.
  URI_PREFIX_HTTPS_WWW: 0x02, // https://www.
  URI_PREFIX_HTTP: 0x03,      // http://
  URI_PREFIX_HTTPS: 0x04,     // https://

  // NDEF TLV (Type-Length-Value) tags
  TLV_NULL: 0x00,
  TLV_NDEF_MESSAGE: 0x03,
  TLV_TERMINATOR: 0xFE,
} as const;

/**
 * Default NTAG424 DNA keys (for testing only - should be replaced)
 */
export const DEFAULT_KEYS = {
  K0: new Uint8Array(16), // All zeros (factory default)
  K1: new Uint8Array(16), // All zeros (factory default)
  K2: new Uint8Array(16), // All zeros (factory default)
} as const;

/**
 * ATQA (Answer To Request Type A) values
 */
export const ATQA = {
  DOUBLE_SIZE_UID: 0x0344,  // 7-byte UID
  SINGLE_SIZE_UID: 0x0304,  // 4-byte UID
} as const;

/**
 * SAK (Select Acknowledge) values
 */
export const SAK = {
  TYPE_4: 0x20,  // ISO 14443-4 compliant (NTAG424 DNA)
} as const;

/**
 * Authentication modes
 */
export const AUTH_MODE = {
  NATIVE: 0x00,       // Native AES authentication
  EV2: 0x01,          // EV2 authentication
  LRP: 0x02,          // LRP (Leakage Resilient Primitive)
} as const;

/**
 * Maximum values
 */
export const MAX = {
  COUNTER: 0xFFFFFF,     // 3-byte counter maximum
  READ_LENGTH: 0xFF,     // Maximum read length in single APDU
} as const;
