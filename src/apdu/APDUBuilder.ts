/**
 * APDU Response Builder
 * Builds APDU responses with status words
 */

import { APDUResponse } from '../types/apdu.types';
import { SW, statusWordToBytes } from '../constants/apdu';

/**
 * Build a success APDU response with data
 */
export function buildSuccessResponse(data?: Uint8Array): APDUResponse {
  return {
    data,
    SW1: (SW.SUCCESS >> 8) & 0xFF,
    SW2: SW.SUCCESS & 0xFF,
  };
}

/**
 * Build an error APDU response
 */
export function buildErrorResponse(statusWord: number): APDUResponse {
  return {
    SW1: (statusWord >> 8) & 0xFF,
    SW2: statusWord & 0xFF,
  };
}

/**
 * Build a custom APDU response
 */
export function buildResponse(data: Uint8Array | undefined, statusWord: number): APDUResponse {
  return {
    data,
    SW1: (statusWord >> 8) & 0xFF,
    SW2: statusWord & 0xFF,
  };
}

/**
 * Serialize APDU response to bytes
 */
export function serializeResponse(response: APDUResponse): Uint8Array {
  const swBytes = new Uint8Array([response.SW1, response.SW2]);

  if (response.data && response.data.length > 0) {
    const result = new Uint8Array(response.data.length + 2);
    result.set(response.data, 0);
    result.set(swBytes, response.data.length);
    return result;
  }

  return swBytes;
}

/**
 * Parse APDU response from bytes
 */
export function parseResponse(bytes: Uint8Array): APDUResponse {
  if (bytes.length < 2) {
    throw new Error('Invalid APDU response: too short');
  }

  const SW1 = bytes[bytes.length - 2];
  const SW2 = bytes[bytes.length - 1];

  const data = bytes.length > 2 ? bytes.slice(0, bytes.length - 2) : undefined;

  return { data, SW1, SW2 };
}

/**
 * Get response status word as a single number
 */
export function getStatusWord(response: APDUResponse): number {
  return (response.SW1 << 8) | response.SW2;
}
