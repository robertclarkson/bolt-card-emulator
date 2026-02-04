/**
 * Application configuration type definitions
 */

/**
 * App configuration stored in AsyncStorage
 */
export interface AppConfig {
  keys: {
    K0: string;        // Hex-encoded K0 (32 chars)
    K1: string;        // Hex-encoded K1 (32 chars)
    K2: string;        // Hex-encoded K2 (32 chars)
    UID: string;       // Hex-encoded UID (14 chars)
  };
  lnurlBase: string;   // LNURL callback base URL
  cardId: string;      // Card identifier for server
  counter: number;     // Current counter value
  enabled: boolean;    // HCE emulation enabled
}

/**
 * Default app configuration
 */
export const DEFAULT_CONFIG: Partial<AppConfig> = {
  lnurlBase: 'https://lnbits.com/boltcards/api/v1/scan',
  cardId: '',
  counter: 0,
  enabled: false,
};

/**
 * HCE service status
 */
export interface HCEStatus {
  enabled: boolean;
  supported: boolean;
  error?: string;
}

/**
 * Debug log entry
 */
export interface DebugLogEntry {
  id: string;
  timestamp: number;
  type: 'apdu' | 'sdm' | 'counter' | 'error' | 'info';
  direction?: 'incoming' | 'outgoing';
  data: string;
  description: string;
}
