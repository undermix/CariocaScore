import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, ActivityIndicator, Image } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Authenticated, Unauthenticated, AuthLoading, ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL || 'https://example.convex.cloud', {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: async (key: string) => {
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};
import { ThemeProvider, useTheme } from './lib/ThemeContext';
import { fontSize } from './lib/theme';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import SocialScreen from './screens/SocialScreen';
import CreateGameScreen from './screens/CreateGameScreen';
import ActiveGameScreen from './screens/ActiveGameScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';
import DonationsScreen from './screens/DonationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
const { colors, fs } = useTheme();

return (
<Tab.Navigator
screenOptions={{
headerShown: false,
tabBarStyle: {
backgroundColor: colors.tabBar,
borderTopColor: colors.tabBarBorder,
borderTopWidth: 1,
paddingBottom: 4,
height: 56,
},
tabBarActiveTintColor: colors.primary,
tabBarInactiveTintColor: colors.textMuted,
tabBarLabelStyle: { fontSize: fs(fontSize.xs), fontWeight: '600' },
}}
>
<Tab.Screen
name="Home"
component={SocialScreen}
options={{
tabBarIcon: ({ color, size }: { color: string; size: number }) => (
<Ionicons name="home" size={size} color={color} />
),
}}
/>
<Tab.Screen
name="Partidas"
component={HomeScreen}
options={{
tabBarIcon: ({ color, size }: { color: string; size: number }) => (
<Ionicons name="game-controller" size={size} color={color} />
),
}}
/>
<Tab.Screen
name="Stats"
component={StatsScreen}
options={{
tabBarIcon: ({ color, size }: { color: string; size: number }) => (
<Ionicons name="stats-chart" size={size} color={color} />
),
tabBarLabel: 'Estadísticas',
}}
/>
<Tab.Screen
name="Ajustes"
component={SettingsScreen}
options={{
tabBarIcon: ({ color, size }: { color: string; size: number }) => (
<Ionicons name="settings" size={size} color={color} />
),
}}
/>
</Tab.Navigator>
);
}

function AppStack() {
return (
<Stack.Navigator screenOptions={{ headerShown: false }}>
<Stack.Screen name="HomeTabs" component={HomeTabs} />
<Stack.Screen name="CreateGame" component={CreateGameScreen} />
<Stack.Screen name="ActiveGame" component={ActiveGameScreen} />
<Stack.Screen name="Donations" component={DonationsScreen} />
</Stack.Navigator>
);
}

function LoadingScreen() {
const { colors } = useTheme();
return (
<View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
<Image
  source={require('./assets/icon.png')}
  style={styles.loadingLogo}
  resizeMode="contain"
/>
<Text style={[styles.loadingTitle, { color: colors.text }]}>Carioca Score</Text>
<ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
</View>
);
}

function AppContent() {
React.useEffect(() => {
  SplashScreen.hideAsync().catch(() => {});
}, []);

return (
<>
<AuthLoading>
<LoadingScreen />
</AuthLoading>
<Unauthenticated>
<AuthScreen />
</Unauthenticated>
<Authenticated>
<NavigationContainer>
  <AppStack />
</NavigationContainer>
</Authenticated>
</>
);
}

export default function App() {
return (
<ThemeProvider>
<ConvexAuthProvider client={convex} storage={secureStorage}>
<SafeAreaProvider style={styles.container}>
<AppContent />
</SafeAreaProvider>
</ConvexAuthProvider>
</ThemeProvider>
);
}

const styles = StyleSheet.create({
container: { flex: 1 },
loadingContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
},
loadingLogo: {
width: 88,
height: 88,
borderRadius: 20,
marginBottom: 12,
},
loadingTitle: {
fontSize: 24,
fontWeight: '800',
letterSpacing: -0.5,
},
});