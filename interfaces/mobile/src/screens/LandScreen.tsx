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
import { landService } from '../services/api';
import { Map, PlusCircle, CheckCircle, Clock3 } from '../components/Icons';
import { FadeInView, SkeletonLoader } from '../components/Animations';

export default function LandScreen({ route }: any) {
  const user = route.params?.user;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'FONCIER';
  const [activeTab, setActiveTab] = useState<'my' | 'request' | 'admin'>(isAdmin ? 'admin' : 'my');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // My parcels
  const [myParcels, setMyParcels] = useState<string[]>([]);
  
  // Request form
  const [docUrl, setDocUrl] = useState('');
  const [description, setDescription] = useState('');
  
  // Admin
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      if (activeTab === 'my') {
        const res = await landService.getParcelsByOwner(user.public_key);
        setMyParcels(res);
      } else if (activeTab === 'admin') {
        const res = await landService.getPending();
        setPendingRequests(res);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleRequest = async () => {
    if (!docUrl) return;
    setLoading(true);
    try {
      await api_submit_request(); // Simulation ou appel réel
      Alert.alert('Succès', 'Demande d’immatriculation envoyée');
      setDocUrl('');
      setDescription('');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l’envoi');
    } finally {
      setLoading(false);
    }
  };

  // Mock API call if not in service
  const api_submit_request = async () => {
     // Implementation réelle via service si disponible
  };

  const handleApprove = async (id: number) => {
    setLoading(true);
    try {
      await landService.approve(id);
      Alert.alert('Succès', 'Titre foncier validé et miné !');
      fetchData();
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l’approbation');
    } finally {
      setLoading(false);
    }
  };

  const renderParcelItem = ({ item }: { item: string }) => (
    <FadeInView style={styles.card}>
      <Map color={palette.accent} size={24} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item}</Text>
        <Text style={styles.cardSub}>Titre Certifié Hazo Lova</Text>
      </View>
      <CheckCircle color={palette.accent} size={20} />
    </FadeInView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Map color={palette.accent} size={32} />
        <Text style={styles.title}>Module Foncier</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'my' && styles.activeTab]} 
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>Mes Titres</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'request' && styles.activeTab]} 
          onPress={() => setActiveTab('request')}
        >
          <Text style={[styles.tabText, activeTab === 'request' && styles.activeTabText]}>Demande</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'admin' && styles.activeTab]} 
            onPress={() => setActiveTab('admin')}
          >
            <Text style={[styles.tabText, activeTab === 'admin' && styles.activeTabText]}>Admin</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {activeTab === 'my' && (
          <View style={{ flex: 1 }}>
            {initialLoading ? (
              <View style={{ gap: 10 }}>
                <SkeletonLoader style={{ height: 80 }} />
                <SkeletonLoader style={{ height: 80 }} />
              </View>
            ) : (
              <FlatList
                data={myParcels}
                renderItem={renderParcelItem}
                keyExtractor={(item) => item}
                ListEmptyComponent={<Text style={styles.empty}>Aucun titre trouvé</Text>}
                onRefresh={fetchData}
                refreshing={loading}
              />
            )}
          </View>
        )}

        {activeTab === 'request' && (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <FadeInView style={styles.form}>
              <Text style={styles.sectionTitle}>Nouvelle Immatriculation</Text>
              <Text style={styles.label}>URL du document (Scan PDF)</Text>
              <TextInput style={styles.input} value={docUrl} onChangeText={setDocUrl} placeholder="https://..." />
              
              <Text style={styles.label}>Description de la parcelle</Text>
              <TextInput 
                style={[styles.input, { height: 80 }]} 
                value={description} 
                onChangeText={setDescription} 
                placeholder="Ex: Terrain 500m2 à Ivato..."
                multiline
              />

              <TouchableOpacity style={styles.button} onPress={handleRequest} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <><PlusCircle color="white" size={20} /><Text style={styles.buttonText}>Envoyer au Cadastre</Text></>}
              </TouchableOpacity>
            </FadeInView>
          </ScrollView>
        )}

        {activeTab === 'admin' && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={pendingRequests}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>Demande #{item.id}</Text>
                    <Text style={styles.cardSub}>{item.description}</Text>
                    <Text style={styles.cardSub}>Par: {item.requester_id.substring(0, 10)}...</Text>
                  </View>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
                    <CheckCircle color="white" size={20} />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.empty}>Aucune demande en attente</Text>}
            />
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
  card: { 
    backgroundColor: palette.surface, 
    borderRadius: 16, 
    padding: 15, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center',
    elevation: 2,
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: palette.ink },
  cardSub: { fontSize: 12, color: palette.gray, marginTop: 2 },
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
  approveBtn: { backgroundColor: palette.accent, padding: 10, borderRadius: 10 },
  empty: { textAlign: 'center', marginTop: 40, color: palette.gray }
});
