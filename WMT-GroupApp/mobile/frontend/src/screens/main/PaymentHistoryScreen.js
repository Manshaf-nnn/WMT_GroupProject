import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import { Receipt, Download } from 'lucide-react-native';
import { useTheme, fontSize, space, radius, formatCurrency } from '../../theme';
import { ScreenContainer, Header, Skeleton, EmptyState } from '../../components/ui';
import { paymentApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const STATUS_TONE = { completed: '#2F9E6E', pending: '#D4A437', failed: '#D45A5A', refunded: '#9aa0a6' };

export default function PaymentHistoryScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await paymentApi.history()); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const printReceipt = async (p) => {
    try {
      const html = `
      <html><head><meta charset="utf-8"/></head>
      <body style="font-family: -apple-system, system-ui, sans-serif; padding:36px; color:#0E0E10;">
        <div style="border-bottom: 2px solid #C8A45C; padding-bottom: 18px; margin-bottom: 24px;">
          <div style="letter-spacing:6px; color:#C8A45C; font-size: 11px; font-weight:700;">MAISON</div>
          <h1 style="margin:6px 0 0 0; font-size: 28px;">Receipt</h1>
        </div>
        <div style="font-size:14px; line-height:1.8;">
          <div><strong>Restaurant:</strong> ${p.booking?.restaurant?.name || '—'}</div>
          <div><strong>Date:</strong> ${new Date(p.createdAt).toLocaleString()}</div>
          <div><strong>Transaction:</strong> ${p.transactionId}</div>
          <div><strong>Method:</strong> ${p.paymentMethod}</div>
          <div><strong>Type:</strong> ${p.type}</div>
        </div>
        <div style="margin-top: 36px; padding: 20px; background:#F6F1E7; border-radius: 12px;">
          <div style="display:flex; justify-content:space-between; font-size: 24px; font-weight:800;">
            <span>Total</span>
            <span>${formatCurrency(p.amount, p.currency || 'USD')}</span>
          </div>
        </div>
        <div style="margin-top: 36px; font-size: 11px; color: rgba(0,0,0,0.5); letter-spacing:1px;">
          Thank you for dining with Maison.
        </div>
      </body></html>`;
      await Print.printAsync({ html });
    } catch (err) { toast.show('Could not generate PDF', 'error'); }
  };

  const refund = (p) => {
    if (p.status !== 'completed') return;
    Alert.alert('Issue refund?', 'For demo purposes only.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Refund', style: 'destructive', onPress: async () => {
        try { await paymentApi.refund(p._id); toast.show('Refunded', 'success'); load(); }
        catch (err) { toast.show(friendlyError(err), 'error'); }
      }}
    ]);
  };

  return (
    <ScreenContainer>
      <Header title="Billing" />
      {loading ? (
        <View style={{ padding: space.lg }}>
          <Skeleton height={80} br={radius.md} style={{ marginBottom: 8 }} />
          <Skeleton height={80} br={radius.md} style={{ marginBottom: 8 }} />
          <Skeleton height={80} br={radius.md} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState icon={<Receipt size={28} color={theme.textMuted} />} title="No payments yet" message="Your receipts will appear here." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it._id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.accent} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <Pressable onLongPress={() => refund(item)}>
              <View style={{
                backgroundColor: theme.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.surfaceLine,
                padding: space.lg
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800' }}>
                      {item.booking?.restaurant?.name || 'Reservation deposit'}
                    </Text>
                    <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · {item.paymentMethod}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: theme.text, fontSize: fontSize.lg, fontWeight: '900' }}>
                      {formatCurrency(item.amount, item.currency)}
                    </Text>
                    <Text style={{
                      color: STATUS_TONE[item.status] || theme.textMuted,
                      fontSize: 10, letterSpacing: 1.4, fontWeight: '700', textTransform: 'uppercase', marginTop: 2
                    }}>{item.status}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.surfaceLine }}>
                  <Text style={{ color: theme.textMuted, fontSize: 11, flex: 1 }} numberOfLines={1}>{item.transactionId}</Text>
                  <Pressable onPress={() => printReceipt(item)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: theme.surfaceMuted }}>
                    <Download size={11} color={theme.accent} />
                    <Text style={{ marginLeft: 4, color: theme.accent, fontSize: 11, fontWeight: '700' }}>Receipt</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </ScreenContainer>
  );
}
