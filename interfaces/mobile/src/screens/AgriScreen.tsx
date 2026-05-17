import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '../theme/palette';
import { agriService } from '../services/api';
import { Leaf, Navigation, PlusCircle, RefreshCw } from '../components/Icons';
import { FadeInView, SkeletonLoader } from '../components/Animations';

export default function AgriScreen({ route }: any) {
  const [activeTab, setActiveTab] = useState<'harvest' | 'tracking'>('harvest');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Form fields
  const [productType, setProductType] = useState('Vanille');
  const [district, setDistrict] = useState('');
  const [weight, setWeight] = useState('');
  const [quality, setQuality] = useState('Premium');
  
  // Tracking fields
  const [lots, setLots] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await agriService.getAllLots();
      setLots(res.reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleHarvest = async () => {
    if (!district || !weight) return;
    setLoading(true);
    try {
      await agriService.recordHarvest({
        owner_id: route.params?.user?.public_key || 'ANONYMOUS',
        product_type: productType,
        district,
        weight: parseFloat(weight),
        quality
      });
      Alert.alert('Succès', 'Récolte enregistrée sur la blockchain');
      setDistrict('');
      setWeight('');
      fetchData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d’enregistrer la récolte');
    } finally {
      setLoading(false);
    }
  };

  const renderLotItem = ({ item }: { item: any }) => (
    <FadeInView style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.lotId}>{item.id}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.productTitle}>{item.product_type} - {item.weight}kg</Text>
      <Text style={styles.lotInfo}>Origine: {item.district_origin}</Text>
      <Text style={styles.lotInfo}>Qualité: {item.quality}</Text>
    </FadeInView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Leaf color={palette.accent} size={32} />
        <Text style={styles.title}>Agriculture</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'harvest' && styles.activeTab]} 
          onPress={() => setActiveTab('harvest')}
        >
          <Text style={[styles.tabText, activeTab === 'harvest' && styles.activeTabText]}>Récolte</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tracking' && styles.activeTab]} 
          onPress={() => setActiveTab('tracking')}
        >
          <Text style={[styles.tabText, activeTab === 'tracking' && styles.activeTabText]}>Traçabilité</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'harvest' && (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <FadeInView style={styles.form}>
              <Text style={styles.sectionTitle}>Enregistrer une Récolte</Text>
              
              <Text style={styles.label}>Type de Produit</Text>
              <View style={styles.chipRow}>
                 {['Vanille', 'Café', 'Girofle', 'Poivre', 'Cacao'].map(p => (
                   <TouchableOpacity 
                    key={p} 
                    style={[styles.chip, productType === p && styles.chipActive]} 
                    onPress={() => setProductType(p)}
                   >
                     <Text style={[styles.chipText, productType === p && styles.chipTextActive]}>{p}</Text>
                   </TouchableOpacity>
                 ))}
              </View>

              <Text style={styles.label}>District</Text>
              <TextInput style={styles.input} value={district} onChangeText={setDistrict} placeholder="Ex: Sambava" placeholderTextColor={palette.gray} />
              
              <Text style={styles.label}>Poids (kg)</Text>
              <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="Ex: 50.5" placeholderTextColor={palette.gray} />

              <TouchableOpacity style={styles.button} onPress={handleHarvest} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <><PlusCircle color="white" size={20} /><Text style={styles.buttonText}>Inscrire en Blockchain</Text></>}
              </TouchableOpacity>
            </FadeInView>
          </ScrollView>
        )}

        {activeTab === 'tracking' && (
          <View style={{ flex: 1 }}>
            {initialLoading ? (
              <View style={{ gap: 10 }}>
                <SkeletonLoader style={{ height: 120 }} />
                <SkeletonLoader style={{ height: 120 }} />
              </View>
            ) : (
              <FlatList
                data={lots}
                renderItem={renderLotItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.empty}>Aucun lot enregistré</Text>}
                onRefresh={fetchData}
                refreshing={loading}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: palette.surface },
  title: { fontSize: 24, fontWeight: 'bold', marginLeft: 10, color: palette.ink },
  tabBar: { flexDirection: 'row', backgroundColor: palette.surface, borderBottomWidth: 1, borderBottomColor: palette.lightGray },
  tab: { flex: 1, padding: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: palette.accent },
  tabText: { color: palette.gray, fontWeight: '600' },
  activeTabText: { color: palette.accent },
  content: { flex: 1, padding: 20 },
  form: { backgroundColor: palette.surface, borderRadius: 20, padding: 20, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: palette.ink },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: palette.gray },
  input: { 
    borderWidth: 1.5, 
    borderColor: palette.lightGray, 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 15, 
    backgroundColor: palette.background,
    color: palette.ink
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: palette.lightGray, marginRight: 10, marginBottom: 10 },
  chipActive: { backgroundColor: palette.accentTransparent, borderWidth: 1, borderColor: palette.accent },
  chipText: { fontSize: 12, color: palette.gray, fontWeight: 'bold' },
  chipTextActive: { color: palette.accent },
  button: { 
    backgroundColor: palette.accent, 
    borderRadius: 14, 
    padding: 15, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
  card: { 
    backgroundColor: palette.surface, 
    borderRadius: 18, 
    padding: 18, 
    marginBottom: 15, 
    elevation: 2,
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  lotId: { fontSize: 12, color: palette.gray, fontWeight: 'bold' },
  statusBadge: { backgroundColor: palette.accentTransparent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 10, color: palette.accent, fontWeight: '900' },
  productTitle: { fontSize: 18, fontWeight: '900', color: palette.ink },
  lotInfo: { fontSize: 13, color: palette.gray, marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: palette.gray }
});
