import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Layers, FileText, Clock, Award } from 'lucide-react';

export default function GlobalCourseManager() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#94a3b8', padding: '40px' }}>Loading course catalog...</div>;

  const difficultyColors = { BEGINNER: 'badge-green', INTERMEDIATE: 'badge-amber', ADVANCED: 'badge-rose' };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>Global Course Catalog</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manage cybersecurity training curriculum available across all tenants</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {courses.map((course) => (
          <div key={course._id} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <BookOpen size={20} color="#06b6d4" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{course.title}</h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{course.category}</div>
                </div>
              </div>
              <span className={`badge ${difficultyColors[course.difficulty] || 'badge-slate'}`}>
                {course.difficulty}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '14px', lineHeight: '1.5' }}>
              {course.description?.substring(0, 120)}...
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={13} /> {course.moduleCount || 0} Modules
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={13} /> {course.lessonCount || 0} Lessons
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> {course.estimatedDuration}m
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award size={13} /> Pass: {course.passingScore}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
