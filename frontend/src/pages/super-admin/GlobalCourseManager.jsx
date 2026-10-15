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
  Sparkles,
  Building2,
  Briefcase,
  Tv,
  Search,
  Filter
} from 'lucide-react';
import CourseCurriculumModal from '../../components/course/CourseCurriculumModal';

const PRESET_OFFICE_CATEGORIES = [
  { value: 'ALL', label: '🌐 All Offices & Companies (Universal)' },
  { value: 'TV Channels / Media & Broadcasting', label: '📺 TV Channels / Media & Broadcasting' },
  { value: 'Technology & Software', label: '💻 Technology & Software' },
  { value: 'Finance & Banking', label: '🏦 Finance & Banking' },
  { value: 'Healthcare & Hospitals', label: '🏥 Healthcare & Hospitals' },
  { value: 'Education & Academia', label: '🎓 Education & Academia' },
  { value: 'Government & Public Sector', label: '🏛️ Government & Public Sector' },
  { value: 'Retail & E-Commerce', label: '🛒 Retail & E-Commerce' },
  { value: 'Manufacturing & Logistics', label: '🏭 Manufacturing & Logistics' },
  { value: 'Legal & Law Firms', label: '⚖️ Legal & Law Firms' },
  { value: 'Energy & Utilities', label: '⚡ Energy & Utilities' },
  { value: 'Telecommunications', label: '📡 Telecommunications' },
  { value: 'CUSTOM', label: '✏️ Custom Office Category...' }
];

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

  // Filter & Search state
  const [targetCategoryFilter, setTargetCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const emptyForm = {
    title: '',
    description: '',
    category: 'General Security',
    targetCategory: 'ALL',
    customTargetCategory: '',
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

    const courseTarget = course.targetCategory || 'ALL';
    const isPreset = PRESET_OFFICE_CATEGORIES.some(p => p.value !== 'CUSTOM' && p.value === courseTarget);

    setForm({
      ...emptyForm,
      title: course.title || '',
      description: course.description || '',
      category: course.category || 'General Security',
      targetCategory: isPreset ? courseTarget : 'CUSTOM',
      customTargetCategory: isPreset ? '' : courseTarget,
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

    const resolvedTargetCategory = form.targetCategory === 'CUSTOM'
      ? (form.customTargetCategory?.trim() || 'ALL')
      : (form.targetCategory || 'ALL');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category || 'General Security',
      targetCategory: resolvedTargetCategory,
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
      <div style={{ color: 'var(--text-muted)', padding: '40px' }}>
        Loading course catalog...
      </div>
    );
  }

  const difficultyStyles = {
    BEGINNER: {
      background: 'var(--success-text)',
      color: 'var(--card)'
    },
    INTERMEDIATE: {
      background: 'var(--warning-text)',
      color: 'var(--card)'
    },
    ADVANCED: {
      background: 'var(--danger-text)',
      color: 'var(--card)'
    }
  };

  const iconButtonStyle = (color = 'var(--text-muted)') => ({
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--card)',
    border: '1px solid var(--border)',
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
    e.currentTarget.style.background = 'var(--card)';
    e.currentTarget.style.color = 'var(--text-muted)';
    e.currentTarget.style.borderColor = 'var(--border)';
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
              color: 'var(--text)'
            }}
          >
            Global Course Catalog
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
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
            background: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            color: 'var(--success-text)',
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

      {/* Search and Category Filter Bar */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by title, topic, or target category..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.80rem', color: 'var(--text-muted)' }}>
            <Filter size={14} />
            <span>Target Office:</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Courses' },
            { id: 'ALL_OFFICES', label: '🌐 All Offices' },
            { id: 'TV Channels', label: '📺 TV Channels' },
            { id: 'Technology', label: '💻 Technology' },
            { id: 'Healthcare', label: '🏥 Healthcare' },
            { id: 'Finance', label: '🏦 Finance' },
            { id: 'Education', label: '🎓 Education' },
            { id: 'Government', label: '🏛️ Government' }
          ].map(pill => {
            const isActive = targetCategoryFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setTargetCategoryFilter(pill.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--navy)' : 'var(--border)',
                  background: isActive ? 'var(--navy)' : 'var(--surface-subtle)',
                  color: isActive ? 'var(--card)' : 'var(--text)',
                  fontSize: '0.76rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Courses */}
      {(() => {
        const filteredCourses = courses.filter((course) => {
          if (targetCategoryFilter !== 'ALL') {
            const tc = (course.targetCategory || 'ALL').toLowerCase();
            if (targetCategoryFilter === 'ALL_OFFICES') {
              if (tc !== 'all') return false;
            } else {
              if (!tc.includes(targetCategoryFilter.toLowerCase())) return false;
            }
          }

          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchTitle = course.title?.toLowerCase().includes(q);
            const matchDesc = course.description?.toLowerCase().includes(q);
            const matchCat = course.category?.toLowerCase().includes(q);
            const matchTarget = course.targetCategory?.toLowerCase().includes(q);
            return matchTitle || matchDesc || matchCat || matchTarget;
          }

          return true;
        });

        if (filteredCourses.length === 0) {
          return (
            <div
              style={{
                padding: '60px',
                textAlign: 'center',
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <BookOpen size={40} color="var(--text-muted)" />
              <p style={{ color: 'var(--text-muted)', marginTop: '14px', fontSize: '0.9rem' }}>
                {courses.length === 0
                  ? 'No courses yet. Click "Add Course" to create the first one.'
                  : 'No courses match the selected filters or search query.'}
              </p>
              {courses.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setTargetCategoryFilter('ALL'); setSearchQuery(''); }}
                  style={{
                    marginTop: '10px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-subtle)',
                    color: 'var(--navy)',
                    fontSize: '0.80rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          );
        }

        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}
          >
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                style={{
                  padding: '24px',
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-card)'
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
                        backgroundColor: 'var(--navy)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <BookOpen size={20} color="var(--card)" />
                    </div>

                    <div>
                      <h3
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--text)'
                        }}
                      >
                        {course.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {course.category}
                        </span>

                        {/* Office / Target Category Badge */}
                        {(!course.targetCategory || course.targetCategory === 'ALL') ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            fontSize: '0.70rem',
                            fontWeight: 600,
                            background: 'rgba(6, 182, 212, 0.1)',
                            color: '#0284c7',
                            border: '1px solid rgba(6, 182, 212, 0.25)'
                          }}>
                            🌐 All Offices
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            background: course.targetCategory.toLowerCase().includes('tv') ? 'rgba(234, 88, 12, 0.12)' : 'rgba(99, 102, 241, 0.1)',
                            color: course.targetCategory.toLowerCase().includes('tv') ? '#ea580c' : '#4f46e5',
                            border: course.targetCategory.toLowerCase().includes('tv') ? '1px solid rgba(234, 88, 12, 0.3)' : '1px solid rgba(99, 102, 241, 0.25)'
                          }}>
                            {course.targetCategory.toLowerCase().includes('tv') ? '📺' : '🏢'} {course.targetCategory}
                          </span>
                        )}
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
                      ...iconButtonStyle('var(--navy)'),
                      width: 'auto',
                      padding: '0 10px',
                      gap: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'var(--surface-subtle)',
                      borderColor: 'var(--border)'
                    }}
                    onMouseEnter={hoverOn('var(--navy)', 'var(--surface-subtle)')}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--surface-subtle)';
                      e.currentTarget.style.color = 'var(--navy)';
                      e.currentTarget.style.borderColor = 'var(--border)';
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
                    onMouseEnter={hoverOn('var(--navy)', 'var(--bg)')}
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
                    onMouseEnter={hoverOn('var(--danger-text)', 'var(--danger-bg)')}
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
                  color: 'var(--text-muted)',
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
                  color: 'var(--text-muted)',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  type="button"
                  onClick={() => setCurriculumCourseId(course._id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--navy)',
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
                    color: 'var(--navy)',
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
        );
      })()}

      {/* Add / Edit Course Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--navy)',
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
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-card)',
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
                    color: 'var(--text)'
                  }}
                >
                  {isEditing ? 'Edit Course' : 'Create Global Course & Content'}
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
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
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            {/* Quick jump to curriculum for editing */}
            {isEditing && (
              <div style={{ marginBottom: '18px', padding: '12px 16px', background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--navy)' }}>Course Curriculum & Lessons</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--navy)' }}>Create, preview, or edit learning modules and lesson content</div>
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
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={() => setModalTab('basic')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    borderBottom: modalTab === 'basic' ? '2px solid var(--orange)' : '2px solid transparent',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: modalTab === 'basic' ? 'var(--surface-subtle)' : 'var(--card)',
                    color: 'var(--navy)'
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
                    border: '1px solid var(--border)',
                    borderBottom: modalTab === 'content' ? '2px solid var(--orange)' : '2px solid transparent',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: modalTab === 'content' ? 'var(--surface-subtle)' : 'var(--card)',
                    color: 'var(--navy)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  2. Initial Lesson (Optional)
                  {form.includeInitialContent && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success-text)' }} />}
                </button>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
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

                  {/* Target Office / Company Category */}
                  <div style={{
                    marginBottom: '16px',
                    padding: '14px',
                    background: 'var(--surface-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={15} color="var(--navy)" />
                        Target Office / Organization Category *
                      </label>
                      <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
                        Controls tenant office visibility
                      </span>
                    </div>

                    <select
                      className="form-input"
                      value={form.targetCategory}
                      onChange={(e) => handleChange('targetCategory', e.target.value)}
                      style={{ cursor: 'pointer', marginBottom: form.targetCategory === 'CUSTOM' ? '10px' : '0' }}
                    >
                      {PRESET_OFFICE_CATEGORIES.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {form.targetCategory === 'CUSTOM' && (
                      <div style={{ marginTop: '10px' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>
                          Specify Custom Office Category *
                        </label>
                        <input
                          className="form-input"
                          value={form.customTargetCategory}
                          onChange={(e) => handleChange('customTargetCategory', e.target.value)}
                          placeholder="e.g. TV Broadcasting Network, Media Production, Regional Bureau..."
                          required={form.targetCategory === 'CUSTOM'}
                        />
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.73rem',
                      color: 'var(--text-muted)',
                      marginTop: '8px'
                    }}>
                      <Briefcase size={12} />
                      <span>
                        {form.targetCategory === 'ALL'
                          ? 'Universal: Available to all registered customer offices and industries.'
                          : `Belongs specifically to offices matching "${form.targetCategory === 'CUSTOM' ? (form.customTargetCategory || 'custom category') : form.targetCategory}".`}
                      </span>
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
                    <div style={{ marginBottom: '18px', padding: '12px 14px', background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={form.openCurriculumAfterCreate}
                          onChange={(e) => handleChange('openCurriculumAfterCreate', e.target.checked)}
                        />
                        Open Curriculum & Lesson Builder immediately after creating
                      </label>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '24px' }}>
                        Recommended: easily add multiple modules, interactive reading materials, and video links.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Tab 2: Initial content during creation */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--navy)', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.includeInitialContent}
                      onChange={(e) => handleChange('includeInitialContent', e.target.checked)}
                    />
                    Add an initial module & lesson right now
                  </label>

                  {form.includeInitialContent && (
                    <div style={{ padding: '16px', background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: '10px' }}>
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

                  <div style={{ padding: '12px 14px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--success-text)' }}>
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
            backgroundColor: 'var(--navy)',
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
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-card)'
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
                  backgroundColor: 'var(--danger-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertTriangle
                  size={20}
                  color="var(--danger-text)"
                />
              </div>

              <div>
                <h2
                  id="delete-course-title"
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: '6px'
                  }}
                >
                  Delete this course?
                </h2>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
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
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
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
                  background: 'var(--danger-text)',
                  color: 'var(--card)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: deleting
                    ? 'not-allowed'
                    : 'pointer',
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
