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
import * as Api from '../services/api';
const { agriService, authService, algoService } = Api;
import { Leaf, Navigation, PlusCircle, RefreshCw, ShoppingCart, DollarSign, User, Search } from '../components/Icons';
import { FadeInView, SkeletonLoader } from '../components/Animations';
import { BobModal } from '../components/BobModal';

export default function AgriScreen({ route }: any) {
  console.log("[DEBUG Agri] route.params:", JSON.stringify(route.params));
  const [manualPublicKey, setManualPublicKey] = useState('');
  const user = route.params?.user;
  const activeKey = user?.public_key || manualPublicKey;
  console.log("[DEBUG Agri] activeKey:", activeKey);
  const [activeTab, setActiveTab] = useState<'harvest' | 'tracking' | 'transport'>('harvest');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Transport State
  const [destination, setDestination] = useState('');
  const [isDestinationSelection, setIsDestinationSelection] = useState(false);
  const [optimizedPath, setOptimizedPath] = useState<string[] | null>(null);
  const [districts, setDistricts] = useState<any[]>([]);
  
  // Form fields
  const [productType, setProductType] = useState('Vanille');
  const [district, setDistrict] = useState('');
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [weight, setWeight] = useState('');
  const [quality, setQuality] = useState('Premium');
  
  // Tracking fields
  const [lots, setLots] = useState<any[]>([]);

  // Sale Modal State
  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [buyerId, setBuyerId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [price, setPrice] = useState('');
  
  // User Selection
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [showUserList, setShowUserList] = useState(false);

  const fetchData = async () => {
    console.log("[DEBUG Agri] fetchData start. activeKey:", activeKey);
    if (!activeKey) {
      console.log("[DEBUG Agri] fetchData skipped: activeKey is empty");
      setInitialLoading(false);
      return;
    }
    try {
      const res = await agriService.getAllLots();
      console.log("[DEBUG Agri] Received lots count:", res.length);
      
      // Nettoyage des clés pour comparaison
      const normalize = (k: string) => k.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const myNormalizedKey = normalize(activeKey || '');
      console.log("[DEBUG Agri] myNormalizedKey:", myNormalizedKey);

      // On ne garde que les lots appartenant à l'utilisateur
      const myLots = res.filter((lot: any) => {
        const lotOwnerRaw = String(lot.owner_id || '');
        const lotOwnerNorm = normalize(lotOwnerRaw);
        const isMatch = lotOwnerNorm === myNormalizedKey;
        
        console.log('[DEBUG Agri] Lot ' + lot.id + ' Match: ' + isMatch);
        return isMatch;
      });
      
      setLots(myLots.reverse());
      
      const [districtsData, usersData] = await Promise.all([
        algoService.getDistricts(),
        authService.getUsers()
      ]);
      setDistricts(districtsData);
      setUsers(usersData);
    } catch (error) {
      console.error(error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await authService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const handleHarvest = async () => {
    if (!district || !weight) return;
    setLoading(true);
    try {
      await agriService.recordHarvest({
        owner_id: activeKey || 'ANONYMOUS',
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
      Alert.alert('Erreur', 'Échec de l’enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async () => {
    if (!buyerId || !price || !selectedLot) return;
    setLoading(true);
    try {
      await agriService.sellLot({
        lot_id: selectedLot.id,
        buyer_id: buyerId,
        price: parseFloat(price),
        seller_id: route.params?.user?.public_key 
      });
      setSaleModalVisible(false);
      setBuyerId('');
      setBuyerName('');
      setPrice('');
      fetchData();
      Alert.alert('Félicitations', 'Vente enregistrée en blockchain !');
    } catch (error) {
      Alert.alert('Erreur', 'La vente a échoué. Vérifiez que vous êtes le propriétaire du lot.');
    } finally {
      setLoading(false);
    }
  };

  const selectBuyer = (user: any) => {
    setBuyerId(user.public_key);
    setBuyerName(user.username);
    setShowUserList(false);
    setUserSearch('');
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.public_key.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleOptimizeTransport = async () => {
    if (!selectedLot || !destination) {
      Alert.alert('Erreur', 'Sélectionnez un lot et une destination');
      return;
    }

    setLoading(true);
    try {
      const res = await agriService.optimizeTransport({
        lot_id: selectedLot.id,
        destination: destination
      });
      
      if (res.path) {
        setOptimizedPath(res.path);
      }
      
      Alert.alert('Succès', 'Trajet optimisé via A* et enregistré !');
      fetchData();
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de l\'optimisation du transport.');
    } finally {
      setLoading(false);
    }
  };

  const openSaleModal = (lot: any) => {
    setSelectedLot(lot);
    setSaleModalVisible(true);
  };

  const renderLotItem = ({ item }: { item: any }) => (
    <FadeInView style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.lotId}>{item.id}</Text>
        <View style={[styles.statusBadge, item.status === 'VENDU' && { backgroundColor: palette.inkTransparent }]}>
          <Text style={[styles.statusText, item.status === 'VENDU' && { color: palette.gray }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.productTitle}>{item.product_type} - {item.weight}kg</Text>
      <Text style={styles.lotInfo}>Origine: {item.district_origin}</Text>
      <Text style={styles.lotInfo}>Qualité: {item.quality}</Text>
      
      <View style={styles.lotActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { setSelectedLot(item); setActiveTab('transport'); }}>
           <Navigation color={palette.accent} size={16} />
           <Text style={styles.actionBtnText}>Trajet</Text>
        </TouchableOpacity>
        
        {item.status !== 'VENDU' && (
          <TouchableOpacity style={[styles.actionBtn, styles.sellBtn]} onPress={() => openSaleModal(item)}>
            <ShoppingCart color="white" size={16} />
            <Text style={[styles.actionBtnText, { color: 'white' }]}>Vendre</Text>
          </TouchableOpacity>
        )}
      </View>
    </FadeInView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Leaf color={palette.accent} size={32} />
        <Text style={styles.title}>Agriculture</Text>
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
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'transport' && styles.activeTab]} 
          onPress={() => setActiveTab('transport')}
        >
          <Text style={[styles.tabText, activeTab === 'transport' && styles.activeTabText]}>Logistique</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'harvest' && (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <FadeInView style={styles.form}>
              <Text style={styles.sectionTitle}>Enregistrer une Récolte</Text>
              
              <Text style={styles.label}>Nom du Produit</Text>
              <TextInput 
                style={styles.input} 
                value={productType} 
                onChangeText={setProductType} 
                placeholder="Ex: Poivre Noir, Riz Makalioka..." 
                placeholderTextColor={palette.gray} 
              />

              <Text style={styles.label}>District</Text>
              <TouchableOpacity style={styles.input} onPress={() => setDistrictModalVisible(true)}>
                <Text style={district ? {color: palette.ink} : {color: palette.gray}}>
                  {district || "Sélectionner un district"}
                </Text>
              </TouchableOpacity>
              
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

        {activeTab === 'transport' && (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <FadeInView style={styles.form}>
               <Text style={styles.sectionTitle}>Optimisation Logistique (A*)</Text>
               <Text style={styles.label}>Sélectionner un Lot</Text>
               <View style={styles.input}>
                  <ScrollView style={{ maxHeight: 150 }}>
                    {lots.map((item) => (
                      <TouchableOpacity key={item.id} onPress={() => setSelectedLot(item)} style={{ padding: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
                         <Text style={{ color: palette.ink }}>{item.id} - {item.product_type} ({item.district_origin})</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
               </View>
               <Text style={styles.label}>Destination</Text>
               <TouchableOpacity 
                 style={styles.input} 
                 onPress={() => { setIsDestinationSelection(true); setDistrictModalVisible(true); }}
               >
                  <Text style={destination ? {color: palette.ink} : {color: palette.gray}}>
                    {destination || "Sélectionner une destination"}
                  </Text>
               </TouchableOpacity>
               
               <TouchableOpacity style={styles.button} onPress={handleOptimizeTransport} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Optimiser Chemin</Text>}
               </TouchableOpacity>

               {optimizedPath && (
                  <View style={{ marginTop: 20, padding: 15, backgroundColor: '#f0f9ff', borderRadius: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: palette.accent }}>Chemin calculé :</Text>
                    <Text style={{ color: palette.ink, marginTop: 5 }}>{optimizedPath.join(' -> ')}</Text>
                  </View>
               )}
            </FadeInView>
          </ScrollView>
        )}
      </View>

      <BobModal 
        visible={districtModalVisible} 
        onClose={() => { setDistrictModalVisible(false); setIsDestinationSelection(false); }}
        title="Sélectionner un District"
      >
        <FlatList
          data={districts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.userSelectItem}
              onPress={() => { 
                if (isDestinationSelection) {
                  setDestination(item.nom);
                } else {
                  setDistrict(item.nom);
                }
                setDistrictModalVisible(false); 
                setIsDestinationSelection(false);
              }}
            >
              <Text style={styles.userSelectName}>{item.nom}</Text>
            </TouchableOpacity>
          )}
        />
      </BobModal>

      <BobModal 
        visible={saleModalVisible} 
        onClose={() => setSaleModalVisible(false)}
        title="Finaliser la Vente"
      >
        <View style={styles.saleForm}>
          <Text style={styles.lotSummary}>{selectedLot?.product_type} - {selectedLot?.weight}kg</Text>
          
          <View style={styles.inputGroup}>
            <Search color={palette.gray} size={18} style={styles.inputIcon} />
            <TextInput 
              style={styles.modalInput} 
              placeholder="Rechercher l'Acheteur..." 
              value={buyerName || userSearch}
              onChangeText={(txt) => {
                if (buyerName) { setBuyerName(''); setBuyerId(''); }
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

          <View style={styles.inputGroup}>
            <DollarSign color={palette.gray} size={18} style={styles.inputIcon} />
            <TextInput 
              style={styles.modalInput} 
              placeholder="Prix de vente (MGA)" 
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholderTextColor={palette.gray}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, { marginTop: 20 }]} 
            onPress={handleSell}
            disabled={loading || !buyerId}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Confirmer la Vente</Text>}
          </TouchableOpacity>
        </View>
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
  lotActions: { 
    flexDirection: 'row', 
    marginTop: 15, 
    paddingTop: 15, 
    borderTopWidth: 1, 
    borderTopColor: palette.lightGray,
    gap: 10
  },
  actionBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: palette.accentTransparent,
  },
  actionBtnText: { fontSize: 13, fontWeight: 'bold', marginLeft: 8, color: palette.accent },
  sellBtn: { backgroundColor: palette.accent },
  empty: { textAlign: 'center', marginTop: 40, color: palette.gray },
  
  // Modal Styles
  saleForm: { width: '100%' },
  lotSummary: { fontSize: 16, fontWeight: 'bold', color: palette.ink, marginBottom: 20, textAlign: 'center' },
  inputGroup: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: palette.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.lightGray,
    marginBottom: 15,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  modalInput: { flex: 1, paddingVertical: 12, color: palette.ink, fontSize: 15 },
  
  // User selection styles
  userDropdown: {
    backgroundColor: palette.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.lightGray,
    marginBottom: 15,
    maxHeight: 200,
    overflow: 'hidden'
  },
  userSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.lightGray
  },
  userAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarTextSmall: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  userSelectName: { fontSize: 14, fontWeight: 'bold', color: palette.ink },
  userSelectKey: { fontSize: 10, color: palette.gray },
  noUser: { padding: 15, textAlign: 'center', color: palette.gray, fontSize: 12 },
});
