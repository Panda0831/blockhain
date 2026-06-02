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
import { BobModal } from '../components/BobModal';

export default function LandScreen({ route }: any) {
  const [manualPublicKey, setManualPublicKey] = useState('');
  const user = route.params?.user;
  const activeKey = user?.public_key || manualPublicKey;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'FONCIER';
  const [activeTab, setActiveTab] = useState<'my' | 'request' | 'admin'>(isAdmin ? 'admin' : 'my');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // My parcels
  const [myParcels, setMyParcels] = useState<string[]>([]);
  
  // Request form
  const [docUrl, setDocUrl] = useState('');
  const [description, setDescription] = useState('');

  // Action Modals State
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<string | null>(null);
  const [transferBuyerId, setTransferBuyerId] = useState('');
  const [transferBuyerName, setTransferBuyerName] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  
  // Admin
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const fetchData = async () => {
    if (!activeKey) {
      setInitialLoading(false);
      return;
    }
    try {
      console.log("[DEBUG] Fetching parcels for activeKey:", activeKey);
      if (activeTab === 'my') {
        const res = await landService.getParcelsByOwner(activeKey);
        console.log("[DEBUG] Received parcels:", res);
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

  const fetchUsers = async () => {
    // Muted for demo
    console.log(" [DEBUG] Skipping user fetch for demo stability");
    setUsers([]);
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, [activeTab]);



  const selectBuyer = (user: any) => {
    setTransferBuyerId(user.public_key);
    setTransferBuyerName(user.username);
    setShowUserList(false);
    setUserSearch('');
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.public_key.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleRequest = async () => {
    if (!docUrl || !activeKey) return;
    setLoading(true);
    try {
      await landService.request({
        requester_id: activeKey,
        document_url: docUrl,
        description: description
      });
      Alert.alert('Succès', 'Demande d’immatriculation envoyée au cadastre');
      setDocUrl('');
      setDescription('');
      fetchData();
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l’envoi de la demande');
    } finally {
      setLoading(false);
    }
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
    <TouchableOpacity onPress={() => { setSelectedParcel(item); setActionModalVisible(true); }}>
      <FadeInView style={styles.card}>
        <Map color={palette.accent} size={24} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item}</Text>
          <Text style={styles.cardSub}>Titre Certifié Hazo Lova</Text>
        </View>
        <CheckCircle color={palette.accent} size={20} />
      </FadeInView>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Map color={palette.accent} size={32} />
        <Text style={styles.title}>Module Foncier</Text>
      </View>

      {!activeKey && (
        <View style={{ padding: 20 }}>
          <Text style={styles.label}>Entrer votre Clé Publique (Mode Démo)</Text>
          <TextInput 
            style={styles.input} 
            value={manualPublicKey} 
            onChangeText={setManualPublicKey} 
            placeholder="0x..." 
            placeholderTextColor={palette.gray} 
          />
        </View>
      )}

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
      {/* Action Selection Modal */}
      <BobModal visible={actionModalVisible} onClose={() => setActionModalVisible(false)} title="Options">
        <TouchableOpacity style={styles.button} onPress={() => { setActionModalVisible(false); setTransferModalVisible(true); }}>
          <Text style={styles.buttonText}>Céder</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: palette.gray }]} onPress={() => { setActionModalVisible(false); setDetailsModalVisible(true); }}>
          <Text style={styles.buttonText}>Détails</Text>
        </TouchableOpacity>
      </BobModal>

      {/* Transfer Modal */}
      <BobModal visible={transferModalVisible} onClose={() => setTransferModalVisible(false)} title="Céder la Parcelle">
          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.modalInput} 
              placeholder="Rechercher l'Acheteur..." 
              value={transferBuyerName || userSearch}
              onChangeText={(txt) => {
                if (transferBuyerName) { setTransferBuyerName(''); setTransferBuyerId(''); }
                setUserSearch(txt);
                setShowUserList(true);
              }}
              onFocus={() => setShowUserList(true)}
              placeholderTextColor={palette.gray}
            />
          </View>

          {showUserList && userSearch.length > 0 && (
            <View style={styles.userDropdown}>
              {filteredUsers.slice(0, 5).map((u) => (
                <TouchableOpacity 
                  key={u.public_key} 
                  style={styles.userSelectItem}
                  onPress={() => selectBuyer(u)}
                >
                  <View style={styles.userAvatarSmall}>
                    <Text style={styles.avatarTextSmall}>{u.username[0].toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.userSelectName}>{u.username}</Text>
                    <Text style={styles.userSelectKey}>{u.public_key.substring(0, 15)}...</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {filteredUsers.length === 0 && <Text style={styles.noUser}>Aucun utilisateur trouvé</Text>}
            </View>
          )}

        <TouchableOpacity style={styles.button} onPress={async () => {
             if (!transferBuyerId) return;
             setLoading(true);
             try {
                await landService.transfer({ parcel_id: selectedParcel, seller_id: activeKey, buyer_id: transferBuyerId });
                Alert.alert('Succès', 'Transféré');
                setTransferModalVisible(false);
                setTransferBuyerId('');
                setTransferBuyerName('');
                fetchData();
             } catch(e) { Alert.alert('Erreur', 'Échec'); } finally { setLoading(false); }
        }}>
          <Text style={styles.buttonText}>Confirmer le transfert</Text>
        </TouchableOpacity>
      </BobModal>

      {/* Details Modal */}
      <BobModal visible={detailsModalVisible} onClose={() => setDetailsModalVisible(false)} title="Détails">
        <Text>Parcelle: {selectedParcel}</Text>
        <Text>Propriétaire actuel: Vous</Text>
      </BobModal>
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
