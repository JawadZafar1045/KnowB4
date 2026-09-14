import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Layers, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then(res => setCourses(res.data.courses || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#94a3b8', padding: '60px', textAlign: 'center' }}>Loading catalog...</div>;

  const diffColors = { BEGINNER: 'badge-green', INTERMEDIATE: 'badge-amber', ADVANCED: 'badge-rose' };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>Course Catalog</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Available cybersecurity training courses</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {courses.map(c => (
          <Link key={c._id} to={`/employee/course/${c._id}`} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} color="#06b6d4" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{c.title}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.category}</div>
                  </div>
                </div>
                <span className={`badge ${diffColors[c.difficulty] || 'badge-slate'}`}>{c.difficulty}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '12px' }}>{c.description?.substring(0, 100)}...</p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={12} /> {c.moduleCount} Modules</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {c.estimatedDuration}m</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={12} /> Pass: {c.passingScore}%</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
