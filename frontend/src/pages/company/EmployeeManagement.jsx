import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>Employee Roster</h1>
          <p style={{ color: '#71717a', fontSize: '0.85rem' }}>Manage your organization's learner workforce</p>
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
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="#71717a" style={{ position: 'absolute', left: '12px', top: '11px' }} />
          <input className="form-input" style={{ paddingLeft: '36px' }} placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: '240px' }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.employeeCount})</option>)}
        </select>
      </div>

      {/* Employee Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
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
                      background: 'linear-gradient(135deg, #356c89, #4e86a0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: 700, color: '#ffffff'
                    }}>
                      {emp.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#18181b' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: '#52525b' }}>{emp.departmentId?.name || '—'}</td>
                <td><span className={`badge ${statusColors[emp.status] || 'badge-slate'}`}>{emp.status}</span></td>
                <td style={{ fontWeight: 700, color: '#356c89', textAlign: 'center' }}>{emp.enrollmentCount || 0}</td>
                <td style={{ fontWeight: 700, color: '#15803d', textAlign: 'center' }}>{emp.completedCount || 0}</td>
                <td style={{ fontWeight: 700, color: '#356c89', textAlign: 'center' }}>{emp.certificatesCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '32px', width: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181b' }}>
                {createdCredentials ? 'Account Created Successfully 🎉' : 'Add New Employee'}
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={18}/></button>
            </div>

            {createdCredentials ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: '#52525b' }}>
                  The employee account for <strong>{createdCredentials.name}</strong> has been created. Share these login details with them:
                </p>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#64748b' }}>Email:</span>
                    <strong style={{ color: '#0f172a' }}>{createdCredentials.email}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#64748b' }}>Temporary Password:</span>
                    <strong style={{ color: '#2563eb', fontFamily: 'monospace' }}>{createdCredentials.password}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#64748b' }}>Organization Tenant ID:</span>
                    <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{createdCredentials.tenantId}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleCopyCredentials} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
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
                    <button type="button" onClick={() => setNewEmp({ ...newEmp, password: generateRandomPassword() })} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RefreshCw size={12} /> Auto-Generate
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" value={newEmp.password} onChange={e => setNewEmp({...newEmp, password: e.target.value})} placeholder="Set initial password..." required style={{ paddingLeft: '34px', fontFamily: 'monospace' }} />
                    <Key size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '32px', width: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181b' }}>Bulk CSV Import</h2>
              <button onClick={() => { setShowCSVModal(false); setCsvResult(null); }} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <label className="form-label">Paste CSV (Required: name, email | Optional: department)</label>
            <textarea className="form-input" rows={6} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              value={csvText} onChange={e => setCsvText(e.target.value)} />
            <button className="btn-primary" style={{ width: '100%', marginTop: '14px' }} onClick={handleCSVImport}>
              <Upload size={14} /> Import Employees
            </button>
            {csvResult && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '8px', background: '#F6F7F9', border: '1px solid #e4e4e7', fontSize: '0.82rem' }}>
                <div style={{ color: '#15803d', fontWeight: 700 }}>✓ Imported: {csvResult.importedCount}</div>
                {csvResult.skippedCount > 0 && <div style={{ color: '#b45309', marginTop: '4px' }}>⚠ Skipped: {csvResult.skippedCount}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}