import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Building2, Shield, Users, CheckCircle2, XCircle, Clock,
  ChevronDown, ChevronUp, Copy, Check, AlertCircle, Search,
  UserCog, Eye, Ban, Unlock, RefreshCw
} from 'lucide-react';

export default function CompaniesManagement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchCompanies = () => {
    setLoading(true);
    api.get('/companies')
      .then(res => setCompanies(res.data.companies || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCompanies(); }, []);

  const activateCompany = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/companies/${id}/activate`);
      fetchCompanies();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectCompany = async (id) => {
    if (!window.confirm('Are you sure you want to reject this organization registration?')) return;
    setActionLoading(id);
    try {
      await api.put(`/companies/${id}/reject`);
      fetchCompanies();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoading(id);
    try {
      await api.put(`/companies/${id}/status`, { status: newStatus });
      fetchCompanies();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const copyTenantId = (tenantId) => {
    navigator.clipboard.writeText(tenantId);
    setCopiedId(tenantId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & Search
  const pendingCount = companies.filter(c => c.status === 'PENDING_APPROVAL').length;
  const filtered = companies.filter(c => {
    if (filter !== 'ALL' && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.tenantId && c.tenantId.toLowerCase().includes(q));
    }
    return true;
  });

  const statusConfig = {
    'PENDING_APPROVAL': { bg: '#d97706', label: 'Pending Approval', icon: Clock },
    'ACTIVE': { bg: '#15803d', label: 'Active', icon: CheckCircle2 },
    'SUSPENDED': { bg: '#be123c', label: 'Suspended', icon: Ban },
    'TRIAL': { bg: '#2563eb', label: 'Trial', icon: Clock }
  };

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#71717a' }}>
      <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ marginTop: '12px' }}>Loading organizations...</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>
            Tenant Organizations
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.85rem' }}>
            Manage multi-tenant customer accounts, approve registrations & admin activation
          </p>
        </div>
        <button
          onClick={fetchCompanies}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px',
            background: '#f4f4f5', border: '1px solid #e4e4e7',
            color: '#52525b', fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Pending Alert Banner */}
      {pendingCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 18px', borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(217,119,6,0.08), rgba(245,158,11,0.12))',
          border: '1px solid rgba(217,119,6,0.25)',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertCircle size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400e' }}>
              {pendingCount} Organization{pendingCount > 1 ? 's' : ''} Pending Approval
            </div>
            <div style={{ fontSize: '0.78rem', color: '#a16207' }}>
              New registrations require your review before admins can access their dashboards.
            </div>
          </div>
          <button
            onClick={() => setFilter('PENDING_APPROVAL')}
            style={{
              marginLeft: 'auto',
              padding: '6px 14px', borderRadius: '8px',
              background: '#d97706', border: 'none',
              color: '#fff', fontSize: '0.78rem', fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            Review Now
          </button>
        </div>
      )}

      {/* Filter Tabs + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: `All (${companies.length})` },
          { key: 'PENDING_APPROVAL', label: `Pending (${companies.filter(c => c.status === 'PENDING_APPROVAL').length})` },
          { key: 'ACTIVE', label: `Active (${companies.filter(c => c.status === 'ACTIVE').length})` },
          { key: 'SUSPENDED', label: `Suspended (${companies.filter(c => c.status === 'SUSPENDED').length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: filter === tab.key ? '1px solid #356c89' : '1px solid #e4e4e7',
              background: filter === tab.key ? '#356c89' : 'transparent',
              color: filter === tab.key ? '#fff' : '#71717a',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <Search size={14} color="#a1a1aa" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, tenant ID..."
            style={{
              padding: '8px 12px 8px 32px',
              borderRadius: '8px',
              border: '1px solid #e4e4e7',
              fontSize: '0.82rem',
              width: '240px',
              outline: 'none',
              color: '#18181b'
            }}
          />
        </div>
      </div>

      {/* Company Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#a1a1aa' }}>
            No organizations match your filter.
          </div>
        )}

        {filtered.map((company) => {
          const sc = statusConfig[company.status] || statusConfig['ACTIVE'];
          const StatusIcon = sc.icon;
          const isExpanded = expandedId === company._id;

          return (
            <div key={company._id} className="glass-card" style={{
              padding: 0,
              border: company.status === 'PENDING_APPROVAL' ? '2px solid rgba(217,119,6,0.35)' : undefined,
              overflow: 'hidden'
            }}>
              {/* Main Row */}
              <div style={{
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 300px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: company.status === 'PENDING_APPROVAL'
                      ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                      : '#356c89',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Building2 size={24} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181b' }}>{company.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#71717a', marginTop: '2px' }}>
                      {company.industry} &bull; {company.email}
                    </div>
                    {/* Tenant ID */}
                    {company.tenantId && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        marginTop: '6px',
                        padding: '3px 10px',
                        background: 'rgba(6,182,212,0.08)',
                        border: '1px solid rgba(6,182,212,0.2)',
                        borderRadius: '6px'
                      }}>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700,
                          color: '#0891b2', fontFamily: 'monospace', letterSpacing: '0.05em'
                        }}>
                          {company.tenantId}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyTenantId(company.tenantId); }}
                          style={{
                            background: 'none', border: 'none', padding: '2px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center'
                          }}
                          title="Copy Tenant ID"
                        >
                          {copiedId === company.tenantId
                            ? <Check size={12} color="#059669" />
                            : <Copy size={12} color="#0891b2" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  {/* Stats */}
                  <div style={{ textAlign: 'center', minWidth: '55px' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#356c89' }}>
                      {company.employeeCount || 0}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#71717a' }}>Users</div>
                  </div>

                  {/* Status Badge */}
                  <span style={{
                    background: sc.bg, color: '#ffffff',
                    fontSize: '0.72rem', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '9999px',
                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                  }}>
                    <StatusIcon size={12} />
                    {sc.label}
                  </span>

                  {/* Plan Badge */}
                  <span style={{
                    background: '#356c89', color: '#ffffff',
                    fontSize: '0.72rem', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '9999px'
                  }}>
                    {company.subscriptionPlan}
                  </span>

                  {/* Actions */}
                  {company.status === 'PENDING_APPROVAL' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => activateCompany(company._id)}
                        disabled={actionLoading === company._id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '7px 14px', borderRadius: '8px',
                          background: '#15803d', border: 'none',
                          color: '#fff', fontSize: '0.78rem', fontWeight: 700,
                          cursor: 'pointer', opacity: actionLoading === company._id ? 0.6 : 1
                        }}
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button
                        onClick={() => rejectCompany(company._id)}
                        disabled={actionLoading === company._id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '7px 14px', borderRadius: '8px',
                          background: '#be123c', border: 'none',
                          color: '#fff', fontSize: '0.78rem', fontWeight: 700,
                          cursor: 'pointer', opacity: actionLoading === company._id ? 0.6 : 1
                        }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleStatus(company._id, company.status)}
                      disabled={actionLoading === company._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '7px 14px', borderRadius: '8px',
                        background: company.status === 'ACTIVE' ? 'rgba(190,18,60,0.1)' : 'rgba(21,128,61,0.1)',
                        border: `1px solid ${company.status === 'ACTIVE' ? 'rgba(190,18,60,0.3)' : 'rgba(21,128,61,0.3)'}`,
                        color: company.status === 'ACTIVE' ? '#be123c' : '#15803d',
                        fontSize: '0.78rem', fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {company.status === 'ACTIVE' ? <><Ban size={14} /> Suspend</> : <><Unlock size={14} /> Activate</>}
                    </button>
                  )}

                  {/* Expand */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : company._id)}
                    style={{
                      background: 'none', border: '1px solid #e4e4e7',
                      borderRadius: '8px', padding: '6px',
                      cursor: 'pointer', display: 'flex',
                      color: '#71717a'
                    }}
                    title="View details"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{
                  borderTop: '1px solid #f0f0f0',
                  padding: '18px 22px',
                  background: '#fafafa'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {/* Organization Info */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                        Organization Details
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                        <div><span style={{ color: '#71717a' }}>Slug:</span> <span style={{ color: '#18181b', fontWeight: 600 }}>{company.slug}</span></div>
                        <div><span style={{ color: '#71717a' }}>Tenant ID:</span> <span style={{ color: '#0891b2', fontWeight: 700, fontFamily: 'monospace' }}>{company.tenantId || 'N/A'}</span></div>
                        <div><span style={{ color: '#71717a' }}>Subscription:</span> <span style={{ color: '#18181b', fontWeight: 600 }}>{company.subscriptionPlan} ({company.subscriptionStatus})</span></div>
                        <div><span style={{ color: '#71717a' }}>Registered:</span> <span style={{ color: '#18181b', fontWeight: 600 }}>{new Date(company.createdAt).toLocaleDateString()}</span></div>
                        {company.activatedAt && (
                          <div><span style={{ color: '#71717a' }}>Activated:</span> <span style={{ color: '#15803d', fontWeight: 600 }}>{new Date(company.activatedAt).toLocaleDateString()}</span></div>
                        )}
                      </div>
                    </div>

                    {/* Admin Info */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                        <UserCog size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Company Admin
                      </h4>
                      {company.admin ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                          <div><span style={{ color: '#71717a' }}>Name:</span> <span style={{ color: '#18181b', fontWeight: 600 }}>{company.admin.name}</span></div>
                          <div><span style={{ color: '#71717a' }}>Email:</span> <span style={{ color: '#18181b', fontWeight: 600 }}>{company.admin.email}</span></div>
                          <div>
                            <span style={{ color: '#71717a' }}>Status:</span>{' '}
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: company.admin.status === 'ACTIVE' ? 'rgba(21,128,61,0.1)' : 'rgba(190,18,60,0.1)',
                              color: company.admin.status === 'ACTIVE' ? '#15803d' : '#be123c'
                            }}>
                              {company.admin.status}
                            </span>
                          </div>
                          <div><span style={{ color: '#71717a' }}>Last Login:</span> <span style={{ color: '#18181b', fontWeight: 600 }}>{company.admin.lastLoginAt ? new Date(company.admin.lastLoginAt).toLocaleString() : 'Never'}</span></div>
                        </div>
                      ) : (
                        <div style={{ color: '#a1a1aa', fontSize: '0.82rem' }}>No admin assigned</div>
                      )}
                    </div>

                    {/* Branding */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                        Branding
                      </h4>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: company.branding?.primaryColor || '#06b6d4',
                          border: '2px solid #e4e4e7'
                        }} />
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: company.branding?.secondaryColor || '#3b82f6',
                          border: '2px solid #e4e4e7'
                        }} />
                        <span style={{ fontSize: '0.78rem', color: '#71717a' }}>
                          {company.branding?.primaryColor || '#06b6d4'} / {company.branding?.secondaryColor || '#3b82f6'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}