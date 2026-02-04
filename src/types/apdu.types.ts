/**
 * APDU (Application Protocol Data Unit) type definitions
 */

/**
 * APDU Command structure (C-APDU)
 */
export interface APDUCommand {
  CLA: number;           // Class byte
  INS: number;           // Instruction byte
  P1: number;            // Parameter 1
  P2: number;            // Parameter 2
  Lc?: number;           // Command data length
  data?: Uint8Array;     // Command data
  Le?: number;           // Expected response data length
}

/**
 * APDU Response structure (R-APDU)
 */
export interface APDUResponse {
  data?: Uint8Array;     // Response data
  SW1: number;           // Status word 1
  SW2: number;           // Status word 2
}

/**
 * Parsed APDU with status word
 */
export interface ParsedAPDU {
  command: APDUCommand;
  raw: Uint8Array;
}

/**
 * APDU handler function type
 */
export type APDUHandler = (command: APDUCommand) => APDUResponse;

/**
 * APDU log entry for debugging
 */
export interface APDULogEntry {
  timestamp: number;
  direction: 'incoming' | 'outgoing';
  command?: APDUCommand;
  response?: APDUResponse;
  raw: Uint8Array;
  description?: string;
}
