/**
 * Session key derivation for NTAG424 DNA
 * Implements NIST SP 800-108 Counter Mode KDF with CMAC as PRF
 *
 * Session keys are derived from master keys (K1, K2) for SDM operations
 */

import { cmacPRF } from './cmac';
import { concat, numberToBytes } from './utils';

/**
 * Session keys for SDM (Secure Dynamic Messaging)
 */
export interface SDMSessionKeys {
  KSesSDMFileReadMAC: Uint8Array;  // For CMAC generation (from K2)
  KSesSDMFileEnc: Uint8Array;      // For encrypting PICCData (from K1)
}

/**
 * Derive session keys for SDM operations using NIST SP 800-108 KDF
 *
 * For unauthenticated SDM reads, SV (Session Vector) is typically all zeros
 *
 * Formula: K_i = PRF(K_master, [i]_2 || Label || 0x00 || SV || [L]_2)
 * Where:
 * - [i]_2 is a 2-byte counter (0x0001, 0x0002, etc.)
 * - Label identifies the purpose
 * - 0x00 is a separator
 * - SV is the session vector (context data)
 * - [L]_2 is the desired output length in bits (0x0080 for 128 bits)
 *
 * @param masterKey - Master key (K1 or K2)
 * @param sv - Session Vector (16 bytes, all zeros for unauthenticated reads)
 * @param label - Key derivation label
 * @returns Derived session key (16 bytes)
 */
function deriveKey(masterKey: Uint8Array, sv: Uint8Array, label: Uint8Array): Uint8Array {
  if (masterKey.length !== 16) {
    throw new Error('Master key must be 16 bytes');
  }

  if (sv.length !== 16) {
    throw new Error('Session vector must be 16 bytes');
  }

  // Counter [i]_2 (0x0001 for first iteration)
  const counter = new Uint8Array([0x00, 0x01]);

  // Separator
  const separator = new Uint8Array([0x00]);

  // Output length [L]_2 (128 bits = 0x0080)
  const length = new Uint8Array([0x00, 0x80]);

  // Concatenate: [i]_2 || Label || 0x00 || SV || [L]_2
  const input = concat(counter, label, separator, sv, length);

  // PRF(K_master, input) = CMAC(K_master, input)
  return cmacPRF(masterKey, input);
}

/**
 * Derive SDM session keys for unauthenticated reads
 *
 * According to NTAG424 DNA spec AN12196:
 * - KSesSDMFileReadMAC = CMAC(K2, 0x0001 || "SDMFileReadMAC" || 0x00 || SV || 0x0080)
 * - KSesSDMFileEnc = CMAC(K1, 0x0001 || "SDMENCFileData" || 0x00 || SV || 0x0080)
 *
 * For unauthenticated SDM, SV = 0x00...00 (16 bytes)
 *
 * @param K1 - Encryption master key
 * @param K2 - Authentication master key
 * @param sv - Session Vector (optional, defaults to all zeros)
 * @returns SDM session keys
 */
export function deriveSDMSessionKeys(
  K1: Uint8Array,
  K2: Uint8Array,
  sv?: Uint8Array
): SDMSessionKeys {
  // Default SV to all zeros for unauthenticated reads
  const sessionVector = sv || new Uint8Array(16);

  // Labels from NTAG424 DNA specification
  const labelFileEnc = new TextEncoder().encode('SDMENCFileData');
  const labelFileReadMAC = new TextEncoder().encode('SDMFileReadMAC');

  // Derive session keys
  const KSesSDMFileEnc = deriveKey(K1, sessionVector, labelFileEnc);
  const KSesSDMFileReadMAC = deriveKey(K2, sessionVector, labelFileReadMAC);

  return {
    KSesSDMFileReadMAC,
    KSesSDMFileEnc
  };
}

/**
 * Derive authentication session keys (for future use if implementing full auth)
 */
export interface AuthSessionKeys {
  KSesAuth: Uint8Array;         // For authentication
  KSesSDMFileReadMAC: Uint8Array;
  KSesSDMFileEnc: Uint8Array;
}

/**
 * Derive all session keys including authentication keys
 * (For future expansion to support authenticated operations)
 */
export function deriveAuthSessionKeys(
  K0: Uint8Array,
  K1: Uint8Array,
  K2: Uint8Array,
  sv: Uint8Array
): AuthSessionKeys {
  const labelAuth = new TextEncoder().encode('SDMSesAuthENC');
  const labelFileEnc = new TextEncoder().encode('SDMENCFileData');
  const labelFileReadMAC = new TextEncoder().encode('SDMFileReadMAC');

  const KSesAuth = deriveKey(K0, sv, labelAuth);
  const KSesSDMFileEnc = deriveKey(K1, sv, labelFileEnc);
  const KSesSDMFileReadMAC = deriveKey(K2, sv, labelFileReadMAC);

  return {
    KSesAuth,
    KSesSDMFileReadMAC,
    KSesSDMFileEnc
  };
}

/**
 * Generate a zero session vector (for unauthenticated SDM)
 */
export function generateZeroSV(): Uint8Array {
  return new Uint8Array(16);
}
