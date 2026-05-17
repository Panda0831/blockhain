import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Map as MapIcon, 
  Trees, 
  GraduationCap, 
  Wallet, 
  Search, 
  LogOut, 
  Bell, 
  ChevronRight,
  PlusCircle,
  Award,
  ShieldCheck,
  CheckCircle,
  FileText,
  TrendingUp,
  Globe,
  Upload,
  Database,
  SearchCode
} from 'lucide-react';
import { educationService } from './services/api';
import './dashboard.css';

export default function EducationModule() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{"username": "Utilisateur Réseau", "public_key": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"}');
  const isAdmin = ['ADMIN', 'UNIVERSITE', 'MINISTERE'].includes((user.role || '').toUpperCase());

  const [activeTab, setActiveTab] = useState<'request' | 'verify' | 'admin'>(isAdmin ? 'admin' : 'request');
  const [loading, setLoading] = useState(false);
  
  // Request Form State
  const [requestData, setRequestData] = useState({
    studentId: '',
    degreeTitle: '',
    university: '',
    year: '',
    docHash: ''
  });

  // Verify State
  const [diplomaId, setDiplomaId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Admin State
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const fetchData = async () => {
    if (activeTab === 'admin' && isAdmin) {
      setLoading(true);
      try {
        const data = await educationService.getPendingDiplomas();
        setPendingRequests(data);
      } catch (err) {
        console.error("Erreur chargement admin education :", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestData.studentId || !requestData.degreeTitle || !requestData.university || !requestData.year) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      setLoading(true);
      await educationService.requestDiploma({
        student_id: requestData.studentId,
        degree_title: requestData.degreeTitle,
        university: requestData.university,
        year: parseInt(requestData.year),
        document_hash: requestData.docHash || undefined
      });
      alert("Demande de certification envoyée avec succès !");
      setRequestData({
        studentId: '',
        degreeTitle: '',
        university: '',
        year: '',
        docHash: ''
      });
      setActiveTab('verify');
    } catch (err) {
      alert("Erreur lors de l'envoi de la demande.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diplomaId) return;

    try {
      setLoading(true);
      const res = await educationService.getDiplomaProof(diplomaId);
      setVerificationResult(res);
    } catch (err) {
      alert("Diplôme non trouvé ou invalide sur la blockchain.");
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setLoading(true);
      await educationService.approveDiploma(id);
      alert("Diplôme certifié et scellé sur la blockchain !");
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'approbation.");
    } finally {
      setLoading(false);
    }
  };

  const simulateFileUpload = () => {
    const mockHash = "sha256:8b3e" + Math.random().toString(16).substring(2, 10);
    setRequestData({...requestData, docHash: mockHash});
    alert("Simulation : PDF analysé. Empreinte Merkle générée.");
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const eduStats = [
    { label: 'Diplômes Certifiés', value: '4,205', icon: <Award size={18} /> },
    { label: 'Universités Nodes', value: '12', icon: <Globe size={18} /> },
    { label: 'Merkle Proofs', value: 'Actif', icon: <ShieldCheck size={18} /> },
    { label: 'Intégrité', value: '100%', icon: <CheckCircle size={18} /> }
  ];

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <Link to="/" className="sidebar-logo">HAZO LOVA</Link>
        <nav className="nav-group">
          <Link to="/dashboard" className="nav-item">
            <LayoutDashboard className="nav-icon" /> Dashboard
          </Link>
          <Link to="/profile" className="nav-item">
            <User className="nav-icon" /> Profil
          </Link>
          <Link to="/land" className="nav-item">
            <MapIcon className="nav-icon" /> Foncier
          </Link>
          <Link to="/agri" className="nav-item">
            <Trees className="nav-icon" /> Agriculture
          </Link>
          <Link to="/education" className="nav-item active">
            <GraduationCap className="nav-icon" /> Éducation
          </Link>
          <Link to="/finance" className="nav-item">
            <Wallet className="nav-icon" /> Microfinance
          </Link>
          <Link to="/explorer" className="nav-item">
            <Search className="nav-icon" /> Registre
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-bar">
          <div className="page-title-area">
            <div className="pre-title" style={{ fontSize: '10px', color: 'var(--or)', letterSpacing: '2px', fontWeight: 900, marginBottom: '4px' }}>CERTIFICATION ACADÉMIQUE</div>
            <h1>Registre des Diplômes</h1>
          </div>
          <div className="user-status">
            <button className="nav-icon-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--navy)', opacity: 0.5 }}><Bell size={20} /></button>
            <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className="profile-mini">
                <span className="username">{user.username}</span>
                <span className="public-key-hash">{user.public_key?.substring(0, 10)}...</span>
              </div>
              <div className="avatar-circle">{user.username?.charAt(0) || 'U'}</div>
            </Link>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="tab-navigation" style={{ display: 'flex', gap: '40px', marginBottom: '30px', borderBottom: 'var(--border-main)' }}>
            <button 
              className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
              onClick={() => setActiveTab('request')}
              style={{ padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: activeTab === 'request' ? 'var(--navy)' : '#94a3b8', borderBottom: activeTab === 'request' ? '3px solid var(--navy)' : '3px solid transparent' }}
            >
              Demander Certification
            </button>
            <button 
              className={`tab-btn ${activeTab === 'verify' ? 'active' : ''}`}
              onClick={() => setActiveTab('verify')}
              style={{ padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: activeTab === 'verify' ? 'var(--navy)' : '#94a3b8', borderBottom: activeTab === 'verify' ? '3px solid var(--navy)' : '3px solid transparent' }}
            >
              Vérifier un Diplôme
            </button>
            {isAdmin && (
              <button 
                className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
                style={{ padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: activeTab === 'admin' ? 'var(--navy)' : '#94a3b8', borderBottom: activeTab === 'admin' ? '3px solid var(--navy)' : '3px solid transparent' }}
              >
                Portail Académique (Pending)
              </button>
            )}
          </div>

          <div className="land-container-full">
            <div className="land-stats-summary" style={{ marginBottom: '40px' }}>
              {eduStats.map((stat, i) => (
                <div key={i} className="l-stat-card">
                  <div className="l-stat-icon" style={{ color: 'var(--or)' }}>{stat.icon}</div>
                  <div className="l-stat-info">
                    <span className="l-stat-label">{stat.label}</span>
                    <span className="l-stat-value">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="land-main-layout">
              <div className="parcels-section">
                {activeTab === 'request' && (
                  <div className="registration-form-area" style={{ background: 'var(--blanc)', padding: '40px', borderRadius: '24px', border: 'var(--border-main)' }}>
                    <h2 className="section-title">Certification de Diplôme</h2>
                    <form className="mutation-form" onSubmit={handleRequest}>
                      <div className="form-field">
                        <label className="form-label">Identifiant Étudiant</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Ex: TANA-2024-001" 
                          value={requestData.studentId}
                          onChange={(e) => setRequestData({...requestData, studentId: e.target.value})}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Titre du Diplôme</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Ex: Master en Intelligence Artificielle" 
                          value={requestData.degreeTitle}
                          onChange={(e) => setRequestData({...requestData, degreeTitle: e.target.value})}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Établissement / Université</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Ex: Université d'Antananarivo" 
                          value={requestData.university}
                          onChange={(e) => setRequestData({...requestData, university: e.target.value})}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Année d'obtention</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="2026" 
                          value={requestData.year}
                          onChange={(e) => setRequestData({...requestData, year: e.target.value})}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Document Justificatif (PDF)</label>
                        <div 
                          onClick={simulateFileUpload}
                          style={{ 
                            padding: '16px', 
                            border: '2px dashed #e2e8f0', 
                            borderRadius: '12px', 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            background: requestData.docHash ? 'rgba(212, 163, 115, 0.05)' : 'var(--off-white)',
                            borderColor: requestData.docHash ? 'var(--or)' : '#e2e8f0'
                          }}
                        >
                          {requestData.docHash ? (
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--or)' }}>
                              <CheckCircle size={14} style={{ marginBottom: '-3px', marginRight: '5px' }} /> Document haché : {requestData.docHash.substring(0, 20)}...
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              <Upload size={14} style={{ marginBottom: '-3px', marginRight: '5px' }} /> Cliquer pour joindre le PDF
                            </span>
                          )}
                        </div>
                      </div>
                      <button type="submit" className="btn-submit-mutation" disabled={loading}>
                        {loading ? 'Traitement...' : 'SOUMETTRE POUR CERTIFICATION'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'verify' && (
                  <div className="registration-form-area" style={{ background: 'var(--blanc)', padding: '40px', borderRadius: '24px', border: 'var(--border-main)' }}>
                    <h2 className="section-title">Vérification de l'Authenticité</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>
                      Saisissez l'identifiant unique du diplôme pour vérifier son existence dans le Merkle Tree national.
                    </p>
                    <form className="mutation-form" onSubmit={handleVerify}>
                      <div className="form-field">
                        <label className="form-label">ID du Diplôme</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ flex: 1 }}
                            placeholder="Ex: DIP-STUDENT-2035" 
                            value={diplomaId}
                            onChange={(e) => setDiplomaId(e.target.value)}
                          />
                          <button type="submit" className="btn-submit-mutation" style={{ marginTop: 0, padding: '0 25px' }} disabled={loading}>
                            {loading ? '...' : <Search size={18} />}
                          </button>
                        </div>
                      </div>
                    </form>

                    {verificationResult && (
                      <div style={{ marginTop: '40px', padding: '30px', background: 'var(--off-white)', borderRadius: '20px', border: '1px solid var(--or)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                          <ShieldCheck size={32} style={{ color: 'var(--emeraude)' }} />
                          <div>
                            <div style={{ fontWeight: 900, color: 'var(--navy)' }}>DIPLÔME AUTHENTIFIÉ</div>
                            <div style={{ fontSize: '11px', opacity: 0.6 }}>Vérifié par Merkle Proof le {new Date().toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div className="form-field">
                            <label className="form-label" style={{ opacity: 0.5 }}>Merkle Root</label>
                            <div style={{ fontSize: '10px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{verificationResult.root}</div>
                          </div>
                          <div className="form-field">
                            <label className="form-label" style={{ opacity: 0.5 }}>Transaction Hash</label>
                            <div style={{ fontSize: '10px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{verificationResult.tx_hash}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'admin' && isAdmin && (
                  <div className="admin-requests-area">
                    <h2 className="section-title">Certifications en Attente</h2>
                    <div className="admin-requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {loading ? (
                        <p>Chargement...</p>
                      ) : pendingRequests.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--blanc)', borderRadius: '24px', border: 'var(--border-main)', opacity: 0.5 }}>
                          Aucun diplôme en attente de signature.
                        </div>
                      ) : pendingRequests.map((req, idx) => (
                        <div key={idx} className="request-card" style={{ background: 'var(--blanc)', padding: '24px', borderRadius: '16px', border: 'var(--border-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="req-info">
                            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>{req.degree_title}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{req.university} • {req.year}</div>
                            <div style={{ fontSize: '11px', color: 'var(--or)', fontWeight: 700, marginTop: '4px' }}>Étudiant: {req.student_id}</div>
                          </div>
                          <div className="req-actions">
                            <button className="btn-submit-mutation" style={{ marginTop: 0, padding: '10px 20px', fontSize: '11px' }} onClick={() => handleApprove(req.id)}>
                              SCELLER EN BLOCKCHAIN
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="land-sidebar-actions">
                <h2 className="section-title">Audit Académique</h2>
                <div className="land-history-card" style={{ marginTop: 0 }}>
                  <div className="land-activity-list">
                    {[
                      { type: 'CERT', desc: 'Master IT certifié (Univ Tana)', time: 'Il y a 2h' },
                      { type: 'SIGN', desc: 'Signature Merkle scellée', time: 'Il y a 5h' },
                      { type: 'USER', desc: 'Nouveau node académique : Univ Majunga', time: '12 Mai 2026' }
                    ].map((act, i) => (
                      <div key={i} className="land-activity-item">
                        <div className="act-icon-box" style={{ background: 'rgba(212, 163, 115, 0.1)', color: 'var(--or)' }}><Award size={14} /></div>
                        <div className="act-content">
                          <span className="act-title">{act.desc}</span>
                          <span className="act-meta">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '30px', padding: '24px', background: 'var(--off-white)', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <SearchCode size={20} style={{ color: 'var(--or)' }} />
                    <h4 style={{ fontSize: '13px', fontWeight: 900 }}>Preuve de Travail</h4>
                  </div>
                  <p style={{ fontSize: '11px', lineHeight: 1.6, color: '#64748b' }}>
                    Le système utilise des <strong>Merkle Trees</strong> pour agréger les diplômes d'une promotion. 
                    Un seul hash est stocké sur la blockchain principale, permettant une vérification immédiate et immuable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
