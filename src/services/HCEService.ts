/**
 * HCE (Host Card Emulation) Service
 * Bridge using react-native-hce library
 */

import { Platform } from 'react-native';
import { HCESession, NFCTagType4, NFCTagType4NDEFContentType } from 'react-native-hce';

/**
 * HCE Service class using react-native-hce
 */
export class HCEService {
  private session: HCESession | null = null;
  private tag: NFCTagType4 | null = null;
  private isActive: boolean = false;
  private currentContent: string = '';

  constructor() {
    // Initialize on Android only
    if (Platform.OS === 'android') {
      this.initSession();
    }
  }

  /**
   * Initialize HCE session
   */
  private async initSession() {
    try {
      this.session = await HCESession.getInstance();

      // Listen to HCE events
      this.session.on(HCESession.Events.HCE_STATE_READ, () => {
        console.log('[HCE] Tag was read by reader');
      });

      this.session.on(HCESession.Events.HCE_STATE_CONNECTED, () => {
        console.log('[HCE] NFC reader connected');
      });

      this.session.on(HCESession.Events.HCE_STATE_DISCONNECTED, () => {
        console.log('[HCE] NFC reader disconnected');
      });

    } catch (error) {
      console.error('Failed to initialize HCE session:', error);
    }
  }

  /**
   * Check if HCE is supported on this device
   */
  public async isSupported(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    // If session exists, HCE is supported
    return this.session !== null;
  }

  /**
   * Enable HCE card emulation with NDEF content
   */
  public async enable(ndefUrl?: string): Promise<void> {
    if (!this.session) {
      throw new Error('HCE not available on this platform');
    }

    try {
      // Create NFC Type 4 tag with URL content
      const content = ndefUrl || this.currentContent || 'https://example.com';

      this.tag = new NFCTagType4({
        type: NFCTagType4NDEFContentType.URL,
        content: content,
        writable: false
      });

      // Set the application
      this.session.setApplication(this.tag);

      // Enable the session
      await this.session.setEnabled(true);

      this.isActive = true;
      this.currentContent = content;

      console.log('[HCE] Emulation enabled with content:', content);
    } catch (error) {
      console.error('Failed to enable HCE:', error);
      throw error;
    }
  }

  /**
   * Disable HCE card emulation
   */
  public async disable(): Promise<void> {
    if (!this.session) {
      throw new Error('HCE not available on this platform');
    }

    try {
      await this.session.setEnabled(false);
      this.isActive = false;
      console.log('[HCE] Emulation disabled');
    } catch (error) {
      console.error('Failed to disable HCE:', error);
      throw error;
    }
  }

  /**
   * Check if HCE is currently enabled
   */
  public async isEnabled(): Promise<boolean> {
    if (!this.session) {
      return false;
    }

    return this.session.enabled;
  }

  /**
   * Update NDEF content (requires re-enabling)
   */
  public async updateContent(ndefUrl: string): Promise<void> {
    if (!this.session) {
      throw new Error('HCE not available');
    }

    this.currentContent = ndefUrl;

    // If currently active, update by re-enabling
    if (this.isActive) {
      await this.disable();
      await this.enable(ndefUrl);
    }
  }

  /**
   * Register APDU command handler
   * Note: react-native-hce handles APDU internally for NFCTagType4
   * This is kept for compatibility but doesn't do direct APDU handling
   */
  public onAPDUCommand(handler: (command: Uint8Array) => Uint8Array): void {
    console.warn('[HCE] Direct APDU handling not supported with react-native-hce');
    console.warn('[HCE] Using NFCTagType4 for automatic NDEF handling');
    // Store handler for future custom implementation
  }

  /**
   * Remove command listener
   */
  public removeListener(): void {
    // react-native-hce manages listeners internally
  }

  /**
   * Get current status
   */
  public getStatus(): { active: boolean; supported: boolean } {
    return {
      active: this.isActive,
      supported: this.session !== null && Platform.OS === 'android'
    };
  }
}

// Export singleton instance
export default new HCEService();
