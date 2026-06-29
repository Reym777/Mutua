import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import HomeScreen     from './screens/client/HomeScreen';
import BookingScreen  from './screens/client/BookingScreen';
import SearchingScreen from './screens/client/SearchingScreen';
import MatchScreen    from './screens/client/MatchScreen';
import TrackingScreen from './screens/client/TrackingScreen';
import PayPalScreen   from './screens/client/PayPalScreen';
import DoneScreen     from './screens/client/DoneScreen';
import CleanerScreen  from './screens/cleaner/CleanerScreen';
import { COLORS } from './constants';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Client Stack (Home → Booking → Searching → Match → Tracking → PayPal → Done)
function ClientStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      <Stack.Screen name="Home"      component={HomeScreen} />
      <Stack.Screen name="Booking"   component={BookingScreen} />
      <Stack.Screen name="Searching" component={SearchingScreen} />
      <Stack.Screen name="Match"     component={MatchScreen} />
      <Stack.Screen name="Tracking"  component={TrackingScreen} />
      <Stack.Screen name="PayPal"    component={PayPalScreen} />
      <Stack.Screen name="Done"      component={DoneScreen} />
    </Stack.Navigator>
  );
}

// ── Root Tabs: Client | Nettoyeur
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.brandDark,
          tabBarInactiveTintColor: COLORS.muted,
          tabBarStyle: { borderTopColor: COLORS.border, paddingBottom: 4 },
          tabBarIcon: ({ focused, color }) => {
            const icons = { Client: '🫧', Nettoyeur: '🧹' };
            return (
              <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>
                {icons[route.name]}
              </Text>
            );
          },
          tabBarLabel: ({ children, color }) => (
            <Text style={{ fontSize: 11, fontWeight: '600', color, marginBottom: 2 }}>
              {children}
            </Text>
          ),
        })}
      >
        <Tab.Screen name="Client"    component={ClientStack}  options={{ title: 'Client' }} />
        <Tab.Screen name="Nettoyeur" component={CleanerScreen} options={{ title: 'Nettoyeur' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
