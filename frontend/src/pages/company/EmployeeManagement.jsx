import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatStatus } from '../../utils/displayFormatters';
import { Users, Search, Plus, Upload, ChevronDown, Award, BookOpen, X, Key, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeManagement() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', email: '', departmentId: '', jobTitle: '', password: '' });
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const [csvText, setCsvText] = useState('name,email,department\nJohn Doe,john@acmefinance.com,IT & Security\nJane Smith,jane@acmefinance.com,Finance');
  const [csvResult, setCsvResult] = useState(null);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleOpenAddModal = () => {
    setNewEmp({ name: '', email: '', departmentId: '', jobTitle: '', password: generateRandomPassword() });
    setCreatedCredentials(null);
    setShowAddModal(true);
  };

  const fetchEmployees = () => {
    const params = {};
    if (search) params.search = search;
    if (deptFilter) params.departmentId = deptFilter;
    api.get('/employees', { params })
      .then(res => setEmployees(res.data.employees || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
    api.get('/departments').then(res => setDepartments(res.data.departments || [])).catch(console.error);
  }, []);

  useEffect(() => { fetchEmployees(); }, [search, deptFilter]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/employees', newEmp);
      setCreatedCredentials({
        name: newEmp.name,
        email: newEmp.email,
        password: newEmp.password || 'WelcomeCyber2026!',
        tenantId: user?.companyId?.tenantId || user?.company?.tenantId || 'TB4-DEMO'
      });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `ThinkB4Act Employee Login Credentials:\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nTenant ID: ${createdCredentials.tenantId}\nLogin URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCSVImport = async () => {
    try {
      const res = await api.post('/employees/bulk-import', { csvText });
      setCsvResult(res.data);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'CSV import failed');
    }
  };

  const statusColors = {
    ACTIVE: 'badge-green',
    INVITED: 'badge-cyan',
    SUSPENDED: 'badge-rose',
    DEACTIVATED: 'badge-slate'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Employee Roster</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your organization's learner workforce</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => setShowCSVModal(true)}>
            <Upload size={14} /> CSV Import
          </button>
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <Plus size={14} /> Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="employee-roster-toolbar">
        <div className="employee-roster-search" style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
          <input className="form-input" style={{ paddingLeft: '36px' }} placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: '240px' }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.employeeCount})</option>)}
        </select>
      </div>

      {/* Employee Table */}
      <div className="surface-panel" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Enrollments</th>
              <th style={{ textAlign: 'center' }}>Completed</th>
              <th style={{ textAlign: 'center' }}>Certificates</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--navy)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: 700, color: 'var(--card)'
                    }}>
                      {emp.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{emp.departmentId?.name || '—'}</td>
                <td><span className={`badge ${statusColors[emp.status] || 'badge-slate'}`}>{formatStatus(emp.status)}</span></td>
                <td style={{ fontWeight: 700, color: 'var(--navy)', textAlign: 'center' }}>{emp.enrollmentCount || 0}</td>
                <td style={{ fontWeight: 700, color: 'var(--success-text)', textAlign: 'center' }}>{emp.completedCount || 0}</td>
                <td style={{ fontWeight: 700, color: 'var(--navy)', textAlign: 'center' }}>{emp.certificatesCount || 0}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="surface-card" style={{ padding: '32px', width: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
                {createdCredentials ? 'Account Created Successfully 🎉' : 'Add New Employee'}
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18}/></button>
            </div>

            {createdCredentials ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  The employee account for <strong>{createdCredentials.name}</strong> has been created. Share these login details with them:
                </p>
                <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                    <strong style={{ color: 'var(--navy)' }}>{createdCredentials.email}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Temporary Password:</span>
                    <strong style={{ color: 'var(--navy)', fontFamily: 'monospace' }}>{createdCredentials.password}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Organization Tenant ID:</span>
                    <strong style={{ color: 'var(--navy)', fontFamily: 'monospace' }}>{createdCredentials.tenantId}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleCopyCredentials} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {copied ? <Check size={16} color="var(--success-text)" /> : <Copy size={16} />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Login Credentials'}
                  </button>
                  <button onClick={() => handleOpenAddModal()} className="btn-primary" style={{ padding: '0 16px' }}>
                    + Add Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div><label className="form-label">Full Name</label><input className="form-input" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} placeholder="e.g. Sarah Jenkins" required /></div>
                <div><label className="form-label">Email</label><input className="form-input" type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} placeholder="sarah@company.com" required /></div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Initial Temporary Password</label>
                    <button type="button" onClick={() => setNewEmp({ ...newEmp, password: generateRandomPassword() })} style={{ background: 'none', border: 'none', color: 'var(--navy)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RefreshCw size={12} /> Auto-Generate
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" value={newEmp.password} onChange={e => setNewEmp({...newEmp, password: e.target.value})} placeholder="Set initial password..." required style={{ paddingLeft: '34px', fontFamily: 'monospace' }} />
                    <Key size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                  </div>
                </div>

                <div><label className="form-label">Department</label>
                  <select className="form-input" value={newEmp.departmentId} onChange={e => setNewEmp({...newEmp, departmentId: e.target.value})}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Job Title</label><input className="form-input" value={newEmp.jobTitle} onChange={e => setNewEmp({...newEmp, jobTitle: e.target.value})} placeholder="e.g. Senior Security Analyst" /></div>

                <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Create Employee Account</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCSVModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="surface-card" style={{ padding: '32px', width: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>Bulk CSV Import</h2>
              <button onClick={() => { setShowCSVModal(false); setCsvResult(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <label className="form-label">Paste CSV (Required: name, email | Optional: department)</label>
            <textarea className="form-input" rows={6} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              value={csvText} onChange={e => setCsvText(e.target.value)} />
            <button className="btn-primary" style={{ width: '100%', marginTop: '14px' }} onClick={handleCSVImport}>
              <Upload size={14} /> Import Employees
            </button>
            {csvResult && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '0.82rem' }}>
                <div style={{ color: 'var(--success-text)', fontWeight: 700 }}>✓ Imported: {csvResult.importedCount}</div>
                {csvResult.skippedCount > 0 && <div style={{ color: 'var(--warning-text)', marginTop: '4px' }}>⚠ Skipped: {csvResult.skippedCount}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}