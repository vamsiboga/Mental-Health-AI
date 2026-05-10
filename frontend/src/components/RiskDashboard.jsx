import { useState, useEffect } from 'react';
import { assessmentAPI } from '../services/api';

const SEVERITY_COLORS = {
  'Minimal': { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  'Mild': { bg: '#fefce8', text: '#854d0e', border: '#fef08a' },
  'Moderate': { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  'Moderately Severe': { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  'Severe': { bg: '#450a0a', text: '#fca5a5', border: '#7f1d1d' },
};

export default function RiskDashboard({ patientId }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      loadAssessments();
    }
  }, [patientId]);

  const loadAssessments = async () => {
    try {
      const res = await assessmentAPI.getForPatient(patientId);
      setAssessments(res.data);
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        Loading assessment history...
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
        <div style={{ color: '#94a3b8', fontSize: '14px' }}>
          No assessments recorded yet.
        </div>
        <div style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '6px' }}>
          Administer a PHQ-9 or GAD-7 from the Assessments tab.
        </div>
      </div>
    );
  }

  const phq9List = assessments.filter((a) => a.assessment_type === 'PHQ-9');
  const gad7List = assessments.filter((a) => a.assessment_type === 'GAD-7');
  const hasRiskFlag = assessments.some((a) => a.risk_flag);
  const latest = assessments[0];

  const phq9Last4 = phq9List.slice(0, 4).reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {hasRiskFlag && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '22px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: '700', color: '#dc2626', fontSize: '14px' }}>
              Risk Flag Active
            </div>
            <div style={{ fontSize: '13px', color: '#b91c1c', marginTop: '4px', lineHeight: '1.6' }}>
              One or more assessments have triggered a risk flag. PHQ-9 Item 9 was positive indicating thoughts of self-harm. Immediate suicide risk assessment using the C-SSRS protocol is required.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>PHQ-9 assessments</div>
          <div style={{ fontSize: '30px', fontWeight: '700', color: '#1e293b' }}>{phq9List.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            {phq9List[0] ? `Latest: ${phq9List[0].total_score} (${phq9List[0].severity_level})` : 'None yet'}
          </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>GAD-7 assessments</div>
          <div style={{ fontSize: '30px', fontWeight: '700', color: '#1e293b' }}>{gad7List.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            {gad7List[0] ? `Latest: ${gad7List[0].total_score} (${gad7List[0].severity_level})` : 'None yet'}
          </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Risk flags total</div>
          <div style={{
            fontSize: '30px',
            fontWeight: '700',
            color: hasRiskFlag ? '#dc2626' : '#22c55e',
          }}>
            {assessments.filter((a) => a.risk_flag).length}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            {hasRiskFlag ? 'Requires attention' : 'No risk flags'}
          </div>
        </div>
      </div>

      {phq9Last4.length > 0 && (
        <div>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}>
            PHQ-9 Score Trend
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            height: '100px',
            padding: '0 8px',
          }}>
            {phq9Last4.map((a, i) => {
              const heightPct = Math.round((a.total_score / 27) * 100);
              const barColor =
                a.total_score <= 4 ? '#22c55e' :
                a.total_score <= 9 ? '#eab308' :
                a.total_score <= 14 ? '#f97316' :
                a.total_score <= 19 ? '#ef4444' : '#7f1d1d';
              return (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  flex: 1,
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                    {a.total_score}
                  </div>
                  <div style={{
                    width: '100%',
                    backgroundColor: barColor,
                    borderRadius: '4px 4px 0 0',
                    height: `${heightPct}px`,
                    minHeight: '4px',
                  }} />
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '10px',
        }}>
          Assessment History
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {assessments.map((a, i) => {
            const colors = SEVERITY_COLORS[a.severity_level] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 0',
                borderBottom: '1px solid #f1f5f9',
              }}>
                <span style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  minWidth: '52px',
                  fontWeight: '500',
                }}>
                  {a.assessment_type}
                </span>
                <span style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#1e293b',
                  minWidth: '32px',
                }}>
                  {a.total_score}
                </span>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '5px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}>
                  {a.severity_level}
                </span>
                {a.risk_flag && (
                  <span style={{
                    fontSize: '12px',
                    color: '#dc2626',
                    fontWeight: '700',
                  }}>
                    ⚠ Risk flag
                  </span>
                )}
                <span style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  marginLeft: 'auto',
                }}>
                  {new Date(a.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
