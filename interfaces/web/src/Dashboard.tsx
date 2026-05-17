import React from 'react';
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
  Globe
} from 'lucide-react';
import { authService } from './services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{"username": "Utilisateur Réseau", "public_key": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const stats = [
    { label: 'Blocs Validés', value: '1,284', trend: '+12.5%', icon: <ShieldCheck size={20} /> },
    { label: 'Actifs Détenus', value: '43', trend: '+3.2%', icon: <MapIcon size={20} /> },
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
      <div className="noise-overlay"></div>
      <div className="lens-flare lp-1"></div>
      <div className="lens-flare lp-2"></div>
      
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
                <div className="crystal-shine"></div>
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
                    <div className="crystal-shine"></div>
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

            {/* RECENT ACTIVITY */}
            <div className="activity-area">
              <h2 className="section-title">Flux Réseau</h2>
              <div className="activity-list">
                {[
                  { type: 'BLOCK', desc: 'Nouveau bloc scellé #842054', time: 'Il y a 2m' },
                  { type: 'LAND', desc: 'Titre HZL-LND-92 mis à jour', time: 'Il y a 14m' },
                  { type: 'AGRI', desc: 'Récolte certifiée : Vanille A1', time: 'Il y a 32m' },
                  { type: 'USER', desc: 'Nouvelle identité validée', time: 'Il y a 1h' }
                ].map((act, i) => (
                  <div key={i} className="activity-item">
                    <div className="act-type">{act.type}</div>
                    <div className="act-desc">{act.desc}</div>
                    <div className="act-time">{act.time}</div>
                  </div>
                ))}
                <button className="view-all-btn">VOIR LE REGISTRE COMPLET</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
