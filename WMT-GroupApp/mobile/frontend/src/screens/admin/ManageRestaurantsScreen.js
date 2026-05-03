import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView
} from 'react-native';
import { COLORS } from '../../theme/colors';
import api from '../../services/api';
import CustomButton from '../../components/CustomButton';

const ManageRestaurantsScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('$$');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data } = await api.get('/restaurants');
      setRestaurants(data);
    } catch (error) {
      Alert.alert('Error', 'Could not load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestaurant = async () => {
    if (!name || !cuisine || !location || !description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await api.post('/restaurants', {
        name, cuisine, location, priceRange, description
      });
      Alert.alert('Success', 'Restaurant added successfully');
      setModalVisible(false);
      fetchRestaurants();
      // Reset form
      setName(''); setCuisine(''); setLocation(''); setDescription('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add restaurant');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm', 'Delete this restaurant?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/restaurants/${id}`);
          fetchRestaurants();
        } catch (e) { Alert.alert('Error', 'Delete failed'); }
      }}
    ]);
  };

  const renderRestaurant = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.resName}>{item.name}</Text>
        <Text style={styles.resSub}>{item.cuisine} • {item.location}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id)}>
        <Text style={styles.deleteBtn}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Restaurants</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtn}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item._id}
        renderItem={renderRestaurant}
        contentContainerStyle={styles.list}
      />

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Restaurant</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeModal}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <Text style={styles.label}>Restaurant Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="The Grand Hall" placeholderTextColor="#666" />
              
              <Text style={styles.label}>Cuisine Type</Text>
              <TextInput style={styles.input} value={cuisine} onChangeText={setCuisine} placeholder="French / Italian / etc" placeholderTextColor="#666" />
              
              <Text style={styles.label}>Location</Text>
              <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="City, Area" placeholderTextColor="#666" />
              
              <Text style={styles.label}>Price Range</Text>
              <View style={styles.priceContainer}>
                {['$', '$$', '$$$', '$$$$'].map(p => (
                  <TouchableOpacity key={p} style={[styles.priceChip, priceRange === p && styles.priceChipActive]} onPress={() => setPriceRange(p)}>
                    <Text style={[styles.priceText, priceRange === p && styles.priceTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, { height: 100 }]} value={description} onChangeText={setDescription} multiline placeholder="Describe the experience..." placeholderTextColor="#666" />
              
              <CustomButton title="Add Restaurant" onPress={handleAddRestaurant} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { fontSize: 24, color: COLORS.text },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  addBtn: { fontSize: 32, color: COLORS.primary },
  list: { padding: 20 },
  card: { backgroundColor: COLORS.surface, padding: 18, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  resName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  resSub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  deleteBtn: { fontSize: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  closeModal: { fontSize: 24, color: COLORS.textSecondary },
  label: { color: COLORS.text, fontWeight: '600', marginBottom: 8, fontSize: 14 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, color: COLORS.text, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  priceContainer: { flexDirection: 'row', marginBottom: 16 },
  priceChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.background, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  priceChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  priceText: { color: COLORS.textSecondary, fontWeight: '700' },
  priceTextActive: { color: COLORS.background }
});

export default ManageRestaurantsScreen;
