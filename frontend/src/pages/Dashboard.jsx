import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI } from '../services/api';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientAPI.getAll()
      .then((res) => setPatients(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const calculateAge = (dob) => {
    if (!dob) return '—';
    return Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const getInitials = (name) => {
    return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
          Patient Dashboard
        </h1>
        <Link to="/" style={{
          padding: '9px 18px',
          backgroundColor: '#6366f1',
          color: '#ffffff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '600',
        }}>
          + New Patient
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'Total patients', value: patients.length },
          { label: 'Active today', value: patients.length },
          { label: 'AI assistant', value: 'Online' },
        ].map((card, i) => (
          <div key={i} style={{
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            padding: '18px',
          }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        fontSize: '12px',
        fontWeight: '700',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '12px',
      }}>
        All Patients
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          Loading patients...
        </div>
      ) : patients.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧠</div>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
            No patients yet.
          </div>
          <Link to="/" style={{
            color: '#6366f1',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '14px',
          }}>
            Create the first patient →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {patients.map((p) => (
            <Link
              key={p.patient_id}
              to={`/patient/${p.patient_id}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#6366f1',
                  flexShrink: 0,
                }}>
                  {getInitials(p.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    {p.patient_id} · Age {calculateAge(p.date_of_birth)} · {p.gender}
                  </div>
                </div>
                {p.primary_diagnosis && (
                  <span style={{
                    padding: '3px 10px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}>
                    {p.primary_diagnosis}
                  </span>
                )}
                <span style={{ color: '#6366f1', fontSize: '18px' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
