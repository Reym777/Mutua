import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, ROOMS } from '../constants';

const RATING_MSGS = ['', 'Décevant 😕', 'Peut mieux faire 😐', 'Bien 🙂', 'Très bien 😊', 'Excellent ! 🤩'];

export default function DoneScreen({ navigation, route }) {
  const { cleaner, rooms, hours, price, paypalOrderId, payerName } = route.params;
  const [rating, setRating] = useState(4);

  const roomList = rooms?.includes('complet')
    ? 'Nettoyage Complet'
    : (rooms || []).map(r => ROOMS[r]?.label).filter(Boolean).join(', ');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.checkCircle}>
            <Text style={{ fontSize: 48 }}>✓</Text>
          </View>
          <Text style={styles.title}>Service terminé !</Text>
          <Text style={styles.sub}>Votre domicile est impeccable.{'\n'}Merci d'avoir choisi LavaGO.</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>Notez {cleaner?.name || 'votre nettoyeur'}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(v => (
              <TouchableOpacity key={v} onPress={() => setRating(v)} activeOpacity={0.7}>
                <Text style={[styles.star, v <= rating && styles.starLit]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingMsg}>{RATING_MSGS[rating]}</Text>
        </View>

        {/* Receipt */}
        <View style={styles.receipt}>
          <Text style={styles.receiptTitle}>🧾 Reçu</Text>
          <ReceiptRow label="Service" value={`${hours}h de ménage`} />
          <ReceiptRow label="Pièces" value={roomList} />
          <ReceiptRow label="Nettoyeur" value={cleaner?.name || '—'} />
          {paypalOrderId && <ReceiptRow label="Commande PayPal" value={paypalOrderId} mono />}
          {payerName && <ReceiptRow label="Payé par" value={payerName} />}
          <View style={styles.receiptDivider} />
          <ReceiptRow label="Total payé" value={`${price} €`} bold />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('Booking')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={COLORS.brandGrad} style={styles.btnGrad}>
              <Text style={styles.btnText}>Nouvelle réservation</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnOutlineText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ReceiptRow({ label, value, bold, mono }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={[styles.receiptValue, bold && styles.receiptBold, mono && { fontFamily: 'monospace', fontSize: 11 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  hero: { alignItems: 'center', paddingTop: 48, paddingBottom: 32, paddingHorizontal: 24 },
  checkCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: COLORS.success, shadowOpacity: .35, shadowRadius: 16, elevation: 8 },
  title: { fontSize: 30, fontWeight: '900', color: COLORS.dark, letterSpacing: -1, marginBottom: 8 },
  sub: { fontSize: 15, color: COLORS.gray, textAlign: 'center', lineHeight: 22 },
  ratingCard: { backgroundColor: COLORS.light, borderRadius: 20, margin: 24, marginTop: 0, padding: 24, alignItems: 'center' },
  ratingTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16, color: COLORS.dark },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  star: { fontSize: 38, color: COLORS.border },
  starLit: { color: '#F59E0B' },
  ratingMsg: { fontSize: 14, color: COLORS.gray },
  receipt: { backgroundColor: COLORS.light, borderRadius: 20, marginHorizontal: 24, padding: 20 },
  receiptTitle: { fontSize: 14, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  receiptLabel: { fontSize: 14, color: COLORS.gray },
  receiptValue: { fontSize: 14, fontWeight: '600', color: COLORS.dark, maxWidth: '60%', textAlign: 'right' },
  receiptBold: { fontSize: 16, fontWeight: '800', color: COLORS.accent },
  receiptDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  actions: { padding: 24, gap: 12 },
  btnPrimary: { borderRadius: 999, overflow: 'hidden' },
  btnGrad: { paddingVertical: 16, alignItems: 'center', borderRadius: 999 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnOutline: { paddingVertical: 14, borderRadius: 999, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center' },
  btnOutlineText: { fontSize: 15, fontWeight: '600', color: COLORS.slate },
});
