import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Plus, Upload, ChevronDown, Award, BookOpen, X } from 'lucide-react';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', email: '', departmentId: '', jobTitle: '' });
  const [csvText, setCsvText] = useState('name,email,department\nJohn Doe,john@acmefinance.com,IT & Security\nJane Smith,jane@acmefinance.com,Finance');
  const [csvResult, setCsvResult] = useState(null);

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
      await api.post('/employees', newEmp);
      setShowAddModal(false);
      setNewEmp({ name: '', email: '', departmentId: '', jobTitle: '' });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add employee');
    }
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>Employee Roster</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manage your organization's learner workforce</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => setShowCSVModal(true)}>
            <Upload size={14} /> CSV Import
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
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
              <th>Enrollments</th>
              <th>Completed</th>
              <th>Certificates</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: 700, color: '#06b6d4'
                    }}>
                      {emp.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: '#94a3b8' }}>{emp.departmentId?.name || '—'}</td>
                <td><span className={`badge ${statusColors[emp.status] || 'badge-slate'}`}>{emp.status}</span></td>
                <td style={{ fontWeight: 700, color: '#38bdf8' }}>{emp.enrollmentCount || 0}</td>
                <td style={{ fontWeight: 700, color: '#10b981' }}>{emp.completedCount || 0}</td>
                <td style={{ fontWeight: 700, color: '#f59e0b' }}>{emp.certificatesCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '32px', width: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>Add New Employee</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label className="form-label">Full Name</label><input className="form-input" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} required /></div>
              <div><label className="form-label">Email</label><input className="form-input" type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} required /></div>
              <div><label className="form-label">Department</label>
                <select className="form-input" value={newEmp.departmentId} onChange={e => setNewEmp({...newEmp, departmentId: e.target.value})}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div><label className="form-label">Job Title</label><input className="form-input" value={newEmp.jobTitle} onChange={e => setNewEmp({...newEmp, jobTitle: e.target.value})} /></div>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Create Employee Account</button>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCSVModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '32px', width: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>Bulk CSV Import</h2>
              <button onClick={() => { setShowCSVModal(false); setCsvResult(null); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <label className="form-label">Paste CSV (Required: name, email | Optional: department)</label>
            <textarea className="form-input" rows={6} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              value={csvText} onChange={e => setCsvText(e.target.value)} />
            <button className="btn-primary" style={{ width: '100%', marginTop: '14px' }} onClick={handleCSVImport}>
              <Upload size={14} /> Import Employees
            </button>
            {csvResult && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '8px', background: '#0e1526', border: '1px solid #1e293b', fontSize: '0.82rem' }}>
                <div style={{ color: '#10b981', fontWeight: 700 }}>✓ Imported: {csvResult.importedCount}</div>
                {csvResult.skippedCount > 0 && <div style={{ color: '#f59e0b', marginTop: '4px' }}>⚠ Skipped: {csvResult.skippedCount}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
