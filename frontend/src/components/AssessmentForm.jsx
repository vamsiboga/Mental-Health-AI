import { useState, useEffect } from 'react';
import { assessmentAPI } from '../services/api';

const SCORE_LABELS = ['Not at all', 'Several days', 'More than half', 'Nearly every day'];

const SEVERITY_COLORS = {
  'Minimal': '#22c55e',
  'Mild': '#eab308',
  'Moderate': '#f97316',
  'Moderately Severe': '#ef4444',
  'Severe': '#7f1d1d',
};

export default function AssessmentForm({ patientId, onComplete }) {
  const [type, setType] = useState('PHQ9');
  const [questions, setQuestions] = useState({});
  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuestions(type);
  }, [type]);

  const loadQuestions = async (assessmentType) => {
    try {
      const res = await assessmentAPI.getQuestions(assessmentType);
      setQuestions(res.data.questions);
      setResponses({});
      setResult(null);
      setError('');
    } catch (err) {
      setError('Failed to load questions. Make sure the backend is running.');
    }
  };

  const handleSubmit = async () => {
    const questionKeys = Object.keys(questions);
    if (Object.keys(responses).length < questionKeys.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formattedResponses = {};
      Object.entries(responses).forEach(([key, value]) => {
        formattedResponses[key] = parseInt(value);
      });
      const res = await assessmentAPI.score({
        patient_id: patientId,
        assessment_type: type,
        responses: formattedResponses,
      });
      setResult(res.data);
      if (onComplete) onComplete(res.data);
    } catch (err) {
      setError('Failed to score assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const severityColor = SEVERITY_COLORS[result?.severity_level] || '#6366f1';

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['PHQ9', 'GAD7'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: type === t ? '#6366f1' : '#ffffff',
              color: type === t ? '#ffffff' : '#64748b',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            {t === 'PHQ9' ? 'PHQ-9 Depression Screen' : 'GAD-7 Anxiety Screen'}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          color: '#dc2626',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {result ? (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
        }}>
          {result.risk_flag && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <div>
                <div style={{ fontWeight: '700', color: '#dc2626', fontSize: '14px' }}>
                  URGENT — Risk Flag Active
                </div>
                <div style={{ color: '#b91c1c', fontSize: '13px', marginTop: '3px' }}>
                  Item 9 is positive. Conduct a full suicide risk assessment immediately using the Columbia Protocol (C-SSRS). Do not leave patient alone.
                </div>
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: '52px', fontWeight: '800', color: '#1e293b' }}>
              {result.total_score}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: severityColor }}>
                {result.severity_level}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                {result.assessment_type} Score
              </div>
            </div>
          </div>

          <p style={{
            fontSize: '14px',
            color: '#475569',
            lineHeight: '1.7',
            marginBottom: '20px',
          }}>
            {result.interpretation}
          </p>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '10px',
            }}>
              Clinical Recommendations
            </div>
            {result.recommendations.map((rec, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '10px',
                padding: '8px 0',
                borderBottom: '1px solid #f1f5f9',
                fontSize: '13px',
                color: '#475569',
                alignItems: 'flex-start',
              }}>
                <span style={{ color: '#6366f1', fontWeight: '700', flexShrink: 0 }}>→</span>
                {rec}
              </div>
            ))}
          </div>

          <button
            onClick={() => { setResult(null); setResponses({}); setError(''); }}
            style={{
              padding: '9px 18px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#475569',
              fontWeight: '500',
            }}
          >
            Administer Again
          </button>
        </div>
      ) : (
        <div>
          {Object.entries(questions).map(([num, question]) => (
            <div key={num} style={{
              marginBottom: '14px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{
                fontSize: '13px',
                color: '#1e293b',
                marginBottom: '12px',
                fontWeight: '500',
                lineHeight: '1.5',
              }}>
                {num}. {question}
                {num === '9' && (
                  <span style={{
                    marginLeft: '8px',
                    color: '#dc2626',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: '#fef2f2',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}>
                    SUICIDE RISK ITEM
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[0, 1, 2, 3].map((score) => (
                  <label
                    key={score}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: responses[num] === String(score) ? '#eef2ff' : '#ffffff',
                      border: `1px solid ${responses[num] === String(score) ? '#6366f1' : '#e2e8f0'}`,
                      minWidth: '82px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${num}`}
                      value={score}
                      checked={responses[num] === String(score)}
                      onChange={() => setResponses({ ...responses, [num]: String(score) })}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: responses[num] === String(score) ? '#6366f1' : '#94a3b8',
                    }}>
                      {score}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      color: '#94a3b8',
                      textAlign: 'center',
                      lineHeight: '1.3',
                    }}>
                      {SCORE_LABELS[score]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: loading ? '#a5b4fc' : '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
            }}
          >
            {loading ? 'Scoring assessment...' : `Submit ${type === 'PHQ9' ? 'PHQ-9' : 'GAD-7'} →`}
          </button>
        </div>
      )}
    </div>
  );
}
