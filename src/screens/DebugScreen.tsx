/**
 * Debug Screen
 * Real-time APDU transaction log
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Title, Text, Button, Chip } from 'react-native-paper';
import { DebugLogEntry } from '../types/config.types';

interface DebugScreenProps {
  navigation: any;
}

export default function DebugScreen({ navigation }: DebugScreenProps) {
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);

  const handleClearLogs = () => {
    setLogs([]);
  };

  const addLog = (entry: DebugLogEntry) => {
    setLogs((prev) => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'apdu':
        return '#2196f3';
      case 'sdm':
        return '#4caf50';
      case 'counter':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const renderLogEntry = ({ item }: { item: DebugLogEntry }) => (
    <Card style={styles.logCard}>
      <Card.Content>
        <View style={styles.logHeader}>
          <Chip
            mode="flat"
            style={[styles.chip, { backgroundColor: getTypeColor(item.type) }]}
            textStyle={styles.chipText}
          >
            {item.type.toUpperCase()}
          </Chip>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        </View>

        {item.direction && (
          <Text style={styles.direction}>
            {item.direction === 'incoming' ? '← Incoming' : '→ Outgoing'}
          </Text>
        )}

        <Text style={styles.description}>{item.description}</Text>

        {item.data && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataLabel}>Data:</Text>
            <Text style={styles.data}>{item.data}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title>APDU Transaction Log</Title>
          <Text style={styles.subtitle}>
            Real-time debugging information for NFC communication
          </Text>
          <Button mode="outlined" onPress={handleClearLogs} style={styles.button}>
            Clear Logs
          </Button>
        </Card.Content>
      </Card>

      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No logs yet</Text>
          <Text style={styles.emptySubtext}>
            Enable card emulation and tap to an NFC reader to see logs
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderLogEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  button: {
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  logCard: {
    marginBottom: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: {
    height: 24,
  },
  chipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  direction: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  dataContainer: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  data: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#333',
  },
});
