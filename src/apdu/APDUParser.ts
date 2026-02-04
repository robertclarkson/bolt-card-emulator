/**
 * APDU Command Parser
 * Parses raw APDU bytes into structured command objects
 */

import { APDUCommand } from '../types/apdu.types';

/**
 * Parse raw APDU command bytes
 *
 * APDU structure:
 * Case 1: CLA INS P1 P2 (no data, no response expected)
 * Case 2: CLA INS P1 P2 Le (no data, response expected)
 * Case 3: CLA INS P1 P2 Lc Data (data sent, no response expected)
 * Case 4: CLA INS P1 P2 Lc Data Le (data sent, response expected)
 *
 * @param bytes - Raw APDU command bytes
 * @returns Parsed APDU command
 */
export function parseAPDU(bytes: Uint8Array): APDUCommand {
  if (bytes.length < 4) {
    throw new Error(`Invalid APDU: too short (${bytes.length} bytes)`);
  }

  const command: APDUCommand = {
    CLA: bytes[0],
    INS: bytes[1],
    P1: bytes[2],
    P2: bytes[3],
  };

  // Parse remaining bytes based on APDU case
  if (bytes.length === 4) {
    // Case 1: No data, no Le
    return command;
  }

  if (bytes.length === 5) {
    // Case 2: Le only (no data)
    command.Le = bytes[4];
    return command;
  }

  // Case 3 or 4: Has Lc and possibly data
  const Lc = bytes[4];
  command.Lc = Lc;

  if (bytes.length < 5 + Lc) {
    throw new Error(`Invalid APDU: Lc=${Lc} but only ${bytes.length - 5} data bytes`);
  }

  // Extract data if Lc > 0
  if (Lc > 0) {
    command.data = bytes.slice(5, 5 + Lc);
  }

  // Check for Le after data
  if (bytes.length > 5 + Lc) {
    command.Le = bytes[5 + Lc];
  }

  return command;
}

/**
 * Get APDU command description for debugging
 */
export function getAPDUDescription(command: APDUCommand): string {
  const insNames: Record<number, string> = {
    0xA4: 'SELECT',
    0xB0: 'READ BINARY',
    0xD6: 'UPDATE BINARY',
    0xCA: 'GET DATA',
    0xB2: 'READ RECORDS',
    0xAF: 'AUTHENTICATE',
    0x60: 'GET VERSION',
  };

  const insName = insNames[command.INS] || `INS_0x${command.INS.toString(16).toUpperCase()}`;

  let desc = `${insName} (CLA=0x${command.CLA.toString(16).toUpperCase().padStart(2, '0')}`;
  desc += `, P1=0x${command.P1.toString(16).toUpperCase().padStart(2, '0')}`;
  desc += `, P2=0x${command.P2.toString(16).toUpperCase().padStart(2, '0')}`;

  if (command.Lc !== undefined) {
    desc += `, Lc=${command.Lc}`;
  }

  if (command.Le !== undefined) {
    desc += `, Le=${command.Le}`;
  }

  desc += ')';

  return desc;
}

/**
 * Serialize APDU command to bytes (for testing)
 */
export function serializeAPDU(command: APDUCommand): Uint8Array {
  const parts: number[] = [command.CLA, command.INS, command.P1, command.P2];

  if (command.data && command.data.length > 0) {
    parts.push(command.data.length); // Lc
    parts.push(...Array.from(command.data));
  }

  if (command.Le !== undefined) {
    parts.push(command.Le);
  }

  return new Uint8Array(parts);
}
