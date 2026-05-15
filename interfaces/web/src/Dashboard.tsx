import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'sans-serif',
      backgroundColor: '#f4f7f6',
      color: '#182436'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Bienvenue, {user.username || 'Utilisateur'} !</h1>
      <p style={{ fontSize: '1.2rem', color: '#4b5563', marginBottom: '2rem' }}>La connexion a réussi.</p>
      
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '20px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        maxWidth: '500px',
        wordBreak: 'break-all'
      }}>
        <p><strong>Votre Clé Publique (Blockchain) :</strong></p>
        <code style={{ color: '#2D7A58', fontWeight: 'bold' }}>{user.public_key}</code>
      </div>

      <button 
        onClick={handleLogout}
        style={{
          marginTop: '30px',
          padding: '10px 20px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
