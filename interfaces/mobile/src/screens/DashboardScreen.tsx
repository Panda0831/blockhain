import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Activity,
  ArrowRight,
  Clock3,
  Database,
  Map as MapIcon,
  Shield,
  RefreshCw,
  Brain,
} from '../components/Icons';
import { palette } from '../theme/palette';
import { DashboardCard } from '../components/DashboardCard';
import { SignalRow } from '../components/SignalRow';
import { TimelineRow } from '../components/TimelineRow';
import { blockchainService } from '../services/api';

console.log('DashboardScreen.tsx: starting');

interface BlockchainStatus {
  longueur: number;
  dernier_hash: string;
  est_valide: boolean;
}

export default function DashboardScreen({ navigation, route }: { navigation: any, route: any }) {
  const user = route.params?.user;
  const [status, setStatus] = useState<BlockchainStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const data = await blockchainService.getStatus();
      setStatus(data);
    } catch (err) {
      console.error('Erreur lors de la récupération du statut:', err);
      setError('Impossible de se connecter au serveur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStatus();
  }, [fetchStatus]);

  const handleMine = async () => {
    try {
      setLoading(true);
      await blockchainService.mine();
      await fetchStatus();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur lors du minage');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !refreshing && !status) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={palette.accent} />
        <Text style={styles.loadingText}>Connexion au réseau...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.accent} />
        }
      >
        <View style={styles.header}>
          <View style={[
            styles.statusBadge, 
            status?.est_valide === false && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
          ]}>
            <View style={[
              styles.statusDot, 
              status?.est_valide === false && { backgroundColor: '#ef4444' }
            ]} />
            <Text style={[
              styles.statusText,
              status?.est_valide === false && { color: '#ef4444' }
            ]}>
              {status?.est_valide ? 'Réseau synchronisé' : status ? 'Chaîne invalide' : 'Hors ligne'}
            </Text>
          </View>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Hazo Lova</Text>
              <Text style={styles.subtitle}>
                {user ? `Bienvenue, ${user.username}` : 'Infrastructure décentralisée pour Madagascar 2035.'}
              </Text>
            </View>
            {user && user.username && (
              <TouchableOpacity 
                style={styles.profileBadge}
                onPress={() => navigation.replace('Login')}
              >
                <Text style={styles.profileInitial}>{user.username[0].toUpperCase()}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={onRefresh}>
              <RefreshCw color={palette.accent} size={20} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroEyebrow}>Vue globale</Text>
            <Text style={styles.heroCounter}>Bloc #{status?.longueur ? status.longueur - 1 : 0}</Text>
          </View>

          <Text style={styles.heroTitle}>Confiance, trace et action rapide.</Text>

          <Text style={styles.heroDescription}>
            Dernier Hash : {status?.dernier_hash ? `${status.dernier_hash.substring(0, 16)}...` : 'N/A'}
          </Text>

          <View style={styles.signalList}>
            <SignalRow label="Disponibilité réseau" value="99.98%" />
            <SignalRow label="État de la chaîne" value={status?.est_valide ? "Intègre" : "Corrompue"} />
            <SignalRow label="Version" value="v1.0.2-alpha" />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Indicateurs essentiels</Text>
          <Text style={styles.sectionHint}>Statut temps réel</Text>
        </View>

        <View style={styles.grid}>
          <DashboardCard
            title="Réseau"
            value={status ? "Actif" : "Inactif"}
            detail="Surveillance"
            icon={<Activity color={palette.accent} size={18} strokeWidth={2.2} />}
          />
          <DashboardCard
            title="Blocs"
            value={status?.longueur.toString() || "0"}
            detail="Taille"
            icon={<Database color={palette.accent} size={18} strokeWidth={2.2} />}
          />
          <DashboardCard
            title="Sécurité"
            value={status?.est_valide ? "Élevée" : "Critique"}
            detail="Alertes"
            icon={<Shield color={palette.accent} size={18} strokeWidth={2.2} />}
          />
          <DashboardCard
            title="Districts"
            value="119"
            detail="Couverture"
            icon={<MapIcon color={palette.accent} size={18} strokeWidth={2.2} />}
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Actions système</Text>

          {user?.role === 'MINEUR' && (
            <TouchableOpacity 
              activeOpacity={0.9} 
              style={styles.primaryButton}
              onPress={handleMine}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Minage en cours...' : 'Miner transactions'}
              </Text>
              <RefreshCw color={palette.background} size={18} strokeWidth={2.2} />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            activeOpacity={0.85} 
            style={styles.secondaryButton}
            onPress={() => (navigation as any).navigate('Foncier')}
          >
            <Text style={styles.secondaryButtonText}>Gestion Foncière</Text>
            <ArrowRight color={palette.ink} size={18} strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.85} 
            style={[styles.secondaryButton, { marginTop: 10 }]}
            onPress={() => (navigation as any).navigate('Algo')}
          >
            <Text style={styles.secondaryButtonText}>Réseau Intelligent</Text>
            <Brain color={palette.ink} size={18} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.helperRow}>
            <View style={styles.helperIcon}>
              <Clock3 color={palette.accent} size={16} strokeWidth={2.1} />
            </View>
            <Text style={styles.helperText}>
              Le minage regroupe les transactions en attente dans un nouveau bloc sécurisé.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: palette.gray,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: palette.accentTransparent,
    marginBottom: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: palette.accent,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.accent,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: palette.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: palette.gray,
    maxWidth: 340,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '600',
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: palette.ink,
    marginBottom: 22,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.background,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroCounter: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(243, 238, 223, 0.78)',
  },
  heroTitle: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '800',
    color: palette.background,
    marginBottom: 10,
    maxWidth: 260,
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(243, 238, 223, 0.76)',
    marginBottom: 20,
  },
  signalList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(243, 238, 223, 0.16)',
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: palette.ink,
  },
  sectionHint: {
    fontSize: 12,
    color: 'rgba(24, 36, 54, 0.56)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  panel: {
    backgroundColor: palette.lightGray,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 26,
    padding: 18,
    marginTop: 14,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.ink,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.background,
  },
  secondaryButton: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(24, 36, 54, 0.12)',
    marginBottom: 14,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helperIcon: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: palette.accentTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: palette.gray,
  },
});
