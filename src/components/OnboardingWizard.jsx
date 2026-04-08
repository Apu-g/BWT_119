import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const STEPS = [
    {
        key: 'primary_focus',
        question: "What matters most right now?",
        subtitle: "This helps us prioritize your tasks smarter.",
        options: [
            { value: 'exams', label: 'Exams / Studies', icon: '📚', desc: 'Tests, quizzes, study sessions' },
            { value: 'projects', label: 'Projects / Hackathon', icon: '🚀', desc: 'Building, shipping, coding' },
            { value: 'work', label: 'Work / Job', icon: '💼', desc: 'Professional tasks, meetings' },
            { value: 'personal', label: 'Personal / Health', icon: '🧘', desc: 'Fitness, wellness, self-care' },
        ],
    },
    {
        key: 'motivation_type',
        question: "What do you actually feel like doing?",
        subtitle: "We'll weight your schedule toward what fires you up.",
        options: [
            { value: 'study', label: 'Study', icon: '📖', desc: 'Focus, reading, note-taking' },
            { value: 'build', label: 'Build / Code', icon: '⚡', desc: 'Hands-on creation' },
            { value: 'exercise', label: 'Exercise', icon: '🏃', desc: 'Physical activity, sports' },
            { value: 'chill', label: 'Chill / Low effort', icon: '🎧', desc: 'Relaxed productivity' },
        ],
    },
    {
        key: 'preferred_slot',
        question: "When are you most active?",
        subtitle: "We'll schedule important tasks in your peak window.",
        options: [
            { value: 'morning', label: 'Morning', icon: '🌅', desc: '5 AM – 12 PM' },
            { value: 'afternoon', label: 'Afternoon', icon: '☀️', desc: '12 PM – 5 PM' },
            { value: 'evening', label: 'Evening', icon: '🌆', desc: '5 PM – 9 PM' },
            { value: 'night', label: 'Night', icon: '🌙', desc: '9 PM – 2 AM' },
        ],
    },
    {
        key: 'recovery_style',
        question: "When you miss a task, what do you usually do?",
        subtitle: "Optional — helps our repair engine adapt to you.",
        optional: true,
        options: [
            { value: 'postpone', label: 'I postpone it', icon: '📅', desc: 'Move to tomorrow' },
            { value: 'same_day', label: 'I try later same day', icon: '🔄', desc: 'Find another slot today' },
            { value: 'break_smaller', label: 'I break it smaller', icon: '✂️', desc: 'Split into mini-tasks' },
        ],
    },
]

