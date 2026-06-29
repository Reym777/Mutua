import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, ROOMS, RATE } from '../constants';

const STEP_LABELS = ['Adresse', 'Pièces', 'Durée', 'Récap'];

export default function BookingScreen({ navigation }) {
  const [step, setStep] = useState(0);

  // Step 0 - Address
  const [street, setStreet] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [extra, setExtra] = useState('');

  // Step 1 - Rooms
  const [selectedRooms, setSelectedRooms] = useState(new Set());

  // Step 2 - Hours
  const [hours, setHours] = useState(2);

  function computePrice() {
    const isComplet = selectedRooms.has('complet');
    let roomsBonus = 0;
    if (!isComplet) {
      selectedRooms.forEach(r => { roomsBonus += (ROOMS[r]?.price || 0); });
    } else {
      Object.keys(ROOMS).forEach(r => {
        if (r !== 'complet') roomsBonus += ROOMS[r].price;
      });
    }
    const base = hours * RATE;
    const sub = base + roomsBonus;
    const disc = isComplet ? Math.round(sub * 0.15) : 0;
    return { base, roomsBonus, disc, total: sub - disc, isComplet };
  }

  function toggleRoom(key) {
    const next = new Set(selectedRooms);
    if (key === 'complet') {
      if (next.has('complet')) { next.clear(); }
      else { next.clear(); next.add('complet'); }
    } else {
      next.delete('complet');
      if (next.has(key)) next.delete(key);
      else next.add(key);
    }
    setSelectedRooms(next);
  }

  function nextStep() {
    if (step === 0) {
      if (!street || !zip || !city) { Alert.alert('Adresse incomplète', 'Merci de renseigner rue, code postal et ville.'); return; }
    }
    if (step === 1) {
      if (selectedRooms.size === 0) { Alert.alert('Aucune pièce', 'Sélectionnez au moins une pièce.'); return; }
    }
    if (step === 3) {
      // Confirm → go to search
      navigation.navigate('Searching', {
        address: { street, zip, city, extra },
        rooms: [...selectedRooms],
        hours,
        price: computePrice().total,
      });
      return;
    }
    setStep(s => s + 1);
  }

  const { base, roomsBonus, disc, total, isComplet } = computePrice();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 0 ? navigation.goBack() : setStep(s => s - 1)} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>Lava<Text style={{ color: COLORS.accent }}>GO</Text></Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {STEP_LABELS.map((l, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[styles.stepDot, i === step && styles.stepDotActive, i < step && styles.stepDotDone]}>
              {i < step && <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text>}
              {i >= step && <Text style={{ color: i === step ? '#fff' : COLORS.muted, fontSize: 11, fontWeight: '700' }}>{i + 1}</Text>}
            </View>
            <Text style={[styles.stepLabel, i === step && { color: COLORS.brandDark }]}>{l}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ─── STEP 0: ADDRESS ─── */}
        {step === 0 && (
          <View>
            <Text style={styles.stepTitle}>Votre adresse</Text>
            <Text style={styles.stepSub}>Où devons-nous envoyer votre nettoyeur ?</Text>
            <View style={styles.mapPlaceholder}>
              <Text style={{ fontSize: 40 }}>📍</Text>
              <Text style={{ color: COLORS.gray, fontSize: 13, marginTop: 8 }}>Carte — saisie manuelle</Text>
            </View>
            <InputField label="Rue et numéro" value={street} onChangeText={setStreet} placeholder="ex: 14 rue de la Paix" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InputField label="Code postal" value={zip} onChangeText={setZip} placeholder="75001" keyboardType="numeric" maxLength={5} />
              </View>
              <View style={{ flex: 2 }}>
                <InputField label="Ville" value={city} onChangeText={setCity} placeholder="Paris" />
              </View>
            </View>
            <InputField label="Complément (optionnel)" value={extra} onChangeText={setExtra} placeholder="Bât. B, 3e étage" />
          </View>
        )}

        {/* ─── STEP 1: ROOMS ─── */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Pièces à nettoyer</Text>
            <Text style={styles.stepSub}>Plusieurs choix possibles</Text>
            <View style={styles.roomsGrid}>
              {Object.entries(ROOMS).map(([key, room]) => {
                const sel = selectedRooms.has(key);
                const isSpecial = room.special;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.roomCard,
                      sel && styles.roomCardSel,
                      isSpecial && styles.roomCardSpecial,
                      isSpecial && sel && styles.roomCardSpecialSel,
                      isSpecial && { width: '100%' },
                    ]}
                    onPress={() => toggleRoom(key)}
                    activeOpacity={0.8}
                  >
                    {sel && <View style={styles.roomCheck}><Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>✓</Text></View>}
                    <Text style={{ fontSize: 28, marginBottom: 6 }}>{room.emoji}</Text>
                    <Text style={[styles.roomLabel, isSpecial && { color: COLORS.accent, fontWeight: '700' }]}>{room.label}</Text>
                    <Text style={[styles.roomPrice, isSpecial && { color: COLORS.accentDark }]}>
                      {isSpecial ? '−15% remise' : `+${room.price} €`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ─── STEP 2: HOURS ─── */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Durée du service</Text>
            <Text style={styles.stepSub}>Combien d'heures souhaitez-vous réserver ?</Text>
            <View style={styles.hoursDisplay}>
              <Text style={styles.hoursValue}>{hours}</Text>
              <Text style={styles.hoursUnit}> heure{hours > 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.hoursControls}>
              <TouchableOpacity
                style={[styles.hourBtn, hours <= 1 && styles.hourBtnDisabled]}
                onPress={() => hours > 1 && setHours(h => h - 1)}
                activeOpacity={0.7}
              >
                <Text style={styles.hourBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.hourSteps}>
                {[1,2,3,4,5,6,7,8].map(h => (
                  <TouchableOpacity key={h} onPress={() => setHours(h)} style={[styles.hourStep, hours === h && styles.hourStepActive]}>
                    <Text style={[styles.hourStepText, hours === h && { color: '#fff' }]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.hourBtn, hours >= 8 && styles.hourBtnDisabled]}
                onPress={() => hours < 8 && setHours(h => h + 1)}
                activeOpacity={0.7}
              >
                <Text style={styles.hourBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priceCard}>
              <PriceRow label="Taux horaire" value={`${RATE} €/h`} />
              <PriceRow label={`${hours}h × ${RATE} €`} value={`${base} €`} />
              <PriceRow label="Options pièces" value={`+${roomsBonus} €`} />
              {isComplet && <PriceRow label="Remise complet (−15%)" value={`−${disc} €`} color={COLORS.success} />}
              <View style={styles.priceDivider} />
              <PriceRow label="Total estimé" value={`${total} €`} bold />
            </View>
          </View>
        )}

        {/* ─── STEP 3: RECAP ─── */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Récapitulatif</Text>
            <Text style={styles.stepSub}>Vérifiez avant de confirmer</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summarySection}>📍 Adresse</Text>
              <Text style={styles.summaryValue}>{street}, {zip} {city}{extra ? `\n${extra}` : ''}</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summarySection}>🧹 Pièces</Text>
              {selectedRooms.has('complet') ? (
                <Text style={styles.summaryValue}>✨ Nettoyage Complet (toutes pièces)</Text>
              ) : (
                [...selectedRooms].map(r => (
                  <Text key={r} style={styles.summaryValue}>{ROOMS[r]?.emoji} {ROOMS[r]?.label}</Text>
                ))
              )}
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summarySection}>⏱️ Durée</Text>
              <Text style={styles.summaryValue}>{hours} heure{hours > 1 ? 's' : ''}</Text>
            </View>

            <LinearGradient colors={COLORS.brandGrad} style={styles.totalBox}>
              <Text style={styles.totalLabel}>TOTAL ESTIMÉ</Text>
              <Text style={styles.totalAmount}>{total} €</Text>
              <Text style={styles.totalNote}>Paiement sécurisé via PayPal</Text>
            </LinearGradient>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnPrimary} onPress={nextStep} activeOpacity={0.85}>
          <LinearGradient colors={step === 3 ? [COLORS.accent, COLORS.accentDark] : COLORS.brandGrad} style={styles.btnGrad}>
            <Text style={styles.btnText}>
              {step === 3 ? '🚀 Confirmer et trouver un nettoyeur' : 'Continuer →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InputField({ label, value, onChangeText, placeholder, keyboardType, maxLength }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.inputField}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        keyboardType={keyboardType || 'default'}
        maxLength={maxLength}
      />
    </View>
  );
}

