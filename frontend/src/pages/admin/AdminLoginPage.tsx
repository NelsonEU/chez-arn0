import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext.tsx';
import '../../styles/admin.css';

export default function AdminLoginPage() {
  const { authenticated, login } = useAdminAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (authenticated) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <h1>Connexion admin</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={submitting}>
          Se connecter
        </button>
        <p className="error">{error || ' '}</p>
      </form>
    </div>
  );
}
