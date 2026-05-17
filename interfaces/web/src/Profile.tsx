import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Key, 
  Shield, 
  History, 
  Bell, 
  LogOut,
  LayoutDashboard,
  Map as MapIcon,
  Trees,
  GraduationCap,
  Wallet,
  Search,
  ChevronRight,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import './dashboard.css'; // On réutilise les bases de la sidebar
import './profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{"username": "Utilisateur Réseau", "email": "contact@hazolova.mg", "public_key": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <Link to="/" className="sidebar-logo">HAZO LOVA</Link>
        
        <nav className="nav-group">
          <Link to="/dashboard" className="nav-item">
            <LayoutDashboard className="nav-icon" /> Dashboard
          </Link>
          <Link to="/profile" className="nav-item active">
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
            <div className="pre-title" style={{ fontSize: '10px', color: 'var(--or)', letterSpacing: '2px', fontWeight: 900, marginBottom: '4px' }}>MON COMPTE</div>
            <h1>Identité Numérique</h1>
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
          <div className="profile-grid">
            {/* CARTE D'IDENTITÉ */}
            <div className="profile-main-card">
              <div className="profile-header-info">
                <div className="profile-avatar-large">
                  {user.username?.charAt(0) || 'U'}
                </div>
                <div className="profile-titles">
                  <h2>{user.username}</h2>
                  <p className="user-role">Citoyen Certifié — Réseau Hazo Lova</p>
                </div>
              </div>

              <div className="info-rows">
                <div className="info-row">
                  <div className="info-label"><Mail size={14} /> Adresse Email</div>
                  <div className="info-value">{user.email || 'Non renseigné'}</div>
                </div>
                <div className="info-row">
                  <div className="info-label"><Key size={14} /> Clé Publique (Signature)</div>
                  <div className="info-value-box">
                    <code>{user.public_key}</code>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label"><Fingerprint size={14} /> ID Numérique</div>
                  <div className="info-value">HZL-USER-{Math.random().toString(36).substring(7).toUpperCase()}</div>
                </div>
              </div>
              
              <button className="edit-profile-btn">MODIFIER LES INFORMATIONS</button>
            </div>

            {/* SÉCURITÉ & STATUT */}
            <div className="profile-side-panels">
              <div className="security-status-card">
                <h3 className="section-title">Niveau de Sécurité</h3>
                <div className="security-meter">
                    <div className="meter-fill" style={{ width: '85%' }}></div>
                </div>
                <div className="security-tags">
                  <div className="sec-tag protected"><Shield size={12} /> 2FA Actif</div>
                  <div className="sec-tag protected"><Shield size={12} /> Email Validé</div>
                  <div className="sec-tag warning"><ShieldAlert size={12} /> Clé Bio non liée</div>
                </div>
              </div>

              <div className="recent-activity-card">
                <h3 className="section-title">Dernières Connexions</h3>
                <div className="mini-activity-list">
                  {[
                    { desc: 'Connexion depuis Antananarivo', time: 'Aujourd\'hui, 09:42' },
                    { desc: 'Signature de contrat foncier', time: 'Hier, 14:15' },
                    { desc: 'Mise à jour des identifiants', time: '15 Mai 2026' }
                  ].map((act, i) => (
                    <div key={i} className="mini-act-item">
                      <div className="mini-act-desc">{act.desc}</div>
                      <div className="mini-act-time">{act.time}</div>
                    </div>
                  ))}
                </div>
                <button className="history-link">VOIR L'HISTORIQUE COMPLET <ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
