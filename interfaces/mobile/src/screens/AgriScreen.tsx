import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { palette } from '../theme/palette';
import { agriService, algoService } from '../services/api';
import { Leaf, PlusCircle, Navigation, Search, Activity } from '../components/Icons';

export default function AgriScreen({ route }: any) {
  const user = route.params?.user || {};
  const [activeTab, setActiveTab] = useState<'lots' | 'harvest' | 'transport'>('lots');
  const [loading, setLoading] = useState(false);
  const [lots, setLots] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  // Harvest Form
  const [productType, setProductType] = useState('Vanille');
  const [weight, setWeight] = useState('');
  const [quality, setQuality] = useState('Premium');
  const [harvestDistrict, setHarvestDistrict] = useState(user.district || 'Sambava');

  // Transport Form
  const [selectedLotId, setSelectedLotId] = useState('');
  const [destination, setDestination] = useState('Antananarivo');

  useEffect(() => {
    fetchLots();
    fetchDistricts();
  }, []);

  const fetchLots = async () => {
    setLoading(true);
    try {
      const data = await agriService.getAllLots();
      setLots(data);
    } catch (error) {
      console.error('Erreur chargement des lots', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const data = await algoService.getDistricts();
      setDistricts(data);
    } catch (error) {
      console.error('Erreur chargement des districts', error);
    }
  };

  const handleHarvest = async () => {
    if (!weight) return;
    setLoading(true);
    try {
      const res = await agriService.recordHarvest({
        owner_id: user.public_key || "PUB_DEMO",
        product_type: productType,
        district: harvestDistrict,
        weight: parseFloat(weight),
        quality: quality
      });
      alert(`Récolte enregistrée ! Lot ID: ${res.lot.id}`);
      setActiveTab('lots');
      fetchLots();
    } catch (error) {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleTransport = async () => {
    if (!selectedLotId || !destination) return;
    setLoading(true);
    try {
      const res = await agriService.optimizeTransport({
        lot_id: selectedLotId,
        destination: destination
      });
      alert(`Transport optimisé ! Chemin: ${res.lot.traceability[res.lot.traceability.length - 1].chemin.join(' -> ')}`);
      setActiveTab('lots');
      fetchLots();
    } catch (error) {
      alert("Erreur lors du calcul du transport");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Leaf color={palette.accent} size={32} />
        <Text style={styles.title}>Agriculture 2.0</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'lots' && styles.activeTab]} 
          onPress={() => setActiveTab('lots')}
        >
          <Text style={[styles.tabText, activeTab === 'lots' && styles.activeTabText]}>Mes Lots</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'harvest' && styles.activeTab]} 
          onPress={() => setActiveTab('harvest')}
        >
          <Text style={[styles.tabText, activeTab === 'harvest' && styles.activeTabText]}>Récolte</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'transport' && styles.activeTab]} 
          onPress={() => setActiveTab('transport')}
        >
          <Text style={[styles.tabText, activeTab === 'transport' && styles.activeTabText]}>Logistique</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'lots' && (
          <View>
            <Text style={styles.sectionTitle}>Traçabilité Blockchain</Text>
            {loading ? (
              <ActivityIndicator color={palette.accent} size="large" style={{ marginTop: 20 }} />
            ) : lots.length === 0 ? (
              <Text style={styles.emptyText}>Aucun lot enregistré pour le moment.</Text>
            ) : (
              lots.map((lot) => (
                <View key={lot.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.lotId}>{lot.id}</Text>
                    <Text style={[styles.statusTag, { backgroundColor: lot.status === 'RECOLTE' ? '#4CAF50' : '#2196F3' }]}>
                      {lot.status}
                    </Text>
                  </View>
                  <Text style={styles.cardText}><Text style={styles.bold}>Produit:</Text> {lot.product_type}</Text>
                  <Text style={styles.cardText}><Text style={styles.bold}>Poids:</Text> {lot.weight} kg</Text>
                  <Text style={styles.cardText}><Text style={styles.bold}>Origine:</Text> {lot.district_origin}</Text>
                  <View style={styles.timeline}>
                    {lot.traceability.map((step: any, idx: number) => (
                      <View key={idx} style={styles.timelineItem}>
                        <View style={styles.dot} />
                        <Text style={styles.timelineText}>{step.action} - {step.lieu || step.destination}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'harvest' && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Enregistrer une Récolte</Text>
            <Text style={styles.label}>Type de Produit</Text>
            <TextInput style={styles.input} value={productType} onChangeText={setProductType} placeholder="Vanille, Girofle, Café..." />
            
            <Text style={styles.label}>Poids (kg)</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="Ex: 50.5" />
            
            <Text style={styles.label}>Qualité</Text>
            <TextInput style={styles.input} value={quality} onChangeText={setQuality} placeholder="Premium, Grade A..." />

            <TouchableOpacity style={styles.button} onPress={handleHarvest} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <><PlusCircle color="white" size={20} /><Text style={styles.buttonText}>Valider sur Blockchain</Text></>}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'transport' && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Calcul Trajet Optimal (A*)</Text>
            <Text style={styles.label}>Sélectionner un Lot</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lotSelector}>
              {lots.map(lot => (
                <TouchableOpacity 
                  key={lot.id} 
                  style={[styles.lotChip, selectedLotId === lot.id && styles.activeChip]} 
                  onPress={() => setSelectedLotId(lot.id)}
                >
                  <Text style={[styles.chipText, selectedLotId === lot.id && styles.activeChipText]}>{lot.id}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Destination</Text>
            <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="Ex: Antananarivo" />

            <TouchableOpacity style={[styles.button, { backgroundColor: palette.secondary }]} onPress={handleTransport} disabled={loading || !selectedLotId}>
              {loading ? <ActivityIndicator color="white" /> : <><Navigation color="white" size={20} /><Text style={styles.buttonText}>Optimiser Logistique</Text></>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', marginLeft: 10, color: palette.text },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: palette.lightGray, backgroundColor: 'white' },
  tab: { flex: 1, padding: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: palette.accent },
  tabText: { color: palette.gray, fontWeight: '600' },
  activeTabText: { color: palette.accent },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: palette.text },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  lotId: { fontWeight: 'bold', color: palette.accent },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, color: 'white', fontSize: 10, fontWeight: 'bold' },
  cardText: { fontSize: 14, marginBottom: 5, color: palette.text },
  bold: { fontWeight: 'bold' },
  timeline: { marginTop: 10, borderLeftWidth: 2, borderLeftColor: palette.lightGray, paddingLeft: 15 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.accent, position: 'absolute', left: -19 },
  timelineText: { fontSize: 12, color: palette.gray },
  form: { backgroundColor: 'white', borderRadius: 12, padding: 20, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: palette.gray },
  input: { borderWidth: 1, borderColor: palette.lightGray, borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: '#F9FAFB' },
  button: { backgroundColor: palette.accent, borderRadius: 8, padding: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
  emptyText: { textAlign: 'center', marginTop: 40, color: palette.gray },
  lotSelector: { marginBottom: 15 },
  lotChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: palette.lightGray, marginRight: 10 },
  activeChip: { backgroundColor: palette.accent, borderColor: palette.accent },
  chipText: { fontSize: 12, color: palette.gray },
  activeChipText: { color: 'white' },
});
