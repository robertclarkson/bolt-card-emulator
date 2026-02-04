/**
 * Crypto Service
 * Handles key generation and cryptographic operations
 */

import * as Crypto from 'expo-crypto';
import { NTAG424Keys } from '../types/ntag424.types';
import { hexToBytes, bytesToHex } from '../crypto/utils';

/**
 * Generate new NTAG424 keys for a Bolt Card
 *
 * Generates:
 * - K0: Master/Authentication key (16 bytes)
 * - K1: Encryption key - SDMMetaReadKey (16 bytes)
 * - K2: MAC key - SDMFileReadKey (16 bytes)
 * - UID: Unique identifier (7 bytes)
 */
export async function generateKeys(): Promise<NTAG424Keys> {
  // Generate random keys using expo-crypto
  const K0 = await Crypto.getRandomBytesAsync(16);
  const K1 = await Crypto.getRandomBytesAsync(16);
  const K2 = await Crypto.getRandomBytesAsync(16);

  // Generate UID (7 bytes)
  // First byte should be 0x04 for NXP tags (manufacturer code)
  const uidRandom = await Crypto.getRandomBytesAsync(6);
  const UID = new Uint8Array([0x04, ...uidRandom]);

  return {
    K0: new Uint8Array(K0),
    K1: new Uint8Array(K1),
    K2: new Uint8Array(K2),
    UID
  };
}

/**
 * Export keys to hex strings for storage/display
 */
export function exportKeysToHex(keys: NTAG424Keys): {
  K0: string;
  K1: string;
  K2: string;
  UID: string;
} {
  return {
    K0: bytesToHex(keys.K0),
    K1: bytesToHex(keys.K1),
    K2: bytesToHex(keys.K2),
    UID: bytesToHex(keys.UID)
  };
}

/**
 * Import keys from hex strings
 */
export function importKeysFromHex(hexKeys: {
  K0: string;
  K1: string;
  K2: string;
  UID: string;
}): NTAG424Keys {
  return {
    K0: hexToBytes(hexKeys.K0),
    K1: hexToBytes(hexKeys.K1),
    K2: hexToBytes(hexKeys.K2),
    UID: hexToBytes(hexKeys.UID)
  };
}

/**
 * Validate keys
 */
export function validateKeys(keys: NTAG424Keys): boolean {
  return (
    keys.K0.length === 16 &&
    keys.K1.length === 16 &&
    keys.K2.length === 16 &&
    keys.UID.length === 7
  );
}

/**
 * Generate a random card ID
 */
export async function generateCardId(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return bytesToHex(new Uint8Array(bytes));
}
