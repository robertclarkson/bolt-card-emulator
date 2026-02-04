/**
 * READ BINARY Command Handler
 * Handles reading NDEF data with SDM (Secure Dynamic Messaging)
 */

import { APDUCommand, APDUResponse } from '../../types/apdu.types';
import { buildSuccessResponse, buildErrorResponse } from '../APDUBuilder';
import { SW } from '../../constants/apdu';
import { FILE_ID, MEMORY } from '../../constants/ntag424';
import { getReadOffset, getReadLength } from '../commands';

/**
 * Handle READ BINARY command
 */
export function handleReadBinary(
  command: APDUCommand,
  selectedFileId: number | null,
  getNDEFData: () => Uint8Array,
  onCounterIncrement?: () => void
): APDUResponse {
  // Check if a file is selected
  if (selectedFileId === null) {
    return buildErrorResponse(SW.SECURITY_STATUS_NOT_SATISFIED);
  }

  // Get read parameters
  const offset = getReadOffset(command);
  const length = getReadLength(command);

  // Only support reading NDEF file (File 02)
  if (selectedFileId === FILE_ID.CC) {
    // Read Capability Container
    return handleReadCC(offset, length);
  }

  if (selectedFileId === FILE_ID.NDEF) {
    // Read NDEF file with SDM
    // Increment counter on first read (offset 0)
    if (offset === 0 && onCounterIncrement) {
      onCounterIncrement();
    }

    return handleReadNDEF(offset, length, getNDEFData);
  }

  // File not supported
  return buildErrorResponse(SW.FILE_NOT_FOUND);
}

/**
 * Handle reading Capability Container (CC)
 */
function handleReadCC(offset: number, length: number): APDUResponse {
  // NDEF Capability Container structure
  // See NFC Forum Type 4 Tag specification
  const cc = new Uint8Array([
    0xE1,        // NDEF Magic Number
    0x40,        // Version 4.0 (0x40 = version 4.0)
    0x00, 0x40,  // Maximum data size (64 bytes - example, adjust as needed)
    0x00,        // Read access (0x00 = free)
    0x00,        // Write access (0x00 = free)
  ]);

  // Extract requested portion
  const endOffset = Math.min(offset + length, cc.length);

  if (offset >= cc.length) {
    // Reading beyond end of file
    return buildSuccessResponse(new Uint8Array(0));
  }

  const data = cc.slice(offset, endOffset);
  return buildSuccessResponse(data);
}

/**
 * Handle reading NDEF file with SDM
 */
function handleReadNDEF(
  offset: number,
  length: number,
  getNDEFData: () => Uint8Array
): APDUResponse {
  // Get current NDEF data (includes SDM-generated content)
  const ndefData = getNDEFData();

  // Extract requested portion
  const endOffset = Math.min(offset + length, ndefData.length);

  if (offset >= ndefData.length) {
    // Reading beyond end of file
    return buildSuccessResponse(new Uint8Array(0));
  }

  const data = ndefData.slice(offset, endOffset);
  return buildSuccessResponse(data);
}
