import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft, Clock, CheckCircle2, XCircle, Award, ArrowRight, RotateCcw } from 'lucide-react';

export default function QuizPlayer() {
  const { courseId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    api.get(`/quizzes/course/${courseId}`)
      .then(res => {
        setQuiz(res.data.quiz);
        if (res.data.quiz.timeLimit) {
          setTimeLeft(res.data.quiz.timeLimit * 60);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleSelectOption = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    const formattedAnswers = quiz.questions.map(q => ({
      questionId: q._id,
      selectedOption: answers[q._id] !== undefined ? answers[q._id] : -1
    }));

    try {
      const res = await api.post(`/quizzes/${quiz._id}/submit`, {
        answers: formattedAnswers,
        campaignId: null
      });
      setResult(res.data);
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quiz');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div style={{ color: '#71717a', padding: '60px', textAlign: 'center' }}>Loading assessment...</div>;
  if (!quiz) return <div style={{ color: '#dc2626', padding: '40px' }}>No quiz found for this course.</div>;

  // Already passed state
  if (quiz.hasPassed && !submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '48px' }}>
          <CheckCircle2 size={64} color="#15803d" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181b', marginTop: '16px' }}>Assessment Passed!</h2>
          <p style={{ color: '#71717a', marginTop: '8px' }}>You already achieved a passing score of <strong style={{ color: '#15803d' }}>{quiz.bestScore}%</strong></p>
          <Link to="/employee" className="btn-primary" style={{ marginTop: '20px' }}>
            <ArrowRight size={16} /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // No attempts remaining
  if (quiz.attemptsRemaining <= 0 && !quiz.hasPassed && !submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '48px' }}>
          <XCircle size={64} color="#dc2626" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181b', marginTop: '16px' }}>All Attempts Exhausted</h2>
          <p style={{ color: '#71717a', marginTop: '8px' }}>You've used all {quiz.attemptsAllowed} attempts. Best score: {quiz.bestScore}%. Contact your administrator.</p>
          <Link to="/employee" className="btn-secondary" style={{ marginTop: '20px' }}>Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Result screen
  if (submitted && result) {
    return (
      <div style={{ maxWidth: '700px', margin: '40px auto' }}>
        <div className="glass-card" style={{
          padding: '40px', textAlign: 'center',
          border: result.passed ? '1px solid rgba(21,128,61,0.4)' : '1px solid rgba(220,38,38,0.4)'
        }}>
          {result.passed ? <CheckCircle2 size={64} color="#15803d" /> : <XCircle size={64} color="#dc2626" />}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b', marginTop: '16px' }}>
            {result.passed ? '🎉 Assessment Passed!' : 'Assessment Not Passed'}
          </h2>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: result.passed ? '#15803d' : '#dc2626', marginTop: '12px' }}>
            {result.score}%
          </div>
          <p style={{ color: '#71717a', marginTop: '8px' }}>
            {result.correctCount}/{result.totalQuestions} correct &bull; Passing: {result.passingScore}% &bull; Attempt {result.attemptNumber}
          </p>
          {result.certificate && (
            <div style={{ marginTop: '20px', padding: '16px', borderRadius: '10px', background: 'rgba(53,108,137,0.08)', border: '1px solid rgba(53,108,137,0.25)' }}>
              <Award size={28} color="#356c89" />
              <div style={{ fontWeight: 700, color: '#18181b', marginTop: '8px' }}>Certificate Issued!</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#356c89', fontSize: '0.9rem' }}>{result.certificate.certificateId}</div>
            </div>
          )}

          {/* Review Answers */}
          <div style={{ marginTop: '28px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', marginBottom: '16px' }}>Answer Review</h3>
            {(result.feedback || []).map((fb, i) => (
              <div key={i} style={{
                padding: '16px', borderRadius: '10px', marginBottom: '12px',
                background: fb.isCorrect ? 'rgba(21,128,61,0.08)' : 'rgba(220,38,38,0.08)',
                border: `1px solid ${fb.isCorrect ? 'rgba(21,128,61,0.25)' : 'rgba(220,38,38,0.25)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  {fb.isCorrect ? <CheckCircle2 size={16} color="#15803d" style={{ marginTop: '2px' }} /> : <XCircle size={16} color="#dc2626" style={{ marginTop: '2px' }} />}
                  <span style={{ fontWeight: 600, color: '#18181b', fontSize: '0.9rem' }}>Q{i + 1}: {fb.questionText}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#71717a', marginLeft: '24px' }}>
                  {fb.explanation}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
            <Link to="/employee" className="btn-secondary"><ArrowRight size={14} /> Back to Dashboard</Link>
            {result.certificate && (
              <Link to="/employee/certificates" className="btn-primary"><Award size={14} /> View Certificates</Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz
  const question = quiz.questions[currentQ];
  const totalQ = quiz.questions.length;

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <Link to={`/employee/course/${courseId}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#71717a', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '16px' }}>
        <ChevronLeft size={14} /> Back to Course
      </Link>

      {/* Quiz Header */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181b' }}>{quiz.title}</h2>
          <div style={{ fontSize: '0.78rem', color: '#71717a' }}>
            Pass: {quiz.passingScore}% &bull; Attempt {quiz.attemptsCount + 1} of {quiz.attemptsAllowed}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {timeLeft !== null && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '8px',
              background: timeLeft < 60 ? 'rgba(220,38,38,0.12)' : 'rgba(53,108,137,0.1)',
              color: timeLeft < 60 ? '#dc2626' : '#356c89',
              fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '1rem'
            }}>
              <Clock size={16} /> {formatTime(timeLeft)}
            </div>
          )}
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#18181b' }}>
            {currentQ + 1} / {totalQ}
          </div>
        </div>
      </div>

      {/* Question Progress Dots */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', justifyContent: 'center' }}>
        {quiz.questions.map((_, i) => {
          const isCurrent = i === currentQ;
          const isAnswered = answers[quiz.questions[i]._id] !== undefined;
          return (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: isCurrent ? '#356c89' : isAnswered ? 'rgba(53,108,137,0.12)' : '#f4f4f5',
                border: isCurrent ? '2px solid #4e86a0' : isAnswered ? '1px solid rgba(53,108,137,0.3)' : '1px solid #e4e4e7',
                color: isCurrent ? '#ffffff' : isAnswered ? '#356c89' : '#71717a',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>
          Question {currentQ + 1}
        </h3>
        <p style={{ fontSize: '0.95rem', color: '#27272a', marginBottom: '24px', lineHeight: '1.6' }}>
          {question.questionText}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {question.options.map((opt, i) => {
            const selected = answers[question._id] === i;
            return (
              <button
                key={i}
                onClick={() => handleSelectOption(question._id, i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 18px', borderRadius: '10px',
                  background: selected ? 'rgba(53,108,137,0.1)' : '#ffffff',
                  border: selected ? '2px solid #356c89' : '1px solid #e4e4e7',
                  color: selected ? '#356c89' : '#27272a',
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.9rem', fontWeight: selected ? 600 : 400,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: selected ? '2px solid #356c89' : '2px solid #d4d4d8',
                  background: selected ? '#356c89' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: selected ? '#ffffff' : '#71717a',
                  flexShrink: 0
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button
          className="btn-secondary"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ(prev => prev - 1)}
          style={{ opacity: currentQ === 0 ? 0.4 : 1 }}
        >
          Previous
        </button>

        {currentQ < totalQ - 1 ? (
          <button className="btn-primary" onClick={() => setCurrentQ(prev => prev + 1)}>
            Next Question <ArrowRight size={14} />
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={handleSubmit}
            style={{ background: 'linear-gradient(135deg, #15803d 0%, #356c89 100%)' }}
          >
            Submit Assessment <CheckCircle2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}