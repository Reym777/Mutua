import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { COLORS, ROOMS } from '../constants';

export default function MatchScreen({ navigation, route }) {
  const { cleaner, address, rooms, hours, price } = route.params;

  const stars = '★'.repeat(Math.round(cleaner.rating)) + '☆'.repeat(5 - Math.round(cleaner.rating));

  // Approximate user location (Paris center as default)
  const userLat = 48.8566;
  const userLng = 2.3522;

  function cancelRide() {
    Alert.alert('Annuler ?', 'Êtes-vous sûr de vouloir annuler la réservation ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: () => navigation.navigate('Home') },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Hero */}
      <LinearGradient colors={COLORS.brandGrad} style={styles.hero}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Nettoyeur trouvé !</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: cleaner.color }]}>
          <Text style={styles.avatarText}>{cleaner.avatar}</Text>
        </View>
        <Text style={styles.name}>{cleaner.name}</Text>
        <Text style={styles.stars}>{stars}</Text>
        <Text style={styles.ratingText}>{cleaner.rating.toFixed(1)} · {cleaner.reviews} services effectués</Text>
      </LinearGradient>

      <ScrollView style={styles.card} showsVerticalScrollIndicator={false}>
        {/* ETA Row */}
        <View style={styles.etaRow}>
          <ETABadge value={`${cleaner.eta}`} label="min d'arrivée" />
          <ETABadge value={`${hours}h`} label="durée réservée" />
          <ETABadge value={`${price}€`} label="prix estimé" />
        </View>

        {/* Map with cleaner position */}
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: (cleaner.lat + userLat) / 2,
            longitude: (cleaner.lng + userLng) / 2,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={{ latitude: cleaner.lat, longitude: cleaner.lng }} title={cleaner.name} description="Nettoyeur" pinColor={cleaner.color} />
          <Marker coordinate={{ latitude: userLat, longitude: userLng }} title="Votre domicile" pinColor={COLORS.accent} />
          <Polyline
            coordinates={[
              { latitude: cleaner.lat, longitude: cleaner.lng },
              { latitude: userLat, longitude: userLng },
            ]}
            strokeColor={COLORS.brand}
            strokeWidth={3}
            lineDashPattern={[8, 4]}
          />
        </MapView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Tracking', { cleaner, address, rooms, hours, price })} activeOpacity={0.8}>
            <Text style={styles.actionBtnText}>📍 Suivre en direct</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('💬 Chat', `Contacter ${cleaner.name}`)} activeOpacity={0.8}>
            <Text style={styles.actionBtnText}>💬 Contacter</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.actionBtn, { width: '100%' }]} onPress={cancelRide} activeOpacity={0.8}>
          <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>✕ Annuler la réservation</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ETABadge({ value, label }) {
  return (
    <View style={styles.etaBadge}>
      <Text style={styles.etaVal}>{value}</Text>
      <Text style={styles.etaLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  hero: { paddingTop: 32, paddingBottom: 48, paddingHorizontal: 24, alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,.2)', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14, marginBottom: 20 },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A7F3D0' },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,.6)', marginBottom: 16, shadowColor: '#000', shadowOpacity: .2, shadowRadius: 12, elevation: 6 },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  name: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  stars: { color: '#FDE68A', fontSize: 18, marginBottom: 4 },
  ratingText: { fontSize: 13, color: 'rgba(255,255,255,.85)' },
  card: { backgroundColor: '#fff', borderRadius: 24, marginTop: -20, flex: 1, paddingHorizontal: 24, paddingTop: 28 },
  etaRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  etaBadge: { flex: 1, backgroundColor: COLORS.light, borderRadius: 14, padding: 16, alignItems: 'center' },
  etaVal: { fontSize: 26, fontWeight: '800', color: COLORS.brandDark },
  etaLbl: { fontSize: 12, color: COLORS.gray, marginTop: 2, textAlign: 'center' },
  map: { width: '100%', height: 200, borderRadius: 14, marginBottom: 20, overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  actionBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.slate },
});
