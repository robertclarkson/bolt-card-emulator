/**
 * NTAG424 Service
 * Main APDU handler and NTAG424 DNA state coordinator
 */

import { APDUCommand, APDUResponse } from '../types/apdu.types';
import { NTAG424State, NTAG424Keys } from '../types/ntag424.types';
import { parseAPDU, getAPDUDescription } from '../apdu/APDUParser';
import { serializeResponse, buildErrorResponse } from '../apdu/APDUBuilder';
import { handleSelect } from '../apdu/handlers/SelectHandler';
import { handleReadBinary } from '../apdu/handlers/ReadHandler';
import { isSelectCommand, isReadBinaryCommand } from '../apdu/commands';
import { SW } from '../constants/apdu';
import { FILE_ID } from '../constants/ntag424';
import { generateNDEFWithSDM } from './SDMService';
import { incrementCounter as incrementStorageCounter } from './StorageService';
import { bytesToHex, hexToBytes, incrementCounter, numberToBytes } from '../crypto/utils';

/**
 * NTAG424 Service class
 */
export class NTAG424Service {
  private state: NTAG424State;
  private keys: NTAG424Keys;
  private lnurlBase: string;
  private cardId: string;
  private onLog?: (message: string, data?: any) => void;

  constructor(
    keys: NTAG424Keys,
    lnurlBase: string,
    cardId: string,
    counterValue: number = 0,
    onLog?: (message: string, data?: any) => void
  ) {
    this.keys = keys;
    this.lnurlBase = lnurlBase;
    this.cardId = cardId;
    this.onLog = onLog;

    // Initialize state
    this.state = {
      selectedFileId: null,
      authenticated: false,
      counter: numberToBytes(counterValue, 3),
      files: new Map()
    };

    this.log('NTAG424Service initialized', {
      uid: bytesToHex(keys.UID),
      counter: counterValue
    });
  }

  /**
   * Process incoming APDU command
   */
  public processAPDU(commandBytes: Uint8Array): Uint8Array {
    try {
      // Parse APDU command
      const command = parseAPDU(commandBytes);
      this.log(`Incoming APDU: ${getAPDUDescription(command)}`, {
        raw: bytesToHex(commandBytes)
      });

      // Route to appropriate handler
      let response: APDUResponse;

      if (isSelectCommand(command)) {
        response = this.handleSelectCommand(command);
      } else if (isReadBinaryCommand(command)) {
        response = this.handleReadCommand(command);
      } else {
        // Unsupported command
        this.log(`Unsupported command: INS=0x${command.INS.toString(16)}`);
        response = buildErrorResponse(SW.INSTRUCTION_NOT_SUPPORTED);
      }

      // Serialize response
      const responseBytes = serializeResponse(response);
      this.log(`Outgoing response: SW=${bytesToHex(new Uint8Array([response.SW1, response.SW2]))}`, {
        raw: bytesToHex(responseBytes),
        dataLength: response.data?.length || 0
      });

      return responseBytes;

    } catch (error) {
      this.log(`Error processing APDU: ${error}`, { error });
      return serializeResponse(buildErrorResponse(SW.UNKNOWN_ERROR));
    }
  }

  /**
   * Handle SELECT command
   */
  private handleSelectCommand(command: APDUCommand): APDUResponse {
    return handleSelect(command, (fileId) => {
      this.state.selectedFileId = fileId;
      this.log(`File selected: ${fileId}`);
    });
  }

  /**
   * Handle READ BINARY command
   */
  private handleReadCommand(command: APDUCommand): APDUResponse {
    return handleReadBinary(
      command,
      this.state.selectedFileId,
      () => this.generateNDEFData(),
      () => this.handleCounterIncrement()
    );
  }

  /**
   * Generate NDEF data with SDM
   */
  private generateNDEFData(): Uint8Array {
    const ndefData = generateNDEFWithSDM(
      this.keys.UID,
      this.state.counter,
      this.keys.K1,
      this.keys.K2,
      this.lnurlBase,
      this.cardId
    );

    this.log('Generated NDEF with SDM', {
      size: ndefData.length,
      counter: bytesToHex(this.state.counter)
    });

    return ndefData;
  }

  /**
   * Handle counter increment
   */
  private handleCounterIncrement(): void {
    // Increment counter
    this.state.counter = incrementCounter(this.state.counter);

    this.log('Counter incremented', {
      counter: bytesToHex(this.state.counter)
    });

    // Persist to storage (async, don't wait)
    incrementStorageCounter().catch((error) => {
      this.log('Failed to persist counter', { error });
    });
  }

  /**
   * Update keys
   */
  public updateKeys(keys: NTAG424Keys): void {
    this.keys = keys;
    this.log('Keys updated');
  }

  /**
   * Update LNURL configuration
   */
  public updateLNURL(lnurlBase: string, cardId: string): void {
    this.lnurlBase = lnurlBase;
    this.cardId = cardId;
    this.log('LNURL configuration updated', { lnurlBase, cardId });
  }

  /**
   * Update counter
   */
  public updateCounter(counterValue: number): void {
    this.state.counter = numberToBytes(counterValue, 3);
    this.log('Counter updated', { counter: counterValue });
  }

  /**
   * Get current state
   */
  public getState(): NTAG424State {
    return { ...this.state };
  }

  /**
   * Log message
   */
  private log(message: string, data?: any): void {
    if (this.onLog) {
      this.onLog(message, data);
    }
  }
}
