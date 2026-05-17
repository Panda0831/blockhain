import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '../theme/palette';
import { blockchainService } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import TimelineRow from '../components/TimelineRow';
import { Shield, Database, RefreshCw } from '../components/Icons';
import { FadeInView } from '../components/Animations';

export default function MinerScreen({ route }: any) {
  const user = route.params?.user;
  const [status, setStatus] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, pendingRes] = await Promise.all([
        blockchainService.getStatus(),
        blockchainService.getPendingTransactions()
      ]);
      setStatus(statusRes);
      setPending(pendingRes);
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
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de miner le bloc');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Espace Mineur</Text>
        <TouchableOpacity onPress={fetchData}>
          <RefreshCw color={palette.accent} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.statsGrid}>
          <DashboardCard
            title="Hauteur"
            value={status?.longueur?.toString() || '0'}
            icon={<Database color={palette.accent} size={24} />}
            color={palette.accent}
          />
          <DashboardCard
            title="En attente"
            value={pending.length.toString()}
            icon={<Shield color={palette.accent} size={24} />}
            color={palette.accent}
          />
        </View>

        <TouchableOpacity 
          style={styles.mineButton} 
          onPress={handleMine} 
          disabled={loading || pending.length === 0}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Miner le Bloc</Text>}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Transactions en file d'attente</Text>
        <FlatList
          data={pending}
          keyExtractor={(item) => item.hash}
          renderItem={({ item, index }) => (
            <TimelineRow
              title={item.description}
              subtitle={`${item.montant} MGA`}
              time={new Date(item.horodatage * 1000).toLocaleTimeString()}
              isLast={index === pending.length - 1}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucune transaction en attente</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: palette.ink },
  content: { flex: 1, padding: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  mineButton: { backgroundColor: palette.accent, padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: palette.ink },
  empty: { textAlign: 'center', marginTop: 20, color: palette.gray },
});
