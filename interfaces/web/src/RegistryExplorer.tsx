import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Database,
  GraduationCap,
  Hash,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Search,
  ShieldCheck,
  Trees,
  User,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./dashboard.css";
import "./registry.css";
import { blockchainService } from "./services/api";

export default function RegistryExplorer() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);
  const blocksPerPage = 8;

  useEffect(() => {
    blockchainService
      .getBlocks()
      .then((data) => {
        const sorted = [...data].sort((a, b) => b.index - a.index);
        setBlocks(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch blocks", err);
        setLoading(false);
      });
  }, []);

  const indexOfLastBlock = currentPage * blocksPerPage;
  const indexOfFirstBlock = indexOfLastBlock - blocksPerPage;
  const currentBlocks = blocks.slice(indexOfFirstBlock, indexOfLastBlock);
  const totalPages = Math.ceil(blocks.length / blocksPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setExpandedBlock(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const toggleExpand = (index: number) => {
    setExpandedBlock(expandedBlock === index ? null : index);
  };

  const formatTime = (ts: number) => {
    return new Date(ts * 1000).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <Link to="/" className="sidebar-logo">
          HAZO LOVA
        </Link>
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
          <Link to="/finance" className="nav-item">
            <Wallet className="nav-icon" /> Microfinance
          </Link>
          <Link to="/explorer" className="nav-item active">
            <Search className="nav-icon" /> Registre
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="page-title-area">
            <div
              className="pre-title"
              style={{
                fontSize: "10px",
                color: "var(--or)",
                letterSpacing: "2px",
                fontWeight: 900,
                marginBottom: "4px",
              }}
            >
              CORE SYSTEM
            </div>
            <h1>Registre Décentralisé</h1>
          </div>
          <div className="user-status">
            <div
              className="header-network-stats"
              style={{ marginRight: "40px" }}
            >
              <div className="h-stat">
                <span className="h-label">NODES</span>
                <span className="h-value">23 ACTIVE</span>
              </div>
              <div className="h-stat">
                <span className="h-label">HASH RATE</span>
                <span className="h-value">8.4 MH/s</span>
              </div>
            </div>
            <Link
              to="/profile"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div className="profile-mini">
                <span className="username">{user.username}</span>
                <span className="public-key-hash">
                  {user.public_key?.substring(0, 10)}...
                </span>
              </div>
              <div className="avatar-circle">
                {user.username?.charAt(0) || "U"}
              </div>
            </Link>
          </div>
        </header>

        <div className="dashboard-content">
          <div
            className="title-nav-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <div>
              <h2 className="section-title">Chaîne de Blocs</h2>
              <p style={{ opacity: 0.5, fontSize: "13px" }}>
                {blocks.length} blocs validés par le réseau Hazo Lova
              </p>
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

          {loading ? (
            <div className="loading-blockchain">
              <div className="loading-spinner"></div>
              <p style={{ fontWeight: 800, letterSpacing: "1px" }}>
                SYNCHRONISATION DU REGISTRE...
              </p>
            </div>
          ) : (
            <div className="blockchain-grid-container">
              <div className="blockchain-grid">
                {currentBlocks.map((block: any, i: number) => (
                  <motion.div
                    key={block.index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`block-card-wrapper ${
                      expandedBlock === block.index ? "expanded" : ""
                    }`}
                  >
                    <div
                      className={`block-card ${
                        expandedBlock === block.index ? "expanded" : ""
                      }`}
                    >
                      <div className="block-header">
                        <div className="block-id-tag">BLOCK #{block.index}</div>
                        <div className="block-status-badge">
                          <div className="status-dot"></div>
                          SCELLÉ
                        </div>
                      </div>

                      <div className="block-meta-grid">
                        <div className="meta-item">
                          <span className="meta-label">
                            <Clock size={10} /> TIMESTAMP
                          </span>
                          <span className="meta-value">
                            {formatTime(block.timestamp)}
                          </span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">
                            <Cpu size={10} /> NONCE
                          </span>
                          <span className="meta-value">{block.nonce}</span>
                        </div>
                        <div
                          className="meta-item"
                          style={{ gridColumn: "span 2" }}
                        >
                          <span className="meta-label">
                            <Hash size={10} /> BLOCK HASH
                          </span>
                          <span className="meta-value hash">{block.hash}</span>
                        </div>
                        {expandedBlock === block.index && (
                          <>
                            <div
                              className="meta-item"
                              style={{ gridColumn: "span 2" }}
                            >
                              <span className="meta-label">
                                <Database size={10} /> MERKLE ROOT
                              </span>
                              <span className="meta-value hash">
                                {block.merkle_root}
                              </span>
                            </div>
                            <div
                              className="meta-item"
                              style={{ gridColumn: "span 2" }}
                            >
                              <span className="meta-label">
                                <ShieldCheck size={10} /> PREVIOUS HASH
                              </span>
                              <span className="meta-value hash">
                                {block.previous_hash}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="block-tx-section">
                        <div className="tx-header">
                          <div className="tx-info">
                            <Activity size={14} />{" "}
                            {block.transactions?.length || 0} TRANSACTIONS
                          </div>
                          <button
                            className="view-tx-toggle"
                            onClick={() => toggleExpand(block.index)}
                          >
                            {expandedBlock === block.index ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                            {expandedBlock === block.index
                              ? "RÉDUIRE"
                              : "DÉTAILS"}
                          </button>
                        </div>

                        <AnimatePresence>
                          {expandedBlock === block.index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="tx-list"
                            >
                              {block.transactions &&
                              block.transactions.length > 0 ? (
                                block.transactions.map((tx: any, idx: number) => (
                                  <div key={idx} className="tx-item">
                                    <span
                                      style={{ fontWeight: 600, opacity: 0.7 }}
                                    >
                                      {tx.sender?.substring(0, 8)}... →{" "}
                                      {tx.receiver?.substring(0, 8)}...
                                    </span>
                                    <span className="tx-type-badge">
                                      {tx.type || "DATA"}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p
                                  style={{
                                    fontSize: "10px",
                                    opacity: 0.5,
                                    textAlign: "center",
                                  }}
                                >
                                  Aucune transaction de données
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    {/* Visual Chain Connector */}
                    {i % 4 !== 3 && i < currentBlocks.length - 1 && expandedBlock !== block.index && (
                      <div className="grid-connector-h">
                        <div className="connector-dot"></div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


