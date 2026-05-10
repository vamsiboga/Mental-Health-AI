import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const linkStyle = (path) => ({
    color: location.pathname === path ? '#6366f1' : '#64748b',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: location.pathname === path ? '600' : '400',
    paddingBottom: '4px',
    borderBottom: location.pathname === path ? '2px solid #6366f1' : '2px solid transparent',
  });

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 32px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px' }}>🧠</span>
        <span style={{ fontSize: '17px', fontWeight: '700', color: '#1e293b' }}>
          Mental Health AI
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
        <Link to="/" style={linkStyle('/')}>Home</Link>
        <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
      </div>
    </nav>
  );
}
