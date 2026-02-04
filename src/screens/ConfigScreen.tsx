/**
 * Config Screen
 * Key management and LNURL configuration
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card, Title, TextInput, Text, Divider } from 'react-native-paper';
import { generateKeys, exportKeysToHex, importKeysFromHex, generateCardId } from '../services/CryptoService';
import { loadConfig, saveConfig } from '../services/StorageService';
import { AppConfig } from '../types/config.types';
import * as Clipboard from 'expo-clipboard';

interface ConfigScreenProps {
  navigation: any;
}

export default function ConfigScreen({ navigation }: ConfigScreenProps) {
  const [K0, setK0] = useState('');
  const [K1, setK1] = useState('');
  const [K2, setK2] = useState('');
  const [UID, setUID] = useState('');
  const [lnurlBase, setLnurlBase] = useState('https://lnbits.com/boltcards/api/v1/scan');
  const [cardId, setCardId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const config = await loadConfig();
      if (config && config.keys) {
        setK0(config.keys.K0);
        setK1(config.keys.K1);
        setK2(config.keys.K2);
        setUID(config.keys.UID);
        setLnurlBase(config.lnurlBase || 'https://lnbits.com/boltcards/api/v1/scan');
        setCardId(config.cardId || '');
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKeys = async () => {
    try {
      const keys = await generateKeys();
      const hexKeys = exportKeysToHex(keys);

      setK0(hexKeys.K0);
      setK1(hexKeys.K1);
      setK2(hexKeys.K2);
      setUID(hexKeys.UID);

      Alert.alert('Success', 'New keys generated successfully');
    } catch (error) {
      console.error('Failed to generate keys:', error);
      Alert.alert('Error', 'Failed to generate keys');
    }
  };

  const handleGenerateCardId = async () => {
    try {
      const newCardId = await generateCardId();
      setCardId(newCardId);
      Alert.alert('Success', 'New card ID generated');
    } catch (error) {
      console.error('Failed to generate card ID:', error);
      Alert.alert('Error', 'Failed to generate card ID');
    }
  };

  const handleSave = async () => {
    try {
      // Validate keys
      if (!K0 || !K1 || !K2 || !UID) {
        Alert.alert('Error', 'Please generate or enter all keys');
        return;
      }

      if (!cardId) {
        Alert.alert('Error', 'Please enter or generate a card ID');
        return;
      }

      // Validate hex format
      const hexRegex = /^[0-9A-Fa-f]+$/;
      if (!hexRegex.test(K0) || !hexRegex.test(K1) || !hexRegex.test(K2) || !hexRegex.test(UID)) {
        Alert.alert('Error', 'Keys must be in hexadecimal format');
        return;
      }

      // Validate lengths
      if (K0.length !== 32 || K1.length !== 32 || K2.length !== 32) {
        Alert.alert('Error', 'Keys K0, K1, K2 must be 32 hex characters (16 bytes)');
        return;
      }

      if (UID.length !== 14) {
        Alert.alert('Error', 'UID must be 14 hex characters (7 bytes)');
        return;
      }

      const config: AppConfig = {
        keys: { K0, K1, K2, UID },
        lnurlBase,
        cardId,
        counter: 0,
        enabled: false,
      };

      // Load existing config to preserve counter
      const existing = await loadConfig();
      if (existing) {
        config.counter = existing.counter;
        config.enabled = existing.enabled;
      }

      await saveConfig(config);
      Alert.alert('Success', 'Configuration saved successfully');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      Alert.alert('Error', 'Failed to save configuration');
    }
  };

  const handleCopyKey = async (key: string, name: string) => {
    await Clipboard.setStringAsync(key);
    Alert.alert('Copied', `${name} copied to clipboard`);
  };

  const handleExportAll = async () => {
    const exportData = JSON.stringify({
      K0,
      K1,
      K2,
      UID,
      lnurlBase,
      cardId,
    }, null, 2);

    await Clipboard.setStringAsync(exportData);
    Alert.alert('Exported', 'All configuration copied to clipboard');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Cryptographic Keys</Title>
            <Text style={styles.subtitle}>
              These keys are used to secure your Bolt Card emulation
            </Text>

            <Button mode="contained" onPress={handleGenerateKeys} style={styles.button}>
              Generate New Keys
            </Button>

            <Divider style={styles.divider} />

            <Text style={styles.label}>K0 (Master Key)</Text>
            <View style={styles.keyRow}>
              <TextInput
                mode="outlined"
                value={K0}
                onChangeText={setK0}
                style={styles.keyInput}
                placeholder="32 hex characters"
                autoCapitalize="characters"
              />
              <Button mode="text" onPress={() => handleCopyKey(K0, 'K0')} compact>
                Copy
              </Button>
            </View>

            <Text style={styles.label}>K1 (Encryption Key)</Text>
            <View style={styles.keyRow}>
              <TextInput
                mode="outlined"
                value={K1}
                onChangeText={setK1}
                style={styles.keyInput}
                placeholder="32 hex characters"
                autoCapitalize="characters"
              />
              <Button mode="text" onPress={() => handleCopyKey(K1, 'K1')} compact>
                Copy
              </Button>
            </View>

            <Text style={styles.label}>K2 (MAC Key)</Text>
            <View style={styles.keyRow}>
              <TextInput
                mode="outlined"
                value={K2}
                onChangeText={setK2}
                style={styles.keyInput}
                placeholder="32 hex characters"
                autoCapitalize="characters"
              />
              <Button mode="text" onPress={() => handleCopyKey(K2, 'K2')} compact>
                Copy
              </Button>
            </View>

            <Text style={styles.label}>UID (Unique ID)</Text>
            <View style={styles.keyRow}>
              <TextInput
                mode="outlined"
                value={UID}
                onChangeText={setUID}
                style={styles.keyInput}
                placeholder="14 hex characters"
                autoCapitalize="characters"
              />
              <Button mode="text" onPress={() => handleCopyKey(UID, 'UID')} compact>
                Copy
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>LNURL Configuration</Title>
            <Text style={styles.subtitle}>
              Configure your Lightning Network URL endpoint
            </Text>

            <TextInput
              label="LNURL Base URL"
              mode="outlined"
              value={lnurlBase}
              onChangeText={setLnurlBase}
              style={styles.input}
              placeholder="https://lnbits.com/boltcards/api/v1/scan"
            />

            <TextInput
              label="Card ID"
              mode="outlined"
              value={cardId}
              onChangeText={setCardId}
              style={styles.input}
              placeholder="Unique identifier for this card"
            />

            <Button mode="outlined" onPress={handleGenerateCardId} style={styles.button}>
              Generate Card ID
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Button mode="contained" onPress={handleSave} style={styles.button}>
              Save Configuration
            </Button>
            <Button mode="outlined" onPress={handleExportAll} style={styles.button}>
              Export All to Clipboard
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.warningTitle}>⚠️ Security Warning</Title>
            <Text>
              These keys control access to your Bolt Card. Keep them secure!
              {'\n\n'}
              • Never share your keys publicly
              {'\n'}
              • Back up your keys securely
              {'\n'}
              • Generate new keys if compromised
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    marginBottom: 12,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyInput: {
    flex: 1,
    marginRight: 8,
  },
  button: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  warningTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
});
