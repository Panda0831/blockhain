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
  Send,
  Info,
  MapPin,
  Maximize,
  Clock,
  Filter,
  History,
  TrendingUp,
  FileText,
  Globe,
  ShieldCheck,
  Check,
  ArrowLeft,
  Upload,
  File
} from 'lucide-react';
import { landService, authService } from './services/api';
import './dashboard.css';
import './land.css';

export default function LandModule() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{"username": "Utilisateur Réseau", "public_key": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"}');
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'FONCIER';

  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'request' | 'admin'>(isAdmin ? 'admin' : 'my');
  
  // States for mutation
  const [transferData, setTransferData] = useState({
    parcelId: '',
    buyerId: '',
    price: ''
  });

  // Registration Form State
  const [regData, setRegData] = useState({
    docUrl: '',
    description: '',
    fileName: ''
  });

  // Admin State
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  // User Search States
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserSelector, setShowUserSelector] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Toujours charger les parcelles de l'utilisateur (pour le menu déroulant de transfert)
      if (user.public_key) {
        const myParcelIds = await landService.getParcelsByOwner(user.public_key);
        const parcelDetails = await Promise.all(
          myParcelIds.map(async (id: string) => {
            try {
              const details = await landService.getDetails(id);
              return { id, ...details };
            } catch (e) {
              return { id, status: 'UNKNOWN' };
            }
          })
        );
        setParcels(parcelDetails);
      }

      // 2. Toujours charger les utilisateurs (pour la recherche d'acquéreur)
      const usersData = await authService.getUsers();
      setAllUsers(usersData.filter((u: any) => u.public_key !== user.public_key));

      // 3. Charger les données spécifiques à l'onglet
      if (activeTab === 'admin' && isAdmin) {
        const data = await landService.getPending();
        setPendingRequests(data);
      }
    } catch (err) {
      console.error("Erreur chargement foncier :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleApprove = async (id: number) => {
    try {
      await landService.approve(id);
      alert("Demande approuvée et inscrite sur la blockchain !");
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'approbation");
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const selectBuyer = (selectedUser: any) => {
    setTransferData({ ...transferData, buyerId: selectedUser.public_key });
    setUserSearchQuery(selectedUser.username);
    setShowUserSelector(false);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.parcelId || !transferData.buyerId || !transferData.price) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      await landService.transfer({
        parcel_id: transferData.parcelId,
        seller_id: user.public_key,
        buyer_id: transferData.buyerId,
        price: parseFloat(transferData.price),
        signature: "SIG_MOBILE_DEMO" // Signature simplifiée pour la démo
      });
      alert("Mutation signée et enregistrée sur la blockchain !");
      setTransferData({ parcelId: '', buyerId: '', price: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erreur lors de la mutation");
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.docUrl) {
      alert("Veuillez sélectionner un document justificatif (PDF/Image).");
      return;
    }

    try {
      await landService.request({
        requester_id: user.public_key,
        document_url: regData.docUrl,
        description: regData.description || "Nouvelle immatriculation de parcelle"
      });
      alert("Demande d'immatriculation envoyée avec succès !");
      setRegData({ docUrl: '', description: '', fileName: '' });
      setActiveTab('my');
    } catch (err) {
      alert("Erreur lors de l'envoi de la demande.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulation d'upload : on génère un hash fictif basé sur le nom
      const fakeHash = "ipfs://hzl-" + Math.random().toString(36).substring(7);
      setRegData({ ...regData, fileName: file.name, docUrl: fakeHash });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const landStats = [
    { label: 'Surface Estimée', value: (parcels.length * 1250).toLocaleString() + ' m²', icon: <Maximize size={18} /> },
    { label: 'Titres Actifs', value: parcels.length.toString(), icon: <FileText size={18} /> },
    { label: 'Réseau', value: ' MG-BFT v2.4', icon: <Globe size={18} /> },
    { label: 'Status', value: 'Opérationnel', icon: <ShieldCheck size={18} /> }
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="noise-overlay"></div>
      
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
          <Link to="/land" className="nav-item active">
            <MapIcon className="nav-icon" /> Foncier
          </Link>
          <Link to="/agri" className="nav-item">
            <Trees className="nav-icon" /> Agriculture
          </Link>
          <Link to="/education" className="nav-item">
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
            <div className="pre-title" style={{ fontSize: '10px', color: 'var(--or)', letterSpacing: '2px', fontWeight: 900, marginBottom: '4px' }}>GESTION PATRIMONIALE</div>
            <h1>Cadastre National</h1>
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
          {/* TAB NAVIGATION */}
          <div className="tab-navigation" style={{ display: 'flex', gap: '40px', marginBottom: '30px', borderBottom: 'var(--border-main)' }}>
            <button 
              className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
              onClick={() => setActiveTab('my')}
              style={{ padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: activeTab === 'my' ? 'var(--navy)' : '#94a3b8', borderBottom: activeTab === 'my' ? '3px solid var(--navy)' : '3px solid transparent' }}
            >
              Mes Titres
            </button>
            <button 
              className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
              onClick={() => setActiveTab('request')}
              style={{ padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: activeTab === 'request' ? 'var(--navy)' : '#94a3b8', borderBottom: activeTab === 'request' ? '3px solid var(--navy)' : '3px solid transparent' }}
            >
              Demande d'Immatriculation
            </button>
            {isAdmin && (
              <button 
                className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
                style={{ padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: activeTab === 'admin' ? 'var(--navy)' : '#94a3b8', borderBottom: activeTab === 'admin' ? '3px solid var(--navy)' : '3px solid transparent' }}
              >
                Administration (Pending)
              </button>
            )}
          </div>

          <div className="land-container-full">
            <div className="land-main-layout">
              <div className="parcels-section">
                {activeTab === 'my' && (
                  <>
                    <div className="search-filter-bar">
                      <div className="search-input-wrapper">
                        <Search size={16} opacity={0.4} />
                        <input type="text" placeholder="Rechercher une parcelle (ID, Commune...)" />
                      </div>
                    </div>
                    <h2 className="section-title">Parcelles Enregistrées</h2>
                    {loading ? (
                      <p>Chargement du cadastre...</p>
                    ) : (
                      <div className="parcels-grid">
                        {parcels.length === 0 ? (
                          <div className="empty-state-card" style={{ background: 'var(--blanc)', padding: '60px', borderRadius: '24px', border: 'var(--border-main)', textAlign: 'center', gridColumn: '1 / -1' }}>
                            <MapIcon size={40} style={{ color: 'var(--or)', marginBottom: '20px', opacity: 0.5 }} />
                            <p style={{ opacity: 0.5, marginBottom: '20px', fontWeight: 600 }}>Aucune propriété détectée sur ce compte.</p>
                            <button className="btn-submit-mutation" style={{ maxWidth: '250px', margin: '0 auto' }} onClick={() => setActiveTab('request')}>DÉPOSER UN DOSSIER</button>
                          </div>
                        ) : parcels.map((p, idx) => (
                          <div key={idx} className="parcel-card">
                            <div className="parcel-header">
                              <span className="parcel-id">{p.id}</span>
                              <span className="parcel-status">Certifié</span>
                            </div>
                            <div className="parcel-info-row">
                              <span className="parcel-label"><MapPin size={12} /> Localisation</span>
                              <span className="parcel-value">Antananarivo</span>
                            </div>
                            <div className="parcel-info-row">
                              <span className="parcel-label"><Maximize size={12} /> Surface</span>
                              <span className="parcel-value">1,250 m²</span>
                            </div>
                            <div className="parcel-actions">
                              <button className="parcel-btn btn-details"><Info size={14} /> Consulter</button>
                              <button className="parcel-btn btn-transfer" onClick={() => setTransferData({ ...transferData, parcelId: p.id })}><Send size={14} /> Céder</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'request' && (
                  <div className="registration-form-area" style={{ background: 'var(--blanc)', padding: '40px', borderRadius: '24px', border: 'var(--border-main)' }}>
                    <h2 className="section-title">Nouvelle Immatriculation</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>
                      Remplissez ce formulaire pour soumettre votre dossier de propriété à l'administration foncière.
                    </p>
                    <form className="mutation-form" onSubmit={handleRequest}>
                      <div className="form-field">
                        <label className="form-label">Justificatifs (Titre, Acte, Certificat)</label>
                        <div 
                          className="file-upload-zone" 
                          style={{ 
                            border: '2px dashed #e2e8f0', 
                            borderRadius: '16px', 
                            padding: '30px', 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            background: regData.fileName ? 'rgba(45, 122, 88, 0.05)' : 'var(--off-white)',
                            borderColor: regData.fileName ? 'var(--emeraude)' : '#e2e8f0',
                            position: 'relative'
                          }}
                          onClick={() => document.getElementById('land-file-input')?.click()}
                        >
                          <input 
                            type="file" 
                            id="land-file-input" 
                            hidden 
                            accept=".pdf,image/*" 
                            onChange={handleFileChange} 
                          />
                          
                          {regData.fileName ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <File size={32} style={{ color: 'var(--emeraude)' }} />
                              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>{regData.fileName}</span>
                              <span style={{ fontSize: '11px', opacity: 0.5 }}>Document prêt pour scellage blockchain</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <Upload size={32} style={{ color: '#94a3b8' }} />
                              <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Cliquez pour sélectionner un fichier</span>
                              <span style={{ fontSize: '11px', opacity: 0.5 }}>PDF ou Image (Max 10 Mo)</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="form-field">
                        <label className="form-label">Description détaillée</label>
                        <textarea 
                          className="form-input" 
                          placeholder="Commune, district, bornes, voisins, surface exacte..." 
                          style={{ height: '120px', resize: 'none' }}
                          value={regData.description}
                          onChange={(e) => setRegData({ ...regData, description: e.target.value })}
                        ></textarea>
                      </div>
                      <div style={{ background: 'var(--off-white)', padding: '20px', borderRadius: '16px', marginTop: '20px', border: '1px dashed #e2e8f0' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <ShieldCheck size={24} style={{ color: 'var(--emeraude)' }} />
                          <div>
                            <span style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>VÉRIFICATION BLOCKCHAIN</span>
                            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                              Une fois approuvé, ce titre sera scellé cryptographiquement et associé à votre clé publique.
                            </span>
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="btn-submit-mutation">ENVOYER LE DOSSIER AU CADASTRE</button>
                    </form>
                  </div>
                )}

                {activeTab === 'admin' && isAdmin && (
                  <div className="admin-requests-area">
                    <h2 className="section-title">Demandes en attente</h2>
                    <div className="admin-requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {loading ? (
                        <p>Chargement des demandes...</p>
                      ) : pendingRequests.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--blanc)', borderRadius: '24px', border: 'var(--border-main)', opacity: 0.5 }}>
                          Aucune demande en attente.
                        </div>
                      ) : pendingRequests.map((req, idx) => (
                        <div key={idx} className="request-card" style={{ background: 'var(--blanc)', padding: '24px', borderRadius: '16px', border: 'var(--border-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="req-info">
                            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>Demande #{req.id}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Par: {req.requester_id.substring(0, 20)}...</div>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>{req.description}</div>
                          </div>
                          <div className="req-actions" style={{ display: 'flex', gap: '10px' }}>
                            <button className="parcel-btn btn-details" onClick={() => window.open(req.document_url, '_blank')}><FileText size={14} /> Voir Doc</button>
                            <button className="parcel-btn btn-transfer" onClick={() => handleApprove(req.id)}><ShieldCheck size={14} /> Approuver</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="land-sidebar-actions">
                <h2 className="section-title">Opérations</h2>
                <div className="mutation-card">
                  <form className="mutation-form" onSubmit={handleTransfer}>
                    <div className="form-field">
                      <label className="form-label">Parcelle source</label>
                      <select 
                        className="form-input" 
                        value={transferData.parcelId} 
                        onChange={(e) => setTransferData({ ...transferData, parcelId: e.target.value })}
                      >
                        <option value="">Sélectionnez une propriété</option>
                        {parcels.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
                      </select>
                    </div>
                    <div className="form-field" style={{ position: 'relative' }}>
                      <label className="form-label">Acquéreur (Clé Publique)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Rechercher par nom..." 
                          style={{ flex: 1 }}
                          value={userSearchQuery}
                          onChange={(e) => {
                            setUserSearchQuery(e.target.value);
                            setShowUserSelector(true);
                          }}
                          onFocus={() => setShowUserSelector(true)}
                        />
                        {transferData.buyerId && (
                          <div style={{ background: 'var(--emeraude)', color: 'white', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                            <Check size={16} />
                          </div>
                        )}
                      </div>
                      
                      {showUserSelector && userSearchQuery && (
                        <div className="user-dropdown" style={{ 
                          position: 'absolute', 
                          top: '100%', 
                          left: 0, 
                          right: 0, 
                          background: 'white', 
                          border: 'var(--border-main)', 
                          borderRadius: '12px', 
                          marginTop: '5px',
                          zIndex: 10,
                          maxHeight: '200px',
                          overflowY: 'auto',
                          boxShadow: 'var(--shadow-md)'
                        }}>
                          {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                            <div 
                              key={i} 
                              className="user-option" 
                              onClick={() => selectBuyer(u)}
                              style={{ 
                                padding: '12px 16px', 
                                borderBottom: '1px solid #f1f5f9', 
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 700, fontSize: '13px' }}>{u.username}</span>
                                <span style={{ fontSize: '10px', opacity: 0.5, fontFamily: 'monospace' }}>{u.public_key.substring(0, 20)}...</span>
                              </div>
                              <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--or)', textTransform: 'uppercase' }}>{u.role}</span>
                            </div>
                          )) : (
                            <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>Aucun citoyen trouvé</div>
                          )}
                        </div>
                      )}
                      
                      {transferData.buyerId && (
                        <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                          ID: {transferData.buyerId}
                        </div>
                      )}
                    </div>
                    <div className="form-field">
                      <label className="form-label">Prix de cession (HZ-MGA)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="0.00" 
                        value={transferData.price}
                        onChange={(e) => setTransferData({ ...transferData, price: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn-submit-mutation">SIGNER & INITIALISER LA MUTATION</button>
                  </form>
                </div>

                <div className="land-history-card">
                  <h3 className="section-title" style={{ fontSize: '14px', marginBottom: '20px' }}>Flux de Propriété</h3>
                  <div className="land-activity-list">
                    {[
                      { type: 'CERT', desc: 'Titre HZL-LND-92 scellé', time: 'Il y a 2h' },
                      { type: 'MOVE', desc: 'Mutation en cours vers 0x82...a1', time: 'Il y a 1j' },
                      { type: 'NEW', desc: 'Dossier déposé : Parcelle A22', time: '12 Mai 2026' }
                    ].map((act, i) => (
                      <div key={i} className="land-activity-item">
                        <div className="act-icon-box"><History size={14} /></div>
                        <div className="act-content">
                          <span className="act-title">{act.desc}</span>
                          <span className="act-meta">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
