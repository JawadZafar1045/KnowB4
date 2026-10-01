import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  ClipboardList, Download, Upload, FileSpreadsheet, X, Trash2,
  CheckCircle2, AlertTriangle, AlertCircle, Loader2, Clock, Award,
  RotateCcw, Shuffle, Layers
} from 'lucide-react';

// ---- CSV template ----
const TEMPLATE_HEADERS = [
  'question', 'type', 'option_a', 'option_b', 'option_c', 'option_d',
  'correct_answer', 'explanation', 'points', 'difficulty', 'category'
];
const TEMPLATE_ROWS = [
  ['What is phishing?', 'MCQ_SINGLE', 'A network protocol', 'A social engineering attack', 'An antivirus tool', 'A backup method', 'B', 'Phishing tricks people into giving up sensitive data.', '10', 'EASY', 'Email Security'],
  ['MFA adds a second layer of login security', 'TRUE_FALSE', '', '', '', '', 'TRUE', 'Multi-factor authentication requires a second proof of identity.', '10', 'EASY', 'Identity & Access']
];

const downloadTemplate = () => {
  const csvLine = (cells) => cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
  const csv = [TEMPLATE_HEADERS.join(','), ...TEMPLATE_ROWS.map(csvLine)].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quiz_import_template.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const card = { backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const label = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#3f3f46', marginBottom: '6px' };

export default function QuizManager() {
  // ---- reference data ----
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // ---- import form ----
  const emptyForm = {
    courseId: '',
    title: '',
    passingScore: '',
    timeLimit: 15,
    attemptsAllowed: 3,
    randomizeQuestions: false,
    randomizeOptions: false,
    replaceExisting: false
  };
  const [form, setForm] = useState(emptyForm);
  const [csvFile, setCsvFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const fileInputRef = useRef(null);

  // ---- preview (dry run) ----
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState(null); // { valid, totalRows, validCount, errors, existingQuiz, preview }
  const [previewFailed, setPreviewFailed] = useState('');

  // ---- import (real save) ----
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ---- delete ----
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadQuizzes = async (silent = false) => {
    if (!silent) setLoadingQuizzes(true);
    try {
      const res = await api.get('/quizzes');
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    loadCourses();
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(''), 3500);
    return () => clearTimeout(t);
  }, [successMsg]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const buildImportPayload = (dryRun) => ({
    courseId: form.courseId,
    csvText,
    title: form.title,
    passingScore: form.passingScore === '' ? undefined : Number(form.passingScore),
    timeLimit: Number(form.timeLimit),
    attemptsAllowed: Number(form.attemptsAllowed),
    randomizeQuestions: form.randomizeQuestions,
    randomizeOptions: form.randomizeOptions,
    replaceExisting: form.replaceExisting,
    dryRun
  });

  // Runs automatically whenever course + file are both chosen (and again if the checkbox changes)
  const runPreview = async (nextCsvText = csvText, nextCourseId = form.courseId) => {
    if (!nextCourseId || !nextCsvText) {
      setPreview(null);
      return;
    }
    setPreviewing(true);
    setPreviewFailed('');
    setImportError('');
    try {
      const res = await api.post('/quizzes/import', {
        ...buildImportPayload(true),
        courseId: nextCourseId,
        csvText: nextCsvText
      });
      setPreview(res.data);
    } catch (err) {
      setPreview(null);
      setPreviewFailed(err.response?.data?.message || 'Could not read this CSV file.');
    } finally {
      setPreviewing(false);
    }
  };

  const handleCourseChange = (courseId) => {
    setField('courseId', courseId);
    setField('replaceExisting', false);
    if (csvText) runPreview(csvText, courseId);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setPreviewFailed('Please choose a .csv file.');
      setCsvFile(null);
      setCsvText('');
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setCsvFile(file);
      setCsvText(text);
      runPreview(text, form.courseId);
    };
    reader.onerror = () => setPreviewFailed('Could not read this file.');
    reader.readAsText(file);
  };

  const clearFile = () => {
    setCsvFile(null);
    setCsvText('');
    setPreview(null);
    setPreviewFailed('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setForm(emptyForm);
    clearFile();
  };

  const canImport =
    Boolean(form.courseId) &&
    Boolean(csvText) &&
    Boolean(preview) &&
    preview.valid &&
    preview.validCount > 0 &&
    (!preview.existingQuiz || form.replaceExisting);

  const handleImport = async () => {
    if (!canImport) return;
    setImporting(true);
    setImportError('');
    try {
      const res = await api.post('/quizzes/import', buildImportPayload(false));
      setSuccessMsg(res.data.message || 'Quiz imported successfully.');
      resetForm();
      await loadQuizzes(true);
    } catch (err) {
      setImportError(err.response?.data?.message || 'Failed to import quiz.');
    } finally {
      setImporting(false);
    }
  };

  const openDeleteDialog = (quiz) => {
    setDeleteError('');
    setDeleteTarget(quiz);
  };
  const closeDeleteDialog = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError('');
  };
  const handleDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`/quizzes/${deleteTarget._id}`);
      setDeleteTarget(null);
      setSuccessMsg('Quiz deleted successfully.');
      await loadQuizzes(true);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete quiz.');
    } finally {
      setDeleting(false);
    }
  };

  const iconButtonStyle = (color = '#52525b') => ({
    width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '8px', cursor: 'pointer', color,
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

  const errorCount = preview?.errors?.length || 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>Quizzes</h1>
          <p style={{ color: '#71717a', fontSize: '0.85rem' }}>Import a course quiz from a CSV file. Each course can have one quiz.</p>
        </div>
        <button className="btn-secondary" onClick={downloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
          <Download size={15} /> Download template
        </button>
      </div>

      {successMsg && (
        <div role="status" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/*  Import quiz  */}
      <div style={{ ...card, padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181b', marginBottom: '18px' }}>Import quiz</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={label}>Course</label>
            <select className="form-input" value={form.courseId} onChange={(e) => handleCourseChange(e.target.value)}>
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={label}>CSV file</label>
            {!csvFile ? (
              <label
                htmlFor="quiz-csv-input"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 12px',
                  border: '1px dashed #d4d4d8', borderRadius: '8px', cursor: 'pointer', color: '#71717a',
                  fontSize: '0.85rem', background: '#fafafa', transition: 'border-color 0.15s, color 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#356c89'; e.currentTarget.style.color = '#356c89'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d4d4d8'; e.currentTarget.style.color = '#71717a'; }}
              >
                <Upload size={15} /> Choose CSV file
              </label>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 10px', border: '1px solid #e4e4e7', borderRadius: '8px', background: '#ffffff' }}>
                <FileSpreadsheet size={15} color="#356c89" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }} title={csvFile.name}>
                  {csvFile.name}
                </span>
                <button type="button" onClick={clearFile} title="Remove file" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a1a1aa', flexShrink: 0, display: 'flex' }}>
                  <X size={15} />
                </button>
              </div>
            )}
            <input ref={fileInputRef} id="quiz-csv-input" type="file" accept=".csv,text/csv" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>

          <div>
            <label style={label}>Quiz title (optional)</label>
            <input className="form-input" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Course name - Final Assessment" />
          </div>

          <div>
            <label style={label}>Passing score (%)</label>
            <input type="number" className="form-input" min={1} max={100} value={form.passingScore} onChange={(e) => setField('passingScore', e.target.value)} placeholder="Course default" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '14px' }}>
          <div>
            <label style={label}>Time limit (minutes, 0 = none)</label>
            <input type="number" className="form-input" min={0} value={form.timeLimit} onChange={(e) => setField('timeLimit', e.target.value)} />
          </div>
          <div>
            <label style={label}>Attempts allowed</label>
            <input type="number" className="form-input" min={1} value={form.attemptsAllowed} onChange={(e) => setField('attemptsAllowed', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.85rem', color: '#3f3f46', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.randomizeQuestions} onChange={(e) => setField('randomizeQuestions', e.target.checked)} />
            <Shuffle size={13} /> Shuffle questions
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.85rem', color: '#3f3f46', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.randomizeOptions} onChange={(e) => setField('randomizeOptions', e.target.checked)} />
            <Shuffle size={13} /> Shuffle options
          </label>
        </div>

        {previewFailed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
            <AlertCircle size={15} /> {previewFailed}
          </div>
        )}

        {previewing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#71717a', fontSize: '0.85rem', marginBottom: '16px' }}>
            <Loader2 size={15} className="spin" style={{ animation: 'spin 0.8s linear infinite' }} /> Checking your file...
          </div>
        )}

        {/* ---- Preview result ---- */}
        {preview && !previewing && (
          <div style={{ border: '1px solid #e4e4e7', borderRadius: '10px', padding: '18px', marginBottom: '20px', background: '#fafafa' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginBottom: errorCount || preview.existingQuiz ? '14px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: preview.valid ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
                {preview.valid ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                {preview.validCount} of {preview.totalRows} question(s) ready
              </div>
              {errorCount > 0 && (
                <div style={{ fontSize: '0.82rem', color: '#b91c1c' }}>{errorCount} row(s) need fixing</div>
              )}
            </div>

            {preview.existingQuiz && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '14px' }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <strong>{preview.existingQuiz.title}</strong> already exists for this course ({preview.existingQuiz.questionCount} questions).
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.replaceExisting} onChange={(e) => setField('replaceExisting', e.target.checked)} />
                    Replace existing quiz
                  </label>
                </div>
              </div>
            )}

            {errorCount > 0 && (
              <div style={{ maxHeight: '160px', overflowY: 'auto', marginBottom: preview.preview?.length ? '14px' : 0 }}>
                {preview.errors.map((er, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: '#b91c1c', padding: '4px 0', borderBottom: i < preview.errors.length - 1 ? '1px solid #fecaca' : 'none' }}>
                    {er.row > 0 ? `Row ${er.row}: ` : ''}{er.message}
                  </div>
                ))}
              </div>
            )}

            {preview.preview?.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#71717a' }}>
                      <th style={{ padding: '6px 8px' }}>Row</th>
                      <th style={{ padding: '6px 8px' }}>Question</th>
                      <th style={{ padding: '6px 8px' }}>Type</th>
                      <th style={{ padding: '6px 8px' }}>Correct answer</th>
                      <th style={{ padding: '6px 8px' }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.slice(0, 8).map((q) => (
                      <tr key={q.row} style={{ borderTop: '1px solid #e4e4e7' }}>
                        <td style={{ padding: '6px 8px', color: '#a1a1aa' }}>{q.row}</td>
                        <td style={{ padding: '6px 8px', color: '#18181b', maxWidth: '320px' }}>{q.questionText}</td>
                        <td style={{ padding: '6px 8px', color: '#71717a' }}>{q.type}</td>
                        <td style={{ padding: '6px 8px', color: '#15803d', fontWeight: 600 }}>{q.options[q.correctIndex]}</td>
                        <td style={{ padding: '6px 8px', color: '#71717a' }}>{q.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.preview.length > 8 && (
                  <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '8px' }}>
                    + {preview.preview.length - 8} more question(s)
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {importError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
            <AlertCircle size={15} /> {importError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {(csvFile || form.courseId !== '') && (
            <button type="button" className="btn-secondary" onClick={resetForm} disabled={importing} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
          <button type="button" className="btn-primary" onClick={handleImport} disabled={!canImport || importing}>
            {importing ? 'Importing...' : 'Import quiz'}
          </button>
        </div>
      </div>

      {/* ---------------- Quiz library ---------------- */}
      <div style={{ ...card, padding: '24px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181b', marginBottom: '18px' }}>Quiz library</h2>

        {loadingQuizzes ? (
          <div style={{ color: '#71717a', fontSize: '0.85rem' }}>Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <ClipboardList size={34} color="#a1a1aa" />
            <p style={{ color: '#71717a', marginTop: '12px', fontSize: '0.88rem' }}>No quizzes yet. Pick a course and upload a CSV above to create the first one.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quizzes.map((q) => (
              <div key={q._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '14px 16px', border: '1px solid #e4e4e7', borderRadius: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '9px', backgroundColor: '#356c89', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ClipboardList size={17} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#18181b' }}>{q.title}</div>
                    <div style={{ fontSize: '0.76rem', color: '#71717a' }}>{q.course?.title || 'Course removed'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: '#71717a', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={13} /> {q.questionCount} Questions</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={13} /> Pass: {q.passingScore}%</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {q.timeLimit === 0 ? 'No limit' : `${q.timeLimit}m`}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><RotateCcw size={13} /> {q.attemptsAllowed} attempts</span>
                  <span style={{ padding: '3px 10px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.72rem', background: q.status === 'ACTIVE' ? '#15803d' : '#71717a', color: '#ffffff' }}>{q.status}</span>
                </div>

                <button
                  type="button"
                  onClick={() => openDeleteDialog(q)}
                  title="Delete quiz"
                  aria-label={`Delete ${q.title}`}
                  style={iconButtonStyle()}
                  onMouseEnter={hoverOn('#b91c1c', '#fef2f2')}
                  onMouseLeave={hoverOff}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/*  Delete confirmation  */}
      {deleteTarget && (
        <div role="alertdialog" aria-modal="true" aria-labelledby="delete-quiz-title"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}>
          <div style={{ width: '440px', maxWidth: '100%', padding: '28px', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={20} color="#b91c1c" />
              </div>
              <div>
                <h2 id="delete-quiz-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>Delete this quiz?</h2>
                <p style={{ fontSize: '0.85rem', color: '#52525b', lineHeight: '1.5' }}>
                  <strong>{deleteTarget.title}</strong> will be permanently removed. This cannot be undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={closeDeleteDialog} disabled={deleting}>Cancel</button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  background: '#b91c1c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '9px 16px',
                  fontSize: '0.85rem', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}