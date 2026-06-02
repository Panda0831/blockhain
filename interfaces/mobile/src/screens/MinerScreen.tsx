import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '../theme/palette';
import { blockchainService } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import TimelineRow from '../components/TimelineRow';
import { Shield, Database, RefreshCw, Brain, Box, CheckCircle } from '../components/Icons';
import { FadeInView } from '../components/Animations';

export default function MinerScreen({ route }: any) {
  const user = route.params?.user;
  const [activeTab, setActiveTab] = useState<'ai' | 'mempool' | 'blocks'>('ai');
  const [status, setStatus] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, pendingRes, blocksRes] = await Promise.all([
        blockchainService.getStatus(),
        blockchainService.getPendingTransactions(),
        blockchainService.getBlocks()
      ]);
      setStatus(statusRes);
      setPending(pendingRes);
      setBlocks(blocksRes.reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMine = async () => {
    setLoading(true);
    try {
      await blockchainService.mine(user.public_key);
      Alert.alert('Succès', 'Bloc miné avec succès !');
      fetchData();
      setActiveTab('blocks');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de miner le bloc');
    } finally {
      setLoading(false);
    }
  };

  const aiRecommended = pending.filter(tx => 
    tx.secteur === 'PRODUITS_AGRICOLES' || tx.secteur === 'FONCIER'
  );

  const otherTransactions = pending.filter(tx => 
    tx.secteur !== 'PRODUITS_AGRICOLES' && tx.secteur !== 'FONCIER'
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.preTitle}>CONTRÔLE RÉSEAU</Text>
          <Text style={styles.title}>Mineur IA</Text>
        </View>
        <TouchableOpacity onPress={fetchData} disabled={loading}>
          {loading ? <ActivityIndicator color={palette.accent} /> : <RefreshCw color={palette.accent} size={24} />}
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'ai' && styles.activeTab]} onPress={() => setActiveTab('ai')}>
          <Brain color={activeTab === 'ai' ? palette.accent : palette.gray} size={18} />
          <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>Conseillé</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'mempool' && styles.activeTab]} onPress={() => setActiveTab('mempool')}>
          <Box color={activeTab === 'mempool' ? palette.accent : palette.gray} size={18} />
          <Text style={[styles.tabText, activeTab === 'mempool' && styles.activeTabText]}>Mempool</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'blocks' && styles.activeTab]} onPress={() => setActiveTab('blocks')}>
          <Database color={activeTab === 'blocks' ? palette.accent : palette.gray} size={18} />
          <Text style={[styles.tabText, activeTab === 'blocks' && styles.activeTabText]}>Blocs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'ai' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <FadeInView style={styles.aiHero}>
              <View style={styles.aiStatus}>
                <Brain color="white" size={32} />
                <View style={{ marginLeft: 15 }}>
                  <Text style={styles.aiTitle}>Optimisation IA Active</Text>
                  <Text style={styles.aiDesc}>L'IA priorise les secteurs critiques (Foncier/Agri)</Text>
                </View>
              </View>
              
              <View style={styles.statsMini}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{aiRecommended.length}</Text>
                  <Text style={styles.statLab}>Priorité</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{status?.longueur || 0}</Text>
                  <Text style={styles.statLab}>Hauteur</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.mineButton, aiRecommended.length === 0 && { opacity: 0.6 }]} 
                onPress={handleMine} 
                disabled={loading || aiRecommended.length === 0}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Valider Recommandations</Text>}
              </TouchableOpacity>
            </FadeInView>

            <Text style={styles.sectionTitle}>Transactions Prioritaires</Text>
            {aiRecommended.map((item, index) => (
              <TimelineRow
                key={item.hash}
                title={item.description}
                subtitle={`${item.secteur} • ${item.montant} MGA`}
                time={new Date(item.horodatage * 1000).toLocaleTimeString()}
                isLast={index === aiRecommended.length - 1}
              />
            ))}
            {aiRecommended.length === 0 && (
              <View style={styles.emptyContainer}>
                <CheckCircle color={palette.accent} size={40} opacity={0.3} />
                <Text style={styles.empty}>Tous les secteurs critiques sont à jour</Text>
              </View>
            )}
          </ScrollView>
        )}

        {activeTab === 'mempool' && (
          <View style={{ flex: 1 }}>
             <View style={styles.mempoolHeader}>
                <Text style={styles.sectionTitle}>File d'attente complète ({pending.length})</Text>
                <TouchableOpacity style={styles.mineAllBtn} onPress={handleMine} disabled={loading || pending.length === 0}>
                   <Text style={styles.mineAllText}>Miner Tout</Text>
                </TouchableOpacity>
             </View>
             <FlatList
                data={pending}
                keyExtractor={(item) => item.hash}
                renderItem={({ item, index }) => (
                  <TimelineRow
                    title={item.description}
                    subtitle={`${item.secteur} • ${item.montant} MGA`}
                    time={new Date(item.horodatage * 1000).toLocaleTimeString()}
                    isLast={index === pending.length - 1}
                  />
                )}
                ListEmptyComponent={<Text style={styles.empty}>Mempool vide</Text>}
             />
          </View>
        )}

        {activeTab === 'blocks' && (
          <FlatList
            data={blocks}
            keyExtractor={(item) => item.hash}
            renderItem={({ item, index }) => (
              <FadeInView style={styles.blockCard}>
                 <View style={styles.blockHeader}>
                    <Text style={styles.blockIdx}>BLOC #{item.index}</Text>
                    <Text style={styles.blockTime}>{new Date(item.timestamp * 1000).toLocaleTimeString()}</Text>
                 </View>
                 <Text style={styles.blockHash}>{item.hash}</Text>
                 <View style={styles.blockMeta}>
                    <Text style={styles.metaText}>{item.transactions.length} transactions</Text>
                    <Text style={styles.metaText}>Nonce: {item.nonce}</Text>
                 </View>
              </FadeInView>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Aucun bloc dans la chaîne</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, backgroundColor: palette.surface },
  preTitle: { fontSize: 10, fontWeight: '900', color: palette.accent, letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: palette.ink },
  
  tabBar: { flexDirection: 'row', backgroundColor: palette.surface, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: palette.lightGray },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: palette.accent },
  tabText: { color: palette.gray, fontWeight: '700', fontSize: 13 },
  activeTabText: { color: palette.accent },

  content: { flex: 1, padding: 20 },
  
  aiHero: { 
    backgroundColor: palette.secondary, 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5
  },
  aiStatus: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  aiTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  aiDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  
  statsMini: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 16 },
  statVal: { color: 'white', fontSize: 20, fontWeight: '900' },
  statLab: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', marginTop: 4, fontWeight: '700' },

  mineButton: { backgroundColor: palette.accent, padding: 18, borderRadius: 16, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: palette.ink },
  emptyContainer: { alignItems: 'center', marginTop: 40, gap: 15 },
  empty: { textAlign: 'center', color: palette.gray, fontSize: 14, fontWeight: '500' },

  mempoolHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  mineAllBtn: { backgroundColor: palette.accentTransparent, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  mineAllText: { color: palette.accent, fontWeight: 'bold', fontSize: 12 },

  blockCard: { backgroundColor: palette.surface, borderRadius: 20, padding: 18, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: palette.accent },
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  blockIdx: { fontSize: 12, fontWeight: '900', color: palette.accent },
  blockTime: { fontSize: 11, color: palette.gray },
  blockHash: { fontSize: 10, color: palette.gray, fontFamily: 'monospace', marginBottom: 12, opacity: 0.7 },
  blockMeta: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: palette.lightGray, paddingTop: 10 },
  metaText: { fontSize: 11, color: palette.ink, fontWeight: '600' }
});
