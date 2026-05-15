import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight, 
  ShieldCheck, 
  Zap,
  Loader2
} from 'lucide-react';
import { authService } from './services/api';
import './auth.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const data = await authService.signIn({
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        await authService.signUp({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* SECTION BRANDING - Vision & Trust */}
      <div className="auth-side-branding">
        <div className="blockchain-visual">
          <div className="cube-container">
            <div className="chain-connector chain-1-2"></div>
            <div className="chain-connector chain-2-3"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`cube cube-${i}`}>
                <div className="face front"></div>
                <div className="face back"></div>
                <div className="face left"></div>
                <div className="face right"></div>
                <div className="face top"></div>
                <div className="face bottom"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="branding-content">
          <div className="branding-logo">HAZO LOVA</div>
          <h2 className="branding-title">Sécurisez l'avenir de vos actifs.</h2>
          <p className="branding-quote">
            "La blockchain n'est pas qu'une technologie, c'est un contrat de confiance pour les générations futures."
          </p>
        </div>
        <div className="branding-footer">
          © 2026 Projet Madagascar 2035 — Infrastructure Certifiée
        </div>
      </div>

      {/* SECTION FORMULAIRE - Interaction */}
      <div className="auth-side-form">
        <Link to="/" className="auth-back-btn">
          <ArrowLeft size={16} /> Accueil
        </Link>

        <div className="auth-form-container animate-fade">
          <div className="auth-card-modern">
            <h1 className="auth-title-modern">
              {isLogin ? 'Bon retour' : 'Commencer'}
            </h1>
            <p className="auth-subtitle-modern">
              {isLogin 
                ? 'Veuillez entrer vos identifiants réseau.' 
                : 'Créez votre identité numérique sécurisée.'}
            </p>

            {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontWeight: '600' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group-modern">
                  <label className="label-modern">Nom complet</label>
                  <input 
                    type="text" 
                    name="username"
                    className="input-modern" 
                    placeholder="Jean Rakoto" 
                    value={formData.username}
                    onChange={handleInputChange}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="form-group-modern">
                <label className="label-modern">Adresse Email</label>
                <input 
                  type="email" 
                  name="email"
                  className="input-modern" 
                  placeholder="nom@hazolova.mg" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group-modern">
                <label className="label-modern">Mot de passe</label>
                <input 
                  type="password" 
                  name="password"
                  className="input-modern" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <button className="btn-modern" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    {isLogin ? 'Se connecter' : 'Créer mon compte'}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">Ou continuer avec</div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-modern" style={{ background: '#fff', color: '#182436', border: '1px solid #e5e7eb', flex: 1 }}>
                <ShieldCheck size={18} color="#2D7A58" /> ID-Mada
              </button>
              <button className="btn-modern" style={{ background: '#fff', color: '#182436', border: '1px solid #e5e7eb', flex: 1 }}>
                <Zap size={18} color="#d4a373" /> Express
              </button>
            </div>

            <p className="toggle-modern">
              {isLogin ? "Nouveau sur le réseau ?" : "Déjà un compte ?"} 
              <span className="toggle-link-modern" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Créer un accès" : "Se connecter"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
