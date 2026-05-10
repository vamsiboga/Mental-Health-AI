import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientIntake from '../components/PatientIntake';
import { patientAPI } from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleLookup = async () => {
    if (!lookupId.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    try {
      await patientAPI.getById(lookupId.trim());
      navigate(`/patient/${lookupId.trim()}`);
    } catch {
      setLookupError('Patient not found. Please check the ID and try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1020px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <div style={{ fontSize: '52px', marginBottom: '14px' }}>🧠</div>
        <h1 style={{
          fontSize: '34px',
          fontWeight: '800',
          color: '#1e293b',
          marginBottom: '10px',
        }}>
          Mental Health AI Assistant
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          maxWidth: '580px',
          margin: '0 auto',
          lineHeight: '1.7',
        }}>
          AI-powered clinical decision support for mental health professionals.
          PHQ-9 and GAD-7 scoring, evidence-based treatment recommendations,
          and crisis detection with source citations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '28px',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>
            New Patient Visit
          </h2>
          <PatientIntake />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '14px' }}>
              Returning Patient
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="Enter patient ID (e.g. P-10421)"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1e293b',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleLookup}
                disabled={lookupLoading}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {lookupLoading ? '...' : 'Open →'}
              </button>
            </div>
            {lookupError && (
              <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '8px' }}>
                {lookupError}
              </div>
            )}
          </div>

          <div style={{
            backgroundColor: '#eef2ff',
            border: '1px solid #c7d2fe',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#3730a3', marginBottom: '14px' }}>
              What this AI assistant does
            </h3>
            {[
              'PHQ-9 and GAD-7 scoring with full clinical interpretation',
              'Crisis detection with immediate 988 Lifeline resources',
              'Evidence-based treatment recommendations',
              'RAG-powered answers grounded in clinical documents',
              'Source citations so clinicians can verify every response',
              'Full session history and audit trail per patient',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '10px',
                fontSize: '13px',
                color: '#4338ca',
                padding: '5px 0',
                alignItems: 'flex-start',
              }}>
                <span style={{ color: '#6366f1', fontWeight: '700', flexShrink: 0 }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
