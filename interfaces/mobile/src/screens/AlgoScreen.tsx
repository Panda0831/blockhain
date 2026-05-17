import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '../theme/palette';
import { algoService } from '../services/api';
import { MapPin, Navigation, Brain, Activity } from '../components/Icons';

export default function AlgoScreen() {
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startId, setStartId] = useState<number | null>(null);
  const [endId, setEndId] = useState<number | null>(null);
  const [pathResult, setPathResult] = useState<any>(null);
  const [validatorResult, setValidatorResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const data = await algoService.getDistricts();
      setDistricts(data.sort((a: any, b: any) => a.nom.localeCompare(b.nom)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindPath = async () => {
    if (!startId || !endId) return;
    setCalculating(true);
    setPathResult(null);
    try {
      const data = await algoService.findPath(startId, endId);
      setPathResult(data);
    } catch (error) {
      alert('Chemin non trouvé');
    } finally {
      setCalculating(false);
    }
  };

  const handleSelectValidator = async () => {
    if (!startId) return;
    setCalculating(true);
    setValidatorResult(null);
    try {
      const data = await algoService.selectValidator(startId);
      setValidatorResult(data);
    } catch (error) {
      alert('Erreur selection validateur');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Réseau Intelligent</Text>
          <Text style={styles.subtitle}>Optimisation A* & Q-Learning</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Propagation de Bloc (A*)</Text>
          
          <View style={styles.selectorContainer}>
            <Text style={styles.label}>Départ:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {districts.map(d => (
                <TouchableOpacity 
                  key={`start-${d.id}`}
                  style={[styles.chip, startId === d.id && styles.chipSelected]}
                  onPress={() => setStartId(d.id)}
                >
                  <Text style={[styles.chipText, startId === d.id && styles.chipTextSelected]}>{d.nom}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.selectorContainer}>
            <Text style={styles.label}>Arrivée:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {districts.map(d => (
                <TouchableOpacity 
                  key={`end-${d.id}`}
                  style={[styles.chip, endId === d.id && styles.chipSelected]}
                  onPress={() => setEndId(d.id)}
                >
                  <Text style={[styles.chipText, endId === d.id && styles.chipTextSelected]}>{d.nom}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity 
            style={[styles.button, (!startId || !endId) && styles.buttonDisabled]} 
            onPress={handleFindPath}
            disabled={calculating || !startId || !endId}
          >
            {calculating ? <ActivityIndicator color="#fff" /> : <><Navigation size={20} color="#fff" /><Text style={styles.buttonText}>Calculer Chemin</Text></>}
          </TouchableOpacity>

          {pathResult && (
            <View style={styles.result}>
              <Text style={styles.resultDistance}>Distance: {pathResult.distance_km} km</Text>
              <View style={styles.pathList}>
                {pathResult.chemin.map((step: any, idx: number) => (
                  <View key={idx} style={styles.pathStep}>
                    <View style={styles.dot} />
                    <Text style={styles.stepText}>{step.nom}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>IA de Validation (Q-Learning)</Text>
          <Text style={styles.infoText}>Apprend à choisir le meilleur validateur pour économiser l'énergie.</Text>
          
          <TouchableOpacity 
            style={[styles.button, !startId && styles.buttonDisabled, { backgroundColor: palette.ink }]} 
            onPress={handleSelectValidator}
            disabled={calculating || !startId}
          >
             <Brain size={20} color="#fff" />
             <Text style={styles.buttonText}>Sélectionner Validateur</Text>
          </TouchableOpacity>

          {validatorResult && (
            <View style={styles.result}>
              <View style={styles.row}>
                <Activity size={18} color={palette.accent} />
                <Text style={styles.validatorName}>Validateur: {validatorResult.selected_validator}</Text>
              </View>
              <Text style={styles.reasonText}>{validatorResult.reason}</Text>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>Q-Score: {validatorResult.score_q.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 25 },
  title: { fontSize: 28, fontWeight: '800', color: palette.ink },
  subtitle: { fontSize: 16, color: palette.gray },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: palette.ink, marginBottom: 15 },
  selectorContainer: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: palette.gray, marginBottom: 8 },
  chipScroll: { flexDirection: 'row' },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 8, borderWidth: 1, borderColor: '#eee' },
  chipSelected: { backgroundColor: palette.accent, borderColor: palette.accent },
  chipText: { fontSize: 13, color: palette.ink },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: palette.accent, flexDirection: 'row', padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  result: { marginTop: 20, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: palette.accent },
  resultDistance: { fontSize: 16, fontWeight: '700', color: palette.accent, marginBottom: 10 },
  pathList: { marginTop: 10 },
  pathStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.accent, marginRight: 10 },
  stepText: { fontSize: 14, color: palette.ink },
  infoText: { fontSize: 14, color: palette.gray, marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  validatorName: { fontSize: 16, fontWeight: '700', color: palette.ink },
  reasonText: { fontSize: 13, color: palette.gray, fontStyle: 'italic' },
  scoreBadge: { marginTop: 10, backgroundColor: 'rgba(52, 211, 153, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scoreText: { color: '#059669', fontWeight: '700', fontSize: 12 }
});
