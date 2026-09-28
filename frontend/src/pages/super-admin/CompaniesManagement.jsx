import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Plus, Shield, Users } from 'lucide-react';

export default function CompaniesManagement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/companies')
      .then(res => setCompanies(res.data.companies || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await api.put(`/companies/${id}/status`, { status: newStatus });
    setCompanies(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
  };

  if (loading) return <div style={{ color: '#71717a', padding: '40px' }}>Loading organizations...</div>;

  // Solid (non-translucent) badge style, as requested
  const solidBadge = (bg) => ({
    background: bg, color: '#ffffff', fontSize: '0.72rem', fontWeight: 700,
    padding: '4px 12px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center'
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>Customer Organizations</h1>
          <p style={{ color: '#71717a', fontSize: '0.85rem' }}>Manage multi-tenant customer accounts</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {companies.map((company) => (
          <div key={company._id} className="glass-card" style={{ padding: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: '#356c89',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Building2 size={24} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181b' }}>{company.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#71717a' }}>
                  {company.industry} &bull; {company.email}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#356c89' }}>{company.employeeCount || 0}</div>
                <div style={{ fontSize: '0.7rem', color: '#71717a' }}>Employees</div>
              </div>
              <span style={solidBadge(company.status === 'ACTIVE' ? '#15803d' : '#be123c')}>
                {company.status}
              </span>
              <span style={solidBadge('#356c89')}>{company.subscriptionPlan}</span>
              <button
                onClick={() => toggleStatus(company._id, company.status)}
                className={company.status === 'ACTIVE' ? 'btn-danger' : 'btn-outline'}
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                {company.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}