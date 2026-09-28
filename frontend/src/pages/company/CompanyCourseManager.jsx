import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Plus, Layers, FileText, Clock, Award, X } from 'lucide-react';

export default function CompanyCourseManager() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const emptyForm = {
    title: '',
    description: '',
    category: 'General Security',
    difficulty: 'BEGINNER',
    estimatedDuration: 20,
    passingScore: 80,
    thumbnail: ''
  };

  const [form, setForm] = useState(emptyForm);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim()) {
      setError('Course title and description are required.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/courses', {
        ...form,
        estimatedDuration: Number(form.estimatedDuration),
        passingScore: Number(form.passingScore)
      });
      setShowModal(false);
      setForm(emptyForm);
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setSaving(false);
    }
  };

  const difficultyStyles = {
    BEGINNER: { background: '#15803d', color: '#ffffff' },
    INTERMEDIATE: { background: '#b45309', color: '#ffffff' },
    ADVANCED: { background: '#be123c', color: '#ffffff' }
  };

  if (loading) return <div style={{ color: '#71717a', padding: '40px' }}>Loading course library...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>Course Library</h1>
          <p style={{ color: '#71717a', fontSize: '0.85rem' }}>Create and manage training content for your organization</p>
        </div>
        <button className="btn-primary" onClick={() => { setError(''); setForm(emptyForm); setShowModal(true); }}>
          <Plus size={16} /> Add Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px' }}>
          <BookOpen size={40} color="#a1a1aa" />
          <p style={{ color: '#71717a', marginTop: '14px' }}>No courses yet. Create your first learning module from this panel.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
          {courses.map(course => (
            <div key={course._id} style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#356c89', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} color="#ffffff" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b' }}>{course.title}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{course.category}</div>
                  </div>
                </div>
                <span style={{ ...difficultyStyles[course.difficulty], fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px' }}>
                  {course.difficulty}
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#52525b', marginBottom: '14px', lineHeight: '1.5' }}>
                {course.description?.substring(0, 120)}...
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: '#71717a', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={13} /> {course.moduleCount || 0} Modules</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={13} /> {course.lessonCount || 0} Lessons</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {course.estimatedDuration}m</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={13} /> Pass: {course.passingScore}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ width: '520px', maxWidth: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181b' }}>Add New Course</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#71717a" />
              </button>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Course Title *</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Insider Threat Awareness" />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Description *</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will learners understand after this course?" style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Category</label>
                  <input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Difficulty</label>
                  <select className="form-input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label className="form-label">Estimated Duration (minutes)</label>
                  <input type="number" className="form-input" value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })} min={1} />
                </div>
                <div>
                  <label className="form-label">Passing Score (%)</label>
                  <input type="number" className="form-input" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: e.target.value })} min={1} max={100} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
