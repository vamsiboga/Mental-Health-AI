import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';

export default function PatientIntake() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patient_id: '',
    name: '',
    date_of_birth: '',
    gender: '',
    primary_diagnosis: '',
    visit_reason: '',
    therapist_name: '',
    emergency_contact: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_id || !form.name || !form.date_of_birth || !form.gender) {
      setError('Patient ID, Name, Date of Birth, and Gender are required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await patientAPI.create(form);
      navigate(`/patient/${form.patient_id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create patient. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    display: 'block',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div>
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          color: '#dc2626',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Patient ID *</label>
            <input
              style={inputStyle}
              name="patient_id"
              value={form.patient_id}
              onChange={handleChange}
              placeholder="e.g. P-10421"
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Full Name *</label>
            <input
              style={inputStyle}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Patient full name"
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Date of Birth *</label>
            <input
              style={inputStyle}
              type="date"
              name="date_of_birth"
              value={form.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Gender *</label>
            <select
              style={inputStyle}
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Primary Diagnosis</label>
            <input
              style={inputStyle}
              name="primary_diagnosis"
              value={form.primary_diagnosis}
              onChange={handleChange}
              placeholder="e.g. Major Depressive Disorder, GAD"
            />
          </div>

          <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Visit Reason</label>
            <input
              style={inputStyle}
              name="visit_reason"
              value={form.visit_reason}
              onChange={handleChange}
              placeholder="e.g. Initial evaluation, medication follow-up"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Therapist Name</label>
            <input
              style={inputStyle}
              name="therapist_name"
              value={form.therapist_name}
              onChange={handleChange}
              placeholder="Assigned therapist"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Emergency Contact</label>
            <input
              style={inputStyle}
              name="emergency_contact"
              value={form.emergency_contact}
              onChange={handleChange}
              placeholder="Name and phone number"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#a5b4fc' : '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {loading ? 'Creating patient record...' : 'Create Patient & Open AI Assistant →'}
        </button>
      </form>
    </div>
  );
}
