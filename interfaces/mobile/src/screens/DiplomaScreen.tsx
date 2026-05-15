import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { palette } from '../theme/palette';
import { educationService } from '../services/api';
import { Award, ShieldCheck, PlusCircle } from '../components/Icons';

export default function DiplomaScreen({ route }: any) {
  const [activeTab, setActiveTab] = useState<'certify' | 'verify'>('certify');
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [studentId, setStudentId] = useState('');
  const [degreeTitle, setDegreeTitle] = useState('');
  const [university, setUniversity] = useState('');
  const [year, setYear] = useState('');
  
  // Verify fields
  const [diplomaId, setDiplomaId] = useState('');
  const [proof, setProof] = useState<any>(null);

  const handleCertify = async () => {
    if (!studentId || !degreeTitle || !university || !year) return;
    setLoading(true);
    try {
      const res = await educationService.certifyDiploma({
        student_id: studentId,
        degree_title: degreeTitle,
        university: university,
        year: parseInt(year)
      });
      Alert.alert('Succès', `Diplôme certifié ! ID: ${res.diploma_id}`);
      setDiplomaId(res.diploma_id);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de certifier le diplôme');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!diplomaId) return;
    setLoading(true);
    try {
      const res = await educationService.getDiplomaProof(diplomaId);
      setProof(res);
      Alert.alert('Succès', 'Preuve de Merkle récupérée avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Diplôme non trouvé ou preuve manquante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Award color={palette.accent} size={32} />
        <Text style={styles.title}>Module Éducation</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'certify' && styles.activeTab]} 
          onPress={() => setActiveTab('certify')}
        >
          <Text style={[styles.tabText, activeTab === 'certify' && styles.activeTabText]}>Certification</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'verify' && styles.activeTab]} 
          onPress={() => setActiveTab('verify')}
        >
          <Text style={[styles.tabText, activeTab === 'verify' && styles.activeTabText]}>Vérification</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'certify' && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Certifier un Diplôme</Text>
            <Text style={styles.label}>ID Étudiant</Text>
            <TextInput style={styles.input} value={studentId} onChangeText={setStudentId} placeholder="Ex: STUDENT_001" />
            
            <Text style={styles.label}>Titre du diplôme</Text>
            <TextInput style={styles.input} value={degreeTitle} onChangeText={setDegreeTitle} placeholder="Ex: Licence Informatique" />
            
            <Text style={styles.label}>Université</Text>
            <TextInput style={styles.input} value={university} onChangeText={setUniversity} placeholder="Ex: Univ Tana" />

            <Text style={styles.label}>Année</Text>
            <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" placeholder="Ex: 2035" />

            <TouchableOpacity style={styles.button} onPress={handleCertify} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <><PlusCircle color="white" size={20} /><Text style={styles.buttonText}>Certifier sur Blockchain</Text></>}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'verify' && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Vérifier l'Authenticité</Text>
            <Text style={styles.label}>ID du Diplôme</Text>
            <TextInput style={styles.input} value={diplomaId} onChangeText={setDiplomaId} placeholder="Ex: DIP-STUDENT_001-2035" />

            <TouchableOpacity style={[styles.button, { backgroundColor: palette.secondary }]} onPress={handleVerify} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <><ShieldCheck color="white" size={20} /><Text style={styles.buttonText}>Générer Preuve Merkle</Text></>}
            </TouchableOpacity>

            {proof && (
              <View style={styles.result}>
                <Text style={styles.bold}>Racine Merkle (Root):</Text>
                <Text style={styles.resultText} numberOfLines={2}>{proof.root}</Text>
                <Text style={[styles.bold, { marginTop: 10 }]}>Hash Transaction:</Text>
                <Text style={styles.resultText} numberOfLines={2}>{proof.tx_hash}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', marginLeft: 10, color: palette.text },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: palette.lightGray, backgroundColor: 'white' },
  tab: { flex: 1, padding: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: palette.accent },
  tabText: { color: palette.gray, fontWeight: '600' },
  activeTabText: { color: palette.accent },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: palette.text },
  form: { backgroundColor: 'white', borderRadius: 12, padding: 20, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: palette.gray },
  input: { borderWidth: 1, borderColor: palette.lightGray, borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: '#F9FAFB' },
  button: { backgroundColor: palette.accent, borderRadius: 8, padding: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
  result: { marginTop: 20, padding: 15, backgroundColor: '#E8F5E9', borderRadius: 8 },
  resultText: { fontSize: 12, color: '#2E7D32', marginTop: 5 },
  bold: { fontWeight: 'bold' },
});
