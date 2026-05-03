import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { COLORS } from '../../theme/colors';

const SettingsScreen = ({ navigation }) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Summary */}
        <View style={styles.profileSummary}>
          <View style={styles.miniAvatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>
          <View>
            <Text style={styles.userName}>Manshaf</Text>
            <Text style={styles.userEmail}>gmail@gmail.com</Text>
          </View>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Push Notifications</Text>
              <Text style={styles.subLabel}>Receive alerts for your bookings</Text>
            </View>
            <Switch 
              value={pushEnabled} 
              onValueChange={setPushEnabled}
              trackColor={{ false: '#334155', true: COLORS.primary }} 
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 10, paddingTop: 10 }]}>
            <View>
              <Text style={styles.label}>Email Updates</Text>
              <Text style={styles.subLabel}>Monthly newsletter and offers</Text>
            </View>
            <Switch 
              value={emailEnabled} 
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#334155', true: COLORS.primary }} 
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>ACCOUNT MANAGEMENT</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.label}>Change Password</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 10, paddingTop: 10 }]}>
            <Text style={styles.label}>Privacy Settings</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>HELP & SUPPORT</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.label}>Contact Support</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 10, paddingTop: 10 }]}>
            <Text style={styles.label}>Terms of Service</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>DANGER ZONE</Text>
        <TouchableOpacity style={[styles.section, { borderColor: '#EF444422' }]} onPress={() => Alert.alert('Delete Account', 'This action cannot be undone.')}>
          <View style={styles.menuItem}>
            <Text style={[styles.label, { color: '#EF4444' }]}>Delete My Account</Text>
            <Text style={[styles.arrow, { color: '#EF4444' }]}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={() => Alert.alert('Success', 'Preferences saved successfully!')}
        >
          <Text style={styles.saveBtnText}>Save Preferences</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Luxury Restaurant v1.0.0 (Build 2026)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40 },
  backButton: { width: 45, height: 45, borderRadius: 22, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: COLORS.border },
  backIcon: { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  content: { padding: 20, paddingBottom: 50 },
  profileSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 20, borderRadius: 24, marginBottom: 30, borderWidth: 1, borderColor: COLORS.border },
  miniAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: COLORS.background, fontSize: 20, fontWeight: '900' },
  userName: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  userEmail: { color: COLORS.textSecondary, fontSize: 14 },
  sectionTitle: { color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 12, marginTop: 10 },
  section: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 18, marginBottom: 25, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  subLabel: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  arrow: { color: COLORS.textSecondary, fontSize: 20, fontWeight: '300' },
  saveBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  saveBtnText: { color: COLORS.background, fontSize: 16, fontWeight: '900' },
  version: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 30, opacity: 0.5 }
});

export default SettingsScreen;