export default function OnboardingWizard() {
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState({})
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [showSummary, setShowSummary] = useState(false)
    const navigate = useNavigate()

    const current = STEPS[step]
    const isLast = step === STEPS.length - 1
    const progress = ((step + 1) / STEPS.length) * 100

    const selectOption = (value) => {
        setAnswers((prev) => ({ ...prev, [current.key]: value }))
        setError('')
    }

    const handleNext = () => {
        if (!answers[current.key] && !current.optional) {
            setError('Please select an option')
            return
        }
        if (isLast) {
            setShowSummary(true)
        } else {
            setStep((s) => s + 1)
        }
    }

    const handleBack = () => {
        if (showSummary) {
            setShowSummary(false)
        } else if (step > 0) {
            setStep((s) => s - 1)
        }
    }

    const handleSkip = () => {
        if (isLast) {
            setShowSummary(true)
        } else {
            setStep((s) => s + 1)
        }
    }

    const handleSubmit = async () => {
        setSaving(true)
        setError('')
        try {
            await api.post('/api/onboarding/save', {
                primary_focus: answers.primary_focus || 'personal',
                motivation_type: answers.motivation_type || 'study',
                preferred_slot: answers.preferred_slot || 'evening',
                recovery_style: answers.recovery_style || 'same_day',
            })
            localStorage.setItem('chrona_onboarded', 'true')
            navigate('/')
        } catch (err) {
            setError(err.message || 'Failed to save. Try again.')
        } finally {
            setSaving(false)
        }
    }

    // Summary labels
    const getLabel = (stepKey, value) => {
        const s = STEPS.find((st) => st.key === stepKey)
        const opt = s?.options.find((o) => o.value === value)
        return opt ? `${opt.icon} ${opt.label}` : '—'
    }

    if (showSummary) {
        return (
            <div className="min-h-screen min-h-dvh flex items-center justify-center px-4 py-8"
                style={{ background: 'radial-gradient(ellipse at top, #0f1c3f 0%, #070d1f 60%, #050a18 100%)' }}>
                <div className="fixed inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(600px circle at 50% 30%, rgba(77,163,255,0.08), transparent 60%)',
                }} />
                <div className="w-full max-w-lg relative z-10 animate-fade-in">
                    {/* Summary card */}
                    <div className="rounded-2xl p-6 sm:p-8" style={{
                        background: 'rgba(15,25,60,0.7)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(77,163,255,0.15)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4"
                                style={{ background: 'linear-gradient(135deg, rgba(61,220,151,0.2), rgba(77,163,255,0.2))', border: '1px solid rgba(61,220,151,0.3)' }}>
                                ✨
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: '#e2e8f0' }}>
                                You're all set!
                            </h2>
                            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                                Here's your personalized profile
                            </p>
                        </div>

                        <div className="space-y-3 mb-6">
                            {STEPS.map((s) => (
                                <div key={s.key} className="flex items-center justify-between rounded-xl p-3"
                                    style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                                        {s.question.split('?')[0]}
                                    </span>
                                    <span className="text-sm font-semibold" style={{ color: '#4da3ff' }}>
                                        {getLabel(s.key, answers[s.key])}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={handleBack}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                                style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                                ← Back
                            </button>
                            <button onClick={handleSubmit} disabled={saving}
                                className="flex-[2] py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300"
                                style={{
                                    background: saving ? 'rgba(77,163,255,0.3)' : 'linear-gradient(135deg, #3ddc97, #4da3ff)',
                                    color: '#fff',
                                    boxShadow: saving ? 'none' : '0 4px 20px rgba(61,220,151,0.3)',
                                    opacity: saving ? 0.7 : 1,
                                }}>
                                {saving ? '⏳ Saving...' : '🚀 Start Using Chrona'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen min-h-dvh flex items-center justify-center px-4 py-8"
            style={{ background: 'radial-gradient(ellipse at top, #0f1c3f 0%, #070d1f 60%, #050a18 100%)' }}>
            <div className="fixed inset-0 pointer-events-none" style={{
                background: 'radial-gradient(600px circle at 50% 30%, rgba(77,163,255,0.08), transparent 60%)',
            }} />

            <div className="w-full max-w-lg relative z-10">
                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4da3ff' }}>
                            Question {step + 1} of {STEPS.length}
                        </span>
                        {current.optional && (
                            <button onClick={handleSkip}
                                className="text-xs font-medium px-3 py-1 rounded-full transition-all duration-200"
                                style={{ color: '#64748b', background: 'rgba(255,255,255,0.05)' }}>
                                Skip →
                            </button>
                        )}
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: `${progress}%`,
                                background: 'linear-gradient(90deg, #4da3ff, #3ddc97)',
                                boxShadow: '0 0 12px rgba(77,163,255,0.5)',
                            }}
                        />
                    </div>
                    {/* Step dots */}
                    <div className="flex justify-center gap-2 mt-3">
                        {STEPS.map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
                                style={{
                                    background: i <= step ? '#4da3ff' : 'rgba(255,255,255,0.15)',
                                    boxShadow: i === step ? '0 0 8px rgba(77,163,255,0.6)' : 'none',
                                    transform: i === step ? 'scale(1.3)' : 'scale(1)',
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Question card */}
                <div className="rounded-2xl p-6 sm:p-8 animate-fade-in" key={step} style={{
                    background: 'rgba(15,25,60,0.7)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(77,163,255,0.15)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-1" style={{ color: '#e2e8f0' }}>
                        {current.question}
                    </h2>
                    <p className="text-sm mb-6" style={{ color: '#64748b' }}>
                        {current.subtitle}
                    </p>

                    {/* Options grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {current.options.map((opt) => {
                            const selected = answers[current.key] === opt.value
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => selectOption(opt.value)}
                                    className="text-left rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5"
                                    style={{
                                        background: selected
                                            ? 'linear-gradient(135deg, rgba(77,163,255,0.15), rgba(99,102,241,0.1))'
                                            : 'rgba(0,0,0,0.25)',
                                        border: selected
                                            ? '2px solid rgba(77,163,255,0.5)'
                                            : '1px solid rgba(255,255,255,0.06)',
                                        boxShadow: selected
                                            ? '0 0 20px rgba(77,163,255,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
                                            : 'none',
                                        transform: selected ? 'scale(1.02)' : 'scale(1)',
                                    }}
                                >
                                    <span className="text-2xl block mb-2">{opt.icon}</span>
                                    <span className="text-sm font-semibold block" style={{ color: selected ? '#4da3ff' : '#e2e8f0' }}>
                                        {opt.label}
                                    </span>
                                    <span className="text-[11px] block mt-0.5" style={{ color: '#64748b' }}>
                                        {opt.desc}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {error && (
                        <div className="mb-4 px-4 py-2 rounded-xl text-xs font-medium"
                            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        {step > 0 && (
                            <button onClick={handleBack}
                                className="px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                                style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                                ←
                            </button>
                        )}
                        <button onClick={handleNext}
                            className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300"
                            style={{
                                background: answers[current.key]
                                    ? 'linear-gradient(135deg, #4da3ff, #6366f1)'
                                    : 'rgba(77,163,255,0.2)',
                                color: '#fff',
                                boxShadow: answers[current.key] ? '0 4px 20px rgba(77,163,255,0.35)' : 'none',
                            }}>
                            {isLast ? 'Review Answers' : 'Continue →'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs mt-6" style={{ color: '#475569' }}>
                    Powered by Chrona AI · Personalized Scheduling
                </p>
            </div>
        </div>
    )
}
