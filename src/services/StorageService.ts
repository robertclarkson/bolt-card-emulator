/**
 * Storage Service
 * Handles persistent storage using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig, DEFAULT_CONFIG } from '../types/config.types';

const STORAGE_KEY = '@BoltCardEmulator:config';

/**
 * Load app configuration from storage
 */
export async function loadConfig(): Promise<AppConfig | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json === null) {
      return null;
    }

    const config = JSON.parse(json) as AppConfig;
    return config;
  } catch (error) {
    console.error('Failed to load config:', error);
    return null;
  }
}

/**
 * Save app configuration to storage
 */
export async function saveConfig(config: AppConfig): Promise<void> {
  try {
    const json = JSON.stringify(config);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save config:', error);
    throw error;
  }
}

/**
 * Update partial configuration
 */
export async function updateConfig(partial: Partial<AppConfig>): Promise<AppConfig> {
  const existing = await loadConfig();
  const updated = { ...DEFAULT_CONFIG, ...existing, ...partial } as AppConfig;
  await saveConfig(updated);
  return updated;
}

/**
 * Clear all stored configuration
 */
export async function clearConfig(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear config:', error);
    throw error;
  }
}

/**
 * Get counter value
 */
export async function getCounter(): Promise<number> {
  const config = await loadConfig();
  return config?.counter || 0;
}

/**
 * Increment and save counter
 */
export async function incrementCounter(): Promise<number> {
  const config = await loadConfig();
  const newCounter = (config?.counter || 0) + 1;

  await updateConfig({ counter: newCounter });
  return newCounter;
}

/**
 * Set counter value
 */
export async function setCounter(value: number): Promise<void> {
  await updateConfig({ counter: value });
}
