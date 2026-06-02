import { motion } from "framer-motion";
import {
  Activity,
  GraduationCap,
  Hash,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Search,
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
  const blocksPerPage = 5;

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
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
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
              marginBottom: "20px",
            }}
          >
            <h2 className="section-title">Blocs Validés ({blocks.length})</h2>
            <div
              className="pagination-controls"
              style={{ display: "flex", gap: "10px" }}
            >
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
              <p>Synchronisation...</p>
            </div>
          ) : (
            <div className="blockchain-sequence">
              {currentBlocks.map((block: any, i: number) => (
                <React.Fragment key={block.index}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="block-card-wrapper"
                  >
                    <div className="block-card">
                      <div className="block-header">
                        <div className="block-index">#{block.index}</div>
                        <div className="block-status-badge">VERIFIED</div>
                      </div>
                      <div className="block-detail-item">
                        <Hash size={12} /> {block.hash.substring(0, 32)}...
                      </div>
                      <div className="tx-info">
                        <Activity size={14} /> {block.transactions?.length || 0}{" "}
                        ATOMIC_TXS
                      </div>
                    </div>
                  </motion.div>

                  {i < currentBlocks.length - 1 && (
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
        </div>
      </main>
    </div>
  );
}
