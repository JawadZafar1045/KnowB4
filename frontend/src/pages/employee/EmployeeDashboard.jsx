import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatStatus } from '../../utils/displayFormatters';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Clock, Award, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/enrollments/my'),
      api.get('/certificates/my')
    ]).then(([enRes, certRes]) => {
      setEnrollments(enRes.data.enrollments || []);
      setCertificates(certRes.data.certificates || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Animate the quick-stat numbers and progress bars up from 0 once data has loaded
  useEffect(() => {
    if (loading) return;
    let frameId;
    let startTime = null;
    const duration = 1000;

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setAnimProgress(eased);
      if (t < 1) frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [loading]);

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '60px', textAlign: 'center' }}>Loading your training...</div>;

  const statusIcons = {
    COMPLETED: <CheckCircle2 size={16} color="var(--success-text)" />,
    IN_PROGRESS: <Clock size={16} color="var(--warning-text)" />,
    ASSIGNED: <BookOpen size={16} color="var(--info-text)" />,
    FAILED: <AlertTriangle size={16} color="var(--danger-text)" />,
  };

  const quickStats = [
    { label: 'Assigned', value: enrollments.length, icon: BookOpen },
    { label: 'Completed', value: enrollments.filter(e => e.status === 'COMPLETED').length, icon: CheckCircle2 },
    { label: 'In Progress', value: enrollments.filter(e => e.status === 'IN_PROGRESS').length, icon: Clock },
    { label: 'Certificates', value: certificates.length, icon: Award },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
          Welcome back, <span style={{ color: 'var(--navy)' }}>{user?.name?.split(' ')[0] || 'Learner'}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your assigned cybersecurity training and progress</p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {quickStats.map((s, i) => {
          const Icon = s.icon;
          const displayValue = Math.round(s.value * animProgress);
          return (
            <div
              key={i}
              className="surface-card"
              style={{
                padding: '20px', textAlign: 'left', cursor: 'default', position: 'relative', overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderColor = 'var(--navy)';
                const bar = e.currentTarget.querySelector('.stat-accent-bar');
                if (bar) bar.style.transform = 'scaleX(1)';
                const iconBox = e.currentTarget.querySelector('.stat-icon');
                if (iconBox) iconBox.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderColor = 'var(--border)';
                const bar = e.currentTarget.querySelector('.stat-accent-bar');
                if (bar) bar.style.transform = 'scaleX(0)';
                const iconBox = e.currentTarget.querySelector('.stat-icon');
                if (iconBox) iconBox.style.transform = 'scale(1)';
              }}
            >
              <div
                className="stat-accent-bar"
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'var(--navy)',
                  transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s ease'
                }}
              />
              <div
                className="stat-icon"
                style={{
                  width: '40px', height: '40px', borderRadius: '12px', marginBottom: '12px',
                  background: 'var(--icon-tile)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.2s ease'
                }}
              >
                <Icon size={18} color="var(--orange)" />
              </div>
              <div className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.9rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{displayValue}</div>
              <div className="stat-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Assigned Training Cards */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>My Training</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {enrollments.map(en => {
          const course = en.courseId;
          if (!course) return null;
          const animatedPct = Math.round((en.progressPercentage || 0) * animProgress);
          return (
            <div
              key={en._id}
              className="surface-card"
              style={{ padding: '22px', position: 'relative', overflow: 'hidden', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderColor = 'var(--navy)';
                const bar = e.currentTarget.querySelector('.course-accent-bar');
                if (bar) bar.style.transform = 'scaleX(1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderColor = 'var(--border)';
                const bar = e.currentTarget.querySelector('.course-accent-bar');
                if (bar) bar.style.transform = 'scaleX(0)';
              }}
            >
              <div
                className="course-accent-bar"
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'var(--navy)',
                  transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s ease'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{course.title}</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{course.category} &bull; {course.estimatedDuration}min</div>
                </div>
                <span className={`badge ${en.status === 'COMPLETED' ? 'badge-green' : en.status === 'IN_PROGRESS' ? 'badge-amber' : en.status === 'FAILED' ? 'badge-rose' : 'badge-slate'}`}>
                  {statusIcons[en.status]}
                  {formatStatus(en.status)}
                </span>
              </div>
              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--border)', marginBottom: '12px', overflow: 'hidden' }}>
                <div style={{
                  width: `${animatedPct}%`, height: '100%', borderRadius: '4px',
                  background: 'var(--orange)',
                  transition: 'width 0.6s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>{animatedPct}% Complete</span>
                <Link to={`/employee/course/${course._id}`} className="btn-outline" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                  {en.status === 'COMPLETED' ? 'Review' : en.progressPercentage > 0 ? 'Continue' : 'Start'} <ArrowRight size={12} />
                </Link>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
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
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>My Certificates</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {certificates.map(cert => (
              <div
                key={cert._id}
                className="surface-card"
                style={{ padding: '22px', position: 'relative', overflow: 'hidden', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  e.currentTarget.style.borderColor = 'var(--navy)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--navy)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-card)'
                  }}>
                    <Award size={22} color="var(--card)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{cert.courseName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{cert.certificateId}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Score: <strong style={{ color: 'var(--success-text)' }}>{cert.score}%</strong> &bull; Issued: {new Date(cert.issuedAt).toLocaleDateString()}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <a href={`/verify/${cert.certificateId}`} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>Verify Online</a>
                  {cert.pdfUrl && <a href={new URL(cert.pdfUrl, import.meta.env.VITE_BACKEND_URL || window.location.origin).toString()} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>Download PDF</a>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}