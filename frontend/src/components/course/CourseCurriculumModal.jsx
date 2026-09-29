import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Layers,
  FileText,
  Video,
  File,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  BookOpen,
  Sparkles,
  HelpCircle,
  Play
} from 'lucide-react';

export default function CourseCurriculumModal({ courseId, onClose, onCourseUpdated }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Module edit/create state: null | { isNew: boolean, _id?: string, title: string, description: string }
  const [moduleModal, setModuleModal] = useState(null);
  const [savingModule, setSavingModule] = useState(false);

  // Lesson edit/create state: null | { isNew: boolean, _id?: string, moduleId: string, title: string, description: string, contentType: string, contentUrl: string, textContent: string, duration: number, isRequired: boolean }
  const [lessonModal, setLessonModal] = useState(null);
  const [savingLesson, setSavingLesson] = useState(false);
  const [lessonTab, setLessonTab] = useState('edit'); // 'edit' | 'preview'

  // Delete confirmation: null | { type: 'module'|'lesson', id: string, title: string, moduleId?: string }
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Expanded preview accordions in list
  const [expandedLessons, setExpandedLessons] = useState({});

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/courses/${courseId}`);
      if (res.data?.course) {
        setCourse(res.data.course);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load course curriculum.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      loadCourseDetails();
    }
  }, [courseId]);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(''), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  // Toggle inline lesson preview
  const toggleLessonPreview = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  // ----- MODULE HANDLERS -----
  const openAddModule = () => {
    setModuleModal({
      isNew: true,
      title: '',
      description: ''
    });
  };

  const openEditModule = (mod) => {
    setModuleModal({
      isNew: false,
      _id: mod._id,
      title: mod.title || '',
      description: mod.description || '',
      order: mod.order
    });
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleModal?.title?.trim()) {
      alert('Module title is required.');
      return;
    }

    setSavingModule(true);
    try {
      if (moduleModal.isNew) {
        await api.post(`/courses/${courseId}/modules`, {
          title: moduleModal.title.trim(),
          description: moduleModal.description?.trim() || ''
        });
        setSuccessMsg('Module created successfully.');
      } else {
        await api.put(`/courses/${courseId}/modules/${moduleModal._id}`, {
          title: moduleModal.title.trim(),
          description: moduleModal.description?.trim() || '',
          order: moduleModal.order
        });
        setSuccessMsg('Module updated successfully.');
      }
      setModuleModal(null);
      await loadCourseDetails();
      if (onCourseUpdated) onCourseUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save module.');
    } finally {
      setSavingModule(false);
    }
  };

  // ----- LESSON HANDLERS -----
  const openAddLesson = (targetModuleId) => {
    setLessonTab('edit');
    setLessonModal({
      isNew: true,
      moduleId: targetModuleId,
      title: '',
      description: '',
      contentType: 'TEXT',
      contentUrl: '',
      textContent: `### Key Principles\n\nExplain the core security concept here.\n\n#### Guidelines:\n- Always verify requests from unknown sources.\n- Report anomalies immediately to the security team.\n\n*Security is everyone's responsibility.*`,
      duration: 5,
      isRequired: true
    });
  };

  const openEditLesson = (lesson) => {
    setLessonTab('edit');
    setLessonModal({
      isNew: false,
      _id: lesson._id,
      moduleId: lesson.moduleId,
      title: lesson.title || '',
      description: lesson.description || '',
      contentType: lesson.contentType || 'TEXT',
      contentUrl: lesson.contentUrl || '',
      textContent: lesson.textContent || '',
      duration: lesson.duration ?? 5,
      isRequired: lesson.isRequired !== false,
      order: lesson.order
    });
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonModal?.title?.trim()) {
      alert('Lesson title is required.');
      return;
    }
    if (!lessonModal?.moduleId) {
      alert('Please select a module for this lesson.');
      return;
    }

    setSavingLesson(true);
    try {
      const payload = {
        moduleId: lessonModal.moduleId,
        title: lessonModal.title.trim(),
        description: lessonModal.description?.trim() || '',
        contentType: lessonModal.contentType || 'TEXT',
        contentUrl: lessonModal.contentUrl?.trim() || '',
        textContent: lessonModal.textContent || '',
        duration: Number(lessonModal.duration) || 5,
        isRequired: lessonModal.isRequired
      };

      if (lessonModal.isNew) {
        await api.post(`/courses/${courseId}/lessons`, payload);
        setSuccessMsg('Lesson added successfully.');
      } else {
        await api.put(`/courses/${courseId}/lessons/${lessonModal._id}`, payload);
        setSuccessMsg('Lesson updated successfully.');
      }
      setLessonModal(null);
      await loadCourseDetails();
      if (onCourseUpdated) onCourseUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save lesson.');
    } finally {
      setSavingLesson(false);
    }
  };

  // ----- DELETE HANDLERS -----
  const confirmDeleteModule = (mod) => {
    setDeleteConfirm({
      type: 'module',
      id: mod._id,
      title: mod.title
    });
  };

  const confirmDeleteLesson = (lesson) => {
    setDeleteConfirm({
      type: 'lesson',
      id: lesson._id,
      title: lesson.title,
      moduleId: lesson.moduleId
    });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      if (deleteConfirm.type === 'module') {
        await api.delete(`/courses/${courseId}/modules/${deleteConfirm.id}`);
        setSuccessMsg('Module and its lessons removed.');
      } else {
        await api.delete(`/courses/${courseId}/lessons/${deleteConfirm.id}`);
        setSuccessMsg('Lesson removed.');
      }
      setDeleteConfirm(null);
      await loadCourseDetails();
      if (onCourseUpdated) onCourseUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    } finally {
      setDeleting(false);
    }
  };

  const insertMarkdownSnippet = (snippet) => {
    if (!lessonModal) return;
    setLessonModal(prev => ({
      ...prev,
      textContent: (prev.textContent ? prev.textContent + '\n\n' : '') + snippet
    }));
  };

  const getContentTypeBadge = (type) => {
    switch (type) {
      case 'VIDEO':
        return { label: 'Video', icon: Video, bg: '#ede9fe', color: '#6d28d9' };
      case 'PDF':
        return { label: 'PDF Document', icon: File, bg: '#fee2e2', color: '#b91c1c' };
      case 'EXTERNAL':
        return { label: 'External Resource', icon: ExternalLink, bg: '#f4f4f5', color: '#3f3f46' };
      case 'TEXT':
      default:
        return { label: 'Interactive Reading', icon: FileText, bg: '#e0f2fe', color: '#0369a1' };
    }
  };

  const totalLessons = (course?.modules || []).reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 120,
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '900px',
          maxWidth: '100%',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e4e4e7',
          overflow: 'hidden'
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e4e4e7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(180deg, #fbfcfd 0%, #f4f7f9 100%)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  background: '#356c89',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Curriculum & Content Builder
              </span>
              {course && (
                <span style={{ fontSize: '0.8rem', color: '#71717a' }}>
                  {course.category} • {course.difficulty}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18181b' }}>
              {course ? course.title : 'Course Content'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {course && (
              <button
                className="btn-primary"
                onClick={openAddModule}
                style={{ fontSize: '0.82rem', padding: '8px 14px' }}
              >
                <Plus size={15} /> Add Module
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#52525b'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div
            role="status"
            style={{
              margin: '12px 24px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}
          >
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              margin: '12px 24px 0',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}
          >
            {error}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#71717a' }}>
              Loading course structure & lessons...
            </div>
          ) : !course ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#b91c1c' }}>
              Could not load course.
            </div>
          ) : course.modules?.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#fbfbfb',
                border: '2px dashed #e4e4e7',
                borderRadius: '12px'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <Layers size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>
                No Modules Yet
              </h3>
              <p style={{ color: '#71717a', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                Organize this course into progressive modules and lessons (e.g. Module 1: Phishing Basics, Lesson 1: Identifying Spoofed Emails).
              </p>
              <button className="btn-primary" onClick={openAddModule}>
                <Plus size={16} /> Create First Module
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Summary Stats bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  color: '#475569'
                }}
              >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <Layers size={15} color="#356c89" /> {course.modules.length} Modules
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <FileText size={15} color="#356c89" /> {totalLessons} Lessons
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={15} color="#356c89" /> Course Duration: {course.estimatedDuration}m
                  </span>
                </div>
                <button
                  type="button"
                  onClick={openAddModule}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#356c89',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.82rem'
                  }}
                >
                  <Plus size={14} /> New Module
                </button>
              </div>

              {/* Modules List */}
              {course.modules.map((mod, modIdx) => (
                <div
                  key={mod._id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Module Header Bar */}
                  <div
                    style={{
                      padding: '14px 18px',
                      backgroundColor: '#f8fafc',
                      borderBottom: '1px solid #e4e4e7',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            background: '#356c89',
                            color: '#ffffff',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}
                        >
                          Module {modIdx + 1}
                        </span>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#18181b', margin: 0 }}>
                          {mod.title}
                        </h3>
                      </div>
                      {mod.description && (
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', marginLeft: '2px' }}>
                          {mod.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => openAddLesson(mod._id)}
                        style={{
                          background: '#356c89',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={14} /> Add Lesson
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModule(mod)}
                        title="Edit Module Title/Description"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => confirmDeleteModule(mod)}
                        title="Delete Module"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#dc2626'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Lessons list inside this module */}
                  <div style={{ padding: '12px 18px' }}>
                    {(!mod.lessons || mod.lessons.length === 0) ? (
                      <div
                        style={{
                          padding: '24px',
                          textAlign: 'center',
                          color: '#94a3b8',
                          fontSize: '0.82rem',
                          border: '1px dashed #e2e8f0',
                          borderRadius: '8px',
                          background: '#fafafa'
                        }}
                      >
                        No lessons in this module yet. Click{' '}
                        <button
                          type="button"
                          onClick={() => openAddLesson(mod._id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#356c89',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          + Add Lesson
                        </button>{' '}
                        to add reading material, video guides, or policies.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {mod.lessons.map((lesson, lIdx) => {
                          const badge = getContentTypeBadge(lesson.contentType);
                          const BadgeIcon = badge.icon;
                          const isExpanded = Boolean(expandedLessons[lesson._id]);

                          return (
                            <div
                              key={lesson._id}
                              style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                backgroundColor: isExpanded ? '#f8fafc' : '#ffffff',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {/* Lesson Header Row */}
                              <div
                                style={{
                                  padding: '10px 14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      color: '#94a3b8',
                                      width: '20px'
                                    }}
                                  >
                                    {lIdx + 1}.
                                  </span>

                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      backgroundColor: badge.bg,
                                      color: badge.color,
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      flexShrink: 0
                                    }}
                                  >
                                    <BadgeIcon size={12} />
                                    {badge.label}
                                  </span>

                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div
                                      style={{
                                        fontSize: '0.86rem',
                                        fontWeight: 600,
                                        color: '#1e293b',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                    >
                                      {lesson.title}
                                    </div>
                                    {lesson.description && (
                                      <div
                                        style={{
                                          fontSize: '0.75rem',
                                          color: '#64748b',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                      >
                                        {lesson.description}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      color: '#64748b',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                  >
                                    <Clock size={12} /> {lesson.duration || 5}m
                                  </span>

                                  {lesson.isRequired && (
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        color: '#b45309',
                                        background: '#fef3c7',
                                        padding: '1px 6px',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      Required
                                    </span>
                                  )}

                                  {/* Toggle Preview */}
                                  <button
                                    type="button"
                                    onClick={() => toggleLessonPreview(lesson._id)}
                                    title="Preview content"
                                    style={{
                                      background: isExpanded ? '#356c89' : '#ffffff',
                                      color: isExpanded ? '#ffffff' : '#64748b',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      fontSize: '0.74rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <Eye size={12} /> {isExpanded ? 'Hide' : 'Preview'}
                                  </button>

                                  {/* Edit Lesson */}
                                  <button
                                    type="button"
                                    onClick={() => openEditLesson(lesson)}
                                    title="Edit lesson"
                                    style={{
                                      background: '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '6px',
                                      width: '26px',
                                      height: '26px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      color: '#334155'
                                    }}
                                  >
                                    <Pencil size={12} />
                                  </button>

                                  {/* Delete Lesson */}
                                  <button
                                    type="button"
                                    onClick={() => confirmDeleteLesson(lesson)}
                                    title="Delete lesson"
                                    style={{
                                      background: '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '6px',
                                      width: '26px',
                                      height: '26px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      color: '#dc2626'
                                    }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Accordion Preview Body */}
                              {isExpanded && (
                                <div
                                  style={{
                                    borderTop: '1px solid #e2e8f0',
                                    padding: '16px 20px',
                                    backgroundColor: '#ffffff',
                                    borderBottomLeftRadius: '8px',
                                    borderBottomRightRadius: '8px'
                                  }}
                                >
                                  {lesson.contentType === 'TEXT' && (
                                    <div
                                      style={{
                                        fontSize: '0.88rem',
                                        color: '#334155',
                                        lineHeight: '1.6',
                                        whiteSpace: 'pre-wrap'
                                      }}
                                    >
                                      {lesson.textContent ? (
                                        lesson.textContent.split('\n').map((line, idx) => {
                                          if (line.startsWith('###')) {
                                            return (
                                              <h4
                                                key={idx}
                                                style={{
                                                  fontSize: '1rem',
                                                  fontWeight: 700,
                                                  color: '#0f172a',
                                                  marginTop: '12px',
                                                  marginBottom: '6px'
                                                }}
                                              >
                                                {line.replace(/^###\s*/, '')}
                                              </h4>
                                            );
                                          }
                                          if (line.startsWith('####')) {
                                            return (
                                              <h5
                                                key={idx}
                                                style={{
                                                  fontSize: '0.9rem',
                                                  fontWeight: 600,
                                                  color: '#1e293b',
                                                  marginTop: '8px',
                                                  marginBottom: '4px'
                                                }}
                                              >
                                                {line.replace(/^####\s*/, '')}
                                              </h5>
                                            );
                                          }
                                          if (line.startsWith('- ')) {
                                            return (
                                              <li
                                                key={idx}
                                                style={{
                                                  marginLeft: '16px',
                                                  marginBottom: '3px'
                                                }}
                                              >
                                                {line.replace(/^- /, '')}
                                              </li>
                                            );
                                          }
                                          if (line.trim() === '') return <br key={idx} />;
                                          return <p key={idx} style={{ marginBottom: '6px' }}>{line}</p>;
                                        })
                                      ) : (
                                        <em style={{ color: '#94a3b8' }}>No text content entered yet.</em>
                                      )}
                                    </div>
                                  )}

                                  {lesson.contentType === 'VIDEO' && (
                                    <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                                      <Play size={28} color="#6d28d9" style={{ margin: '0 auto 8px' }} />
                                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                                        Video Resource: {lesson.contentUrl || 'No URL configured'}
                                      </div>
                                      {lesson.textContent && (
                                        <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '8px' }}>
                                          {lesson.textContent}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {(lesson.contentType === 'PDF' || lesson.contentType === 'EXTERNAL') && (
                                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#0369a1', fontWeight: 600 }}>
                                        <ExternalLink size={14} /> Resource URL: {lesson.contentUrl || 'Not specified'}
                                      </div>
                                      {lesson.textContent && (
                                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                                          {lesson.textContent}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e4e4e7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#71717a' }}>
            Tip: Changes to curriculum and lessons are instantly available to learners enrolled in this course.
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '8px 18px' }}>
            Close
          </button>
        </div>
      </div>

      {/* --- ADD / EDIT MODULE SUB-MODAL --- */}
      {moduleModal && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 130,
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '460px',
              maxWidth: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #e4e4e7',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181b' }}>
                {moduleModal.isNew ? 'Create New Module' : 'Edit Module'}
              </h3>
              <button
                onClick={() => setModuleModal(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModule}>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Module Title *</label>
                <input
                  className="form-input"
                  required
                  value={moduleModal.title}
                  onChange={(e) => setModuleModal({ ...moduleModal, title: e.target.value })}
                  placeholder="e.g. Module 1: The Modern Phishing Threat"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Module Description (Optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={moduleModal.description}
                  onChange={(e) => setModuleModal({ ...moduleModal, description: e.target.value })}
                  placeholder="Brief summary of what this module covers..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setModuleModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingModule}>
                  {savingModule ? 'Saving...' : (moduleModal.isNew ? 'Create Module' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT LESSON FULL EDITOR MODAL --- */}
      {lessonModal && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 130,
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '740px',
              maxWidth: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e4e4e7',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e4e4e7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {lessonModal.isNew ? 'Add New Lesson' : 'Edit Lesson'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Create rich reading content, video links, or security documents for learners.
                </p>
              </div>
              <button
                onClick={() => setLessonModal(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveLesson} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
                {/* Module Selector & Lesson Title */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label className="form-label">Assign To Module *</label>
                    <select
                      className="form-input"
                      value={lessonModal.moduleId}
                      onChange={(e) => setLessonModal({ ...lessonModal, moduleId: e.target.value })}
                      required
                    >
                      {(course?.modules || []).map((m, i) => (
                        <option key={m._id} value={m._id}>
                          Module {i + 1}: {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Lesson Title *</label>
                    <input
                      className="form-input"
                      required
                      value={lessonModal.title}
                      onChange={(e) => setLessonModal({ ...lessonModal, title: e.target.value })}
                      placeholder="e.g. Recognizing Deceptive Domain Names"
                    />
                  </div>
                </div>

                {/* Content Type Tabs & Duration & Required */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label className="form-label">Content Type</label>
                    <select
                      className="form-input"
                      value={lessonModal.contentType}
                      onChange={(e) => setLessonModal({ ...lessonModal, contentType: e.target.value })}
                    >
                      <option value="TEXT">Interactive Text / Markdown Guide</option>
                      <option value="VIDEO">Video Stream / URL</option>
                      <option value="PDF">PDF Policy Document</option>
                      <option value="EXTERNAL">External Security Resource</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Duration (min)</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      className="form-input"
                      value={lessonModal.duration}
                      onChange={(e) => setLessonModal({ ...lessonModal, duration: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Completion</label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.82rem',
                        color: '#334155',
                        marginTop: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={lessonModal.isRequired}
                        onChange={(e) => setLessonModal({ ...lessonModal, isRequired: e.target.checked })}
                      />
                      Is Required
                    </label>
                  </div>
                </div>

                {/* Short Description */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label">Lesson Summary / Description (Optional)</label>
                  <input
                    className="form-input"
                    value={lessonModal.description}
                    onChange={(e) => setLessonModal({ ...lessonModal, description: e.target.value })}
                    placeholder="Short summary displayed in the learner module checklist"
                  />
                </div>

                {/* Specific Fields by Content Type */}
                {lessonModal.contentType !== 'TEXT' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">
                      {lessonModal.contentType === 'VIDEO' ? 'Video URL *' : 'Resource / Document URL *'}
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      value={lessonModal.contentUrl}
                      onChange={(e) => setLessonModal({ ...lessonModal, contentUrl: e.target.value })}
                      placeholder={
                        lessonModal.contentType === 'VIDEO'
                          ? 'e.g. https://www.youtube.com/watch?v=... or https://cdn.company.com/video.mp4'
                          : 'e.g. https://company.com/policies/cybersecurity-guidelines.pdf'
                      }
                    />
                  </div>
                )}

                {/* TEXT CONTENT / NOTES */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      {lessonModal.contentType === 'TEXT' ? 'Lesson Content (Markdown Supported) *' : 'Supplementary Notes / Instructions'}
                    </label>

                    {lessonModal.contentType === 'TEXT' && (
                      <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setLessonTab('edit')}
                          style={{
                            border: 'none',
                            padding: '3px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: lessonTab === 'edit' ? '#ffffff' : 'transparent',
                            color: lessonTab === 'edit' ? '#0f172a' : '#64748b',
                            boxShadow: lessonTab === 'edit' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setLessonTab('preview')}
                          style={{
                            border: 'none',
                            padding: '3px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: lessonTab === 'preview' ? '#ffffff' : 'transparent',
                            color: lessonTab === 'preview' ? '#0f172a' : '#64748b',
                            boxShadow: lessonTab === 'preview' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                          }}
                        >
                          Preview
                        </button>
                      </div>
                    )}
                  </div>

                  {lessonTab === 'edit' || lessonModal.contentType !== 'TEXT' ? (
                    <div>
                      {/* Formatting helper buttons for TEXT */}
                      {lessonModal.contentType === 'TEXT' && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            marginBottom: '8px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('### Section Heading\n')}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            + Heading
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('#### Subsection\n')}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            + Subheading
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('- Bullet point 1\n- Bullet point 2')}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            + Bullet List
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('1. Step One\n2. Step Two')}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            + Numbered List
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('*Always report suspicious emails immediately.*')}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            + Emphasis
                          </button>
                        </div>
                      )}

                      <textarea
                        className="form-input"
                        rows={10}
                        value={lessonModal.textContent}
                        onChange={(e) => setLessonModal({ ...lessonModal, textContent: e.target.value })}
                        placeholder="Type lesson content here using markdown headers (###), bullet points (-), and numbered steps..."
                        style={{ fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical' }}
                      />
                    </div>
                  ) : (
                    /* Live Learner Preview */
                    <div
                      style={{
                        padding: '18px 20px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        minHeight: '220px',
                        backgroundColor: '#f8fafc',
                        overflowY: 'auto'
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#356c89', textTransform: 'uppercase', marginBottom: '10px' }}>
                        Learner View Simulation
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                        {lessonModal.textContent ? (
                          lessonModal.textContent.split('\n').map((line, i) => {
                            if (line.startsWith('###')) {
                              return (
                                <h3
                                  key={i}
                                  style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    marginTop: '14px',
                                    marginBottom: '6px'
                                  }}
                                >
                                  {line.replace(/^###\s*/, '')}
                                </h3>
                              );
                            }
                            if (line.startsWith('####')) {
                              return (
                                <h4
                                  key={i}
                                  style={{
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    marginTop: '10px',
                                    marginBottom: '4px'
                                  }}
                                >
                                  {line.replace(/^####\s*/, '')}
                                </h4>
                              );
                            }
                            if (line.startsWith('- ')) {
                              return <li key={i} style={{ marginLeft: '16px', marginBottom: '3px' }}>{line.replace(/^- /, '')}</li>;
                            }
                            if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                              return <li key={i} style={{ marginLeft: '16px', marginBottom: '3px' }}>{line}</li>;
                            }
                            if (line.startsWith('*') && line.endsWith('*')) {
                              return <em key={i} style={{ display: 'block', color: '#356c89', margin: '8px 0' }}>{line.replace(/\*/g, '')}</em>;
                            }
                            if (line.trim() === '') return <br key={i} />;
                            return <p key={i} style={{ marginBottom: '6px' }}>{line}</p>;
                          })
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Type markdown text in the Edit tab to see a live preview here.</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lesson Footer */}
              <div
                style={{
                  padding: '14px 24px',
                  borderTop: '1px solid #e4e4e7',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  backgroundColor: '#ffffff'
                }}
              >
                <button type="button" className="btn-secondary" onClick={() => setLessonModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingLesson}>
                  {savingLesson ? 'Saving...' : (lessonModal.isNew ? 'Add Lesson' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      {deleteConfirm && (
        <div
          role="alertdialog"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 140,
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '420px',
              maxWidth: '100%',
              padding: '24px',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e4e4e7',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertTriangle size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Delete {deleteConfirm.type === 'module' ? 'Module' : 'Lesson'}?
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: '1.5' }}>
                  Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>?
                  {deleteConfirm.type === 'module' && ' This will also permanently delete all lessons within this module.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={deleting}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer'
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
