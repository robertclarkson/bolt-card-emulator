/**
 * SELECT Command Handler
 * Handles SELECT AID and SELECT File commands
 */

import { APDUCommand, APDUResponse } from '../../types/apdu.types';
import { buildSuccessResponse, buildErrorResponse } from '../APDUBuilder';
import { SW } from '../../constants/apdu';
import { NTAG424_AID, FILE_ID } from '../../constants/ntag424';
import { getSelectAID, getSelectFileID, bytesEqual } from '../commands';

/**
 * Handle SELECT command
 */
export function handleSelect(
  command: APDUCommand,
  onFileSelected?: (fileId: number) => void
): APDUResponse {
  // Check if selecting by AID
  const aid = getSelectAID(command);
  if (aid) {
    return handleSelectByAID(aid);
  }

  // Check if selecting by file ID
  const fileId = getSelectFileID(command);
  if (fileId !== null) {
    const response = handleSelectByFileID(fileId);

    // Notify about file selection
    if (response.SW1 === 0x90 && response.SW2 === 0x00 && onFileSelected) {
      onFileSelected(fileId);
    }

    return response;
  }

  // Invalid SELECT command
  return buildErrorResponse(SW.WRONG_PARAMETERS);
}

/**
 * Handle SELECT by AID (application selection)
 */
function handleSelectByAID(aid: Uint8Array): APDUResponse {
  // Check if AID matches NTAG424 DNA NDEF application
  if (bytesEqual(aid, NTAG424_AID)) {
    // Successfully selected NDEF application
    // Some readers expect FCI (File Control Information) in response
    // For simplicity, we'll return success without FCI
    return buildSuccessResponse();
  }

  // AID not found
  return buildErrorResponse(SW.FILE_NOT_FOUND);
}

/**
 * Handle SELECT by file ID
 */
function handleSelectByFileID(fileId: number): APDUResponse {
  // Validate file ID
  const validFileIds: number[] = [FILE_ID.CC, FILE_ID.NDEF, FILE_ID.PROPRIETARY];

  if (!validFileIds.includes(fileId)) {
    return buildErrorResponse(SW.FILE_NOT_FOUND);
  }

  // File found and selected
  return buildSuccessResponse();
}

/**
 * Create File Control Information (FCI) response
 * Some readers may expect this, but most work without it
 */
function createFCI(fileId: number): Uint8Array {
  // Basic FCI template (tag 6F)
  // Format: 6F [length] 84 [AID length] [AID] A5 [proprietary data length] [data]

  // For now, return minimal FCI
  // In a full implementation, this would include file size, access conditions, etc.
  const fci = new Uint8Array([
    0x6F,  // FCI template tag
    0x00,  // Length (to be filled)
    // Would contain: file descriptor, file identifier, proprietary info, etc.
  ]);

  return fci;
}
