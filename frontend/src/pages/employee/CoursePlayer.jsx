import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft, CheckCircle2, Circle, BookOpen, FileText, Play, ArrowRight } from 'lucide-react';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/courses/${courseId}`),
      api.get(`/progress/course/${courseId}`)
    ]).then(([courseRes, progressRes]) => {
      setCourse(courseRes.data.course);
      setProgress(progressRes.data.progressRecords || []);
      // Select first incomplete lesson or first lesson
      const allLessons = [];
      (courseRes.data.course.modules || []).forEach(mod => {
        (mod.lessons || []).forEach(l => allLessons.push(l));
      });
      const firstIncomplete = allLessons.find(l => !progressRes.data.progressRecords?.some(p => p.lessonId === l._id && p.completed));
      setActiveLesson(firstIncomplete || allLessons[0] || null);
    }).catch(console.error).finally(() => setLoading(false));
  }, [courseId]);

  const isLessonCompleted = (lessonId) => progress.some(p => p.lessonId === lessonId && p.completed);

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    try {
      await api.post(`/progress/lesson/${activeLesson._id}`, { completed: true, watchProgress: 100 });
      setProgress(prev => [...prev.filter(p => p.lessonId !== activeLesson._id), { lessonId: activeLesson._id, completed: true }]);
      // Move to next lesson
      const allLessons = [];
      (course.modules || []).forEach(mod => (mod.lessons || []).forEach(l => allLessons.push(l)));
      const currentIdx = allLessons.findIndex(l => l._id === activeLesson._id);
      if (currentIdx < allLessons.length - 1) {
        setActiveLesson(allLessons[currentIdx + 1]);
      }
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  if (loading) return <div style={{ color: '#71717a', padding: '60px', textAlign: 'center' }}>Loading course content...</div>;
  if (!course) return <div style={{ color: '#dc2626', padding: '40px' }}>Course not found.</div>;

  const allLessons = [];
  (course.modules || []).forEach(mod => (mod.lessons || []).forEach(l => allLessons.push(l)));
  const completedCount = allLessons.filter(l => isLessonCompleted(l._id)).length;
  const totalLessons = allLessons.length;
  const allDone = completedCount === totalLessons;

  return (
    <div style={{ display: 'flex', gap: '24px', minHeight: 'calc(100vh - 160px)' }}>
      {/* Sidebar: Module/Lesson Checklist */}
      <aside style={{
        width: '300px', flexShrink: 0, background: 'linear-gradient(160deg, #2f6c8b 0%, #356c89 55%, #3d7491 100%)',
        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', overflowY: 'auto',
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
      }}>
        <Link to="/employee" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '16px' }}>
          <ChevronLeft size={14} /> Back to Training
        </Link>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>{course.title}</h3>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>
          {completedCount}/{totalLessons} lessons completed
        </div>
        {/* Progress bar */}
        <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.2)', marginBottom: '20px' }}>
          <div style={{ width: `${totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0}%`, height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #ffffff, #a5c8d7)', transition: 'width 0.4s ease' }} />
        </div>

        {(course.modules || []).map((mod, modIdx) => (
          <div key={mod._id} style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Module {modIdx + 1}: {mod.title}
            </div>
            {(mod.lessons || []).map((lesson) => {
              const done = isLessonCompleted(lesson._id);
              const isActive = activeLesson?._id === lesson._id;
              return (
                <button
                  key={lesson._id}
                  onClick={() => setActiveLesson(lesson)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '8px 12px', borderRadius: '8px',
                    border: isActive ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                    background: isActive ? 'rgba(255,255,255,0.16)' : 'transparent',
                    color: done ? '#a5f3c4' : isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer', textAlign: 'left',
                    fontSize: '0.82rem', fontWeight: isActive ? 600 : 400,
                    marginBottom: '4px', transition: 'all 0.15s ease'
                  }}
                >
                  {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Quiz Link */}
        {course.quiz && (
          <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <Link
              to={`/employee/course/${courseId}/quiz`}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 14px', borderRadius: '8px',
                background: allDone ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${allDone ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)'}`,
                color: allDone ? '#a5f3c4' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700,
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={16} />
              Take Final Assessment
              {allDone && <ArrowRight size={14} style={{ marginLeft: 'auto' }} />}
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content Viewer */}
      <main style={{ flex: 1 }}>
        {activeLesson ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#18181b', marginBottom: '4px' }}>{activeLesson.title}</h2>
              <p style={{ fontSize: '0.85rem', color: '#71717a' }}>
                {activeLesson.description}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <span className="badge badge-cyan">{activeLesson.contentType}</span>
                <span className="badge badge-slate">{activeLesson.duration}min</span>
                {activeLesson.isRequired && <span className="badge badge-amber">Required</span>}
              </div>
            </div>

            {/* Content Area */}
            <div className="glass-card" style={{ padding: '32px', minHeight: '300px' }}>
              {activeLesson.contentType === 'TEXT' && activeLesson.textContent ? (
                <div style={{
                  fontSize: '0.92rem', color: '#27272a', lineHeight: '1.7',
                  whiteSpace: 'pre-wrap'
                }}>
                  {activeLesson.textContent.split('\n').map((line, i) => {
                    if (line.startsWith('###')) return <h3 key={i} style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181b', marginTop: '20px', marginBottom: '10px' }}>{line.replace(/^###\s*/, '')}</h3>;
                    if (line.startsWith('####')) return <h4 key={i} style={{ fontSize: '1rem', fontWeight: 600, color: '#18181b', marginTop: '16px', marginBottom: '6px' }}>{line.replace(/^####\s*/, '')}</h4>;
                    if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: '16px', marginBottom: '4px', color: '#27272a' }}>{line.replace(/^- /, '')}</li>;
                    if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) return <li key={i} style={{ marginLeft: '16px', marginBottom: '4px', color: '#27272a' }}>{line}</li>;
                    if (line.startsWith('*') && line.endsWith('*')) return <em key={i} style={{ display: 'block', color: '#356c89', marginTop: '12px' }}>{line.replace(/\*/g, '')}</em>;
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i} style={{ marginBottom: '8px' }}>{line}</p>;
                  })}
                </div>
              ) : activeLesson.contentType === 'VIDEO' ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <Play size={48} color="#356c89" />
                  <p style={{ color: '#71717a', marginTop: '12px' }}>Video content: {activeLesson.contentUrl || 'No URL configured'}</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#71717a' }}>
                  <BookOpen size={48} color="#a1a1aa" />
                  <p style={{ marginTop: '12px' }}>Content type: {activeLesson.contentType}</p>
                </div>
              )}
            </div>

            {/* Mark Complete Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '12px' }}>
              {!isLessonCompleted(activeLesson._id) ? (
                <button className="btn-primary" onClick={handleMarkComplete}>
                  <CheckCircle2 size={16} /> Mark Complete & Next Lesson
                </button>
              ) : (
                <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                  <CheckCircle2 size={14} /> Lesson Completed
                </span>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px', color: '#71717a' }}>
            Select a lesson from the sidebar to begin.
          </div>
        )}
      </main>
    </div>
  );
}