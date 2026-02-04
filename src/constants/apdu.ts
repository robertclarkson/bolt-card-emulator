/**
 * APDU (Application Protocol Data Unit) constants
 * ISO/IEC 7816-4 command structure
 */

/**
 * APDU Class bytes
 */
export const CLA = {
  ISO7816: 0x00,         // Standard ISO 7816 class
  PROPRIETARY: 0x90,     // Proprietary class
} as const;

/**
 * APDU Instruction bytes
 */
export const INS = {
  SELECT: 0xA4,          // SELECT FILE
  READ_BINARY: 0xB0,     // READ BINARY
  UPDATE_BINARY: 0xD6,   // UPDATE BINARY
  GET_DATA: 0xCA,        // GET DATA
  READ_RECORDS: 0xB2,    // READ RECORDS
  AUTHENTICATE: 0xAF,    // AUTHENTICATE (NTAG424 specific)
  GET_VERSION: 0x60,     // GET VERSION
} as const;

/**
 * APDU P1 values for SELECT command
 */
export const P1_SELECT = {
  BY_FILE_ID: 0x00,      // Select by file identifier
  BY_DF_NAME: 0x04,      // Select by DF (dedicated file) name / AID
} as const;

/**
 * APDU P2 values for SELECT command
 */
export const P2_SELECT = {
  FIRST_OR_ONLY: 0x00,   // First or only occurrence
  RETURN_FCI: 0x00,      // Return File Control Information
  NO_RESPONSE: 0x0C,     // No response data
} as const;

/**
 * APDU Status Words (SW1 SW2)
 */
export const SW = {
  SUCCESS: 0x9000,                    // Success
  NO_ERROR: 0x9000,                   // No error
  MORE_DATA_AVAILABLE: 0x6100,        // More data available (0x61XX)
  WRONG_LENGTH: 0x6700,               // Wrong length
  SECURITY_STATUS_NOT_SATISFIED: 0x6982,  // Security status not satisfied
  FILE_NOT_FOUND: 0x6A82,             // File or application not found
  WRONG_PARAMETERS: 0x6A86,           // Wrong parameters P1-P2
  INSTRUCTION_NOT_SUPPORTED: 0x6D00,  // Instruction not supported
  CLA_NOT_SUPPORTED: 0x6E00,          // Class not supported
  UNKNOWN_ERROR: 0x6F00,              // Unknown error
  FUNCTION_NOT_SUPPORTED: 0x6A81,     // Function not supported
  COMMAND_ABORTED: 0x6F00,            // Command aborted
} as const;

/**
 * Convert status word to bytes [SW1, SW2]
 */
export function statusWordToBytes(sw: number): Uint8Array {
  return new Uint8Array([
    (sw >> 8) & 0xFF,  // SW1
    sw & 0xFF          // SW2
  ]);
}

/**
 * Convert status word bytes to number
 */
export function bytesToStatusWord(sw1: number, sw2: number): number {
  return (sw1 << 8) | sw2;
}

/**
 * Check if status word indicates success
 */
export function isSuccess(sw: number): boolean {
  return sw === SW.SUCCESS || sw === SW.NO_ERROR;
}

/**
 * Get status word description
 */
export function getStatusWordDescription(sw: number): string {
  switch (sw) {
    case SW.SUCCESS:
      return 'Success';
    case SW.WRONG_LENGTH:
      return 'Wrong length';
    case SW.SECURITY_STATUS_NOT_SATISFIED:
      return 'Security status not satisfied';
    case SW.FILE_NOT_FOUND:
      return 'File or application not found';
    case SW.WRONG_PARAMETERS:
      return 'Wrong parameters P1-P2';
    case SW.INSTRUCTION_NOT_SUPPORTED:
      return 'Instruction not supported';
    case SW.CLA_NOT_SUPPORTED:
      return 'Class not supported';
    case SW.UNKNOWN_ERROR:
      return 'Unknown error';
    case SW.FUNCTION_NOT_SUPPORTED:
      return 'Function not supported';
    default:
      if ((sw & 0xFF00) === 0x6100) {
        return `More data available (${sw & 0xFF} bytes)`;
      }
      return `Unknown status (0x${sw.toString(16).toUpperCase().padStart(4, '0')})`;
  }
}
