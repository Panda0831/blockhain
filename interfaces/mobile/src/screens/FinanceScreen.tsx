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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '../theme/palette';
import { microfinanceService, authService, blockchainService } from '../services/api';
import { Database, PlusCircle, CheckCircle, RefreshCw, Search, Clock3, Wallet, TrendingUp } from '../components/Icons';
import { FadeInView, SkeletonLoader } from '../components/Animations';
import { WalletPaymentCard } from '../components/WalletPaymentCard';
import { SimpleLineChart } from '../components/SimpleLineChart';

export default function FinanceScreen({ route }: any) {
  const user = route.params?.user;
  const userPublicKey = user?.public_key || '';
  
  const [activeTab, setActiveTab] = useState<'send' | 'wallet'>('send');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  
  // Send form
  const [receiverId, setReceiverId] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // User Selection Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Wallet / Pending
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);

  useEffect(() => {
    fetchBalance();
    fetchPendingTransfers(); // Toujours fetch au début
  }, []);

  useEffect(() => {
    if (activeTab === 'wallet') {
      fetchPendingTransfers();
    }
  }, [activeTab]);

  const fetchBalance = async () => {
    if (!userPublicKey) return;
    try {
      const [res, histRes] = await Promise.all([
        blockchainService.getBalance(userPublicKey),
        blockchainService.getBalanceHistory(userPublicKey)
      ]);
      setBalance(res.balance);
      setHistory(histRes.history);
    } catch (e) {
      console.error("Données indisponibles", e);
    }
  };

  const fetchPendingTransfers = async () => {
    if (!userPublicKey) {
      setInitialLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await microfinanceService.getPendingTransfers(userPublicKey);
      setPendingTransfers(data);
      fetchBalance();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsModalVisible(true);
    setLoading(true);
    try {
      const data = await authService.getUsers();
      setUsers(data.filter((u: any) => u.public_key !== userPublicKey));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer la liste');
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (selectedUser: any) => {
    setReceiverId(selectedUser.public_key);
    setReceiverName(selectedUser.username);
    setIsModalVisible(false);
  };

  const handleSend = async () => {
    if (!receiverId || !amount || !description) {
      Alert.alert('Champs requis', 'Veuillez remplir toutes les informations');
      return;
    }
    setLoading(true);
    try {
      await microfinanceService.sendMoney({
        sender_id: userPublicKey,
        receiver_id: receiverId,
        amount: parseFloat(amount),
        description: description
      });
      Alert.alert(
        'Demande envoyée', 
        'Votre transfert est maintenant dans le mempool. Il apparaîtra chez le destinataire dès qu\'un bloc sera miné.'
      );
      setReceiverId('');
      setReceiverName('');
      setAmount('');
      setDescription('');
      fetchBalance(); // Rafraîchir le solde
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Échec de l\'envoi';
      Alert.alert('Erreur', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (transferId: number) => {
    setLoading(true);
    try {
      await microfinanceService.acceptTransfer(transferId);
      Alert.alert(
        'Transfert Accepté', 
        'L\'argent a été envoyé au mempool. Le solde sera mis à jour une fois le bloc miné.'
      );
      fetchPendingTransfers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Échec de l\'acceptation';
      Alert.alert('Erreur', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => selectUser(item)}>
      <View style={styles.userAvatar}>
        <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userRole}>{item.role}</Text>
      </View>
      <Text style={styles.selectText}>Choisir</Text>
    </TouchableOpacity>
  );

  const renderTransferItem = ({ item }: { item: any }) => (
    <WalletPaymentCard
      amount={item.amount}
      description={item.description}
      senderId={item.sender_id}
      onAccept={() => handleAccept(item.id)}
      loading={loading}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Database color={palette.accent} size={32} />
        <Text style={styles.title}>Microfinance</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'send' && styles.activeTab]} 
          onPress={() => setActiveTab('send')}
        >
          <Text style={[styles.tabText, activeTab === 'send' && styles.activeTabText]}>Envoyer</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'wallet' && styles.activeTab]} 
          onPress={() => setActiveTab('wallet')}
        >
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.activeTabText]}>Portefeuille</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'send' && (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <FadeInView style={styles.balanceCard}>
               <View style={{ flex: 1 }}>
                 <Text style={styles.balanceLabel}>Solde Confirmé</Text>
                 <Text style={styles.balanceValue}>{balance.toLocaleString()} Ar</Text>
               </View>
               <TouchableOpacity onPress={fetchBalance} style={styles.refreshBalance}>
                  <RefreshCw color="white" size={20} />
               </TouchableOpacity>
            </FadeInView>

            <FadeInView style={styles.chartContainer}>
               <View style={styles.chartHeader}>
                  <TrendingUp color={palette.accent} size={18} />
                  <Text style={styles.chartTitle}>Évolution</Text>
               </View>
               <SimpleLineChart data={history} height={100} />
            </FadeInView>

            <FadeInView style={styles.form}>
              <Text style={styles.sectionTitle}>Nouveau Transfert</Text>
              
              <Text style={styles.label}>Destinataire</Text>
              <View style={styles.searchContainer}>
                <TextInput 
                  style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                  value={receiverName || receiverId} 
                  onChangeText={setReceiverId} 
                  placeholder="Nom ou Clé publique"
                  editable={!receiverName}
                  placeholderTextColor={palette.gray}
                />
                <TouchableOpacity style={styles.searchBtn} onPress={fetchUsers}>
                   <Search color="white" size={20} />
                </TouchableOpacity>
              </View>
              {receiverName && (
                <TouchableOpacity onPress={() => { setReceiverName(''); setReceiverId(''); }}>
                  <Text style={styles.clearText}>Réinitialiser</Text>
                </TouchableOpacity>
              )}
              
              <Text style={[styles.label, { marginTop: 15 }]}>Montant (Ariary)</Text>
              <TextInput 
                style={styles.input} 
                value={amount} 
                onChangeText={setAmount} 
                keyboardType="numeric" 
                placeholder="Ex: 5000"
                placeholderTextColor={palette.gray}
              />
              
              <Text style={styles.label}>Motif</Text>
              <TextInput 
                style={styles.input} 
                value={description} 
                onChangeText={setDescription} 
                placeholder="Achat litchis, riz..."
                placeholderTextColor={palette.gray}
              />

              <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <><PlusCircle color="white" size={20} /><Text style={styles.buttonText}>Initialiser le transfert</Text></>}
              </TouchableOpacity>
            </FadeInView>
          </ScrollView>
        )}

        {activeTab === 'wallet' && (
          <View style={{ flex: 1, width: '100%', minHeight: 300 }}>
            {initialLoading ? (
               <View style={{ gap: 10 }}>
                 <SkeletonLoader style={{ height: 80 }} />
                 <SkeletonLoader style={{ height: 80 }} />
               </View>
            ) : (
              <FlatList
                data={pendingTransfers}
                renderItem={renderTransferItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.empty}>Aucun transfert en attente</Text>}
                onRefresh={fetchPendingTransfers}
                refreshing={loading}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>
        )}
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélecteur de destinataire</Text>
            <TextInput 
              style={styles.modalSearch} 
              placeholder="Rechercher un nom..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <FlatList
              data={filteredUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.public_key}
              style={{ maxHeight: 350 }}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  balanceCard: { 
    backgroundColor: palette.secondary, 
    borderRadius: 24, 
    padding: 25, 
    marginBottom: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  balanceLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  balanceValue: { color: 'white', fontSize: 32, fontWeight: '900', marginTop: 5 },
  refreshBalance: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 15 },
  chartMini: { background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 5 },
  chartContainer: { backgroundColor: palette.surface, borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: palette.lightGray },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  chartTitle: { fontSize: 14, fontWeight: '800', color: palette.ink },
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
  searchContainer: { flexDirection: 'row', alignItems: 'center' },
  searchBtn: { backgroundColor: palette.accent, height: 50, width: 50, borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  clearText: { color: palette.error, fontSize: 11, textAlign: 'right', fontWeight: 'bold' },
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
  empty: { textAlign: 'center', marginTop: 40, color: palette.gray },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: palette.surface, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: palette.ink },
  modalSearch: { backgroundColor: palette.background, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: palette.lightGray },
  userItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: palette.lightGray },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.accent, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  userName: { fontSize: 16, fontWeight: 'bold', color: palette.ink },
  userRole: { fontSize: 12, color: palette.gray },
  selectText: { color: palette.accent, fontWeight: 'bold' },
  closeBtn: { marginTop: 15, padding: 15, alignItems: 'center' },
  closeBtnText: { color: palette.gray, fontWeight: 'bold' }
});
