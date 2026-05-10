import { useState } from 'react';

export default function SourceCitation({ source }) {
  const [expanded, setExpanded] = useState(false);

  const percentage = Math.round(source.relevance_score * 100);

  return (
    <div style={{ display: 'inline-block', marginRight: '6px', marginTop: '4px' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 9px',
          backgroundColor: '#eef2ff',
          border: '1px solid #c7d2fe',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#4f46e5',
          cursor: 'pointer',
          fontWeight: '500',
        }}
      >
        📄 {source.document} ({percentage}%)
      </button>

      {expanded && (
        <div style={{
          marginTop: '6px',
          padding: '12px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#475569',
          maxWidth: '420px',
          lineHeight: '1.6',
          position: 'relative',
        }}>
          <div style={{
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '6px',
            fontSize: '12px',
          }}>
            {source.document}
          </div>
          <div>{source.excerpt}</div>
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#94a3b8',
          }}>
            Relevance: {percentage}%
          </div>
        </div>
      )}
    </div>
  );
}
