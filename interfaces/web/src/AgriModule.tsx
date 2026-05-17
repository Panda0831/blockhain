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
  Navigation,
  Box,
  TrendingUp,
  Globe,
  ShieldCheck,
  Check,
  MapPin,
  Clock,
  ArrowRight,
  Leaf
} from 'lucide-react';
import { agriService, algoService } from './services/api';
import './dashboard.css';

export default function AgriModule() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{"username": "Utilisateur Réseau", "public_key": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"}');
  
  const [activeTab, setActiveTab] = useState<'harvest' | 'tracking' | 'transport'>('harvest');
  const [loading, setLoading] = useState(false);
  const [lots, setLots] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  // Harvest Form State
  const [harvestData, setHarvestData] = useState({
    productType: 'Vanille',
    district: '',
    weight: '',
    quality: 'Premium'
  });

  // Transport Form State
  const [selectedLotId, setSelectedLotId] = useState('');
  const [destination, setDestination] = useState('');
  const [optimizedPath, setOptimizedPath] = useState<string[] | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lotsData, districtsData] = await Promise.all([
        agriService.getAllLots(),
        algoService.getDistricts()
      ]);
      setLots(lotsData.reverse());
      setDistricts(districtsData);
    } catch (err) {
      console.error("Erreur chargement agriculture :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!harvestData.district || !harvestData.weight) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);
      await agriService.recordHarvest({
        owner_id: user.public_key,
        product_type: harvestData.productType,
        district: harvestData.district,
        weight: parseFloat(harvestData.weight),
        quality: harvestData.quality
      });
      alert("Récolte inscrite avec succès sur la blockchain !");
      setHarvestData({ ...harvestData, district: '', weight: '' });
      fetchData();
      setActiveTab('tracking');
    } catch (err) {
      alert("Erreur lors de l'enregistrement de la récolte.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotId || !destination) {
      alert("Sélectionnez un lot et une destination.");
      return;
    }

    try {
      setLoading(true);
      const res = await agriService.optimizeTransport({
        lot_id: selectedLotId,
        destination: destination
      });
      
      const lastTrace = res.lot.traceability[res.lot.traceability.length - 1];
      if (lastTrace && lastTrace.chemin) {
        setOptimizedPath(lastTrace.chemin);
      }
      
      alert("Trajet optimisé via A* et enregistré !");
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'optimisation du transport.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const agriStats = [
    { label: 'Lots Actifs', value: lots.length.toString(), icon: <Box size={18} /> },
    { label: 'Volume Total', value: lots.reduce((acc, l) => acc + (l.weight || 0), 0).toFixed(1) + ' kg', icon: <TrendingUp size={18} /> },
    { label: 'Réseau Logistique', value: '119 Districts', icon: <Globe size={18} /> },
    { label: 'Status IA', value: 'A* Actif', icon: <Navigation size={18} /> }
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
          <Link to="/agri" className="nav-item active">
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
            <div className="pre-title" style={{ fontSize: '10px', color: 'var(--or)', letterSpacing: '2px', fontWeight: 900, marginBottom: '4px' }}>TRAÇABILITÉ AGRICOLE</div>
            <h1>Réseau de Collecte</h1>
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
              className={`tab-btn ${activeTab === 'harvest' ? 'active' : ''}`}
              onClick={() => setActiveTab('harvest')}
              style={{ padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: activeTab === 'harvest' ? 'var(--navy)' : '#94a3b8', borderBottom: activeTab === 'harvest' ? '3px solid var(--navy)' : '3px solid transparent' }}
            >
              Enregistrer Récolte
            </button>
            <button 
              className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracking')}
              style={{ padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: activeTab === 'tracking' ? 'var(--navy)' : '#94a3b8', borderBottom: activeTab === 'tracking' ? '3px solid var(--navy)' : '3px solid transparent' }}
            >
              Suivi & Traçabilité
            </button>
            <button 
              className={`tab-btn ${activeTab === 'transport' ? 'active' : ''}`}
              onClick={() => setActiveTab('transport')}
              style={{ padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: activeTab === 'transport' ? 'var(--navy)' : '#94a3b8', borderBottom: activeTab === 'transport' ? '3px solid var(--navy)' : '3px solid transparent' }}
            >
              Logistique (A*)
            </button>
          </div>

          <div className="land-container-full">
            <div className="land-stats-summary" style={{ marginBottom: '40px' }}>
              {agriStats.map((stat, i) => (
                <div key={i} className="l-stat-card">
                  <div className="l-stat-icon" style={{ color: 'var(--emeraude)' }}>{stat.icon}</div>
                  <div className="l-stat-info">
                    <span className="l-stat-label">{stat.label}</span>
                    <span className="l-stat-value">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="land-main-layout">
              <div className="parcels-section">
                {activeTab === 'harvest' && (
                  <div className="registration-form-area" style={{ background: 'var(--blanc)', padding: '40px', borderRadius: '24px', border: 'var(--border-main)' }}>
                    <h2 className="section-title">Nouvelle Récolte</h2>
                    <form className="mutation-form" onSubmit={handleHarvest}>
                      <div className="form-field">
                        <label className="form-label">Produit</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {['Vanille', 'Café', 'Girofle', 'Poivre', 'Cacao'].map(p => (
                            <button 
                              key={p} 
                              type="button"
                              onClick={() => setHarvestData({...harvestData, productType: p})}
                              style={{ 
                                padding: '10px 20px', 
                                borderRadius: '20px', 
                                border: harvestData.productType === p ? '2px solid var(--emeraude)' : '1px solid #e2e8f0',
                                background: harvestData.productType === p ? 'rgba(45, 122, 88, 0.1)' : 'var(--off-white)',
                                color: harvestData.productType === p ? 'var(--emeraude)' : '#64748b',
                                fontWeight: 700,
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="form-field">
                        <label className="form-label">District d'Origine</label>
                        <select 
                          className="form-input"
                          value={harvestData.district}
                          onChange={(e) => setHarvestData({...harvestData, district: e.target.value})}
                        >
                          <option value="">Sélectionnez un district</option>
                          {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">Poids Net (kg)</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          step="0.1"
                          placeholder="0.0"
                          value={harvestData.weight}
                          onChange={(e) => setHarvestData({...harvestData, weight: e.target.value})}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Qualité Certifiée</label>
                        <select 
                          className="form-input"
                          value={harvestData.quality}
                          onChange={(e) => setHarvestData({...harvestData, quality: e.target.value})}
                        >
                          <option value="Premium">Premium (Grade A)</option>
                          <option value="Standard">Standard (Grade B)</option>
                          <option value="Export">Export Qualité</option>
                        </select>
                      </div>
                      <button type="submit" className="btn-submit-mutation" disabled={loading}>
                        {loading ? 'Traitement...' : 'CERTIFIER LA RÉCOLTE'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'tracking' && (
                  <>
                    <h2 className="section-title">Flux de Production</h2>
                    <div className="parcels-grid">
                      {lots.length === 0 ? (
                        <p style={{ opacity: 0.5, gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Aucun lot détecté.</p>
                      ) : lots.map((lot, idx) => (
                        <div key={idx} className="parcel-card" style={{ borderLeft: '4px solid var(--emeraude)' }}>
                          <div className="parcel-header">
                            <span className="parcel-id">{lot.id}</span>
                            <span className="parcel-status" style={{ background: 'rgba(45, 122, 88, 0.1)', color: 'var(--emeraude)' }}>{lot.status}</span>
                          </div>
                          <div style={{ fontSize: '18px', fontWeight: 900, margin: '10px 0' }}>{lot.product_type}</div>
                          <div className="parcel-info-row">
                            <span className="parcel-label">Poids</span>
                            <span className="parcel-value">{lot.weight} kg</span>
                          </div>
                          <div className="parcel-info-row">
                            <span className="parcel-label">Origine</span>
                            <span className="parcel-value">{lot.district_origin}</span>
                          </div>
                          <div className="parcel-actions" style={{ marginTop: '15px' }}>
                            <button className="parcel-btn btn-details" onClick={() => { setSelectedLotId(lot.id); setActiveTab('transport'); }}>
                              <Navigation size={14} /> Logistique
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'transport' && (
                  <div className="registration-form-area" style={{ background: 'var(--blanc)', padding: '40px', borderRadius: '24px', border: 'var(--border-main)' }}>
                    <h2 className="section-title">Optimisation de Trajet (A*)</h2>
                    <form className="mutation-form" onSubmit={handleOptimizeTransport}>
                      <div className="form-field">
                        <label className="form-label">Sélectionner un Lot</label>
                        <select 
                          className="form-input"
                          value={selectedLotId}
                          onChange={(e) => setSelectedLotId(e.target.value)}
                        >
                          <option value="">Choisir un lot...</option>
                          {lots.map(l => <option key={l.id} value={l.id}>{l.id} - {l.product_type} ({l.district_origin})</option>)}
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">Destination (Port / Centre de Collecte)</label>
                        <select 
                          className="form-input"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                        >
                          <option value="">Choisir une destination...</option>
                          {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>
                      <button type="submit" className="btn-submit-mutation" disabled={loading}>
                        CALCULER LE CHEMIN OPTIMAL
                      </button>
                    </form>

                    {optimizedPath && (
                      <div style={{ marginTop: '30px', padding: '20px', background: 'var(--off-white)', borderRadius: '16px' }}>
                        <h4 style={{ marginBottom: '15px', fontSize: '14px', fontWeight: 800 }}>RÉSULTAT DE L'ALGORITHME A*</h4>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          {optimizedPath.map((step, i) => (
                            <React.Fragment key={i}>
                              <div style={{ padding: '8px 12px', background: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: '1px solid #e2e8f0' }}>
                                {step}
                              </div>
                              {i < optimizedPath.length - 1 && <ArrowRight size={14} opacity={0.3} />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="land-sidebar-actions">
                <h2 className="section-title">Journal de Bord</h2>
                <div className="land-history-card" style={{ marginTop: 0 }}>
                  <div className="land-activity-list">
                    {lots.slice(0, 5).map((l, i) => (
                      <div key={i} className="land-activity-item">
                        <div className="act-icon-box"><Leaf size={14} style={{ color: 'var(--emeraude)' }} /></div>
                        <div className="act-content">
                          <span className="act-title">Récolte {l.product_type}</span>
                          <span className="act-meta">{l.district_origin} • {l.weight}kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '30px', padding: '20px', background: 'var(--navy)', color: 'white', borderRadius: '20px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Note Technique</h4>
                  <p style={{ fontSize: '11px', opacity: 0.7, lineHeight: 1.5 }}>
                    Le routage utilise l'algorithme A* sur un graphe de 119 districts. 
                    Chaque étape du transport est scellée dans un Merkle Tree pour garantir l'origine Madagascar.
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
