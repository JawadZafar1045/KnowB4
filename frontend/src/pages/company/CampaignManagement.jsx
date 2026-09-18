import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Send, Plus, CalendarDays, BookOpen, Users, Target, X } from 'lucide-react';

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', courses: [], targetType: 'ALL_EMPLOYEES',
    targetDepartments: [], targetUsers: [], dueDate: ''
  });

  useEffect(() => {
    Promise.all([
      api.get('/campaigns'),
      api.get('/courses'),
      api.get('/departments'),
      api.get('/employees')
    ]).then(([camp, crs, dept, emp]) => {
      setCampaigns(camp.data.campaigns || []);
      setCourses(crs.data.courses || []);
      setDepartments(dept.data.departments || []);
      setEmployees(emp.data.employees || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleLaunch = async (e) => {
    e.preventDefault();
    try {
      await api.post('/campaigns', form);
      setShowCreate(false);
      const res = await api.get('/campaigns');
      setCampaigns(res.data.campaigns || []);
    } catch (err) { alert(err.response?.data?.message || 'Failed to create campaign'); }
  };

  const toggleCourse = (id) => {
    setForm(prev => ({ ...prev, courses: prev.courses.includes(id) ? prev.courses.filter(c => c !== id) : [...prev.courses, id] }));
  };

  if (loading) return <div style={{ color: '#94a3b8', padding: '40px' }}>Loading campaigns...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>Training Campaigns</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Deploy awareness programs and track audience coverage</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Launch Campaign</button>
      </div>

      {/* Campaign List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {campaigns.map(c => (
          <div key={c._id} className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>{c.name}</h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '10px' }}>{c.description?.substring(0, 100)}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {c.courses?.map(course => (
                    <span key={course._id} className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>{course.title}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, marginLeft: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>{c.enrollmentCount || 0}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Enrolled</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{c.completionRate || 0}%</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Complete</div>
                </div>
                <span className={`badge ${c.status === 'ACTIVE' ? 'badge-green' : c.status === 'COMPLETED' ? 'badge-cyan' : 'badge-slate'}`}>
                  {c.status}
                </span>
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarDays size={12} /> Due: {new Date(c.dueDate).toLocaleDateString()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Target size={12} /> {c.targetType?.replace('_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overflowY: 'auto', padding: '40px 0' }}>
          <div className="glass-card" style={{ padding: '32px', width: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181b' }}>Launch New Campaign</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label className="form-label">Campaign Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Annual Security Awareness 2026" /></div>
              <div><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div><label className="form-label">Due Date</label><input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} required /></div>

              <div>
                <label className="form-label">Select Courses</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {courses.map(course => (
                    <label key={course._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: form.courses.includes(course._id) ? 'rgba(6,182,212,0.15)' : '#0e1526', border: `1px solid ${form.courses.includes(course._id) ? 'rgba(6,182,212,0.4)' : '#1e293b'}`, cursor: 'pointer', fontSize: '0.85rem', color: '#e2e8f0' }}>
                      <input type="checkbox" checked={form.courses.includes(course._id)} onChange={() => toggleCourse(course._id)} style={{ accentColor: '#06b6d4' }} />
                      {course.title}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Target Audience</label>
                <select className="form-input" value={form.targetType} onChange={e => setForm({...form, targetType: e.target.value})}>
                  <option value="ALL_EMPLOYEES">All Employees</option>
                  <option value="DEPARTMENT">By Department</option>
                  <option value="SELECTED_USERS">Selected Employees</option>
                </select>
              </div>

              {form.targetType === 'DEPARTMENT' && (
                <div>
                  <label className="form-label">Select Departments</label>
                  {departments.map(d => (
                    <label key={d._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '6px' }}>
                      <input type="checkbox" checked={form.targetDepartments.includes(d._id)} onChange={() => {
                        setForm(prev => ({ ...prev, targetDepartments: prev.targetDepartments.includes(d._id) ? prev.targetDepartments.filter(x => x !== d._id) : [...prev.targetDepartments, d._id] }));
                      }} style={{ accentColor: '#06b6d4' }} />
                      {d.name} ({d.employeeCount} employees)
                    </label>
                  ))}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}><Send size={14} /> Launch Campaign</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
