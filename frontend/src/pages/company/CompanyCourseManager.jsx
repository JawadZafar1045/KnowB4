import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  BookOpen,
  Layers,
  FileText,
  Clock,
  Award,
  Search,
  Filter,
  Send,
  Eye,
  Building2,
  CheckCircle2,
  Briefcase,
  Sparkles
} from 'lucide-react';
import CourseCurriculumModal from '../../components/course/CourseCurriculumModal';

export default function CompanyCourseManager() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'TAILORED' | 'UNIVERSAL'

  // Curriculum Preview modal
  const [curriculumCourseId, setCurriculumCourseId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [crsRes, compRes] = await Promise.all([
        api.get('/courses'),
        api.get('/companies')
      ]);
      setCourses(crsRes.data.courses || []);
      if (compRes.data?.company) {
        setCompanyInfo(compRes.data.company);
      }
    } catch (err) {
      console.error('Failed to load courses or company:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const companyCategory = companyInfo?.category || companyInfo?.industry || 'Technology';
  const isMediaOrTv = companyCategory.toLowerCase().includes('tv') || companyCategory.toLowerCase().includes('media');

  const filteredCourses = courses.filter((course) => {
    const target = (course.targetCategory || 'ALL').trim();
    const isUniversal = !course.targetCategory || target.toUpperCase() === 'ALL';

    if (filterType === 'TAILORED') {
      if (isUniversal) return false;
    } else if (filterType === 'UNIVERSAL') {
      if (!isUniversal) return false;
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

  const diffColors = {
    BEGINNER: 'badge-green',
    INTERMEDIATE: 'badge-amber',
    ADVANCED: 'badge-rose'
  };

  const difficultyStyles = {
    BEGINNER: { background: 'var(--success-bg)', color: 'var(--success-text)' },
    INTERMEDIATE: { background: 'var(--warning-bg)', color: 'var(--warning-text)' },
    ADVANCED: { background: 'var(--danger-bg)', color: 'var(--danger-text)' }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', padding: '50px', textAlign: 'center' }}>Loading course library...</div>;
  }

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
            Course Library & Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
            Curated security awareness curriculum tailored for your organization. Launch campaigns to assign courses to your employees.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/company/campaigns')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Send size={15} /> View Active Campaigns
        </button>
      </div>

      {/* Office Category Info Banner */}
      {companyInfo && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '20px',
          gap: '14px',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              flexShrink: 0
            }}>
              {isMediaOrTv ? '📺' : '🏢'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>
                  Office Category:
                </span>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: isMediaOrTv ? '#ea580c' : 'var(--navy)',
                  background: isMediaOrTv ? 'rgba(234, 88, 12, 0.12)' : 'rgba(99, 102, 241, 0.1)',
                  padding: '2px 10px',
                  borderRadius: '6px',
                  border: isMediaOrTv ? '1px solid rgba(234, 88, 12, 0.3)' : '1px solid rgba(99, 102, 241, 0.25)'
                }}>
                  {companyCategory}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                All course content is professionally tailored and maintained by platform security administrators. Select any course below to launch a training campaign.
              </div>
            </div>
          </div>

          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: '20px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--navy)'
          }}>
            {courses.length} Available Courses
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        flexWrap: 'wrap',
        boxShadow: 'var(--shadow-card)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title, topic, or keyword..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '0.84rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[
            { id: 'ALL', label: 'All Courses' },
            { id: 'TAILORED', label: `🎯 Tailored for ${companyCategory}` },
            { id: 'UNIVERSAL', label: '🌐 Universal' }
          ].map(pill => {
            const active = filterType === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setFilterType(pill.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: active ? 'var(--navy)' : 'var(--border)',
                  background: active ? 'var(--navy)' : 'var(--surface-subtle)',
                  color: active ? 'var(--card)' : 'var(--text)',
                  fontSize: '0.76rem',
                  fontWeight: active ? 700 : 500,
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

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <BookOpen size={40} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-muted)', marginTop: '14px', fontSize: '0.9rem' }}>
            No courses match the current search or category filter.
          </p>
          {(searchQuery || filterType !== 'ALL') && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setFilterType('ALL'); }}
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
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
          {filteredCourses.map(course => {
            const isTailored = course.targetCategory && course.targetCategory !== 'ALL';

            return (
              <div
                key={course._id}
                style={{
                  padding: '22px',
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--navy)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <BookOpen size={20} color="var(--card)" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                          {course.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {course.category}
                          </span>

                          {/* Office / Target Category Badge */}
                          {!isTailored ? (
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

                    <span style={{
                      ...difficultyStyles[course.difficulty],
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      flexShrink: 0
                    }}>
                      {course.difficulty}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                    {course.description?.substring(0, 130)}...
                  </p>
                </div>

                <div>
                  {/* Stats */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)',
                    marginBottom: '16px',
                    paddingBottom: '14px',
                    borderBottom: '1px solid var(--border)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={13} color="var(--navy)" /> {course.moduleCount || 0} Modules
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={13} color="var(--navy)" /> {course.lessonCount || 0} Lessons
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="var(--navy)" /> {course.estimatedDuration}m
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={13} color="var(--navy)" /> Pass: {course.passingScore}%
                    </span>
                  </div>

                  {/* Action Buttons: Preview Course & Launch Campaign */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setCurriculumCourseId(course._id)}
                      style={{
                        flex: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface-subtle)',
                        color: 'var(--navy)',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--navy)';
                        e.currentTarget.style.background = 'var(--bg)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = 'var(--surface-subtle)';
                      }}
                    >
                      <Eye size={14} /> Preview Curriculum
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/company/campaigns', {
                        state: {
                          preselectedCourseId: course._id,
                          courseTitle: course.title
                        }
                      })}
                      className="btn-primary"
                      style={{
                        flex: '1.2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '9px 14px',
                        fontSize: '0.80rem',
                        fontWeight: 700
                      }}
                    >
                      <Send size={14} /> Launch Campaign
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Read-Only Course Curriculum Modal */}
      {curriculumCourseId && (
        <CourseCurriculumModal
          courseId={curriculumCourseId}
          readOnly={true}
          onClose={() => setCurriculumCourseId(null)}
        />
      )}
    </div>
  );
}