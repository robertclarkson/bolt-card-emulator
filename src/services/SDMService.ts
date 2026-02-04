/**
 * SDM (Secure Dynamic Messaging) Service
 * Generates NTAG424 DNA secure dynamic messages with encryption and CMAC
 */

import { deriveSDMSessionKeys } from '../crypto/sessionKeys';
import { aesEncryptCTR } from '../crypto/aes';
import { cmacSDM } from '../crypto/cmac';
import { bytesToHex, concat } from '../crypto/utils';
import { SDMMessage, SDMConfig } from '../types/ntag424.types';
import { MEMORY, NDEF } from '../constants/ntag424';

/**
 * Generate SDM message for NTAG424 DNA
 *
 * Process:
 * 1. Derive session keys from K1 and K2
 * 2. Encrypt UID + Counter using KSesSDMFileEnc
 * 3. Calculate CMAC over UID + Counter using KSesSDMFileReadMAC
 * 4. Return hex-encoded encrypted data and CMAC
 */
export function generateSDM(config: SDMConfig): SDMMessage {
  const { uid, counter, encKey, macKey } = config;

  // Combine UID (7 bytes) + Counter (3 bytes) = PICCData (10 bytes)
  const piccData = concat(uid, counter);

  if (piccData.length !== MEMORY.PICC_DATA_SIZE) {
    throw new Error(`PICCData must be ${MEMORY.PICC_DATA_SIZE} bytes`);
  }

  // Derive session keys for unauthenticated SDM (SV = all zeros)
  const sessionKeys = deriveSDMSessionKeys(encKey, macKey);

  // Encrypt PICCData using AES-128 CTR mode
  // IV for CTR mode is all zeros for unauthenticated reads
  const iv = new Uint8Array(16);
  const encryptedPiccData = aesEncryptCTR(sessionKeys.KSesSDMFileEnc, iv, piccData);

  // Calculate CMAC over original (unencrypted) PICCData
  const cmac = cmacSDM(sessionKeys.KSesSDMFileReadMAC, piccData);

  return {
    encPiccData: bytesToHex(encryptedPiccData),
    cmac: bytesToHex(cmac),
    piccData
  };
}

/**
 * Build LNURL-withdraw URL with SDM data
 *
 * Format: lnurlw://domain/path/cardId?p=ENC_PICC_DATA&c=CMAC
 */
export function buildLNURL(
  baseUrl: string,
  cardId: string,
  sdmMessage: SDMMessage
): string {
  // Ensure base URL doesn't end with slash
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // Build URL with SDM parameters
  const url = `${base}/${cardId}?p=${sdmMessage.encPiccData}&c=${sdmMessage.cmac}`;

  return url;
}

/**
 * Build complete NDEF message with LNURL
 *
 * NDEF structure:
 * - NDEF TLV wrapper
 * - NDEF message with URI record
 * - URI payload: lnurlw://...
 */
export function buildNDEFMessage(lnurlUrl: string): Uint8Array {
  // Convert lnurlw:// to https:// for NDEF URI record
  // Most Lightning wallets recognize both, but https is more standard
  const uri = lnurlUrl.replace(/^lnurlw:\/\//, 'https://');

  // Encode URI payload
  const uriPayload = new TextEncoder().encode(uri);

  // NDEF Record header
  // MB=1 (Message Begin), ME=1 (Message End), SR=1 (Short Record), TNF=0x01 (Well-known)
  const tnf = NDEF.TNF_WELL_KNOWN;
  const flags = 0xD1; // MB=1, ME=1, CF=0, SR=1, IL=0, TNF=0x01

  // Record type: URI (0x55)
  const recordType = new Uint8Array([NDEF.RTD_URI]);

  // URI identifier code: 0x04 = https://
  const uriIdentifier = new Uint8Array([NDEF.URI_PREFIX_HTTPS]);

  // Combine URI payload (without https:// prefix since identifier handles it)
  const uriWithoutPrefix = new TextEncoder().encode(uri.replace(/^https:\/\//, ''));
  const fullPayload = concat(uriIdentifier, uriWithoutPrefix);

  // NDEF Record structure:
  // [Header] [Type Length] [Payload Length] [Type] [Payload]
  const ndefRecord = concat(
    new Uint8Array([flags]),                    // Header byte
    new Uint8Array([recordType.length]),        // Type length
    new Uint8Array([fullPayload.length]),       // Payload length
    recordType,                                  // Type
    fullPayload                                  // Payload
  );

  // Wrap in NDEF TLV
  // TLV format: [Tag] [Length] [Value] [Terminator]
  const tlv = concat(
    new Uint8Array([NDEF.TLV_NDEF_MESSAGE]),   // NDEF message tag
    new Uint8Array([ndefRecord.length]),        // Length
    ndefRecord,                                  // NDEF record
    new Uint8Array([NDEF.TLV_TERMINATOR])      // Terminator
  );

  return tlv;
}

/**
 * Generate complete NDEF data with SDM for a read operation
 */
export function generateNDEFWithSDM(
  uid: Uint8Array,
  counter: Uint8Array,
  encKey: Uint8Array,
  macKey: Uint8Array,
  lnurlBase: string,
  cardId: string
): Uint8Array {
  // Generate SDM message
  const sdmMessage = generateSDM({
    uid,
    counter,
    encKey,
    macKey,
    piccData: concat(uid, counter)
  });

  // Build LNURL with SDM data
  const lnurlUrl = buildLNURL(lnurlBase, cardId, sdmMessage);

  // Build NDEF message
  return buildNDEFMessage(lnurlUrl);
}
