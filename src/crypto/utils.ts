/**
 * Crypto utility functions for hex conversion, padding, and byte manipulation
 */

/**
 * Convert hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  // Remove any spaces or special characters
  hex = hex.replace(/[^0-9A-Fa-f]/g, '');

  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have even length');
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * XOR two Uint8Arrays
 */
export function xor(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.length !== b.length) {
    throw new Error('Arrays must be same length for XOR');
  }

  const result = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i];
  }
  return result;
}

/**
 * Left shift a byte array by 1 bit (for CMAC subkey generation)
 */
export function leftShift(data: Uint8Array): Uint8Array {
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
 * Pad data to block size using PKCS#7 padding
 */
export function pad(data: Uint8Array, blockSize: number): Uint8Array {
  const paddingLength = blockSize - (data.length % blockSize);
  const padded = new Uint8Array(data.length + paddingLength);
  padded.set(data);

  // PKCS#7 padding: fill with padding length value
  for (let i = data.length; i < padded.length; i++) {
    padded[i] = paddingLength;
  }

  return padded;
}

/**
 * Remove PKCS#7 padding
 */
export function unpad(data: Uint8Array): Uint8Array {
  const paddingLength = data[data.length - 1];

  // Validate padding
  for (let i = data.length - paddingLength; i < data.length; i++) {
    if (data[i] !== paddingLength) {
      throw new Error('Invalid PKCS#7 padding');
    }
  }

  return data.slice(0, data.length - paddingLength);
}

/**
 * Concatenate multiple Uint8Arrays
 */
export function concat(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }

  return result;
}

/**
 * Convert number to Uint8Array with specified byte length (big-endian)
 */
export function numberToBytes(num: number, byteLength: number): Uint8Array {
  const bytes = new Uint8Array(byteLength);
  for (let i = byteLength - 1; i >= 0; i--) {
    bytes[i] = num & 0xFF;
    num = num >> 8;
  }
  return bytes;
}

/**
 * Convert Uint8Array to number (big-endian)
 */
export function bytesToNumber(bytes: Uint8Array): number {
  let num = 0;
  for (let i = 0; i < bytes.length; i++) {
    num = (num << 8) | bytes[i];
  }
  return num;
}

/**
 * Increment a counter (3 bytes for NTAG424 DNA)
 */
export function incrementCounter(counter: Uint8Array): Uint8Array {
  const result = new Uint8Array(counter);

  // Increment from least significant byte
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i] === 0xFF) {
      result[i] = 0x00;
    } else {
      result[i]++;
      break;
    }
  }

  return result;
}

/**
 * Generate random bytes
 */
export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);

  // Use crypto.getRandomValues if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback to Math.random (not cryptographically secure)
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return bytes;
}
