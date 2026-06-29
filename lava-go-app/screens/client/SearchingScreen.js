import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  Animated, Easing,
} from 'react-native';
import { COLORS, CLEANERS } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';

export default function SearchingScreen({ navigation, route }) {
  const { address, rooms, hours, price } = route.params;
  const [nearbyCleaners, setNearbyCleaners] = useState([]);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    ).start();

    // Simulate nearby cleaners appearing
    const shuffled = [...CLEANERS].sort(() => Math.random() - .5);
    shuffled.forEach((c, i) => {
      setTimeout(() => {
        setNearbyCleaners(prev => [...prev, c]);
      }, 800 + i * 700);
    });

    // Pick best cleaner after ~5s
    const timer = setTimeout(() => {
      const best = shuffled.reduce((a, b) => a.eta < b.eta ? a : b);
      navigation.replace('Match', { cleaner: best, address, rooms, hours, price });
    }, 5200);

    return () => clearTimeout(timer);
  }, []);

  const scale1 = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.2] });
  const scale2 = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.0] });
  const scale3 = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });
  const opacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Radar */}
        <View style={styles.radarWrap}>
          {[scale1, scale2, scale3].map((scale, i) => (
            <Animated.View key={i} style={[styles.radarRing, { transform: [{ scale }], opacity }]} />
          ))}
          <LinearGradient colors={COLORS.brandGrad} style={styles.radarCenter}>
            <Text style={{ fontSize: 32 }}>🫧</Text>
          </LinearGradient>
        </View>

        <Text style={styles.title}>Recherche en cours…</Text>
        <Text style={styles.sub}>Nous cherchons le meilleur nettoyeur{'\n'}disponible près de chez vous.</Text>

        {/* Detected cleaners */}
        <View style={styles.pingsWrap}>
          {nearbyCleaners.map(c => (
            <View key={c.id} style={styles.ping}>
              <View style={styles.pingDot} />
              <Text style={styles.pingText}>{c.name} — {c.eta} min</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Annuler la recherche</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  radarWrap: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  radarRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 2, borderColor: COLORS.brand },
  radarCenter: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', zIndex: 1, shadowColor: COLORS.brand, shadowOpacity: .4, shadowRadius: 16, elevation: 6 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -.5, marginBottom: 8, color: COLORS.dark, textAlign: 'center' },
  sub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  pingsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 32 },
  ping: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.light, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  pingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  pingText: { fontSize: 13, color: COLORS.dark, fontWeight: '500' },
  cancelBtn: { padding: 12 },
  cancelText: { fontSize: 14, color: COLORS.muted, textDecorationLine: 'underline' },
});
