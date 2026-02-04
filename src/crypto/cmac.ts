/**
 * AES-CMAC (Cipher-based Message Authentication Code) implementation
 * Per NIST Special Publication 800-38B
 *
 * Used in NTAG424 DNA for:
 * - SDM MAC generation (8-byte truncated CMAC)
 * - Session key derivation (CMAC as PRF)
 */

import { aesEncryptBlock, generateCMACSubkeys } from './aes';
import { xor, pad } from './utils';

/**
 * Calculate AES-CMAC
 *
 * @param key - 16-byte AES-128 key
 * @param message - Message to authenticate
 * @returns 16-byte CMAC tag
 */
export function cmac(key: Uint8Array, message: Uint8Array): Uint8Array {
  if (key.length !== 16) {
    throw new Error('Key must be 16 bytes for AES-128 CMAC');
  }

  const blockSize = 16;

  // Step 1: Generate subkeys K1 and K2
  const { K1, K2 } = generateCMACSubkeys(key);

  // Step 2: Process the message
  let numBlocks: number;
  let lastBlockComplete: boolean;

  if (message.length === 0) {
    numBlocks = 1;
    lastBlockComplete = false;
  } else {
    numBlocks = Math.ceil(message.length / blockSize);
    lastBlockComplete = (message.length % blockSize === 0);
  }

  // Step 3: Prepare the last block
  let lastBlock: Uint8Array;

  if (lastBlockComplete) {
    // If last block is complete, XOR with K1
    const lastBlockStart = (numBlocks - 1) * blockSize;
    lastBlock = message.slice(lastBlockStart);
    lastBlock = xor(lastBlock, K1);
  } else {
    // If last block is incomplete, pad with 10...0 and XOR with K2
    const lastBlockStart = (numBlocks - 1) * blockSize;
    const lastBlockData = message.slice(lastBlockStart);

    // Padding: append 0x80 followed by zeros
    const paddingLength = blockSize - lastBlockData.length;
    const padded = new Uint8Array(blockSize);
    padded.set(lastBlockData);
    padded[lastBlockData.length] = 0x80;
    // Remaining bytes are already 0

    lastBlock = xor(padded, K2);
  }

  // Step 4: Apply CBC-MAC
  let mac: Uint8Array = new Uint8Array(blockSize); // Initialize to zero block

  // Process all blocks except the last
  for (let i = 0; i < numBlocks - 1; i++) {
    const block = message.slice(i * blockSize, (i + 1) * blockSize);
    const xored = xor(mac, block);
    mac = new Uint8Array(aesEncryptBlock(key, xored));
  }

  // Process the last block
  const xored = xor(mac, lastBlock);
  mac = new Uint8Array(aesEncryptBlock(key, xored));

  return mac;
}

/**
 * Calculate truncated CMAC (8 bytes) for SDM
 * NTAG424 DNA uses 8-byte MAC in SDM messages
 *
 * @param key - 16-byte AES-128 key
 * @param message - Message to authenticate
 * @returns 8-byte truncated CMAC
 */
export function cmacSDM(key: Uint8Array, message: Uint8Array): Uint8Array {
  const fullCmac = cmac(key, message);

  // Return first 8 bytes (truncation per NTAG424 spec)
  return fullCmac.slice(0, 8);
}

/**
 * CMAC-based PRF (Pseudo Random Function) for key derivation
 * Used in NIST SP 800-108 KDF (Key Derivation Function)
 *
 * PRF(K, S) = CMAC(K, S)
 *
 * @param key - PRF key
 * @param data - Input data
 * @returns PRF output (16 bytes)
 */
export function cmacPRF(key: Uint8Array, data: Uint8Array): Uint8Array {
  return cmac(key, data);
}

/**
 * Verify CMAC
 *
 * @param key - 16-byte AES-128 key
 * @param message - Message to verify
 * @param tag - CMAC tag to verify against
 * @returns true if valid, false otherwise
 */
export function verifyCMAC(key: Uint8Array, message: Uint8Array, tag: Uint8Array): boolean {
  const calculatedTag = cmac(key, message);

  // Constant-time comparison to prevent timing attacks
  if (calculatedTag.length !== tag.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < calculatedTag.length; i++) {
    diff |= calculatedTag[i] ^ tag[i];
  }

  return diff === 0;
}
