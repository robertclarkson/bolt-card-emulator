/**
 * NTAG424 DNA type definitions
 */

/**
 * NTAG424 DNA keys
 */
export interface NTAG424Keys {
  K0: Uint8Array;  // Master/Authentication key (16 bytes)
  K1: Uint8Array;  // Encryption key - SDMMetaReadKey (16 bytes)
  K2: Uint8Array;  // MAC key - SDMFileReadKey (16 bytes)
  UID: Uint8Array; // Unique ID (7 bytes)
}

/**
 * SDM (Secure Dynamic Messaging) configuration
 */
export interface SDMConfig {
  piccData: Uint8Array;          // UID + Counter (10 bytes)
  encKey: Uint8Array;            // K1 for encryption
  macKey: Uint8Array;            // K2 for CMAC
  counter: Uint8Array;           // Current counter value (3 bytes)
  uid: Uint8Array;               // UID (7 bytes)
}

/**
 * SDM generated message
 */
export interface SDMMessage {
  encPiccData: string;           // Hex-encoded encrypted PICCData
  cmac: string;                  // Hex-encoded 8-byte CMAC
  piccData: Uint8Array;          // Original PICCData (UID + Counter)
}

/**
 * File information
 */
export interface FileInfo {
  fileId: number;                // File ID
  size: number;                  // File size in bytes
  readKey: number;               // Key number for reading
  writeKey: number;              // Key number for writing
  data?: Uint8Array;             // File data
}

/**
 * NTAG424 state
 */
export interface NTAG424State {
  selectedFileId: number | null; // Currently selected file
  authenticated: boolean;        // Authentication status
  counter: Uint8Array;           // Current counter (3 bytes)
  files: Map<number, FileInfo>;  // Files indexed by file ID
}

/**
 * Session keys
 */
export interface SessionKeys {
  KSesSDMFileReadMAC: Uint8Array;  // Session key for MAC
  KSesSDMFileEnc: Uint8Array;      // Session key for encryption
}

/**
 * NDEF message structure
 */
export interface NDEFMessage {
  records: NDEFRecord[];
}

/**
 * NDEF record
 */
export interface NDEFRecord {
  tnf: number;                   // Type Name Format
  type: Uint8Array;              // Record type
  id?: Uint8Array;               // Record ID (optional)
  payload: Uint8Array;           // Record payload
}

/**
 * Card configuration for Bolt Card
 */
export interface BoltCardConfig {
  keys: NTAG424Keys;             // Cryptographic keys
  lnurlBase: string;             // LNURL callback base URL
  cardId: string;                // Card identifier
  counter: Uint8Array;           // Current counter
}
