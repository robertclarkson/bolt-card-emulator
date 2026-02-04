/**
 * APDU command type definitions and helpers
 */

import { APDUCommand } from '../types/apdu.types';
import { INS, CLA, P1_SELECT } from '../constants/apdu';

/**
 * Check if command is a SELECT command
 */
export function isSelectCommand(command: APDUCommand): boolean {
  return command.INS === INS.SELECT;
}

/**
 * Check if command is SELECT by AID (application)
 */
export function isSelectByAID(command: APDUCommand): boolean {
  return isSelectCommand(command) && command.P1 === P1_SELECT.BY_DF_NAME;
}

/**
 * Check if command is SELECT by file ID
 */
export function isSelectByFileID(command: APDUCommand): boolean {
  return isSelectCommand(command) && command.P1 === P1_SELECT.BY_FILE_ID;
}

/**
 * Check if command is a READ BINARY command
 */
export function isReadBinaryCommand(command: APDUCommand): boolean {
  return command.INS === INS.READ_BINARY;
}

/**
 * Check if command is an UPDATE BINARY command
 */
export function isUpdateBinaryCommand(command: APDUCommand): boolean {
  return command.INS === INS.UPDATE_BINARY;
}

/**
 * Check if command is an AUTHENTICATE command
 */
export function isAuthenticateCommand(command: APDUCommand): boolean {
  return command.INS === INS.AUTHENTICATE;
}

/**
 * Extract file offset from READ BINARY command (P1 P2)
 */
export function getReadOffset(command: APDUCommand): number {
  if (!isReadBinaryCommand(command)) {
    throw new Error('Not a READ BINARY command');
  }

  // Offset is encoded in P1 P2 (big-endian)
  // P1 = MSB, P2 = LSB
  return (command.P1 << 8) | command.P2;
}

/**
 * Extract requested length from READ BINARY command (Le)
 */
export function getReadLength(command: APDUCommand): number {
  if (!isReadBinaryCommand(command)) {
    throw new Error('Not a READ BINARY command');
  }

  // Le = 0x00 means 256 bytes
  return command.Le === 0 ? 256 : (command.Le || 0);
}

/**
 * Extract AID from SELECT command data
 */
export function getSelectAID(command: APDUCommand): Uint8Array | null {
  if (!isSelectByAID(command)) {
    return null;
  }

  return command.data || null;
}

/**
 * Extract file ID from SELECT command
 */
export function getSelectFileID(command: APDUCommand): number | null {
  if (!isSelectByFileID(command)) {
    return null;
  }

  if (!command.data || command.data.length === 0) {
    return null;
  }

  // File ID is typically 2 bytes, but we'll support 1 byte as well
  if (command.data.length === 1) {
    return command.data[0];
  }

  // Big-endian
  return (command.data[0] << 8) | command.data[1];
}

/**
 * Compare two byte arrays for equality
 */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}
