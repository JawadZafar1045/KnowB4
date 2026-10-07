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

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '60px', textAlign: 'center' }}>Loading course content...</div>;
  if (!course) return <div style={{ color: 'var(--danger-text)', padding: '40px' }}>Course not found.</div>;

  const allLessons = [];
  (course.modules || []).forEach(mod => (mod.lessons || []).forEach(l => allLessons.push(l)));
  const completedCount = allLessons.filter(l => isLessonCompleted(l._id)).length;
  const totalLessons = allLessons.length;
  const allDone = completedCount === totalLessons;

  return (
    <div style={{ display: 'flex', gap: '24px', minHeight: 'calc(100vh - 160px)' }}>
      {/* Sidebar: Module/Lesson Checklist */}
      <aside style={{
        width: '300px', flexShrink: 0, background: 'var(--navy)',
        borderRadius: '12px', border: '1px solid #1D3858', padding: '20px', overflowY: 'auto',
        boxShadow: 'var(--shadow-card)'
      }}>
        <Link to="/employee" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--card)', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '16px' }}>
          <ChevronLeft size={14} /> Back to Training
        </Link>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--card)', marginBottom: '4px' }}>{course.title}</h3>
        <div style={{ fontSize: '0.78rem', color: 'var(--card)', marginBottom: '16px' }}>
          {completedCount}/{totalLessons} lessons completed
        </div>
        {/* Progress bar */}
        <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--border)', marginBottom: '20px' }}>
          <div style={{ width: `${totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0}%`, height: '100%', borderRadius: '3px', background: 'var(--orange)', transition: 'width 0.4s ease' }} />
        </div>

        {(course.modules || []).map((mod, modIdx) => (
          <div key={mod._id} style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--card)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
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
                    border: isActive ? '1px solid #64748B' : '1px solid var(--navy)',
                    background: isActive ? '#1D3858' : 'var(--navy)',
                    color: done ? 'var(--success-text)' : 'var(--card)',
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
          <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #1D3858' }}>
            <Link
              to={`/employee/course/${courseId}/quiz`}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 14px', borderRadius: '8px',
                background: allDone ? '#1D3858' : 'var(--navy)',
                border: `1px solid ${allDone ? '#64748B' : '#1D3858'}`,
                color: allDone ? 'var(--success-text)' : 'var(--card)',
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
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>{activeLesson.title}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {activeLesson.description}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <span style={{ background: 'var(--navy)', color: 'var(--card)', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>{activeLesson.contentType}</span>
                <span style={{ background: 'var(--navy)', color: 'var(--card)', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>{activeLesson.duration}min</span>
                {activeLesson.isRequired && <span style={{ background: 'var(--warning-bg)', color: 'var(--card)', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>Required</span>}
              </div>
            </div>

            {/* Content Area */}
            <div className="surface-card" style={{ padding: '32px', minHeight: '300px' }}>
              {activeLesson.contentType === 'TEXT' && activeLesson.textContent ? (
                <div style={{
                  fontSize: '0.92rem', color: 'var(--text)', lineHeight: '1.7',
                  whiteSpace: 'pre-wrap'
                }}>
                  {activeLesson.textContent.split('\n').map((line, i) => {
                    if (line.startsWith('###')) return <h3 key={i} style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginTop: '20px', marginBottom: '10px' }}>{line.replace(/^###\s*/, '')}</h3>;
                    if (line.startsWith('####')) return <h4 key={i} style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginTop: '16px', marginBottom: '6px' }}>{line.replace(/^####\s*/, '')}</h4>;
                    if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: '16px', marginBottom: '4px', color: 'var(--text)' }}>{line.replace(/^- /, '')}</li>;
                    if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) return <li key={i} style={{ marginLeft: '16px', marginBottom: '4px', color: 'var(--text)' }}>{line}</li>;
                    if (line.startsWith('*') && line.endsWith('*')) return <em key={i} style={{ display: 'block', color: 'var(--navy)', marginTop: '12px' }}>{line.replace(/\*/g, '')}</em>;
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i} style={{ marginBottom: '8px' }}>{line}</p>;
                  })}
                </div>
              ) : activeLesson.contentType === 'VIDEO' ? (
                <div>
                  {(() => {
                    const url = activeLesson.contentUrl || '';
                    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);

                    if (ytMatch) {
                      return (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '10px', marginBottom: '20px' }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                            title={activeLesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '10px' }}
                          />
                        </div>
                      );
                    }
                    if (vimeoMatch) {
                      return (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '10px', marginBottom: '20px' }}>
                          <iframe
                            src={`https://player.vimeo.com/video/${vimeoMatch[3]}`}
                            title={activeLesson.title}
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '10px' }}
                          />
                        </div>
                      );
                    }
                    if (/\.(mp4|webm|ogg)($|\?)/i.test(url)) {
                      return (
                        <video controls style={{ width: '100%', maxHeight: '460px', borderRadius: '10px', marginBottom: '20px', backgroundColor: 'var(--text)' }}>
                          <source src={url} />
                          Your browser does not support the video tag.
                        </video>
                      );
                    }
                    return (
                      <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'var(--surface-muted)', borderRadius: '10px', marginBottom: '20px' }}>
                        <Play size={44} color="var(--navy)" style={{ margin: '0 auto 12px' }} />
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Video Training Resource</h4>
                        {url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ display: 'inline-flex', marginTop: '8px' }}>
                            Launch External Video ↗
                          </a>
                        ) : (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No video link provided for this lesson.</p>
                        )}
                      </div>
                    );
                  })()}

                  {activeLesson.textContent && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', fontSize: '0.92rem', color: 'var(--text)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>Lesson Notes & Guidelines:</h4>
                      {activeLesson.textContent}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ textAlign: 'center', padding: '40px 24px', backgroundColor: 'var(--surface-muted)', borderRadius: '10px', marginBottom: '20px' }}>
                    <BookOpen size={44} color="var(--navy)" style={{ margin: '0 auto 12px' }} />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                      {activeLesson.contentType === 'PDF' ? 'PDF Document / Policy Guide' : 'External Security Resource'}
                    </h4>
                    {activeLesson.contentUrl ? (
                      <a href={activeLesson.contentUrl} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ display: 'inline-flex', marginTop: '8px' }}>
                        Open Document ↗
                      </a>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No document link provided.</p>
                    )}
                  </div>
                  {activeLesson.textContent && (
                    <div style={{ fontSize: '0.92rem', color: 'var(--text)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                      {activeLesson.textContent}
                    </div>
                  )}
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
                <span style={{ background: 'var(--success-bg)', color: 'var(--success-text)', fontSize: '0.85rem', fontWeight: 700, padding: '8px 16px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} /> Lesson Completed
                </span>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
            Select a lesson from the sidebar to begin.
          </div>
        )}
      </main>
    </div>
  );
}