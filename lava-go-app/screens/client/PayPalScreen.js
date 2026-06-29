import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ActivityIndicator,
  TouchableOpacity, Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, PAYPAL_CLIENT_ID, PAYPAL_ENV } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * PayPalScreen
 * ──────────────────────────────────────────────────────────────
 * Intègre le bouton PayPal via WebView avec le SDK PayPal JS.
 * 
 * Pour activer :
 *   1. Créez un compte sur https://developer.paypal.com
 *   2. Créez une app sandbox → copiez le Client ID
 *   3. Remplacez PAYPAL_CLIENT_ID dans constants.js
 *   4. Changez PAYPAL_ENV en 'production' pour la mise en production
 * ──────────────────────────────────────────────────────────────
 */
export default function PayPalScreen({ navigation, route }) {
  const { price, rooms, hours, address, cleaner } = route.params;
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // null | 'success' | 'error' | 'cancel'
  const webviewRef = useRef(null);

  const paypalHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, sans-serif;
      background: #F0F7FF;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      min-height: 100vh; padding: 24px;
    }
    .card {
      background: white; border-radius: 16px;
      padding: 28px; width: 100%; max-width: 380px;
      box-shadow: 0 4px 24px rgba(0,0,0,.1);
    }
    h2 { font-size: 20px; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
    .sub { font-size: 14px; color: #64748B; margin-bottom: 20px; }
    .amount { font-size: 40px; font-weight: 900; color: #0077B6; letter-spacing: -2px; text-align: center; margin: 16px 0; }
    .details { background: #F0F7FF; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
    .row { display: flex; justify-content: space-between; font-size: 14px; color: #64748B; padding: 4px 0; }
    .row span:last-child { font-weight: 600; color: #0F172A; }
    #paypal-button-container { width: 100%; min-height: 48px; }
    .secure { text-align: center; font-size: 12px; color: #94A3B8; margin-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🫧 LavaGO — Paiement</h2>
    <p class="sub">Paiement sécurisé via PayPal</p>
    <div class="amount">${price} €</div>
    <div class="details">
      <div class="row"><span>Service</span><span>${hours}h de ménage</span></div>
      <div class="row"><span>Pièces</span><span>${rooms.join(', ')}</span></div>
      <div class="row"><span>Adresse</span><span>${address?.city || 'Votre domicile'}</span></div>
    </div>
    <div id="paypal-button-container"></div>
    <p class="secure">🔒 Paiement 100% sécurisé · PayPal</p>
  </div>

  <script src="https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR&locale=fr_FR&intent=capture"></script>
  <script>
    paypal.Buttons({
      style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay' },
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: { value: '${price}.00', currency_code: 'EUR' },
            description: 'LavaGO — ${hours}h de nettoyage'
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SUCCESS',
            orderId: details.id,
            payer: details.payer.name.given_name + ' ' + details.payer.name.surname,
            amount: '${price}'
          }));
        });
      },
      onError: function(err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', error: err.toString() }));
      },
      onCancel: function(data) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CANCEL' }));
      }
    }).render('#paypal-button-container');
  </script>
</body>
</html>`;

  function handleMessage(event) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'SUCCESS') {
        setStatus('success');
        navigation.replace('Done', {
          cleaner,
          rooms,
          hours,
          price,
          paypalOrderId: msg.orderId,
          payerName: msg.payer,
        });
      } else if (msg.type === 'ERROR') {
        setStatus('error');
        Alert.alert('Erreur PayPal', 'Une erreur est survenue. Veuillez réessayer.');
      } else if (msg.type === 'CANCEL') {
        setStatus('cancel');
      }
    } catch (e) {}
  }

  // If PayPal Client ID not set, show config screen
  if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'VOTRE_PAYPAL_CLIENT_ID_ICI') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.configScreen}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>💳</Text>
          <Text style={styles.configTitle}>PayPal non configuré</Text>
          <Text style={styles.configDesc}>
            Pour activer le paiement PayPal :{'\n\n'}
            1. Créez un compte sur{'\n'}
            <Text style={{ color: COLORS.brandDark, fontWeight: '700' }}>developer.paypal.com</Text>
            {'\n\n'}
            2. Créez une App Sandbox{'\n\n'}
            3. Copiez votre <Text style={{ fontWeight: '700' }}>Client ID</Text> dans{'\n'}
            <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>constants.js → PAYPAL_CLIENT_ID</Text>
          </Text>

          <LinearGradient colors={COLORS.brandGrad} style={styles.demoBtnGrad}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => navigation.replace('Done', { cleaner, rooms, hours, price, paypalOrderId: 'DEMO-ORDER', payerName: 'Demo User' })}
            >
              <Text style={styles.demoBtnText}>🚀 Simuler le paiement (démo)</Text>
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={{ color: COLORS.gray, textDecorationLine: 'underline' }}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement PayPal</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.brand} />
          <Text style={styles.loadingText}>Chargement PayPal…</Text>
        </View>
      )}

      <WebView
        ref={webviewRef}
        source={{ html: paypalHTML }}
        onLoadEnd={() => setLoading(false)}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        style={{ flex: 1 }}
        originWhitelist={['*']}
        mixedContentMode="always"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.light, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: COLORS.slate },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.dark },
  loadingOverlay: { position: 'absolute', zIndex: 99, top: 80, left: 0, right: 0, alignItems: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.gray },
  configScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  configTitle: { fontSize: 22, fontWeight: '800', color: COLORS.dark, marginBottom: 16 },
  configDesc: { fontSize: 14, color: COLORS.gray, lineHeight: 22, textAlign: 'center', marginBottom: 28 },
  demoBtnGrad: { borderRadius: 999, overflow: 'hidden' },
  demoBtn: { paddingVertical: 16, paddingHorizontal: 32 },
  demoBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
