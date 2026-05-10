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
} from 'react-native';
import { palette } from '../theme/palette';
import { landService, authService } from '../services/api';
import { Search, PlusCircle, ArrowLeftRight, ShieldCheck, Activity } from '../components/Icons';

export default function LandScreen({ route }: any) {
  const user = route.params?.user || {};
  const [activeTab, setActiveTab] = useState<'search' | 'register' | 'transfer' | 'admin'>('search');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(user.role === 'ADMIN');
  const [users, setUsers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [myParcels, setMyParcels] = useState<string[]>([]);
  
  // States for Register (Request)
  const [regDescription, setRegDescription] = useState('');
  const [regOwnerId, setRegOwnerId] = useState(user.public_key || '');

  // States for Transfer
  const [transParcelId, setTransParcelId] = useState('');
  const [transSellerId, setTransSellerId] = useState(user.public_key || '');
  const [transBuyerId, setTransBuyerId] = useState('');

  // States for Search
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
    if (isAdmin) fetchPending();
    if (activeTab === 'transfer') fetchMyParcels();
  }, [isAdmin, activeTab]);

  const fetchMyParcels = async () => {
    if (!user.public_key) return;
    try {
      const data = await landService.getParcelsByOwner(user.public_key);
      setMyParcels(data);
    } catch (error) {
      console.error('Erreur chargement de mes terres', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await authService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs', error);
    }
  };

  const fetchPending = async () => {
    try {
      const data = await landService.getPending();
      setPendingRequests(data);
    } catch (error) {
      console.error('Erreur chargement demandes', error);
    }
  };

  const handleSearch = async () => {
    if (!searchId) return;
    setLoading(true);
    setSearchResult(null);
    setHistory([]);
    try {
      const data = await landService.getParcel(searchId);
      setSearchResult(data);
      if (data.status === 'REGISTERED') {
        const hist = await landService.getHistory(searchId);
        setHistory(hist);
      }
    } catch (error) {
      alert('Parcelle non trouvée');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async () => {
    if (!regOwnerId) return;
    setLoading(true);
    try {
      const res = await landService.submitRequest({
        requester_id: regOwnerId,
        document_url: "https://hazo-lova.gov.mg/dossiers/doc_simulated.pdf",
        description: regDescription || "Nouvelle demande d'immatriculation"
      });
      alert(res.message);
      setRegDescription('');
      setRegOwnerId('');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur d\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setLoading(true);
    try {
      const res = await landService.approveRequest(id);
      alert(`Approuvé ! ID Parcelle: ${res.parcel_id}`);
      fetchPending();
    } catch (error: any) {
      alert('Erreur d\'approbation');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transParcelId || !transSellerId || !transBuyerId) return;
    setLoading(true);
    try {
      const res = await landService.transferParcel({
        parcel_id: transParcelId,
        seller_id: transSellerId,
        buyer_id: transBuyerId,
        signature: "SIG_MOBILE_DEMO",
        price: 0
      });
      alert(res.message);
      setTransParcelId('');
      setTransSellerId('');
      setTransBuyerId('');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur de transfert');
    } finally {
      setLoading(false);
    }
  };

  const UserSelector = ({ selectedId, onSelect, label }: { selectedId: string, onSelect: (id: string) => void, label: string }) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userScroll}>
        {users.map((u, i) => (
          <TouchableOpacity 
            key={i} 
            style={[styles.userChip, selectedId === u.public_key && styles.userChipSelected]}
            onPress={() => onSelect(u.public_key)}
          >
            <Text style={[styles.userChipText, selectedId === u.public_key && styles.userChipTextSelected]}>
              {u.username}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.title}>Gestion Foncière</Text>
            <Text style={styles.subtitle}>Sécurisation via Union-Find</Text>
          </View>
          <TouchableOpacity 
            style={[styles.adminToggle, isAdmin && styles.adminToggleActive]} 
            onPress={() => setIsAdmin(!isAdmin)}
          >
            <Text style={styles.adminToggleText}>{isAdmin ? 'Mode ADMIN' : 'Citoyen'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Search size={20} color={activeTab === 'search' ? palette.accent : palette.gray} />
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Chercher</Text>
        </TouchableOpacity>
        
        {!isAdmin ? (
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'register' && styles.activeTab]}
            onPress={() => setActiveTab('register')}
          >
            <PlusCircle size={20} color={activeTab === 'register' ? palette.accent : palette.gray} />
            <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>Demander</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'admin' && styles.activeTab]}
            onPress={() => setActiveTab('admin')}
          >
            <ShieldCheck size={20} color={activeTab === 'admin' ? palette.accent : palette.gray} />
            <Text style={[styles.tabText, activeTab === 'admin' && styles.activeTabText]}>Dossiers</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'transfer' && styles.activeTab]}
          onPress={() => setActiveTab('transfer')}
        >
          <ArrowLeftRight size={20} color={activeTab === 'transfer' ? palette.accent : palette.gray} />
          <Text style={[styles.tabText, activeTab === 'transfer' && styles.activeTabText]}>Transférer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'search' && (
          <View style={styles.panel}>
            <TextInput
              style={styles.input}
              placeholder="ID de la parcelle (ex: HZL-LND-...)"
              value={searchId}
              onChangeText={setSearchId}
            />
            <TouchableOpacity style={styles.button} onPress={handleSearch} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Vérifier Propriété</Text>}
            </TouchableOpacity>

            {searchResult && (
              <View>
                <View style={styles.resultPanel}>
                  <View style={styles.row}>
                     <ShieldCheck size={28} color={palette.accent} />
                     <View>
                       <Text style={styles.resultTitle}>Certificat de Propriété</Text>
                       <Text style={styles.resultSubtitle}>Document certifié Blockchain</Text>
                     </View>
                  </View>
                  
                  <View style={styles.divider} />

                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>ID Parcelle:</Text>
                    <Text style={styles.resultValue}>{searchResult.parcel_id}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Statut Actuel:</Text>
                    <View style={styles.statusBadge}>
                      <View style={[styles.statusDot, { backgroundColor: palette.accent }]} />
                      <Text style={[styles.statusText, { color: palette.accent }]}>{searchResult.status}</Text>
                    </View>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Titulaire du droit:</Text>
                    <Text style={styles.resultValue} numberOfLines={1} ellipsizeMode="middle">
                      {searchResult.owner_id || 'N/A'}
                    </Text>
                  </View>
                </View>

                {history.length > 0 && (
                  <View style={styles.historyContainer}>
                    <Text style={styles.historyTitle}>Historique des Mutations</Text>
                    {history.map((item, index) => (
                      <View key={index} style={styles.timelineItem}>
                        <View style={styles.timelineLine}>
                          <View style={styles.timelineDot} />
                          {index !== history.length - 1 && <View style={styles.timelineConnector} />}
                        </View>
                        <View style={styles.timelineContent}>
                          <Text style={styles.timelineAction}>{item.action === 'REGISTRATION_APPROVED' ? 'Immatriculation Officielle' : 'Transfert de Propriété'}</Text>
                          <Text style={styles.timelineDate}>{new Date(item.horodatage * 1000).toLocaleDateString()}</Text>
                          <Text style={styles.timelineDetail}>Vers: {item.destinataire.substring(0, 10)}...</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === 'register' && (
          <View style={styles.panel}>
            <Text style={styles.panelInfo}>Soumettez une demande d'immatriculation. L'ID sera généré par l'administration après vérification du dossier.</Text>
            
            <UserSelector 
              label="Bénéficiaire du Titre"
              selectedId={regOwnerId}
              onSelect={setRegOwnerId}
            />

            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Description du terrain (Localisation, surface...)"
              value={regDescription}
              onChangeText={setRegDescription}
              multiline
            />
            
            <View style={styles.docSim}>
               <Activity size={20} color={palette.gray} />
               <Text style={styles.docSimText}>Dossier PDF (Simulé attaché)</Text>
            </View>

            <TouchableOpacity style={[styles.button, { backgroundColor: palette.ink }]} onPress={handleRequestSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Envoyer la Demande</Text>}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'admin' && (
          <View style={styles.panel}>
            <Text style={styles.panelInfo}>Demandes en attente de validation officielle.</Text>
            
            {pendingRequests.length === 0 ? (
              <Text style={{ textAlign: 'center', color: palette.gray, marginVertical: 20 }}>Aucune demande en attente.</Text>
            ) : (
              pendingRequests.map((req, i) => (
                <View key={i} style={styles.reqCard}>
                  <View style={styles.reqCardHeader}>
                    <Text style={styles.reqCardTitle}>Dossier #{req.id}</Text>
                    <Text style={styles.reqCardUser}>Par: {req.requester_id.substring(0, 8)}...</Text>
                  </View>
                  <Text style={styles.reqCardDesc}>{req.description}</Text>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(req.id)} disabled={loading}>
                    <Text style={styles.approveBtnText}>Approuver & Générer Titre</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'transfer' && (
          <View style={styles.panel}>
            <Text style={styles.panelInfo}>Mutation de propriété. L'IA vérifie la validité du vendeur via Union-Find.</Text>
            
            <View style={styles.selectorContainer}>
              <Text style={styles.inputLabel}>Sélectionner votre Parcelle</Text>
              {myParcels.length === 0 ? (
                <Text style={{ fontSize: 13, color: palette.gray, fontStyle: 'italic' }}>Vous ne possédez aucune terre enregistrée.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userScroll}>
                  {myParcels.map((p, i) => (
                    <TouchableOpacity 
                      key={i} 
                      style={[styles.userChip, transParcelId === p && styles.userChipSelected]}
                      onPress={() => setTransParcelId(p)}
                    >
                      <Text style={[styles.userChipText, transParcelId === p && styles.userChipTextSelected]}>
                        {p.substring(0, 15)}...
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <TextInput
              style={styles.input}
              placeholder="ID Parcelle (ou sélectionnez ci-dessus)"
              value={transParcelId}
              onChangeText={setTransParcelId}
            />
            
            <UserSelector 
              label="Vendeur (C'est vous)"
              selectedId={transSellerId}
              onSelect={setTransSellerId}
            />

            <UserSelector 
              label="Acheteur (Nouveau)"
              selectedId={transBuyerId}
              onSelect={setTransBuyerId}
            />

            <TouchableOpacity style={styles.button} onPress={handleTransfer} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Valider le Transfert</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  header: { padding: 25, paddingBottom: 15 },
  title: { fontSize: 28, fontWeight: '800', color: palette.ink },
  subtitle: { fontSize: 16, color: palette.gray },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 15, padding: 5, marginBottom: 20 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8, borderRadius: 10 },
  activeTab: { backgroundColor: 'rgba(45, 122, 88, 0.1)' },
  tabText: { fontSize: 13, fontWeight: '600', color: palette.gray },
  activeTabText: { color: palette.accent },
  content: { paddingHorizontal: 20 },
  panel: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  panelInfo: { fontSize: 14, color: palette.gray, marginBottom: 20, lineHeight: 20 },
  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 15, borderWidth: 1, borderColor: '#eee' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: palette.ink, marginBottom: 8 },
  selectorContainer: { marginBottom: 20 },
  userScroll: { flexDirection: 'row' },
  userChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  userChipSelected: { backgroundColor: palette.accent, borderColor: palette.accent },
  userChipText: { fontSize: 13, color: palette.ink },
  userChipTextSelected: { color: '#fff', fontWeight: '700' },
  button: { backgroundColor: palette.accent, padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  resultPanel: { marginTop: 25, padding: 20, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  resultTitle: { fontSize: 20, fontWeight: '800', color: palette.ink },
  resultSubtitle: { fontSize: 12, color: palette.gray, textTransform: 'uppercase', letterSpacing: 1 },
  resultRow: { marginBottom: 15 },
  resultLabel: { fontSize: 11, fontWeight: '600', color: palette.gray, textTransform: 'uppercase', marginBottom: 4 },
  resultValue: { fontSize: 15, fontWeight: '700', color: palette.ink },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(45, 122, 88, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  historyContainer: { marginTop: 30, paddingHorizontal: 5 },
  historyTitle: { fontSize: 18, fontWeight: '700', color: palette.ink, marginBottom: 20 },
  timelineItem: { flexDirection: 'row', gap: 15 },
  timelineLine: { alignItems: 'center', width: 20 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: palette.accent, borderWidth: 2, borderColor: '#fff', zIndex: 1 },
  timelineConnector: { width: 2, flex: 1, backgroundColor: '#e2e8f0', marginTop: -2 },
  timelineContent: { flex: 1, paddingBottom: 25 },
  timelineAction: { fontSize: 15, fontWeight: '700', color: palette.ink },
  timelineDate: { fontSize: 12, color: palette.gray, marginBottom: 4 },
  timelineDetail: { fontSize: 13, color: palette.gray },
  adminToggle: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  adminToggleActive: { backgroundColor: palette.ink },
  adminToggleText: { fontSize: 11, fontWeight: '800', color: palette.gray },
  docSim: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10, marginBottom: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  docSimText: { fontSize: 13, color: palette.gray, fontWeight: '600' },
  reqCard: { backgroundColor: '#f8fafc', borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  reqCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  reqCardTitle: { fontSize: 16, fontWeight: '800', color: palette.ink },
  reqCardUser: { fontSize: 12, color: palette.gray },
  reqCardDesc: { fontSize: 14, color: palette.gray, marginBottom: 15, lineHeight: 20 },
  approveBtn: { backgroundColor: palette.accent, padding: 12, borderRadius: 10, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
