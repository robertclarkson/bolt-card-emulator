/**
 * Home Screen
 * Main dashboard with enable/disable toggle and status
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Title, Paragraph, Switch, Text, Surface } from 'react-native-paper';
import HCEServiceInstance from '../services/HCEService';
import { loadConfig } from '../services/StorageService';
import { importKeysFromHex } from '../services/CryptoService';
import { generateNDEFWithSDM, buildLNURL, generateSDM } from '../services/SDMService';
import { bytesToHex, numberToBytes, hexToBytes } from '../crypto/utils';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const [counter, setCounter] = useState(0);
  const [cardId, setCardId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSupport();
    loadConfiguration();
  }, []);

  const checkSupport = async () => {
    const isSupported = await HCEServiceInstance.isSupported();
    setSupported(isSupported);
  };

  const loadConfiguration = async () => {
    try {
      const config = await loadConfig();
      if (config) {
        setCounter(config.counter || 0);
        setCardId(config.cardId || 'Not configured');
        setEnabled(config.enabled || false);
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      if (enabled) {
        await HCEServiceInstance.disable();
        setEnabled(false);
      } else {
        // Load config and generate LNURL with SDM
        const config = await loadConfig();
        if (!config || !config.keys) {
          alert('Please configure your card first (Config screen)');
          return;
        }

        // Import keys
        const keys = importKeysFromHex(config.keys);

        // Generate SDM message
        const sdmMessage = generateSDM({
          uid: keys.UID,
          counter: numberToBytes(config.counter, 3),
          encKey: keys.K1,
          macKey: keys.K2,
          piccData: new Uint8Array([...keys.UID, ...numberToBytes(config.counter, 3)])
        });

        // Build LNURL with SDM
        const lnurlUrl = buildLNURL(config.lnurlBase, config.cardId, sdmMessage);

        // Enable HCE with the LNURL
        await HCEServiceInstance.enable(lnurlUrl);
        setEnabled(true);

        console.log('[HomeScreen] Enabled with LNURL:', lnurlUrl);
      }
    } catch (error) {
      console.error('Failed to toggle HCE:', error);
      alert('Failed to toggle card emulation. Make sure NFC is enabled and HCE is supported.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!supported) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>HCE Not Supported</Title>
            <Paragraph>
              This device does not support Host Card Emulation (HCE).
              {'\n\n'}
              Requirements:
              {'\n'}- Android 4.4 or higher
              {'\n'}- NFC hardware
              {'\n'}- HCE capability
            </Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Bolt Card Emulator</Title>
            <Paragraph>
              Emulates an NTAG424 DNA NFC card for Lightning Network payments
            </Paragraph>
          </Card.Content>
        </Card>

        <Surface style={[styles.statusCard, enabled ? styles.activeCard : styles.inactiveCard]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, enabled ? styles.activeIndicator : styles.inactiveIndicator]} />
            <Title style={styles.statusTitle}>
              {enabled ? 'Card Active' : 'Card Inactive'}
            </Title>
          </View>
          <Switch value={enabled} onValueChange={handleToggle} />
        </Surface>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Counter:</Text>
              <Text style={styles.infoValue}>{counter}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Card ID:</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {cardId || 'Not configured'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Config')}
              style={styles.button}
            >
              Configure Card
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Debug')}
              style={styles.button}
            >
              Debug Log
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.instructionTitle}>How to Use</Title>
            <Paragraph>
              1. Configure your card keys and LNURL in the Config screen
              {'\n'}
              2. Enable card emulation using the toggle above
              {'\n'}
              3. Tap your phone to an NFC reader or Lightning wallet
              {'\n'}
              4. The counter increments on each tap
            </Paragraph>
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
  statusCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeCard: {
    backgroundColor: '#e8f5e9',
  },
  inactiveCard: {
    backgroundColor: '#f5f5f5',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  activeIndicator: {
    backgroundColor: '#4caf50',
  },
  inactiveIndicator: {
    backgroundColor: '#9e9e9e',
  },
  statusTitle: {
    fontSize: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  button: {
    marginTop: 8,
  },
  instructionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
});
