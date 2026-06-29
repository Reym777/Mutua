import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: '⚡', title: 'Rapide comme Uber', desc: 'Un nettoyeur disponible dispatché en temps réel.' },
  { icon: '🛡️', title: 'Pros vérifiés', desc: 'Assurés, formés et évalués par la communauté.' },
  { icon: '💳', title: 'Paiement PayPal', desc: 'Paiement sécurisé via PayPal. Prix transparent.' },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={COLORS.brandGrad} style={styles.hero}>
          <Text style={styles.heroIcon}>🫧</Text>
          <Text style={styles.heroTitle}>
            Lava<Text style={{ color: '#A5F3FC' }}>GO</Text>
          </Text>
          <Text style={styles.heroSub}>
            Le nettoyage à domicile en quelques clics.{'\n'}Un pro chez vous en moins de 30 min.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('Booking')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>✨ Réserver maintenant</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Features */}
        <View style={styles.featuresSection}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <LinearGradient colors={COLORS.brandGrad} style={styles.featureIcon}>
                <Text style={{ fontSize: 22 }}>{f.icon}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.bottomCta}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('Booking')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={COLORS.brandGrad} style={styles.btnGrad}>
              <Text style={styles.btnPrimaryText}>Commencer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.brandGrad[0] },
  hero: {
    paddingTop: 60, paddingBottom: 48, paddingHorizontal: 28,
    alignItems: 'center',
  },
  heroIcon: { fontSize: 72, marginBottom: 16 },
  heroTitle: { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: -2, marginBottom: 10 },
  heroSub: { fontSize: 16, color: 'rgba(255,255,255,.9)', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  ctaBtn: {
    backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 32,
    borderRadius: 999, shadowColor: '#000', shadowOpacity: .2, shadowRadius: 12,
    elevation: 6,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '700', color: COLORS.brandDark },
  featuresSection: { backgroundColor: '#fff', padding: 24, gap: 16 },
  featureCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    backgroundColor: COLORS.light, borderRadius: 14, padding: 18,
  },
  featureIcon: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4, color: COLORS.dark },
  featureDesc: { fontSize: 13, color: COLORS.gray, lineHeight: 18 },
  bottomCta: { backgroundColor: '#fff', paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 },
  btnPrimary: { borderRadius: 999, overflow: 'hidden', shadowColor: COLORS.brand, shadowOpacity: .35, shadowRadius: 12, elevation: 4 },
  btnGrad: { paddingVertical: 16, alignItems: 'center', borderRadius: 999 },
  btnPrimaryText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
