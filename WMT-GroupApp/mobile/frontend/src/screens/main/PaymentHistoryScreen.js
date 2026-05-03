import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';

const PaymentHistoryScreen = ({ navigation }) => {
  const transactions = [
    { id: '1', amount: '$50.00', date: '2026-05-01', restaurant: 'The Golden Palace', type: 'Reservation Fee' },
    { id: '2', amount: '$50.00', date: '2026-04-28', restaurant: 'Azure Seafood Grill', type: 'Reservation Fee' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.resName}>{item.restaurant}</Text>
        <Text style={styles.details}>{item.type} • {item.date}</Text>
      </View>
      <Text style={styles.amount}>{item.amount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment History</Text>
      </View>
      <FlatList 
        data={transactions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>No transactions found.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backButton: { width: 45, height: 45, borderRadius: 22, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: COLORS.border },
  backIcon: { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  resName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  details: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  amount: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 }
});

export default PaymentHistoryScreen;
