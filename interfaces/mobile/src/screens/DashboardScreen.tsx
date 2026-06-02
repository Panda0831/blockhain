import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '../theme/palette';
import { blockchainService } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import TimelineRow from '../components/TimelineRow';
import SignalRow from '../components/SignalRow';
import { Database, Shield, Activity, RefreshCw, Bell, Brain } from '../components/Icons';
import { FadeInView } from '../components/Animations';
import { NotificationBell } from '../components/NotificationBell';

export default function DashboardScreen({ route, navigation }: any) {
  console.log("DashboardScreen route:", route);
  const user = route?.params?.user ?? { 
    username: 'Citoyen', 
    public_key: '', 
    role: 'User' 
  };
  console.log("DashboardScreen user:", user);
  const [status, setStatus] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const statusRes = await blockchainService.getStatus();
      const blocksRes = await blockchainService.getBlocks();
      setStatus(statusRes);
      setBlocks(blocksRes.reverse().slice(0, 5));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { user })}>
          <Text style={styles.welcome}>Manao ahoana,</Text>
          <Text style={styles.username}>{user?.username || 'Citoyen'}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <NotificationBell publicKey={user?.public_key || ''} />
          <TouchableOpacity style={[styles.roleBadge, { marginLeft: 10 }]}>
            <Text style={styles.roleText}>{user?.role || 'User'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[palette.accent]} />
        }
      >
        <FadeInView delay={100}>
          <Text style={styles.sectionTitle}>État du Réseau</Text>
          <View style={styles.statsGrid}>
            <DashboardCard
              title="Blocs"
              value={status?.longueur?.toString() || '0'}
              icon={<Database color={palette.accent} size={24} />}
              color={palette.accent}
            />
            <DashboardCard
              title="Intégrité"
              value={status?.est_valide ? '100%' : 'Erreur'}
              icon={<Shield color={status?.est_valide ? palette.accent : palette.error} size={24} />}
              color={status?.est_valide ? palette.accent : palette.error}
            />
          </View>
        </FadeInView>

        <FadeInView delay={300} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dernières Activités</Text>
            <TouchableOpacity onPress={onRefresh}>
              <RefreshCw color={palette.gray} size={18} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.card}>
            {blocks.map((block, index) => (
              <TimelineRow
                key={block.hash}
                title={`Bloc #${block.index}`}
                subtitle={`${block.transactions.length} transactions`}
                time={new Date(block.timestamp * 1000).toLocaleTimeString()}
                isLast={index === blocks.length - 1}
              />
            ))}
            {blocks.length === 0 && (
              <Text style={styles.emptyText}>Aucune activité récente</Text>
            )}
          </View>
        </FadeInView>

        <FadeInView delay={500} style={styles.section}>
          <Text style={styles.sectionTitle}>Signaux Système</Text>
          <View style={styles.card}>
            <SignalRow 
              label="Leader Élu par IA" 
              status={status?.leader_node || "N/A"} 
              icon={<Brain color={palette.accent} size={16} />} 
            />
            <SignalRow 
              label="Validation IA (Q-Learning)" 
              status="ACTIVE" 
              icon={<Activity color={palette.accent} size={16} />} 
            />
            <SignalRow 
              label="Consensus Proof of Work" 
              status="STABLE" 
              icon={<Shield color={palette.accent} size={16} />} 
            />
          </View>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: palette.surface,
  },
  welcome: { fontSize: 16, color: palette.gray, fontWeight: '500' },
  username: { fontSize: 24, fontWeight: '800', color: palette.ink },
  roleBadge: {
    backgroundColor: palette.accentTransparent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: { color: palette.accent, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  scrollContent: { padding: 20 },
  section: { marginTop: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: palette.ink, marginBottom: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    width: '100%', // Par défaut pour les sections pleines
  },
  emptyText: { textAlign: 'center', color: palette.gray, padding: 20 },
});
