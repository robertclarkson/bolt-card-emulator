/**
 * AES-128 encryption/decryption operations for NTAG424 DNA emulation
 * Uses AES in ECB and CTR modes
 */

import CryptoJS from 'crypto-js';
import { bytesToHex, hexToBytes, concat } from './utils';

/**
 * AES-128 ECB encryption (used for CMAC and basic operations)
 */
export function aesEncryptECB(key: Uint8Array, data: Uint8Array): Uint8Array {
  if (key.length !== 16) {
    throw new Error('Key must be 16 bytes for AES-128');
  }

  if (data.length % 16 !== 0) {
    throw new Error('Data must be multiple of 16 bytes for ECB mode');
  }

  // Convert to CryptoJS format
  const keyWords = CryptoJS.enc.Hex.parse(bytesToHex(key));
  const dataWords = CryptoJS.enc.Hex.parse(bytesToHex(data));

  // Encrypt using ECB mode
  const encrypted = CryptoJS.AES.encrypt(dataWords, keyWords, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding
  });

  // Convert back to Uint8Array
  return hexToBytes(encrypted.ciphertext.toString(CryptoJS.enc.Hex));
}

/**
 * AES-128 ECB decryption
 */
export function aesDecryptECB(key: Uint8Array, data: Uint8Array): Uint8Array {
  if (key.length !== 16) {
    throw new Error('Key must be 16 bytes for AES-128');
  }

  if (data.length % 16 !== 0) {
    throw new Error('Data must be multiple of 16 bytes for ECB mode');
  }

  // Convert to CryptoJS format
  const keyWords = CryptoJS.enc.Hex.parse(bytesToHex(key));
  const ciphertext = CryptoJS.enc.Hex.parse(bytesToHex(data));

  // Decrypt using ECB mode
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: ciphertext } as any,
    keyWords,
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
    }
  );

  // Convert back to Uint8Array
  return hexToBytes(decrypted.toString(CryptoJS.enc.Hex));
}

/**
 * AES-128 CTR (Counter) mode encryption for SDM PICCData
 * This is used to encrypt UID + Counter in NTAG424 DNA SDM
 */
export function aesEncryptCTR(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Uint8Array {
  if (key.length !== 16) {
    throw new Error('Key must be 16 bytes for AES-128');
  }

  if (iv.length !== 16) {
    throw new Error('IV must be 16 bytes for CTR mode');
  }

  // Convert to CryptoJS format
  const keyWords = CryptoJS.enc.Hex.parse(bytesToHex(key));
  const dataWords = CryptoJS.enc.Hex.parse(bytesToHex(data));
  const ivWords = CryptoJS.enc.Hex.parse(bytesToHex(iv));

  // Encrypt using CTR mode
  const encrypted = CryptoJS.AES.encrypt(dataWords, keyWords, {
    iv: ivWords,
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.NoPadding
  });

  // Convert back to Uint8Array
  const result = hexToBytes(encrypted.ciphertext.toString(CryptoJS.enc.Hex));

  // CTR mode output might be longer than input due to block alignment
  // Truncate to original data length
  return result.slice(0, data.length);
}

/**
 * AES-128 CTR mode decryption
 */
export function aesDecryptCTR(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Uint8Array {
  // CTR mode: encryption and decryption are the same operation
  return aesEncryptCTR(key, iv, data);
}

/**
 * Encrypt a single AES block (16 bytes) - used in CMAC
 */
export function aesEncryptBlock(key: Uint8Array, block: Uint8Array): Uint8Array {
  if (block.length !== 16) {
    throw new Error('Block must be exactly 16 bytes');
  }
  return aesEncryptECB(key, block);
}

/**
 * Generate AES subkeys for CMAC (K1 and K2)
 * Per NIST SP 800-38B
 */
export function generateCMACSubkeys(key: Uint8Array): { K1: Uint8Array; K2: Uint8Array } {
  // Constant Rb for 128-bit blocks
  const Rb = new Uint8Array(16);
  Rb[15] = 0x87;

  // Step 1: L = AES(K, 0^128)
  const zeroBlock = new Uint8Array(16);
  const L = aesEncryptBlock(key, zeroBlock);

  // Step 2: K1 = L << 1
  let K1 = leftShiftOne(L);

  // If MSB of L is 1, XOR with Rb
  if (L[0] & 0x80) {
    K1 = xorBytes(K1, Rb);
  }

  // Step 3: K2 = K1 << 1
  let K2 = leftShiftOne(K1);

  // If MSB of K1 is 1, XOR with Rb
  if (K1[0] & 0x80) {
    K2 = xorBytes(K2, Rb);
  }

  return { K1, K2 };
}

/**
 * Left shift a byte array by 1 bit (helper for CMAC)
 */
function leftShiftOne(data: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  let carry = 0;

  for (let i = data.length - 1; i >= 0; i--) {
    const newCarry = (data[i] & 0x80) >> 7;
    result[i] = ((data[i] << 1) | carry) & 0xFF;
    carry = newCarry;
  }

  return result;
}

/**
 * XOR two byte arrays (helper)
 */
function xorBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.length !== b.length) {
    throw new Error('Arrays must be same length for XOR');
  }

  const result = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i];
  }
  return result;
}
