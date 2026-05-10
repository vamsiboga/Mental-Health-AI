import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { patientAPI } from '../services/api';
import ChatInterface from '../components/ChatInterface';
import AssessmentForm from '../components/AssessmentForm';
import RiskDashboard from '../components/RiskDashboard';

const TABS = ['AI Chat', 'Assessments', 'Risk Dashboard'];

export default function Patient() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('AI Chat');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      const res = await patientAPI.getById(patientId);
      setPatient(res.data);
    } catch {
      setError('Patient not found. Please check the ID and go back to home.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '—';
    const diff = new Date() - new Date(dob);
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const getInitials = (name) => {
    return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8', fontSize: '16px' }}>
        Loading patient record...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ color: '#dc2626', fontSize: '16px', marginBottom: '20px' }}>{error}</p>
        <Link to="/" style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#6366f1',
          color: '#ffffff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
        }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '24px',
        fontSize: '13px',
      }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>← Home</Link>
        <span style={{ color: '#e2e8f0' }}>/</span>
        <Link to="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard</Link>
        <span style={{ color: '#e2e8f0' }}>/</span>
        <span style={{ color: '#1e293b' }}>{patient.name}</span>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#eef2ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '700',
            color: '#6366f1',
            flexShrink: 0,
          }}>
            {getInitials(patient.name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
              {patient.name}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
              ID: {patient.patient_id} · Age: {calculateAge(patient.date_of_birth)} · {patient.gender}
              {patient.therapist_name && ` · Therapist: ${patient.therapist_name}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {patient.primary_diagnosis && (
              <span style={{
                padding: '4px 12px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                {patient.primary_diagnosis}
              </span>
            )}
            <span style={{
              padding: '4px 12px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              Active Visit
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginTop: '18px',
          paddingTop: '18px',
          borderTop: '1px solid #f1f5f9',
        }}>
          {[
            { label: 'Visit reason', value: patient.visit_reason || '—' },
            { label: 'Emergency contact', value: patient.emergency_contact || '—' },
            { label: 'Patient since', value: new Date(patient.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '3px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '13px', color: '#1e293b' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '2px',
        marginBottom: '20px',
        borderBottom: '1px solid #e2e8f0',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 22px',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === tab ? '#6366f1' : '#64748b',
              fontSize: '14px',
              fontWeight: activeTab === tab ? '700' : '400',
              cursor: 'pointer',
              borderBottom: `2px solid ${activeTab === tab ? '#6366f1' : 'transparent'}`,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
      }}>
        {activeTab === 'AI Chat' && <ChatInterface patient={patient} />}
        {activeTab === 'Assessments' && (
          <AssessmentForm
            patientId={patient.patient_id}
            onComplete={() => setRefreshKey((k) => k + 1)}
          />
        )}
        {activeTab === 'Risk Dashboard' && (
          <RiskDashboard key={refreshKey} patientId={patient.patient_id} />
        )}
      </div>
    </div>
  );
}
