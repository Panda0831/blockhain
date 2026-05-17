import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blockchainService } from './services/api';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Database, 
  Hash, 
  Activity, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import './registry.css';

export default function RegistryExplorer() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blocksPerPage = 10;
  
  const [stats, setStats] = useState({
    hashrate: '4.2 GH/s',
    avgBlockTime: '4.2s',
    validators: '119'
  });

  useEffect(() => {
    blockchainService.getBlocks().then((data) => {
      const sorted = [...data].sort((a, b) => b.index - a.index);
      setBlocks(sorted);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch blocks", err);
      setLoading(false);
    });
  }, []);

  // Pagination logic
  const indexOfLastBlock = currentPage * blocksPerPage;
  const indexOfFirstBlock = indexOfLastBlock - blocksPerPage;
  const currentBlocks = blocks.slice(indexOfFirstBlock, indexOfLastBlock);
  const totalPages = Math.ceil(blocks.length / blocksPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Reset scroll of sequence container
    const sequence = document.querySelector('.blockchain-sequence');
    if (sequence) sequence.scrollLeft = 0;
  };

  return (
    <div className="registry-page-wrapper">
      <div className="noise-overlay"></div>
      <div className="lens-flare lp-1"></div>
      <div className="lens-flare lp-2"></div>

      <header className="registry-header">
        <Link to="/" className="registry-logo">HAZO LOVA</Link>
        <div className="header-network-stats">
          <div className="h-stat">
            <span className="h-label">HASHRATE</span>
            <span className="h-value">{stats.hashrate}</span>
          </div>
          <div className="h-stat">
            <span className="h-label">BLOC MOYEN</span>
            <span className="h-value">{stats.avgBlockTime}</span>
          </div>
          <div className="h-stat">
            <span className="h-label">VALIDATEURS</span>
            <span className="h-value">{stats.validators}</span>
          </div>
        </div>
        <Link to="/auth" className="auth-back-btn">
          <ArrowLeft size={16} /> Accès Réseau
        </Link>
      </header>

      <div className="registry-title-area">
        <div className="registry-pre-title">MADAGASCAR 2035</div>
        <div className="title-nav-row">
          <div>
            <h1 className="registry-main-title">Registre Public Décentralisé</h1>
            <p className="registry-subtitle">Consultation de {blocks.length} blocs vérifiés.</p>
          </div>
          
          <div className="pagination-controls">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className="page-nav-btn"
            >
              PRÉCÉDENT
            </button>
            <div className="page-indicator">
              PAGE <span>{currentPage}</span> SUR {totalPages || 1}
            </div>
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages || totalPages === 0}
              className="page-nav-btn"
            >
              SUIVANT
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-blockchain">
          <div className="loading-spinner"></div>
          <p className="loading-text">Synchronisation atomique...</p>
        </div>
      ) : (
        <div className="blockchain-sequence">
          {currentBlocks.map((block: any, i: number) => (
            <React.Fragment key={block.index}>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={`motion-${block.index}-${currentPage}`}
                transition={{ delay: i * 0.05 }}
                className="block-card-wrapper"
              >
                <div className="block-card">
                  <div className="crystal-shine"></div>
                  <div className="block-header">
                    <div className="block-index-wrapper">
                      <span className="block-index-label">BLOCK_HEIGHT</span>
                      <div className="block-index">#{block.index}</div>
                    </div>
                    <div className="block-status-badge">
                      <span className="status-dot"></span>
                      VERIFIED
                    </div>
                  </div>

                  <div className="block-grid-details">
                    <div className="block-detail-item">
                      <div className="block-detail-label"><Hash size={12} /> MERKLE_ROOT</div>
                      <div className="block-hash">{block.hash.substring(0, 32)}...</div>
                    </div>

                    <div className="block-row">
                      <div className="block-detail-item">
                        <div className="block-detail-label"><ShieldCheck size={12} /> PROOF_OF_WORK</div>
                        <div className="block-detail-value">{block.nonce}</div>
                      </div>
                      <div className="block-detail-item">
                        <div className="block-detail-label"><Clock size={12} /> TIMESTAMP</div>
                        <div className="block-detail-value">
                          {new Date(block.timestamp * 1000).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="tx-count-area">
                    <div className="tx-bar">
                      <div className="tx-bar-fill" style={{ width: `${Math.min((block.transactions?.length || 0) * 20, 100)}%` }}></div>
                    </div>
                    <div className="tx-info">
                      <Activity size={14} />
                      <span>{block.transactions?.length || 0} ATOMIC_TXS</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {i < blocks.length - 1 && (
                <div className="chain-link-connector">
                  <div className="chain-link-line"></div>
                  <div className="chain-link-dot"></div>
                  <div className="chain-link-label">PREV_HASH_LINK</div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <footer className="registry-footer">
        © 2026 Projet Madagascar 2035 — Registre de Confiance HA-LO v2.4
      </footer>
    </div>
  );
}
