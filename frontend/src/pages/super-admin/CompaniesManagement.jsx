import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatOrganizationName, formatStatus } from '../../utils/displayFormatters';
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
    'PENDING_APPROVAL': { label: 'Pending Approval', icon: Clock },
    'ACTIVE': { label: 'Active', icon: CheckCircle2 },
    'SUSPENDED': { label: 'Suspended', icon: Ban },
    'REJECTED': { label: 'Rejected', icon: Ban },
    'TRIAL': { label: 'Trial', icon: Clock }
  };

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
            Tenant Organizations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage multi-tenant customer accounts, approve registrations & admin activation
          </p>
        </div>
        <button
          onClick={fetchCompanies}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600,
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
          background: 'var(--warning-bg)',
          border: '1px solid var(--warning-bg)',
          marginBottom: '20px'
        }} className="pending-approval-banner">
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--warning-text)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertCircle size={20} color="var(--card)" />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--warning-text)' }}>
              {pendingCount} Organization{pendingCount > 1 ? 's' : ''} Pending Approval
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--warning-text)' }}>
              New registrations require your review before admins can access their dashboards.
            </div>
          </div>
          <button
            onClick={() => setFilter('PENDING_APPROVAL')}
            style={{
              marginLeft: 'auto',
              padding: '6px 14px', borderRadius: '8px',
              background: 'var(--warning-text)', border: 'none',
              color: 'var(--card)', fontSize: '0.78rem', fontWeight: 700,
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
              border: '1px solid var(--border)',
              borderBottom: filter === tab.key ? '2px solid var(--orange)' : '2px solid transparent',
              background: filter === tab.key ? 'var(--surface-subtle)' : 'var(--card)',
              color: 'var(--navy)',
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
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, tenant ID..."
            style={{
              padding: '8px 12px 8px 32px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '0.82rem',
              width: '240px',
              outline: 'none',
              color: 'var(--text)'
            }}
          />
        </div>
      </div>

      {/* Company Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No organizations match your filter.
          </div>
        )}

        {filtered.map((company) => {
          const sc = statusConfig[company.status] || statusConfig['ACTIVE'];
          const StatusIcon = sc.icon;
          const isExpanded = expandedId === company._id;

          return (
            <div key={company._id} className="surface-card" style={{
              padding: 0,
              border: '1px solid var(--border)',
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
                    background: 'var(--icon-tile)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Building2 size={24} color="var(--orange)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>{formatOrganizationName(company.name)}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '1px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700,
                        background: (company.category || company.industry || '').toLowerCase().includes('tv') ? 'rgba(234, 88, 12, 0.12)' : 'rgba(99, 102, 241, 0.1)',
                        color: (company.category || company.industry || '').toLowerCase().includes('tv') ? '#ea580c' : '#4f46e5',
                        border: (company.category || company.industry || '').toLowerCase().includes('tv') ? '1px solid rgba(234, 88, 12, 0.3)' : '1px solid rgba(99, 102, 241, 0.25)'
                      }}>
                        {(company.category || company.industry || '').toLowerCase().includes('tv') ? '📺' : '🏢'} {company.category || company.industry || 'Technology'}
                      </span>
                      <span>&bull;</span>
                      <span>{company.email}</span>
                    </div>
                    {/* Tenant ID */}
                    {company.tenantId && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        marginTop: '6px',
                        padding: '3px 10px',
                        background: 'var(--surface-subtle)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }}>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700,
                          color: 'var(--navy)', fontFamily: 'monospace', letterSpacing: '0.05em'
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
                            ? <Check size={12} color="var(--success-text)" />
                            : <Copy size={12} color="var(--navy)" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  {/* Stats */}
                  <div style={{ textAlign: 'center', minWidth: '55px' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)' }}>
                      {company.employeeCount || 0}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Users</div>
                  </div>

                  {/* Status Badge */}
                  <span className={`badge ${company.status === 'ACTIVE' ? 'badge-green' : company.status === 'PENDING_APPROVAL' ? 'badge-amber' : ['SUSPENDED', 'REJECTED'].includes(company.status) ? 'badge-rose' : 'badge-slate'}`}>
                    <StatusIcon size={12} />
                    {formatStatus(sc.label)}
                  </span>

                  {/* Plan Badge */}
                  <span className="badge badge-slate">
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
                          background: 'var(--success-text)', border: 'none',
                          color: 'var(--card)', fontSize: '0.78rem', fontWeight: 700,
                          cursor: 'pointer'
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
                          background: 'var(--danger-text)', border: 'none',
                          color: 'var(--card)', fontSize: '0.78rem', fontWeight: 700,
                          cursor: 'pointer'
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
                        background: company.status === 'ACTIVE' ? 'var(--danger-bg)' : 'var(--success-bg)',
                        border: `1px solid ${company.status === 'ACTIVE' ? 'var(--danger-border)' : 'var(--success-border)'}`,
                        color: company.status === 'ACTIVE' ? 'var(--danger-text)' : 'var(--success-text)',
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
                      background: 'none', border: '1px solid var(--border)',
                      borderRadius: '8px', padding: '6px',
                      cursor: 'pointer', display: 'flex',
                      color: 'var(--text-muted)'
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
                  borderTop: '1px solid var(--surface-muted)',
                  padding: '18px 22px',
                  background: 'var(--bg)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {/* Organization Info */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                        Organization Details
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Office Category:</span> <span style={{ color: 'var(--navy)', fontWeight: 700 }}>{company.category || company.industry || 'General'}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Slug:</span> <span style={{ color: 'var(--text)', fontWeight: 600 }}>{company.slug}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tenant ID:</span> <span style={{ color: 'var(--navy)', fontWeight: 700, fontFamily: 'monospace' }}>{company.tenantId || 'N/A'}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Subscription:</span> <span style={{ color: 'var(--text)', fontWeight: 600 }}>{company.subscriptionPlan} ({company.subscriptionStatus})</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Registered:</span> <span style={{ color: 'var(--text)', fontWeight: 600 }}>{new Date(company.createdAt).toLocaleDateString()}</span></div>
                        {company.activatedAt && (
                          <div><span style={{ color: 'var(--text-muted)' }}>Activated:</span> <span style={{ color: 'var(--success-text)', fontWeight: 600 }}>{new Date(company.activatedAt).toLocaleDateString()}</span></div>
                        )}
                      </div>
                    </div>

                    {/* Admin Info */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                        <UserCog size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Company Admin
                      </h4>
                      {company.admin ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                          <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> <span style={{ color: 'var(--text)', fontWeight: 600 }}>{company.admin.name}</span></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <span style={{ color: 'var(--text)', fontWeight: 600 }}>{company.admin.email}</span></div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Status:</span>{' '}
                            <span className={`badge ${company.admin.status === 'ACTIVE' ? 'badge-green' : 'badge-rose'}`}>
                              {formatStatus(company.admin.status)}
                            </span>
                          </div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Last Login:</span> <span style={{ color: 'var(--text)', fontWeight: 600 }}>{company.admin.lastLoginAt ? new Date(company.admin.lastLoginAt).toLocaleString() : 'Never'}</span></div>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No admin assigned</div>
                      )}
                    </div>

                    {/* Branding */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                        Branding
                      </h4>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: company.branding?.primaryColor || 'var(--navy)',
                          border: '2px solid var(--border)'
                        }} />
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: company.branding?.secondaryColor || 'var(--navy)',
                          border: '2px solid var(--border)'
                        }} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {company.branding?.primaryColor || 'var(--navy)'} / {company.branding?.secondaryColor || 'var(--navy)'}
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