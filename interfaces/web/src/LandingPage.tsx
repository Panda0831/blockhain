import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Map, 
  GraduationCap, 
  Sprout, 
  ArrowRight,
  Globe,
  Database,
  Users
} from 'lucide-react';
import './App.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="bg-mesh" />
      <div className="landing-container">
        <nav className="navbar">
          <div className="logo">HAZO LOVA</div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Secteurs</a>
            <a href="#vision" className="nav-link">Vision 2035</a>
            <button className="btn-nav-auth" onClick={() => navigate('/auth')}>
              Espace Client
            </button>
          </div>
        </nav>

        <header className="hero reveal">
          <h1 className="hero-title">Bâtir la confiance, bloc par bloc.</h1>
          <p className="hero-subtitle">
            L'infrastructure blockchain souveraine de Madagascar. 
            Sécurisez vos terres, authentifiez vos diplômes et tracez vos récoltes.
          </p>
          <div className="cta-group">
            <button className="cta-primary" onClick={() => navigate('/auth')}>
              Rejoindre le réseau <ArrowRight size={20} />
            </button>
          </div>
        </header>

        <section className="stats-bar reveal" style={{ animationDelay: '0.2s' }}>
          <div className="stat-item">
            <span className="stat-value">847K+</span>
            <span className="stat-label">Blocs Validés</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">119</span>
            <span className="stat-label">Districts Connectés</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">100%</span>
            <span className="stat-label">Immuabilité</span>
          </div>
        </section>

        <div id="features" className="features-grid reveal" style={{ animationDelay: '0.4s' }}>
          <div className="feature-card">
            <div className="feature-icon"><Map size={28} /></div>
            <h3>Cadastre Numérique</h3>
            <p>Une gestion foncière transparente. Chaque parcelle est un jeton unique sur la blockchain, rendant la double vente impossible.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><GraduationCap size={28} /></div>
            <h3>Certificats d'Études</h3>
            <p>Protégez la valeur de vos diplômes. Vérification instantanée par les employeurs via un simple QR Code sécurisé.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><Sprout size={28} /></div>
            <h3>Exportation 2.0</h3>
            <p>Suivez vos produits du champ jusqu'au port d'exportation. Garantissez l'origine et la qualité de la vanille et du cacao.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><Database size={28} /></div>
            <h3>Nœuds Décentralisés</h3>
            <p>Une infrastructure résiliente, déployée dans les 23 régions pour garantir une disponibilité totale même hors-ligne.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><Users size={28} /></div>
            <h3>Micro-Finance</h3>
            <p>Accédez au crédit grâce à votre réputation numérique. Un historique de confiance partagé pour le développement rural.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><ShieldCheck size={28} /></div>
            <h3>Souveraineté Digitale</h3>
            <p>Vos données restent à Madagascar, protégées par des standards cryptographiques mondiaux.</p>
          </div>
        </div>

        <footer className="footer">
          <div className="footer-logo">HAZO LOVA</div>
          <div className="footer-links">
            <a href="#" className="footer-link">Documentation</a>
            <a href="#" className="footer-link">Gouvernance</a>
            <a href="#" className="footer-link">Sécurité</a>
          </div>
          <div style={{ color: 'var(--gray)', fontSize: '14px' }}>
            © 2026 Madagascar 2035
          </div>
        </footer>
      </div>
    </>
  );
}
