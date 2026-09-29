import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Send, Plus, CalendarDays, BookOpen, Users, Target, X, Edit2, Trash2, CheckCircle } from 'lucide-react';

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  
  const [form, setForm] = useState({
    name: '', description: '', courses: [], targetType: 'ALL_EMPLOYEES',
    targetDepartments: [], targetUsers: [], dueDate: ''
  });

  const [editForm, setEditForm] = useState({
    name: '', description: '', dueDate: '', status: 'ACTIVE'
  });

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data.campaigns || []);
    } catch (err) {
      console.error(err);
    }
  };

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
      setForm({ name: '', description: '', courses: [], targetType: 'ALL_EMPLOYEES', targetDepartments: [], targetUsers: [], dueDate: '' });
      fetchCampaigns();
    } catch (err) { alert(err.response?.data?.message || 'Failed to create campaign'); }
  };

  const handleOpenEdit = (campaign, e) => {
    e.stopPropagation();
    setEditingCampaign(campaign);
    setEditForm({
      name: campaign.name,
      description: campaign.description || '',
      dueDate: campaign.dueDate ? new Date(campaign.dueDate).toISOString().split('T')[0] : '',
      status: campaign.status || 'ACTIVE'
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCampaign) return;
    try {
      await api.put(`/campaigns/${editingCampaign._id}`, editForm);
      setEditingCampaign(null);
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update campaign');
    }
  };

  const handleDelete = async (campaignId, campaignName, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete the campaign "${campaignName}"? All associated active enrollments for this campaign will also be deleted.`)) {
      return;
    }
    try {
      await api.delete(`/campaigns/${campaignId}`);
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete campaign');
    }
  };

  const toggleCourse = (id) => {
    setForm(prev => ({ ...prev, courses: prev.courses.includes(id) ? prev.courses.filter(c => c !== id) : [...prev.courses, id] }));
  };

  if (loading) return <div style={{ color: '#71717a', padding: '40px' }}>Loading campaigns...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>Training Campaigns</h1>
          <p style={{ color: '#71717a', fontSize: '0.85rem' }}>Deploy awareness programs, update schedules, or clean up past campaigns</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Launch Campaign</button>
      </div>

      {/* Campaign List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {campaigns.length === 0 ? (
          <div className="glass-card" style={{ padding: '36px', textAlign: 'center', color: '#71717a' }}>
            No active training campaigns found. Click "Launch Campaign" to create one.
          </div>
        ) : (
          campaigns.map(c => (
            <div
              key={c._id}
              className="glass-card"
              style={{ padding: '22px', position: 'relative', overflow: 'hidden', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <div
                className="campaign-accent-bar"
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'linear-gradient(90deg, #356c89, #4e86a0)'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>{c.name}</h3>
                    <span className={`badge ${c.status === 'ACTIVE' ? 'badge-green' : c.status === 'COMPLETED' ? 'badge-cyan' : 'badge-slate'}`}>
                      {c.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#71717a', marginBottom: '10px' }}>{c.description?.substring(0, 100)}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {c.courses?.map(course => (
                      <span key={course._id} className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>{course.title}</span>
                    ))}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, marginLeft: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#356c89' }}>{c.enrollmentCount || 0}</div>
                    <div style={{ fontSize: '0.68rem', color: '#71717a' }}>Enrolled</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d' }}>{c.completionRate || 0}%</div>
                    <div style={{ fontSize: '0.68rem', color: '#71717a' }}>Complete</div>
                  </div>

                  {/* Action Buttons: Edit & Delete */}
                  <div style={{ display: 'flex', gap: '6px', marginLeft: '12px', borderLeft: '1px solid #e4e4e7', paddingLeft: '14px' }}>
                    <button
                      onClick={(e) => handleOpenEdit(c, e)}
                      title="Edit Campaign"
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(c._id, c.name, e)}
                      title="Delete Campaign"
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px 10px', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '14px', fontSize: '0.78rem', color: '#71717a', display: 'flex', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarDays size={12} /> Due: {new Date(c.dueDate).toLocaleDateString()}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Target size={12} /> {c.targetType?.replace('_', ' ')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '32px', width: '480px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181b' }}>Edit Campaign Details</h2>
              <button onClick={() => setEditingCampaign(null)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Campaign Name</label>
                <input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} required />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-input" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingCampaign(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <CheckCircle size={14} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overflowY: 'auto', padding: '40px 0' }}>
          <div className="glass-card" style={{ padding: '32px', width: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181b' }}>Launch New Campaign</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label className="form-label">Campaign Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Annual Security Awareness 2026" /></div>
              <div><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div><label className="form-label">Due Date</label><input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} required /></div>

              <div>
                <label className="form-label">Select Courses</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {courses.map(course => (
                    <label key={course._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: form.courses.includes(course._id) ? 'rgba(53,108,137,0.1)' : '#ffffff', border: `1px solid ${form.courses.includes(course._id) ? 'rgba(53,108,137,0.4)' : '#e4e4e7'}`, cursor: 'pointer', fontSize: '0.85rem', color: '#27272a' }}>
                      <input type="checkbox" checked={form.courses.includes(course._id)} onChange={() => toggleCourse(course._id)} style={{ accentColor: '#356c89' }} />
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
                    <label key={d._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#27272a', marginBottom: '6px' }}>
                      <input type="checkbox" checked={form.targetDepartments.includes(d._id)} onChange={() => {
                        setForm(prev => ({ ...prev, targetDepartments: prev.targetDepartments.includes(d._id) ? prev.targetDepartments.filter(x => x !== d._id) : [...prev.targetDepartments, d._id] }));
                      }} style={{ accentColor: '#356c89' }} />
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