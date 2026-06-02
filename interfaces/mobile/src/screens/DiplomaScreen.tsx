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
import { educationService } from '../services/api';
import { Award, ShieldCheck, PlusCircle, CheckCircle, Database } from '../components/Icons';
import { FadeInView, SkeletonLoader } from '../components/Animations';

export default function DiplomaScreen({ route }: any) {
  const user = route.params?.user;
  const userRole = user?.role || 'CITOYEN';
  const isAdmin = ['ADMIN', 'UNIVERSITE', 'MINISTERE'].includes(userRole.toUpperCase());

  const [activeTab, setActiveTab] = useState<'request' | 'verify' | 'admin' | 'my'>(isAdmin ? 'admin' : 'request');
  const [diplomas, setDiplomas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [studentId, setStudentId] = useState('');
  const [degreeTitle, setDegreeTitle] = useState('');
  const [university, setUniversity] = useState('');
  const [year, setYear] = useState('');
  const [docHash, setDocHash] = useState('');
  
  // Verify fields
  const [diplomaId, setDiplomaId] = useState('');
  const [proof, setProof] = useState<any>(null);

  // Admin fields
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const fetchDiplomas = async () => {
    setLoading(true);
    try {
        const data = await educationService.getDiplomasByOwner(user.public_key);
        setDiplomas(data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin') {
      fetchPendingRequests();
    } else if (activeTab === 'my') {
      fetchDiplomas();
    }
  }, [activeTab]);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const data = await educationService.getPendingDiplomas();
      setPendingRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const simulateFileUpload = () => {
    const mockHash = "pdf_hash_" + Math.random().toString(16).slice(2);
    setDocHash(mockHash);
    Alert.alert("Fichier joint", "Le PDF a été analysé et haché.");
  };

  const handleRequest = async () => {
    if (!studentId || !degreeTitle || !university || !year) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const res = await educationService.requestDiploma({
        student_id: studentId,
        degree_title: degreeTitle,
        university: university,
        year: parseInt(year),
        document_hash: docHash || undefined
      });
      Alert.alert('Succès', `Demande envoyée !`);
      setStudentId('');
      setDegreeTitle('');
      setUniversity('');
      setYear('');
      setDocHash('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    setLoading(true);
    try {
      const res = await educationService.approveDiploma(requestId);
      Alert.alert('Succès', `Diplôme certifié sur la blockchain !`);
      fetchPendingRequests();
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'approbation');
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
    } catch (error) {
      Alert.alert('Erreur', 'Diplôme non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const renderAdminItem = ({ item }: { item: any }) => (
    <FadeInView style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.degree_title}</Text>
        <Text style={styles.cardSub}>{item.university} - {item.year}</Text>
        <Text style={styles.cardId}>ID: {item.student_id}</Text>
      </View>
      <TouchableOpacity 
        style={styles.approveBtn} 
        onPress={() => handleApprove(item.id)}
        disabled={loading}
      >
        <CheckCircle color="white" size={20} />
      </TouchableOpacity>
    </FadeInView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Award color={palette.accent} size={32} />
        <Text style={styles.title}>Module Éducation</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'request' && styles.activeTab]} 
          onPress={() => setActiveTab('request')}
        >
          <Text style={[styles.tabText, activeTab === 'request' && styles.activeTabText]}>Demande</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'verify' && styles.activeTab]} 
          onPress={() => setActiveTab('verify')}
        >
          <Text style={[styles.tabText, activeTab === 'verify' && styles.activeTabText]}>Vérification</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'my' && styles.activeTab]} 
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>Mes Diplômes</Text>
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
        {activeTab === 'request' && (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <FadeInView style={styles.form}>
              <Text style={styles.sectionTitle}>Demander une Certification</Text>
              
              <Text style={styles.label}>ID Étudiant</Text>
              <TextInput style={styles.input} value={studentId} onChangeText={setStudentId} placeholder="Ex: STUDENT_001" />
              
              <Text style={styles.label}>Titre du diplôme</Text>
              <TextInput style={styles.input} value={degreeTitle} onChangeText={setDegreeTitle} placeholder="Ex: Licence Informatique" />
              
              <Text style={styles.label}>Université</Text>
              <TextInput style={styles.input} value={university} onChangeText={setUniversity} placeholder="Ex: Univ Tana" />

              <Text style={styles.label}>Année</Text>
              <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" placeholder="Ex: 2026" />

              <TouchableOpacity 
                style={[styles.input, styles.attachmentBtn, docHash ? styles.attachmentActive : null]} 
                onPress={simulateFileUpload}
              >
                <Text style={{ color: docHash ? palette.accent : palette.gray }}>
                  {docHash ? "📄 Document PDF joint" : "📁 Joindre le scan du diplôme (PDF)"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleRequest} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <><PlusCircle color="white" size={20} /><Text style={styles.buttonText}>Envoyer la Demande</Text></>}
              </TouchableOpacity>
            </FadeInView>
          </ScrollView>
        )}

        {activeTab === 'verify' && (
          <FadeInView style={styles.form}>
            <Text style={styles.sectionTitle}>Vérifier l'Authenticité</Text>
            <Text style={styles.label}>ID du Diplôme</Text>
            <TextInput style={styles.input} value={diplomaId} onChangeText={setDiplomaId} placeholder="Ex: DIP-STUDENT_001-2035" />

            <TouchableOpacity style={[styles.button, { backgroundColor: palette.secondary }]} onPress={handleVerify} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <><ShieldCheck color="white" size={20} /><Text style={styles.buttonText}>Vérifier sur Blockchain</Text></>}
            </TouchableOpacity>

            {proof && (
              <View style={styles.result}>
                <Text style={styles.bold}>Racine Merkle (Root):</Text>
                <Text style={styles.resultText} numberOfLines={1}>{proof.root}</Text>
                <Text style={[styles.bold, { marginTop: 10 }]}>Hash Transaction:</Text>
                <Text style={styles.resultText} numberOfLines={1}>{proof.tx_hash}</Text>
              </View>
            )}
          </FadeInView>
        )}

        {activeTab === 'my' && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={diplomas}
              keyExtractor={(item) => item.tx_hash}
              renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardSub}>{item.university} - {item.year}</Text>
                        <Text style={styles.cardId}>ID: {item.diploma_id}</Text>
                    </View>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.empty}>Aucun diplôme trouvé</Text>}
            />
          </View>
        )}
        {activeTab === 'admin' && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={pendingRequests}
              renderItem={renderAdminItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={<Text style={styles.empty}>Aucune demande en attente</Text>}
              onRefresh={fetchPendingRequests}
              refreshing={loading}
            />
          </View>
        )}
      </View>
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
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: palette.ink },
  cardSub: { fontSize: 13, color: palette.gray, marginTop: 2 },
  cardId: { fontSize: 11, color: palette.accent, marginTop: 4, fontWeight: '600' },
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
  attachmentBtn: { borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', height: 50 },
  attachmentActive: { borderColor: palette.accent, backgroundColor: palette.accentTransparent },
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
  approveBtn: { backgroundColor: palette.accent, padding: 10, borderRadius: 12 },
  result: { marginTop: 20, padding: 15, backgroundColor: palette.accentTransparent, borderRadius: 12 },
  resultText: { fontSize: 10, color: palette.accent, marginTop: 5, fontWeight: 'bold' },
  bold: { fontWeight: 'bold', fontSize: 12, color: palette.ink },
  empty: { textAlign: 'center', marginTop: 40, color: palette.gray }
});
