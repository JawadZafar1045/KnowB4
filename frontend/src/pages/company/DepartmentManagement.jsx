import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, Plus, Users, X } from 'lucide-react';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '' });

  const fetchDepts = () => {
    api.get('/departments').then(res => setDepartments(res.data.departments || [])).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchDepts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/departments', newDept);
    setShowModal(false);
    setNewDept({ name: '', description: '' });
    fetchDepts();
  };

  if (loading) return <div style={{ color: '#94a3b8', padding: '40px' }}>Loading departments...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>Departments</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Organize employees by functional department</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Add Department</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {departments.map(dept => (
          <div key={dept._id} className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={20} color="#06b6d4" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b' }}>{dept.name}</h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{dept.description || 'No description'}</p>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{dept.employeeCount || 0}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Staff</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '32px', width: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18181b' }}>Create Department</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label className="form-label">Department Name</label><input className="form-input" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} required /></div>
              <div><label className="form-label">Description</label><input className="form-input" value={newDept.description} onChange={e => setNewDept({...newDept, description: e.target.value})} /></div>
              <button type="submit" className="btn-primary">Create Department</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
