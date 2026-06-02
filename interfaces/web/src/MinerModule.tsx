import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Shield, Cpu, Play, Clock, Box, Database, RefreshCw } from 'lucide-react';
import { blockchainService } from './services/api';
import './dashboard.css';

export default function MinerModule() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  const user = JSON.parse(userStr);
  
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'mempool' | 'blocks'>('mempool');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const blocksPerPage = 5;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, blocksRes] = await Promise.all([
        blockchainService.getPendingTransactions(),
        blockchainService.getBlocks()
      ]);
      setPending(pendingRes);
      setBlocks(blocksRes.reverse());
    } catch (err) {
      console.error("Erreur lors du chargement des données", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMine = async () => {
    setLoading(true);
    try {
      const block = await blockchainService.mine(user.public_key);
      alert(`Bloc miné par ${block.leader_node} !`);
      fetchData();
    } catch (err) {
      alert("Erreur de minage (Accès refusé ou réseau saturé).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <Link to="/" className="sidebar-logo">HAZO LOVA</Link>
        <nav className="nav-group">
          <Link to="/dashboard" className="nav-item"><LayoutDashboard className="nav-icon" /> Dashboard</Link>
          <Link to="/miner" className="nav-item active"><Shield className="nav-icon" /> Mineur</Link>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h1>Portail de Minage</h1>
            <button onClick={fetchData} className="refresh-btn" disabled={loading}>
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </header>

        <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
          <div className="miner-main-area">
            <div className="registration-form-area" style={{ background: 'var(--secondary)', color: 'white', padding: '40px', borderRadius: '24px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '50%' }}>
                  <Cpu size={32} />
                </div>
                <div>
                  <h2 style={{ margin: 0 }}>Consensus IA Hazo Lova</h2>
                  <p style={{ opacity: 0.8, margin: 0 }}>L'IA Q-Learning élit le leader optimal pour le district actuel.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '16px', flex: 1 }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{pending.length}</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>TRANSACTIONS EN ATTENTE</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '16px', flex: 1 }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>#{blocks[0]?.index || 0}</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>DERNIER BLOC</div>
                </div>
              </div>

              <button 
                className="btn-submit-mutation" 
                onClick={handleMine} 
                disabled={loading || pending.length === 0} 
                style={{ width: '100%', padding: '20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {loading ? 'Minage en cours...' : <><Play size={18} /> Lancer le consensus</>}
              </button>
            </div>

            <div className="tab-container">
              <div style={{ display: 'flex', borderBottom: '1px solid var(--light-gray)', marginBottom: '20px' }}>
                <button 
                  onClick={() => setActiveTab('mempool')}
                  style={{ padding: '15px 25px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'mempool' ? '3px solid var(--accent)' : 'none', fontWeight: 'bold', color: activeTab === 'mempool' ? 'var(--accent)' : 'var(--gris-clair)' }}
                >
                  <Box size={18} style={{ marginRight: '8px' }} /> Mempool
                </button>
                <button 
                  onClick={() => setActiveTab('blocks')}
                  style={{ padding: '15px 25px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'blocks' ? '3px solid var(--accent)' : 'none', fontWeight: 'bold', color: activeTab === 'blocks' ? 'var(--accent)' : 'var(--gris-clair)' }}
                >
                  <Database size={18} style={{ marginRight: '8px' }} /> Historique
                </button>
              </div>

              {activeTab === 'mempool' ? (
                <div className="pending-list">
                  {pending.length > 0 ? pending.map((tx, idx) => (
                    <div key={idx} style={{ padding: '15px', borderBottom: '1px solid var(--off-white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{tx.description}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gris-clair)' }}>{tx.secteur} • {tx.montant} MGA</div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--gris-clair)' }}>
                        <Clock size={12} /> {new Date(tx.horodatage * 1000).toLocaleTimeString()}
                      </div>
                    </div>
                  )) : <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gris-clair)' }}>Mempool vide</div>}
                </div>
              ) : (
                <div className="block-list">
                   {blocks.slice((currentPage - 1) * blocksPerPage, currentPage * blocksPerPage).map((block, idx) => (
                     <div key={idx} style={{ padding: '15px', background: 'var(--off-white)', borderRadius: '12px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>BLOC #{block.index}</span>
                          <span style={{ fontSize: '12px' }}>{new Date(block.timestamp * 1000).toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--gris-clair)', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{block.hash}</div>
                        <div style={{ fontSize: '12px', borderTop: '1px solid #eee', paddingTop: '10px' }}>{block.transactions.length} transactions</div>
                     </div>
                   ))}

                   {blocks.length > blocksPerPage && (
                     <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                        <button 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid var(--light-gray)', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                        >
                          Précédent
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                          Page {currentPage} sur {Math.ceil(blocks.length / blocksPerPage)}
                        </span>
                        <button 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(blocks.length / blocksPerPage)))}
                          disabled={currentPage === Math.ceil(blocks.length / blocksPerPage)}
                          style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid var(--light-gray)', background: 'white', cursor: currentPage === Math.ceil(blocks.length / blocksPerPage) ? 'not-allowed' : 'pointer', opacity: currentPage === Math.ceil(blocks.length / blocksPerPage) ? 0.5 : 1 }}
                        >
                          Suivant
                        </button>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>

          <div className="miner-sidebar">
             <div style={{ background: 'var(--blanc)', padding: '20px', borderRadius: '24px', border: 'var(--border-main)' }}>
                <h3>Stats Mineur</h3>
                <div style={{ marginTop: '20px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span>Hashrate</span>
                      <span style={{ fontWeight: 'bold' }}>4.2 MH/s</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span>Stale Blocks</span>
                      <span style={{ color: 'red' }}>0.02%</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Score IA</span>
                      <span style={{ color: 'green' }}>+120</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
