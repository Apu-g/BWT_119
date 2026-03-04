import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
    sortByPriority,
    getPriorityScore,
    getPriorityColor,
    generateSchedule,
    enrichAndSort,
    generateAction,
} from '../lib/priorityEngine'
import PriorityCard from '../components/PriorityCard'
import dayjs from 'dayjs'

export default function Priority() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [view, setView] = useState('schedule') // 'schedule' | 'ranked'

    useEffect(() => {
        async function fetchEvents() {
            try {
                const { data, error: fetchError } = await supabase.from('events').select('*')
                if (fetchError) throw fetchError
                setEvents(data || [])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchEvents()
    }, [])

    const enrichedEvents = enrichAndSort(events)
    const schedule = generateSchedule(events)

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="text-center animate-pulse-slow">
                    <div className="w-16 h-16 mx-auto rounded-full bg-neuravex-accent/20 flex items-center justify-center mb-4">
                        <span className="text-2xl">📊</span>
                    </div>
                    <p className="text-neuravex-muted text-sm">Calculating priorities...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md text-center">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-64px)] p-6 max-w-3xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-neuravex-accent-light to-pink-400 bg-clip-text text-transparent">
                    Priority Dashboard
                </h1>
                <p className="text-neuravex-muted mt-2 text-sm">
                    AI-generated schedule with smart recommendations based on urgency and importance.
                </p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                    { label: 'Total Events', value: events.length, icon: '📅' },
                    { label: 'Critical', value: enrichedEvents.filter((e) => e.priority_score > 15).length, icon: '🔴', color: '#dc2626' },
                    { label: 'Today', value: events.filter((e) => dayjs(e.event_datetime).isSame(dayjs(), 'day')).length, icon: '📌' },
                    { label: 'Schedule Items', value: schedule.length, icon: '📋' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-neuravex-card border border-neuravex-border rounded-xl p-3 text-center">
                        <span className="text-lg">{stat.icon}</span>
                        <p className="text-xl font-bold text-neuravex-text mt-1" style={stat.color ? { color: stat.color } : {}}>
                            {stat.value}
                        </p>
                        <p className="text-[10px] text-neuravex-muted uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* View toggle */}
            <div className="flex justify-center mb-6">
                <div className="inline-flex bg-neuravex-surface border border-neuravex-border rounded-lg p-1">
                    {[
                        { id: 'schedule', label: '📋 Schedule' },
                        { id: 'ranked', label: '📊 Recommended Actions' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id)}
                            className={`px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 ${view === tab.id
                                    ? 'bg-neuravex-accent text-white shadow-lg shadow-neuravex-accent/20'
                                    : 'text-neuravex-muted hover:text-neuravex-text'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {events.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto rounded-full bg-neuravex-card flex items-center justify-center mb-4">
                        <span className="text-3xl">🌙</span>
                    </div>
                    <p className="text-neuravex-muted text-sm">No events yet. Upload something to get started!</p>
                </div>
            ) : view === 'schedule' ? (
                <div className="space-y-3">
                    {schedule.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-neuravex-muted text-sm">No upcoming events to schedule.</p>
                        </div>
                    ) : (
                        schedule.map((item, i) => (
                            <PriorityCard key={item.id} item={item} index={i} />
                        ))
                    )}
                </div>
            ) : (
                /* ===== RANKED / RECOMMENDED ACTIONS VIEW ===== */
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-neuravex-muted uppercase tracking-wider text-center mb-2">
                        Recommended Actions
                    </h2>
                    {enrichedEvents.map((event, i) => {
                        const color = event.color
                        return (
                            <div
                                key={event.id}
                                className="relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.01] animate-slide-up"
                                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
                            >
                                <div
                                    className="absolute inset-0 rounded-xl"
                                    style={{
                                        background: `linear-gradient(135deg, ${color.bg}, #12121a)`,
                                        border: `1px solid ${color.border}40`,
                                    }}
                                />

                                <div className="relative p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Rank + icon */}
                                        <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                            <div className="w-8 h-8 rounded-lg bg-neuravex-surface flex items-center justify-center text-xs font-bold text-neuravex-muted">
                                                #{i + 1}
                                            </div>
                                            <span className="text-xl">{event.actionIcon}</span>
                                        </div>

                                        {/* Main content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Event title */}
                                            <h3 className="text-base font-semibold text-neuravex-text">{event.title}</h3>
                                            <p className="text-xs text-neuravex-muted font-mono mt-0.5">
                                                {dayjs(event.event_datetime).format('ddd, MMM D · h:mm A')}
                                                {event.venue && ` · 📍 ${event.venue}`}
                                            </p>

                                            {/* Action clause highlight */}
                                            <div className="mt-3 bg-neuravex-bg/50 rounded-lg p-3 border-l-2" style={{ borderColor: color.border }}>
                                                <p className="text-sm font-medium" style={{ color: color.text }}>
                                                    ▸ {event.action}
                                                </p>
                                                <p className="text-xs text-neuravex-muted mt-1">
                                                    💡 {event.recommendation}
                                                </p>
                                                {event.studyHours && (
                                                    <p className="text-[11px] text-neuravex-accent-light mt-1">
                                                        ⏱ {event.studyHours}h recommended preparation
                                                    </p>
                                                )}
                                            </div>

                                            {/* Category tag */}
                                            <div className="flex items-center gap-2 mt-3">
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase"
                                                    style={{ background: `${color.border}20`, color: color.text }}
                                                >
                                                    {event.category}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-wider" style={{ color: color.text }}>
                                                    {color.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                                                style={{ background: `${color.border}20`, color: color.text, border: `1px solid ${color.border}40` }}
                                            >
                                                {event.priority_score}
                                            </div>
                                            <span className="text-[9px] uppercase tracking-wider font-medium" style={{ color: color.text }}>
                                                score
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
