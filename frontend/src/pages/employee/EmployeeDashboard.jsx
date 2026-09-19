import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Clock, Award, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/enrollments/my'),
      api.get('/certificates/my')
    ]).then(([enRes, certRes]) => {
      setEnrollments(enRes.data.enrollments || []);
      setCertificates(certRes.data.certificates || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#71717a', padding: '60px', textAlign: 'center' }}>Loading your training...</div>;

  const statusIcons = {
    COMPLETED: <CheckCircle2 size={16} color="#10b981" />,
    IN_PROGRESS: <Clock size={16} color="#f59e0b" />,
    ASSIGNED: <BookOpen size={16} color="#71717a" />,
    FAILED: <AlertTriangle size={16} color="#f43f5e" />,
  };
  const statusColors = { COMPLETED: '#059669', IN_PROGRESS: '#d97706', ASSIGNED: '#71717a', FAILED: '#dc2626' };

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>
          Welcome back, <span style={{ color: '#06b6d4' }}>{user?.name?.split(' ')[0] || 'Learner'}</span>
        </h1>
        <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Your assigned cybersecurity training and progress</p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Assigned', value: enrollments.length },
          { label: 'Completed', value: enrollments.filter(e => e.status === 'COMPLETED').length },
          { label: 'In Progress', value: enrollments.filter(e => e.status === 'IN_PROGRESS').length },
          { label: 'Certificates', value: certificates.length },
        ].map((s, i) => (
          <div
            key={i}
            className="glass-card"
            style={{ padding: '18px', textAlign: 'center', cursor: 'default', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(168,85,247,0.15), 0 4px 8px rgba(0,0,0,0.04)';
              e.currentTarget.style.borderColor = '#a855f7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
              e.currentTarget.style.borderColor = '#e4e4e7';
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#18181b' }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#71717a' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Assigned Training Cards */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181b', marginBottom: '16px' }}>My Training</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {enrollments.map(en => {
          const course = en.courseId;
          if (!course) return null;
          return (
            <div
              key={en._id}
              className="glass-card"
              style={{ padding: '22px', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(168,85,247,0.15), 0 4px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#a855f7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = '#e4e4e7';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', marginBottom: '4px' }}>{course.title}</h3>
                  <div style={{ fontSize: '0.78rem', color: '#71717a' }}>{course.category} &bull; {course.estimatedDuration}min</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {statusIcons[en.status]}
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: statusColors[en.status] }}>{en.status}</span>
                </div>
              </div>
              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#e4e4e7', marginBottom: '12px' }}>
                <div style={{
                  width: `${en.progressPercentage}%`, height: '100%', borderRadius: '4px',
                  background: en.status === 'COMPLETED' ? '#059669' : 'linear-gradient(90deg, #a855f7, #ec4899)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#18181b' }}>{en.progressPercentage}% Complete</span>
                <Link to={`/employee/course/${course._id}`} className="btn-outline" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                  {en.status === 'COMPLETED' ? 'Review' : en.progressPercentage > 0 ? 'Continue' : 'Start'} <ArrowRight size={12} />
                </Link>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '8px' }}>
                Due: {new Date(en.dueDate).toLocaleDateString()}
                {en.campaignId && <> &bull; Campaign: {en.campaignId.name}</>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificates */}
      {certificates.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181b', marginBottom: '16px' }}>My Certificates</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {certificates.map(cert => (
              <div key={cert._id} className="glass-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <Award size={24} color="#d97706" />
                  <div>
                    <div style={{ fontWeight: 700, color: '#18181b' }}>{cert.courseName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#71717a', fontFamily: 'var(--font-mono)' }}>{cert.certificateId}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#52525b' }}>Score: <strong style={{ color: '#059669' }}>{cert.score}%</strong> &bull; Issued: {new Date(cert.issuedAt).toLocaleDateString()}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <a href={`/verify/${cert.certificateId}`} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>Verify Online</a>
                  {cert.pdfUrl && <a href={`http://localhost:5000${cert.pdfUrl}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>Download PDF</a>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}