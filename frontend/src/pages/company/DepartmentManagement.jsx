import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, Plus, Users, X, Pencil, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import ModalBackButton from '../../components/common/ModalBackButton';
import ModalPortal from '../../components/common/ModalPortal';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '' });

  // NEW: edit mode (null = creating, dept._id = editing)
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // NEW: success banner
  const [successMsg, setSuccessMsg] = useState('');

  // NEW: delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchDepts = () => {
    api.get('/departments').then(res => setDepartments(res.data.departments || [])).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchDepts(); }, []);

  // Auto-hide success message
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(''), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const openAddModal = () => {
    setEditingId(null);
    setNewDept({ name: '', description: '' });
    setFormError('');
    setShowModal(true);
  };

  // NEW: open the same modal pre-filled, for editing
  const openEditModal = (dept) => {
    setEditingId(dept._id);
    setNewDept({ name: dept.name || '', description: dept.description || '' });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, newDept);
        setSuccessMsg('Department updated successfully.');
      } else {
        await api.post('/departments', newDept);
        setSuccessMsg('Department created successfully.');
      }
      closeModal();
      setNewDept({ name: '', description: '' });
      fetchDepts();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        (editingId ? 'Failed to update department.' : 'Failed to create department.')
      );
    } finally {
      setSaving(false);
    }
  };

  // NEW: delete flow
  const openDeleteDialog = (dept) => {
    setDeleteError('');
    setDeleteTarget(dept);
  };
  const closeDeleteDialog = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError('');
  };
  const handleDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`/departments/${deleteTarget._id}`);
      setDeleteTarget(null);
      setSuccessMsg('Department deleted successfully.');
      fetchDepts();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete department.');
    } finally {
      setDeleting(false);
    }
  };

  const iconButtonStyle = (color = 'var(--text-muted)') => ({
    width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color,
    transition: 'background 0.15s, color 0.15s, border-color 0.15s'
  });
  const hoverOn = (accent, bg) => (e) => {
    e.currentTarget.style.background = bg;
    e.currentTarget.style.color = accent;
    e.currentTarget.style.borderColor = accent;
  };
  const hoverOff = (e) => {
    e.currentTarget.style.background = 'var(--card)';
    e.currentTarget.style.color = 'var(--text-muted)';
    e.currentTarget.style.borderColor = 'var(--border)';
  };

  const isEditing = Boolean(editingId);

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '40px' }}>Loading departments...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Departments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Organize employees by functional department</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}><Plus size={14} /> Add Department</button>
      </div>

      {/* NEW: success banner */}
      {successMsg && (
        <div role="status" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {departments.map(dept => (
          <div key={dept._id} className="surface-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--icon-tile)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={20} color="#FFFFFF" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{dept.name}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{dept.description || 'No description'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)' }}>{dept.employeeCount || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Staff</div>
                </div>

                {/* NEW: Edit + Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(dept)}
                    title="Edit department"
                    aria-label={`Edit ${dept.name}`}
                    style={iconButtonStyle()}
                    onMouseEnter={hoverOn('var(--navy)', 'var(--surface-muted)')}
                    onMouseLeave={hoverOff}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(dept)}
                    title="Delete department"
                    aria-label={`Delete ${dept.name}`}
                    style={iconButtonStyle()}
                    onMouseEnter={hoverOn('var(--danger-text)', 'var(--danger-bg)')}
                    onMouseLeave={hoverOff}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit modal (same modal, now also handles edit) */}
      {showModal && (
        <ModalPortal>
        <div style={{ position: 'fixed', inset: 0, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="surface-card" style={{ padding: '32px', width: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <ModalBackButton onClick={closeModal} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
                {isEditing ? 'Edit Department' : 'Create Department'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18}/></button>
            </div>

            {formError && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '14px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label className="form-label">Department Name</label><input className="form-input" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} required /></div>
              <div><label className="form-label">Description</label><input className="form-input" value={newDept.description} onChange={e => setNewDept({...newDept, description: e.target.value})} /></div>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving
                  ? (isEditing ? 'Saving...' : 'Creating...')
                  : (isEditing ? 'Save Changes' : 'Create Department')}
              </button>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* NEW: Delete confirmation */}
      {deleteTarget && (
        <ModalPortal>
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dept-title"
          style={{ position: 'fixed', inset: 0, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}
        >
          <div className="surface-card" style={{ padding: '28px', width: '420px' }}>
          <div style={{ display: 'flex', marginBottom: '12px' }}>
            <ModalBackButton onClick={closeDeleteDialog} disabled={deleting} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={20} color="var(--danger-text)" />
              </div>
              <div>
                <h2 id="delete-dept-title" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                  Delete this department?
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <strong>{deleteTarget.name}</strong> will be permanently removed. This cannot be undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={closeDeleteDialog} disabled={deleting}>Cancel</button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  background: 'var(--danger-text)', color: 'var(--card)', border: 'none', borderRadius: '8px', padding: '9px 16px',
                  fontSize: '0.85rem', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete Department'}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}