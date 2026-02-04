/**
 * Main App Component
 * Sets up navigation and integrates all services
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

import HomeScreen from './screens/HomeScreen';
import ConfigScreen from './screens/ConfigScreen';
import DebugScreen from './screens/DebugScreen';

import { NTAG424Service } from './services/NTAG424Service';
import HCEServiceInstance from './services/HCEService';
import { loadConfig } from './services/StorageService';
import { importKeysFromHex } from './services/CryptoService';
import { hexToBytes } from './crypto/utils';

const Stack = createNativeStackNavigator();

let ntag424Service: NTAG424Service | null = null;

export default function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      // Load configuration
      const config = await loadConfig();

      if (config && config.keys) {
        // Import keys
        const keys = importKeysFromHex(config.keys);

        // Note: NTAG424Service and SDM generation will be used on-demand
        // when enabling HCE, rather than handling raw APDU commands
        // The react-native-hce library handles the NDEF tag emulation internally

        console.log('[App] Configuration loaded successfully');
      }

      setInitialized(true);
    } catch (error) {
      console.error('Failed to initialize services:', error);
      setInitialized(true); // Continue anyway
    }
  };

  if (!initialized) {
    return null; // Could show a splash screen here
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#6200ee',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Bolt Card Emulator' }}
          />
          <Stack.Screen
            name="Config"
            component={ConfigScreen}
            options={{ title: 'Configuration' }}
          />
          <Stack.Screen
            name="Debug"
            component={DebugScreen}
            options={{ title: 'Debug Log' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// Export service instance for access from screens if needed
export { ntag424Service };