function PriceRow({ label, value, bold, color }) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, bold && { fontWeight: '700', color: COLORS.dark, fontSize: 16 }]}>{label}</Text>
      <Text style={[styles.priceValue, bold && { fontWeight: '800', color: COLORS.accent, fontSize: 18 }, color && { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.light, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: COLORS.slate },
  logo: { fontSize: 22, fontWeight: '900', color: COLORS.brandDark, letterSpacing: -1 },
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingVertical: 16, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: COLORS.brand },
  stepDotDone: { backgroundColor: COLORS.success },
  stepLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  content: { flex: 1, padding: 24 },
  stepTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6, color: COLORS.dark },
  stepSub: { fontSize: 14, color: COLORS.gray, marginBottom: 24, lineHeight: 20 },
  mapPlaceholder: { height: 130, backgroundColor: COLORS.light, borderRadius: 14, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.slate, marginBottom: 8 },
  inputField: { borderWidth: 2, borderColor: COLORS.border, borderRadius: 14, padding: 14, fontSize: 15, color: COLORS.dark, backgroundColor: '#fff' },

  roomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  roomCard: { width: '47%', borderWidth: 2, borderColor: COLORS.border, borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: '#fff', position: 'relative' },
  roomCardSel: { borderColor: COLORS.brand, backgroundColor: COLORS.light },
  roomCardSpecial: { backgroundColor: '#FFF7F0', borderColor: '#FDBA74' },
  roomCardSpecialSel: { borderColor: COLORS.accent, backgroundColor: '#FFF0E8' },
  roomCheck: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center' },
  roomLabel: { fontSize: 13, fontWeight: '600', color: COLORS.slate, textAlign: 'center' },
  roomPrice: { fontSize: 11, color: COLORS.muted, marginTop: 2 },

  hoursDisplay: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', paddingVertical: 32 },
  hoursValue: { fontSize: 80, fontWeight: '900', color: COLORS.brandDark, letterSpacing: -4 },
  hoursUnit: { fontSize: 22, color: COLORS.gray, fontWeight: '500' },
  hoursControls: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  hourBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  hourBtnDisabled: { opacity: 0.3 },
  hourBtnText: { fontSize: 26, color: COLORS.slate, lineHeight: 32 },
  hourSteps: { flex: 1, flexDirection: 'row', gap: 4 },
  hourStep: { flex: 1, height: 32, borderRadius: 8, backgroundColor: COLORS.light, alignItems: 'center', justifyContent: 'center' },
  hourStepActive: { backgroundColor: COLORS.brand },
  hourStepText: { fontSize: 12, fontWeight: '700', color: COLORS.gray },
  priceCard: { backgroundColor: COLORS.light, borderRadius: 14, padding: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  priceLabel: { fontSize: 14, color: COLORS.gray },
  priceValue: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  priceDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },

  summaryCard: { backgroundColor: COLORS.light, borderRadius: 14, padding: 18, marginBottom: 14 },
  summarySection: { fontSize: 13, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  summaryValue: { fontSize: 15, color: COLORS.dark, marginBottom: 4, lineHeight: 22 },
  totalBox: { borderRadius: 14, padding: 24, alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 13, color: 'rgba(255,255,255,.8)', marginBottom: 4 },
  totalAmount: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  totalNote: { fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 4 },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#fff' },
  btnPrimary: { borderRadius: 999, overflow: 'hidden' },
  btnGrad: { paddingVertical: 16, alignItems: 'center', borderRadius: 999 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
