import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { COLORS } from '../constants';

const STEPS = [
  { icon: '✅', label: 'Réservation confirmée', desc: 'Votre demande a bien été prise en compte.' },
  { icon: '🚗', label: 'Nettoyeur en route', desc: null },
  { icon: '🔔', label: 'Arrivée', desc: 'Votre nettoyeur est devant chez vous.' },
  { icon: '🧹', label: 'Service en cours', desc: 'Le nettoyage de votre domicile est en cours.' },
  { icon: '✨', label: 'Service terminé', desc: 'Votre domicile est impeccable !' },
];

const USER_COORD = { latitude: 48.8566, longitude: 2.3522 };

export default function TrackingScreen({ navigation, route }) {
  const { cleaner, address, rooms, hours, price } = route.params;
  const [activeStep, setActiveStep] = useState(1);

  // Animate cleaner position toward user
  const [cleanerPos, setCleanerPos] = useState({ latitude: cleaner.lat, longitude: cleaner.lng });

  useEffect(() => {
    const interval = setInterval(() => {
      setCleanerPos(prev => ({
        latitude: prev.latitude + (USER_COORD.latitude - prev.latitude) * 0.08,
        longitude: prev.longitude + (USER_COORD.longitude - prev.longitude) * 0.08,
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  function nextStep() {
    const next = activeStep + 1;
    if (next >= STEPS.length) {
      navigation.replace('Done', { cleaner, rooms, hours, price });
      return;
    }
    setActiveStep(next);
  }

  const eta = Math.max(0, cleaner.eta - activeStep * 2);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Live map */}
      <MapView
        style={styles.map}
        region={{
          latitude: (cleanerPos.latitude + USER_COORD.latitude) / 2,
          longitude: (cleanerPos.longitude + USER_COORD.longitude) / 2,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
      >
        <Marker coordinate={cleanerPos} title={cleaner.name} description="En route" pinColor={cleaner.color} />
        <Marker coordinate={USER_COORD} title="Votre domicile" pinColor={COLORS.accent} />
        <Polyline
          coordinates={[cleanerPos, USER_COORD]}
          strokeColor={COLORS.brand}
          strokeWidth={3}
          lineDashPattern={[6, 3]}
        />
      </MapView>

      {/* ETA chip */}
      <View style={styles.etaChip}>
        <Text style={styles.etaChipText}>🚗 Arrivée dans ~{eta} min · {cleaner.name}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress steps */}
        <View style={styles.steps}>
          {STEPS.map((s, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={[styles.stepDot, done && styles.stepDotDone, active && styles.stepDotActive]}>
                    <Text style={{ fontSize: done ? 12 : 16 }}>{done ? '✓' : s.icon}</Text>
                  </View>
                  {i < STEPS.length - 1 && (
                    <View style={[styles.stepLine, done && { backgroundColor: COLORS.success }]} />
                  )}
                </View>
                <View style={styles.stepInfo}>
                  <Text style={[styles.stepLabel, active && { color: COLORS.brandDark, fontWeight: '700' }]}>{s.label}</Text>
                  <Text style={styles.stepDesc}>
                    {i === 1 && active ? `Arrivée dans ~${eta} minutes…` : s.desc || ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.btnWrap}>
          <TouchableOpacity style={styles.btnPrimary} onPress={nextStep} activeOpacity={0.85}>
            <Text style={styles.btnText}>
              {activeStep >= STEPS.length - 1 ? '✓ Terminer le service' : 'Étape suivante (démo →)'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  map: { width: '100%', height: 280 },
  etaChip: { position: 'absolute', top: 290, alignSelf: 'center', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, shadowColor: '#000', shadowOpacity: .12, shadowRadius: 8, elevation: 4 },
  etaChipText: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  scroll: { flex: 1, paddingTop: 24 },
  steps: { paddingHorizontal: 24, paddingTop: 16 },
  stepRow: { flexDirection: 'row', gap: 16, marginBottom: 0 },
  stepLeft: { alignItems: 'center', width: 40 },
  stepDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border },
  stepDotDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  stepDotActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  stepLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 4, minHeight: 24 },
  stepInfo: { flex: 1, paddingBottom: 24, paddingTop: 8 },
  stepLabel: { fontSize: 15, fontWeight: '600', color: COLORS.dark, marginBottom: 4 },
  stepDesc: { fontSize: 13, color: COLORS.gray, lineHeight: 18 },
  btnWrap: { paddingHorizontal: 24, marginTop: 8 },
  btnPrimary: { backgroundColor: COLORS.brand, paddingVertical: 16, borderRadius: 999, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
