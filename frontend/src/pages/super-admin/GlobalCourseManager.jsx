import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BookOpen,
  Layers,
  FileText,
  Clock,
  Award,
  Plus,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import CourseCurriculumModal from '../../components/course/CourseCurriculumModal';

export default function GlobalCourseManager() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState('basic'); // 'basic' | 'content'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Course curriculum content manager state
  const [curriculumCourseId, setCurriculumCourseId] = useState(null);

  // Edit mode
  const [editingId, setEditingId] = useState(null);

  // Success message
  const [successMsg, setSuccessMsg] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const emptyForm = {
    title: '',
    description: '',
    category: 'General Security',
    difficulty: 'BEGINNER',
    estimatedDuration: 20,
    passingScore: 80,
    thumbnail: '',
    includeInitialContent: false,
    moduleTitle: 'Module 1: Core Security Protocols',
    lessonTitle: '',
    lessonContentType: 'TEXT',
    lessonContentUrl: '',
    lessonTextContent: '',
    lessonDuration: 5,
    openCurriculumAfterCreate: true
  };

  const [form, setForm] = useState(emptyForm);

  const loadCourses = async (silent = false) => {
    if (!silent) setLoading(true);

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

  // Auto-hide success message
  useEffect(() => {
    if (!successMsg) return;

    const timer = setTimeout(() => {
      setSuccessMsg('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Open Add modal
  const openAddModal = () => {
    setEditingId(null);
    setModalTab('basic');
    setForm(emptyForm);
    setError('');
    setShowAddModal(true);
  };

  // Open Edit modal
  const openEditModal = (course) => {
    setEditingId(course._id);
    setModalTab('basic');

    setForm({
      ...emptyForm,
      title: course.title || '',
      description: course.description || '',
      category: course.category || 'General Security',
      difficulty: course.difficulty || 'BEGINNER',
      estimatedDuration: course.estimatedDuration ?? 20,
      passingScore: course.passingScore ?? 80,
      thumbnail: course.thumbnail || '',
      includeInitialContent: false
    });

    setError('');
    setShowAddModal(true);
  };

  // Close Add/Edit modal
  const closeModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setModalTab('basic');
    setError('');
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category || 'General Security',
      difficulty: form.difficulty || 'BEGINNER',
      estimatedDuration: Number(form.estimatedDuration),
      passingScore: Number(form.passingScore),
      thumbnail: form.thumbnail || ''
    };

    if (!editingId && form.includeInitialContent && form.moduleTitle.trim()) {
      const initialMod = {
        title: form.moduleTitle.trim(),
        description: 'Foundational global course module',
        lessons: []
      };
      if (form.lessonTitle.trim()) {
        initialMod.lessons.push({
          title: form.lessonTitle.trim(),
          contentType: form.lessonContentType || 'TEXT',
          contentUrl: form.lessonContentUrl?.trim() || '',
          textContent: form.lessonTextContent || `### ${form.lessonTitle}\n\nCore instructions and compliance guidelines for employees.`,
          duration: Number(form.lessonDuration) || 5,
          isRequired: true
        });
      }
      payload.modules = [initialMod];
    }

    setSaving(true);

    try {
      let createdCourseId = null;
      if (editingId) {
        await api.put(`/courses/${editingId}`, payload);
        setSuccessMsg('Course updated successfully.');
      } else {
        const res = await api.post('/courses', payload);
        createdCourseId = res.data?.course?._id;
        setSuccessMsg('Course created successfully.');
      }

      closeModal();
      await loadCourses(true);

      if (createdCourseId && form.openCurriculumAfterCreate) {
        setCurriculumCourseId(createdCourseId);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (editingId
          ? 'Failed to update course. Please try again.'
          : 'Failed to create course. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  };

  // Open delete confirmation
  const openDeleteDialog = (course) => {
    setDeleteError('');
    setDeleteTarget(course);
  };

  // Close delete confirmation
  const closeDeleteDialog = () => {
    if (deleting) return;

    setDeleteTarget(null);
    setDeleteError('');
  };

  // Delete course
  const handleDelete = async () => {
    if (!deleteTarget?._id) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await api.delete(`/courses/${deleteTarget._id}`);

      setDeleteTarget(null);
      setSuccessMsg('Course deleted successfully.');

      await loadCourses(true);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to delete course. Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: '#71717a', padding: '40px' }}>
        Loading course catalog...
      </div>
    );
  }

  const difficultyStyles = {
    BEGINNER: {
      background: '#15803d',
      color: '#ffffff'
    },
    INTERMEDIATE: {
      background: '#b45309',
      color: '#ffffff'
    },
    ADVANCED: {
      background: '#be123c',
      color: '#ffffff'
    }
  };

  const iconButtonStyle = (color = '#52525b') => ({
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    border: '1px solid #e4e4e7',
    borderRadius: '8px',
    cursor: 'pointer',
    color,
    transition: 'background 0.15s, color 0.15s, border-color 0.15s'
  });

  const hoverOn = (accent, bg) => (e) => {
    e.currentTarget.style.background = bg;
    e.currentTarget.style.color = accent;
    e.currentTarget.style.borderColor = accent;
  };

  const hoverOff = (e) => {
    e.currentTarget.style.background = '#ffffff';
    e.currentTarget.style.color = '#52525b';
    e.currentTarget.style.borderColor = '#e4e4e7';
  };

  const isEditing = Boolean(editingId);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#18181b'
            }}
          >
            Global Course Catalog
          </h1>

          <p
            style={{
              color: '#71717a',
              fontSize: '0.85rem'
            }}
          >
            Manage cybersecurity training curriculum available across all tenants
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={openAddModal}
        >
          <Plus size={16} /> Add Course
        </button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}
        >
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Courses */}
      {courses.length === 0 ? (
        <div
          style={{
            padding: '60px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <BookOpen size={40} color="#a1a1aa" />

          <p
            style={{
              color: '#71717a',
              marginTop: '14px'
            }}
          >
            No courses yet. Click "Add Course" to create the first one.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}
        >
          {courses.map((course) => (
            <div
              key={course._id}
              style={{
                padding: '24px',
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '14px',
                  gap: '10px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#356c89',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <BookOpen size={20} color="#ffffff" />
                  </div>

                  <div>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#18181b'
                      }}
                    >
                      {course.title}
                    </h3>

                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#71717a'
                      }}
                    >
                      {course.category}
                    </div>
                  </div>
                </div>

                {/* Difficulty + Edit + Delete */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0
                  }}
                >
                  <span
                    style={{
                      ...difficultyStyles[course.difficulty],
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px'
                    }}
                  >
                    {course.difficulty}
                  </span>

                  {/* Manage Curriculum & Content */}
                  <button
                    type="button"
                    onClick={() => setCurriculumCourseId(course._id)}
                    title="Manage course curriculum and lesson content"
                    aria-label={`Manage content for ${course.title}`}
                    style={{
                      ...iconButtonStyle('#356c89'),
                      width: 'auto',
                      padding: '0 10px',
                      gap: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(53, 108, 137, 0.06)',
                      borderColor: 'rgba(53, 108, 137, 0.4)'
                    }}
                    onMouseEnter={hoverOn('#356c89', 'rgba(53, 108, 137, 0.12)')}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(53, 108, 137, 0.06)';
                      e.currentTarget.style.color = '#356c89';
                      e.currentTarget.style.borderColor = 'rgba(53, 108, 137, 0.4)';
                    }}
                  >
                    <Layers size={13} /> Curriculum
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEditModal(course)}
                    title="Edit course"
                    aria-label={`Edit ${course.title}`}
                    style={iconButtonStyle()}
                    onMouseEnter={hoverOn('#356c89', '#f4f4f5')}
                    onMouseLeave={hoverOff}
                  >
                    <Pencil size={14} />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(course)}
                    title="Delete course"
                    aria-label={`Delete ${course.title}`}
                    style={iconButtonStyle()}
                    onMouseEnter={hoverOn('#b91c1c', '#fef2f2')}
                    onMouseLeave={hoverOff}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: '0.82rem',
                  color: '#52525b',
                  marginBottom: '14px',
                  lineHeight: '1.5'
                }}
              >
                {course.description?.substring(0, 120)}...
              </p>

              {/* Stats */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '0.78rem',
                  color: '#71717a',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  type="button"
                  onClick={() => setCurriculumCourseId(course._id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#356c89',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <Layers size={13} />
                  {course.moduleCount || 0} Modules
                </button>

                <button
                  type="button"
                  onClick={() => setCurriculumCourseId(course._id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#356c89',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <FileText size={13} />
                  {course.lessonCount || 0} Lessons
                </button>

                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Clock size={13} />
                  {course.estimatedDuration}m
                </span>

                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Award size={13} />
                  Pass: {course.passingScore}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div
            style={{
              width: modalTab === 'content' ? '680px' : '560px',
              maxWidth: '100%',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              transition: 'width 0.2s ease'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#18181b'
                  }}
                >
                  {isEditing ? 'Edit Course' : 'Create Global Course & Content'}
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#71717a' }}>
                  {isEditing ? 'Update course information or open curriculum builder' : 'Configure course details and learning materials for all tenants'}
                </p>
              </div>

              <button
                onClick={closeModal}
                aria-label="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={20} color="#71717a" />
              </button>
            </div>

            {/* Quick jump to curriculum for editing */}
            {isEditing && (
              <div style={{ marginBottom: '18px', padding: '12px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0369a1' }}>Course Curriculum & Lessons</div>
                  <div style={{ fontSize: '0.74rem', color: '#0284c7' }}>Create, preview, or edit learning modules and lesson content</div>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                  onClick={() => {
                    const id = editingId;
                    closeModal();
                    setCurriculumCourseId(id);
                  }}
                >
                  <Layers size={14} /> Open Curriculum
                </button>
              </div>
            )}

            {/* Mode Tabs for Create Course */}
            {!isEditing && (
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e4e4e7', paddingBottom: '12px', marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={() => setModalTab('basic')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: modalTab === 'basic' ? '#356c89' : '#f4f4f5',
                    color: modalTab === 'basic' ? '#ffffff' : '#52525b'
                  }}
                >
                  1. Course Info
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('content')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: modalTab === 'content' ? '#356c89' : '#f4f4f5',
                    color: modalTab === 'content' ? '#ffffff' : '#52525b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  2. Initial Lesson (Optional)
                  {form.includeInitialContent && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />}
                </button>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  marginBottom: '16px'
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {modalTab === 'basic' ? (
                <>
                  {/* Title */}
                  <div style={{ marginBottom: '14px' }}>
                    <label className="form-label">
                      Course Title *
                    </label>

                    <input
                      className="form-input"
                      value={form.title}
                      required
                      onChange={(e) =>
                        handleChange('title', e.target.value)
                      }
                      placeholder="e.g. Advanced Phishing Defense & Incident Response"
                    />
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '14px' }}>
                    <label className="form-label">
                      Description *
                    </label>

                    <textarea
                      className="form-input"
                      rows={3}
                      required
                      value={form.description}
                      onChange={(e) =>
                        handleChange('description', e.target.value)
                      }
                      placeholder="What will learners understand after completing this course?"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {/* Category + Difficulty */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '14px',
                      marginBottom: '14px'
                    }}
                  >
                    <div>
                      <label className="form-label">
                        Category
                      </label>

                      <input
                        className="form-input"
                        value={form.category}
                        onChange={(e) =>
                          handleChange('category', e.target.value)
                        }
                        placeholder="e.g. Email Security"
                      />
                    </div>

                    <div>
                      <label className="form-label">
                        Difficulty
                      </label>

                      <select
                        className="form-input"
                        value={form.difficulty}
                        onChange={(e) =>
                          handleChange('difficulty', e.target.value)
                        }
                      >
                        <option value="BEGINNER">
                          Beginner
                        </option>

                        <option value="INTERMEDIATE">
                          Intermediate
                        </option>

                        <option value="ADVANCED">
                          Advanced
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Duration + Passing Score */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '14px',
                      marginBottom: '20px'
                    }}
                  >
                    <div>
                      <label className="form-label">
                        Estimated Duration (minutes)
                      </label>

                      <input
                        type="number"
                        className="form-input"
                        value={form.estimatedDuration}
                        onChange={(e) =>
                          handleChange(
                            'estimatedDuration',
                            e.target.value
                          )
                        }
                        min={1}
                      />
                    </div>

                    <div>
                      <label className="form-label">
                        Passing Score (%)
                      </label>

                      <input
                        type="number"
                        className="form-input"
                        value={form.passingScore}
                        onChange={(e) =>
                          handleChange(
                            'passingScore',
                            e.target.value
                          )
                        }
                        min={1}
                        max={100}
                      />
                    </div>
                  </div>

                  {!isEditing && (
                    <div style={{ marginBottom: '18px', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={form.openCurriculumAfterCreate}
                          onChange={(e) => handleChange('openCurriculumAfterCreate', e.target.checked)}
                        />
                        Open Curriculum & Lesson Builder immediately after creating
                      </label>
                      <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', marginLeft: '24px' }}>
                        Recommended: easily add multiple modules, interactive reading materials, and video links.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Tab 2: Initial content during creation */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.includeInitialContent}
                      onChange={(e) => handleChange('includeInitialContent', e.target.checked)}
                    />
                    Add an initial module & lesson right now
                  </label>

                  {form.includeInitialContent && (
                    <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <label className="form-label">Initial Module Title *</label>
                        <input
                          className="form-input"
                          value={form.moduleTitle}
                          onChange={(e) => handleChange('moduleTitle', e.target.value)}
                          placeholder="e.g. Module 1: Foundational Security Principles"
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label className="form-label">Initial Lesson Title *</label>
                          <input
                            className="form-input"
                            value={form.lessonTitle}
                            onChange={(e) => handleChange('lessonTitle', e.target.value)}
                            placeholder="e.g. Identifying Spear-Phishing Indicators"
                          />
                        </div>
                        <div>
                          <label className="form-label">Content Type</label>
                          <select
                            className="form-input"
                            value={form.lessonContentType}
                            onChange={(e) => handleChange('lessonContentType', e.target.value)}
                          >
                            <option value="TEXT">Reading (Markdown)</option>
                            <option value="VIDEO">Video URL</option>
                            <option value="PDF">PDF Guide</option>
                          </select>
                        </div>
                      </div>

                      {form.lessonContentType !== 'TEXT' ? (
                        <div style={{ marginBottom: '12px' }}>
                          <label className="form-label">Resource / Video URL</label>
                          <input
                            className="form-input"
                            value={form.lessonContentUrl}
                            onChange={(e) => handleChange('lessonContentUrl', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      ) : (
                        <div style={{ marginBottom: '12px' }}>
                          <label className="form-label">Lesson Reading Content (Markdown)</label>
                          <textarea
                            className="form-input"
                            rows={5}
                            value={form.lessonTextContent}
                            onChange={(e) => handleChange('lessonTextContent', e.target.value)}
                            placeholder="### Key Takeaways&#10;&#10;- Always verify suspicious emails out of band.&#10;- Report incidents to security."
                            style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '0.8rem', color: '#166534' }}>
                    💡 You can always add, edit, or remove modules and lessons later using the <strong>Curriculum</strong> button on any course card.
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end',
                  marginTop: '16px'
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? (isEditing
                        ? 'Saving...'
                        : 'Creating...')
                    : (isEditing
                        ? 'Save Changes'
                        : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-course-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '440px',
              maxWidth: '100%',
              padding: '28px',
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                marginBottom: '18px'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertTriangle
                  size={20}
                  color="#b91c1c"
                />
              </div>

              <div>
                <h2
                  id="delete-course-title"
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#18181b',
                    marginBottom: '6px'
                  }}
                >
                  Delete this course?
                </h2>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#52525b',
                    lineHeight: '1.5'
                  }}
                >
                  <strong>{deleteTarget.title}</strong>{' '}
                  and all of its modules, lessons and quiz
                  will be permanently removed. This cannot be
                  undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  marginBottom: '16px'
                }}
              >
                {deleteError}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end'
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={closeDeleteDialog}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  background: '#b91c1c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: deleting
                    ? 'not-allowed'
                    : 'pointer',
                  opacity: deleting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} />

                {deleting
                  ? 'Deleting...'
                  : 'Delete Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Curriculum & Content Builder Modal */}
      {curriculumCourseId && (
        <CourseCurriculumModal
          courseId={curriculumCourseId}
          onClose={() => setCurriculumCourseId(null)}
          onCourseUpdated={() => loadCourses(true)}
        />
      )}
    </div>
  );
}
