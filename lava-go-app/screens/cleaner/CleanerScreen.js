import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, Switch,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, ROOMS } from '../constants';

const FAKE_MISSION = {
  id: 1,
  client: 'Sophie D.',
  address: '14 rue de la Paix, 75001 Paris',
  rooms: ['cuisine', 'salle_bain', 'salon'],
  hours: 2,
  distance: '0.8 km',
  earn: 44,
  lat: 48.8566,
  lng: 2.3522,
};

const MISSION_STEPS = [
  { icon: '🚗', label: 'En route vers le client' },
  { icon: '🔔', label: 'Arrivé — Notifier le client' },
  { icon: '🧹', label: 'Service démarré' },
  { icon: '✅', label: 'Service terminé !' },
];

export default function CleanerScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [mission, setMission] = useState(null); // null | 'incoming' | 'active' | 'done'
  const [missionStep, setMissionStep] = useState(0);
  const [tab, setTab] = useState('missions');
  const locationSub = useRef(null);

  // ── GPS tracking
  useEffect(() => {
    if (isOnline) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
    return () => stopLocationTracking();
  }, [isOnline]);

  async function startLocationTracking() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Permission de localisation refusée. Activez-la dans les paramètres.');
      setIsOnline(false);
      return;
    }
    setLocationError(null);

    // Get initial position
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLocation(pos.coords);

    // Watch position
    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 10 },
      pos => setLocation(pos.coords)
    );

    // Simulate incoming mission after 3s
    setTimeout(() => {
      if (isOnline) setMission('incoming');
    }, 3000);
  }

  function stopLocationTracking() {
    if (locationSub.current) {
      locationSub.current.remove();
      locationSub.current = null;
    }
    setMission(null);
    setMissionStep(0);
  }

  function acceptMission() {
    setMission('active');
    setMissionStep(0);
  }

  function declineMission() {
    setMission(null);
    setTimeout(() => { if (isOnline) setMission('incoming'); }, 5000);
  }

  function advanceStep() {
    const next = missionStep + 1;
    if (next >= MISSION_STEPS.length) {
      setMission('done');
      setTimeout(() => {
        setMission(null);
        setMissionStep(0);
        if (isOnline) setTimeout(() => setMission('incoming'), 4000);
      }, 2000);
      return;
    }
    setMissionStep(next);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Lava<Text style={{ color: COLORS.accent }}>GO</Text> <Text style={styles.proBadge}>Pro</Text></Text>
        <View style={styles.onlineRow}>
          <Text style={[styles.onlineLabel, isOnline && { color: COLORS.success }]}>
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={v => setIsOnline(v)}
            trackColor={{ false: COLORS.border, true: COLORS.success }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Profile banner */}
      <LinearGradient colors={COLORS.brandGrad} style={styles.profileBanner}>
        <View style={[styles.avatar, { backgroundColor: '#E879F9' }]}>
          <Text style={styles.avatarText}>K</Text>
        </View>
        <View>
          <Text style={styles.cleanerName}>Karim B.</Text>
          <Text style={styles.cleanerMeta}>⭐ 4.7 · Membre depuis mars 2024</Text>
        </View>
        <View style={[styles.gpsIndicator, location && styles.gpsActive]}>
          <Text style={{ fontSize: 12 }}>📡</Text>
          <Text style={[styles.gpsText, location && { color: COLORS.success }]}>
            {location ? 'GPS actif' : 'GPS off'}
          </Text>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatBox val="89" lbl="Services" />
        <StatBox val="4.7" lbl="Note" />
        <StatBox val="2 340€" lbl="Ce mois" />
        <StatBox val="178h" lbl="Travaillées" />
      </View>

      {/* Location error */}
      {locationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {locationError}</Text>
        </View>
      )}

      {/* GPS coordinates display */}
      {location && (
        <View style={styles.coordsBar}>
          <Text style={styles.coordsText}>
            📍 {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['missions', 'history', 'earnings'].map(t => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
              {t === 'missions' ? 'Missions' : t === 'history' ? 'Historique' : 'Gains'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ─── MISSIONS TAB ─── */}
        {tab === 'missions' && (
          <View>
            {/* Mini map with real GPS */}
            {isOnline && location && (
              <MapView
                style={styles.miniMap}
                region={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
              >
                <Marker
                  coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                  title="Vous"
                  description="Position en temps réel"
                  pinColor={COLORS.brand}
                />
                <Circle
                  center={{ latitude: location.latitude, longitude: location.longitude }}
                  radius={800}
                  fillColor="rgba(0,180,216,0.08)"
                  strokeColor={COLORS.brand}
                  strokeWidth={1}
                />
                {/* Mission marker */}
                {(mission === 'incoming' || mission === 'active') && (
                  <Marker
                    coordinate={{ latitude: FAKE_MISSION.lat, longitude: FAKE_MISSION.lng }}
                    title={FAKE_MISSION.client}
                    pinColor={COLORS.accent}
                  />
                )}
              </MapView>
            )}

            {/* Offline state */}
            {!isOnline && (
              <View style={styles.offlineCard}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>😴</Text>
                <Text style={styles.offlineTitle}>Vous êtes hors ligne</Text>
                <Text style={styles.offlineSub}>Activez le switch pour recevoir des missions.</Text>
              </View>
            )}

            {/* Online, no mission */}
            {isOnline && !mission && (
              <View style={styles.waitCard}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>⏳</Text>
                <Text style={styles.waitTitle}>En attente de mission…</Text>
                <Text style={styles.waitSub}>Votre position GPS est partagée en temps réel.</Text>
              </View>
            )}

            {/* Incoming mission */}
            {mission === 'incoming' && (
              <View style={styles.missionCard}>
                <View style={styles.missionBadge}>
                  <Text style={styles.missionBadgeText}>🔔 Nouvelle mission !</Text>
                </View>
                <Text style={styles.missionClient}>{FAKE_MISSION.client}</Text>
                <Text style={styles.missionAddr}>📍 {FAKE_MISSION.address}</Text>
                <View style={styles.missionRooms}>
                  {FAKE_MISSION.rooms.map(r => (
                    <Text key={r} style={styles.missionRoom}>{ROOMS[r]?.emoji} {ROOMS[r]?.label}</Text>
                  ))}
                </View>
                <Text style={styles.missionDetail}>⏱️ {FAKE_MISSION.hours} heures · 🚗 {FAKE_MISSION.distance}</Text>
                <Text style={styles.missionEarn}>+{FAKE_MISSION.earn} €</Text>
                <View style={styles.missionActions}>
                  <TouchableOpacity style={styles.btnAccept} onPress={acceptMission}>
                    <Text style={styles.btnAcceptText}>✓ Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnDecline} onPress={declineMission}>
                    <Text style={styles.btnDeclineText}>Décliner</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Active mission steps */}
            {mission === 'active' && (
              <View style={styles.activeMission}>
                <Text style={styles.activeTitle}>Mission en cours</Text>
                <Text style={styles.activeClient}>{FAKE_MISSION.client}</Text>
                <Text style={styles.activeAddr}>📍 {FAKE_MISSION.address}</Text>
                <View style={styles.stepsWrap}>
                  {MISSION_STEPS.map((s, i) => (
                    <View key={i} style={styles.mStep}>
                      <View style={[styles.mStepDot, i < missionStep && styles.mStepDone, i === missionStep && styles.mStepActive]}>
                        <Text style={{ fontSize: i < missionStep ? 11 : 16, color: (i <= missionStep) ? '#fff' : COLORS.muted }}>
                          {i < missionStep ? '✓' : s.icon}
                        </Text>
                      </View>
                      <Text style={[styles.mStepLabel, i === missionStep && { color: COLORS.brandDark, fontWeight: '700' }]}>{s.label}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={styles.btnNext} onPress={advanceStep}>
                  <LinearGradient colors={[COLORS.success, '#059669']} style={styles.btnNextGrad}>
                    <Text style={styles.btnNextText}>
                      {missionStep >= MISSION_STEPS.length - 1 ? '✅ Terminer la mission' : 'Étape suivante →'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Done */}
            {mission === 'done' && (
              <View style={styles.doneCard}>
                <Text style={{ fontSize: 48 }}>🎉</Text>
                <Text style={styles.doneTitle}>Mission terminée !</Text>
                <Text style={styles.doneEarn}>+{FAKE_MISSION.earn} € crédités</Text>
              </View>
            )}
          </View>
        )}

        {/* ─── HISTORY TAB ─── */}
        {tab === 'history' && (
          <View>
            {[
              { name: 'Marie L.', rooms: 'Cuisine + Salle de bain', hours: 2, earn: 44, stars: 5, date: 'Hier' },
              { name: 'Jean-Paul M.', rooms: 'Nettoyage complet', hours: 4, earn: 80, stars: 4, date: '23 mai' },
              { name: 'Léa T.', rooms: 'Chambre × 3', hours: 3, earn: 66, stars: 5, date: '21 mai' },
              { name: 'Ahmed B.', rooms: 'Salle de bain + Bureau', hours: 2, earn: 44, stars: 5, date: '18 mai' },
              { name: 'Claire D.', rooms: 'Salon + Cuisine', hours: 3, earn: 66, stars: 4, date: '15 mai' },
            ].map((h, i) => (
              <View key={i} style={styles.histItem}>
                <View style={styles.histIcon}><Text style={{ fontSize: 22 }}>🧹</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histName}>{h.name} — {h.rooms}</Text>
                  <Text style={styles.histMeta}>{h.date} · {h.hours}h · {'⭐'.repeat(h.stars)}</Text>
                </View>
                <Text style={styles.histEarn}>+{h.earn}€</Text>
              </View>
            ))}
          </View>
        )}

        {/* ─── EARNINGS TAB ─── */}
        {tab === 'earnings' && (
          <View>
            <LinearGradient colors={COLORS.brandGrad} style={styles.earningsCard}>
              <Text style={styles.earningsLbl}>Gains ce mois</Text>
              <Text style={styles.earningsVal}>2 340 €</Text>
              <View style={styles.earningsRow}>
                <EarningsCell val="89" lbl="Services" />
                <EarningsCell val="178h" lbl="Travaillées" />
                <EarningsCell val="22€" lbl="Taux/h" />
              </View>
            </LinearGradient>
            {[
              { week: 'Semaine 1 (1-7)', earn: '+480 €' },
              { week: 'Semaine 2 (8-14)', earn: '+560 €' },
              { week: 'Semaine 3 (15-21)', earn: '+620 €' },
              { week: 'Semaine en cours', earn: '+680 €', highlight: true },
            ].map((w, i) => (
              <View key={i} style={[styles.weekRow, w.highlight && styles.weekRowHighlight]}>
                <Text style={[styles.weekLabel, w.highlight && { color: '#fff' }]}>{w.week}</Text>
                <Text style={[styles.weekEarn, w.highlight && { color: '#A5F3FC' }]}>{w.earn}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.btnWithdraw}>
              <LinearGradient colors={COLORS.brandGrad} style={styles.btnWithdrawGrad}>
                <Text style={styles.btnWithdrawText}>💳 Demander un virement</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ val, lbl }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statVal}>{val}</Text>
      <Text style={styles.statLbl}>{lbl}</Text>
    </View>
  );
}

function EarningsCell({ val, lbl }) {
  return (
    <View style={styles.earningsCell}>
      <Text style={styles.earningsCellVal}>{val}</Text>
      <Text style={styles.earningsCellLbl}>{lbl}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logo: { fontSize: 22, fontWeight: '900', color: COLORS.brandDark, letterSpacing: -1 },
  proBadge: { fontSize: 13, fontWeight: '500', color: COLORS.gray },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  onlineLabel: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  profileBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,.6)' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  cleanerName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  cleanerMeta: { fontSize: 13, color: 'rgba(255,255,255,.85)' },
  gpsIndicator: { marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,.15)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, alignItems: 'center' },
  gpsActive: { backgroundColor: 'rgba(16,185,129,.2)' },
  gpsText: { fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: '600', marginTop: 2 },
  statsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statBox: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRightWidth: 1, borderRightColor: COLORS.border },
  statVal: { fontSize: 16, fontWeight: '800', color: COLORS.dark },
  statLbl: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  errorBanner: { backgroundColor: '#FEF2F2', borderBottomWidth: 1, borderBottomColor: '#FECACA', padding: 12 },
  errorText: { fontSize: 13, color: COLORS.danger, textAlign: 'center' },
  coordsBar: { backgroundColor: COLORS.light, padding: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  coordsText: { fontSize: 11, color: COLORS.gray, textAlign: 'center', fontFamily: 'monospace' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.brand },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.muted },
  tabBtnTextActive: { color: COLORS.brandDark },
  content: { flex: 1, padding: 16 },
  miniMap: { width: '100%', height: 180, borderRadius: 14, marginBottom: 16, overflow: 'hidden' },
  offlineCard: { alignItems: 'center', padding: 32 },
  offlineTitle: { fontSize: 17, fontWeight: '700', color: COLORS.dark },
  offlineSub: { fontSize: 13, color: COLORS.muted, marginTop: 6, textAlign: 'center' },
  waitCard: { alignItems: 'center', padding: 24, backgroundColor: COLORS.light, borderRadius: 14 },
  waitTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark },
  waitSub: { fontSize: 13, color: COLORS.gray, marginTop: 6, textAlign: 'center' },
  missionCard: { backgroundColor: '#FFF7ED', borderWidth: 2, borderColor: '#FDBA74', borderRadius: 14, padding: 20 },
  missionBadge: { backgroundColor: COLORS.accent, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12, alignSelf: 'flex-start', marginBottom: 12 },
  missionBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  missionClient: { fontSize: 18, fontWeight: '800', marginBottom: 6, color: COLORS.dark },
  missionAddr: { fontSize: 13, color: COLORS.gray, marginBottom: 10 },
  missionRooms: { gap: 4, marginBottom: 10 },
  missionRoom: { fontSize: 14, color: COLORS.slate },
  missionDetail: { fontSize: 13, color: COLORS.gray, marginBottom: 8 },
  missionEarn: { fontSize: 32, fontWeight: '900', color: COLORS.accent, textAlign: 'center', marginVertical: 10 },
  missionActions: { flexDirection: 'row', gap: 12 },
  btnAccept: { flex: 2, backgroundColor: COLORS.success, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  btnAcceptText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnDecline: { flex: 1, borderWidth: 2, borderColor: COLORS.border, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  btnDeclineText: { color: COLORS.gray, fontSize: 15, fontWeight: '600' },
  activeMission: { backgroundColor: COLORS.light, borderRadius: 14, padding: 20 },
  activeTitle: { fontSize: 13, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  activeClient: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 4 },
  activeAddr: { fontSize: 13, color: COLORS.gray, marginBottom: 16 },
  stepsWrap: { gap: 12, marginBottom: 20 },
  mStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mStepDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  mStepDone: { backgroundColor: COLORS.success },
  mStepActive: { backgroundColor: COLORS.brand },
  mStepLabel: { fontSize: 14, fontWeight: '500', color: COLORS.gray, flex: 1 },
  btnNext: { borderRadius: 999, overflow: 'hidden' },
  btnNextGrad: { paddingVertical: 14, alignItems: 'center', borderRadius: 999 },
  btnNextText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  doneCard: { alignItems: 'center', padding: 32 },
  doneTitle: { fontSize: 22, fontWeight: '800', color: COLORS.dark, marginTop: 12 },
  doneEarn: { fontSize: 20, fontWeight: '700', color: COLORS.success, marginTop: 8 },
  histItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  histIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.light, alignItems: 'center', justifyContent: 'center' },
  histName: { fontSize: 14, fontWeight: '600', color: COLORS.dark, marginBottom: 2 },
  histMeta: { fontSize: 12, color: COLORS.gray },
  histEarn: { fontSize: 16, fontWeight: '700', color: COLORS.success },
  earningsCard: { borderRadius: 14, padding: 20, marginBottom: 14 },
  earningsLbl: { fontSize: 13, color: 'rgba(255,255,255,.8)', marginBottom: 4 },
  earningsVal: { fontSize: 38, fontWeight: '900', color: '#fff', letterSpacing: -2, marginBottom: 12 },
  earningsRow: { flexDirection: 'row', gap: 8 },
  earningsCell: { flex: 1, backgroundColor: 'rgba(255,255,255,.15)', borderRadius: 10, padding: 10, alignItems: 'center' },
  earningsCellVal: { fontSize: 18, fontWeight: '800', color: '#fff' },
  earningsCellLbl: { fontSize: 11, color: 'rgba(255,255,255,.75)' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: COLORS.light, borderRadius: 12, marginBottom: 8 },
  weekRowHighlight: { backgroundColor: COLORS.brand },
  weekLabel: { fontSize: 14, color: COLORS.dark },
  weekEarn: { fontSize: 14, fontWeight: '700', color: COLORS.success },
  btnWithdraw: { borderRadius: 999, overflow: 'hidden', marginTop: 8 },
  btnWithdrawGrad: { paddingVertical: 14, alignItems: 'center', borderRadius: 999 },
  btnWithdrawText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
