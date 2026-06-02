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
  TrendingUp,
  ShieldCheck,
  Shield,
  Globe,
  Brain
} from 'lucide-react';
import { authService, blockchainService, landService, agriService } from './services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    // Ne devrait pas arriver avec ProtectedRoute mais par sécurité
    return null;
  }
  const user = JSON.parse(userStr);
  const [brainInfo, setBrainInfo] = useState<any>(null);
  const [realStats, setRealStats] = useState({ blocks: 0, assets: 0 });

  useEffect(() => {
    blockchainService.getBrainInfo().then(setBrainInfo).catch(console.error);
    
    const fetchRealData = async () => {
        try {
            const [blocks, parcels, lots] = await Promise.all([
                blockchainService.getBlocks(),
                landService.getParcelsByOwner(user.public_key),
                agriService.getAllLots()
            ]);
            setRealStats({ 
                blocks: blocks.length, 
                assets: parcels.length + lots.length 
            });
        } catch (e) { console.error(e); }
    };
    fetchRealData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const stats = [
    { label: 'Blocs Validés', value: realStats.blocks.toString(), trend: 'Live', icon: <ShieldCheck size={20} /> },
    { label: 'Actifs Détenus', value: realStats.assets.toString(), trend: 'Live', icon: <MapIcon size={20} /> },
    { label: 'Réputation', value: '98/100', trend: 'Stable', icon: <TrendingUp size={20} /> },
    { label: 'Nodes Actifs', value: '1,402', trend: '+24', icon: <Globe size={20} /> }
  ];

  const modules = [
    { 
      title: 'Foncier', 
      description: 'Gérez vos titres de propriété et effectuez des mutations foncières sécurisées.', 
      icon: <MapIcon size={24} />, 
      path: '/land',
      tag: 'HZL-LND'
    },
    { 
      title: 'Agriculture', 
      description: 'Tracez vos récoltes de vanille et giroflée. Optimisez vos trajets logistiques via A*.', 
      icon: <Trees size={24} />, 
      path: '/agri',
      tag: 'HZ-AGRI'
    },
    { 
      title: 'Éducation', 
      description: 'Certifiez vos diplômes et vérifiez l\'authenticité des parcours académiques.', 
      icon: <GraduationCap size={24} />, 
      path: '/education',
      tag: 'HZ-EDU'
    },
    { 
      title: 'Microfinance', 
      description: 'Accédez à des micro-prêts décentralisés basés sur votre historique blockchain.', 
      icon: <Wallet size={24} />, 
      path: '/finance',
      tag: 'HZ-FIN'
    },
    { 
      title: 'Registre', 
      description: 'Explorez la blockchain en temps réel et vérifiez l\'intégrité des blocs.', 
      icon: <Search size={24} />, 
      path: '/explorer',
      tag: 'CORE-SYS'
    }
  ];

  return (
    <div className="dashboard-wrapper">
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <Link to="/" className="sidebar-logo">HAZO LOVA</Link>
        
        <nav className="nav-group">
          <Link to="/dashboard" className="nav-item active">
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
          <Link to="/education" className="nav-item">
            <GraduationCap className="nav-icon" /> Éducation
          </Link>
          {user.role === 'MINEUR' && (
            <Link to="/miner" className="nav-item">
              <Shield className="nav-icon" /> Mineur
            </Link>
          )}
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
            <div className="pre-title" style={{ fontSize: '10px', color: 'var(--or)', letterSpacing: '2px', fontWeight: 900, marginBottom: '4px' }}>ADMINISTRATION</div>
            <h1>Centre de Commande</h1>
          </div>
          
          <div className="user-status">
            <button className="nav-icon-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--navy)', opacity: 0.5 }}><Bell size={20} /></button>
            <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className="profile-mini">
                <span className="username">{user.username}</span>
                <span className="public-key-hash">{user.public_key?.substring(0, 10)}...</span>
              </div>
              <div className="avatar-circle">
                {user.username?.charAt(0) || 'U'}
              </div>
            </Link>
          </div>
        </header>

        <div className="dashboard-content">
          {/* STATS */}
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-label">{stat.label}</div>
                  <div style={{ color: 'var(--emeraude)', opacity: 0.6 }}>{stat.icon}</div>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-trend">{stat.trend}</div>
              </div>
            ))}
          </div>

          <div className="dashboard-main-grid">
            {/* MODULES */}
            <div className="modules-area">
              <h2 className="section-title">Modules de l'Infrastructure</h2>
              <div className="modules-grid">
                {modules.map((m, i) => (
                  <div key={i} className="module-card" onClick={() => navigate(m.path)}>
                    <div className="module-icon-box">{m.icon}</div>
                    <div className="module-tag" style={{ fontSize: '9px', fontWeight: 900, color: 'var(--or)', letterSpacing: '1px', marginBottom: '8px' }}>{m.tag}</div>
                    <h3>{m.title}</h3>
                    <p>{m.description}</p>
                    <div className="module-action">
                      Lancer le module <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI CONSENSUS MONITOR */}
            <div className="activity-area">
              <h2 className="section-title">Consensus IA</h2>
              <div id="ai-monitor" className="activity-list">
                 {brainInfo ? Object.entries(brainInfo).map(([state, info]: any) => (
                    <div key={state} className="activity-item" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            <div className="act-type">{state}</div>
                            <div className="act-desc">{info.best_leader}</div>
                        </div>
                        <div className="act-time" style={{fontWeight: 800}}>{info.score.toFixed(1)}</div>
                    </div>
                 )) : <p style={{fontSize: '13px'}}>Chargement de l'intelligence réseau...</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
