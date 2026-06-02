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
  CheckCircle,
  Database,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  ShieldCheck,
  Globe,
  Copy,
  Check
} from 'lucide-react';
import { microfinanceService, authService, blockchainService } from './services/api';
import { SimpleChart } from './components/SimpleChart';
import './dashboard.css';

export default function FinanceModule() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [activeTab, setActiveTab] = useState<'send' | 'wallet'>('send');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  
  // Send Form State
  const [sendData, setSendData] = useState({
    receiverId: '',
    receiverName: '',
    amount: '',
    description: ''
  });

  // User Search for Transfer
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserSelector, setShowUserSelector] = useState(false);

  // Wallet State
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);

  const [historyData, setHistoryData] = useState<any[]>([]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Récupération du solde, historique de solde, et liste des blocs
      const [balRes, histRes, blocks] = await Promise.all([
        blockchainService.getBalance(user.public_key),
        blockchainService.getBalanceHistory(user.public_key),
        blockchainService.getBlocks()
      ]);
      
      setBalance(balRes.balance);
      setHistory(histRes.history);

      // Traitement de l'historique réel
      const normalize = (k: string) => k.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const myKey = normalize(user.public_key);
      
      const realHistory: any[] = [];
      // On parcourt les blocs en partant du plus récent
      [...blocks].reverse().forEach(block => {
          block.transactions.forEach((tx: any) => {
              if (normalize(tx.expediteur) === myKey || normalize(tx.destinataire) === myKey) {
                  realHistory.push({
                      type: normalize(tx.expediteur) === myKey ? 'SEND' : 'RECV',
                      desc: tx.description,
                      amount: (normalize(tx.expediteur) === myKey ? '-' : '+') + tx.montant + ' MGA',
                      time: new Date(tx.horodatage * 1000).toLocaleDateString()
                  });
              }
          });
      });
      setHistoryData(realHistory.slice(0, 5));

      if (activeTab === 'wallet') {
        const data = await microfinanceService.getPendingTransfers(user.public_key);
        setPendingTransfers(data.reverse());
      }
      
      const usersData = await authService.getUsers();
      setAllUsers(usersData.filter((u: any) => u.public_key !== user.public_key));
    } catch (err) {
      console.error("Erreur chargement finance :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendData.receiverId || !sendData.amount || !sendData.description) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);
      await microfinanceService.sendMoney({
        sender_id: user.public_key,
        receiver_id: sendData.receiverId,
        amount: parseFloat(sendData.amount),
        description: sendData.description
      });
      alert("Demande de transfert envoyée sur la blockchain !");
      setSendData({ receiverId: '', receiverName: '', amount: '', description: '' });
      setUserSearchQuery('');
      setActiveTab('wallet');
    } catch (err) {
      alert("Erreur lors de l'envoi des fonds.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      setLoading(true);
      await microfinanceService.acceptTransfer(id);
      alert("Transfert accepté et miné sur la blockchain !");
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'acceptation du transfert.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const selectReceiver = (u: any) => {
    setSendData({ ...sendData, receiverId: u.public_key, receiverName: u.username });
    setUserSearchQuery(u.username);
    setShowUserSelector(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const financeStats = [
    { label: 'Solde HZ-MGA', value: balance.toLocaleString() + '.00', icon: <Wallet size={18} /> },
    { label: 'Transactions', value: 'Décentralisé', icon: <TrendingUp size={18} /> },
    { label: 'Réseau', value: 'BFT-Secure', icon: <ShieldCheck size={18} /> },
    { label: 'Nodes', value: 'Hazo Lova', icon: <Globe size={18} /> }
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
          <Link to="/education" className="nav-item">
            <GraduationCap className="nav-icon" /> Éducation
          </Link>
          <Link to="/finance" className="nav-item active">
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
            <div className="pre-title" style={{ fontSize: '10px', color: 'var(--or)', letterSpacing: '2px', fontWeight: 900, marginBottom: '4px' }}>SERVICES FINANCIERS</div>
            <h1>Banque Décentralisée</h1>
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
              className={`tab-btn ${activeTab === 'send' ? 'active' : ''}`}
              onClick={() => setActiveTab('send')}
              style={{ padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: activeTab === 'send' ? 'var(--navy)' : '#94a3b8', borderBottom: activeTab === 'send' ? '3px solid var(--navy)' : '3px solid transparent' }}
            >
              Envoyer des Fonds
            </button>
            <button 
              className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
              onClick={() => setActiveTab('wallet')}
              style={{ padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: activeTab === 'wallet' ? 'var(--navy)' : '#94a3b8', borderBottom: activeTab === 'wallet' ? '3px solid var(--navy)' : '3px solid transparent' }}
            >
              Portefeuille & Attente
            </button>
          </div>

          <div className="land-container-full">
            <div className="land-stats-summary" style={{ marginBottom: '40px' }}>
              {financeStats.map((stat, i) => (
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
                {activeTab === 'send' && (
                  <>
                    <h2 className="section-title">Analyse du Portefeuille</h2>
                    <div style={{ marginBottom: '30px' }}>
                       <SimpleChart data={history} height={250} />
                    </div>

                    <div className="registration-form-area" style={{ background: 'var(--blanc)', padding: '40px', borderRadius: '24px', border: 'var(--border-main)' }}>
                      <h2 className="section-title">Nouveau Transfert</h2>
                      <form className="mutation-form" onSubmit={handleSend}>
                        <div className="form-field" style={{ position: 'relative' }}>
                          <label className="form-label">Destinataire (Citoyen)</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="text" 
                              className="form-input" 
                              style={{ flex: 1 }}
                              placeholder="Chercher par nom..." 
                              value={userSearchQuery}
                              onChange={(e) => {
                                setUserSearchQuery(e.target.value);
                                setShowUserSelector(true);
                              }}
                              onFocus={() => setShowUserSelector(true)}
                            />
                            {sendData.receiverId && (
                              <div style={{ background: 'var(--emeraude)', color: 'white', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                                <Check size={16} />
                              </div>
                            )}
                          </div>
                          
                          {showUserSelector && userSearchQuery && (
                            <div className="user-dropdown" style={{ 
                              position: 'absolute', top: '100%', left: 0, right: 0, 
                              background: 'white', border: 'var(--border-main)', borderRadius: '12px', 
                              marginTop: '5px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-md)'
                            }}>
                              {filteredUsers.map((u, i) => (
                                <div key={i} className="user-option" onClick={() => selectReceiver(u)} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{u.username}</span>
                                    <span style={{ fontSize: '10px', opacity: 0.5, fontFamily: 'monospace' }}>{u.public_key.substring(0, 20)}...</span>
                                  </div>
                                  <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--or)', textTransform: 'uppercase' }}>{u.role}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="form-field">
                          <label className="form-label">Montant (Ariary)</label>
                          <input 
                            type="number" 
                            className="form-input" 
                            placeholder="0.00" 
                            value={sendData.amount}
                            onChange={(e) => setSendData({...sendData, amount: e.target.value})}
                          />
                        </div>

                        <div className="form-field">
                          <label className="form-label">Motif du transfert</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Achat de vanille, prêt, etc." 
                            value={sendData.description}
                            onChange={(e) => setSendData({...sendData, description: e.target.value})}
                          />
                        </div>

                        <button type="submit" className="btn-submit-mutation" disabled={loading}>
                          {loading ? 'Initialisation...' : 'INITIALISER LE TRANSFERT SECURE'}
                        </button>
                      </form>
                    </div>
                  </>
                )}

                {activeTab === 'wallet' && (
                  <div className="parcels-section">
                    <h2 className="section-title">Transferts en attente de réception</h2>
                    <div className="parcels-grid">
                      {loading ? (
                        <p>Chargement...</p>
                      ) : pendingTransfers.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--blanc)', borderRadius: '24px', border: 'var(--border-main)', opacity: 0.5, gridColumn: '1/-1' }}>
                          Aucun transfert en attente pour votre compte.
                        </div>
                      ) : pendingTransfers.map((t, idx) => (
                        <div key={idx} className="parcel-card" style={{ borderLeft: '4px solid var(--or)' }}>
                          <div className="parcel-header">
                            <span className="parcel-id">#{t.id}</span>
                            <span className="parcel-status" style={{ background: 'rgba(212, 163, 115, 0.1)', color: 'var(--or)' }}>EN ATTENTE</span>
                          </div>
                          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--navy)', margin: '10px 0' }}>{t.amount.toLocaleString()} Ar</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '15px' }}>{t.description}</div>
                          <div className="parcel-info-row">
                            <span className="parcel-label">Expéditeur</span>
                            <span className="parcel-value" style={{ fontFamily: 'monospace' }}>{t.sender_id.substring(0, 15)}...</span>
                          </div>
                          <div className="parcel-actions">
                            <button className="btn-submit-mutation" style={{ marginTop: 0, width: '100%' }} onClick={() => handleAccept(t.id)}>
                              ACCEPTER LES FONDS
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="land-sidebar-actions">
                <h2 className="section-title">Historique Flux</h2>
                <div className="land-history-card" style={{ marginTop: 0 }}>
                  <div className="land-activity-list">
                    {historyData.map((act, i) => (
                      <div key={i} className="land-activity-item">
                        <div className="act-icon-box">
                          {act.type === 'RECV' ? <ArrowDownLeft size={14} color="var(--emeraude)" /> : <ArrowUpRight size={14} color="#ef4444" />}
                        </div>
                        <div className="act-content">
                          <span className="act-title">{act.amount}</span>
                          <span className="act-meta">{act.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '30px', padding: '24px', background: 'var(--off-white)', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <ShieldCheck size={20} style={{ color: 'var(--emeraude)' }} />
                    <h4 style={{ fontSize: '13px', fontWeight: 900 }}>Garantie Blockchain</h4>
                  </div>
                  <p style={{ fontSize: '11px', lineHeight: 1.6, color: '#64748b' }}>
                    Chaque transfert est validé par un consensus décentralisé. 
                    L'argent ne quitte le compte de l'expéditeur que lorsque le destinataire accepte la transaction sur son node.
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
