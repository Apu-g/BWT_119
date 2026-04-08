import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { api } from '../lib/api'

const CHANGE_TYPE_CONFIG = {
    conflict_resolved: { icon: '⚠️', color: '#ff4757', label: 'Conflict Resolved' },
    rescheduled: { icon: '🔄', color: '#ffa502', label: 'Rescheduled' },
    auto_moved: { icon: '🤖', color: '#4da3ff', label: 'Auto Moved' },
    user_moved: { icon: '👤', color: '#3ddc97', label: 'User Moved' },
    completed: { icon: '✅', color: '#3ddc97', label: 'Completed' },
    skipped: { icon: '⏭️', color: '#94a3b8', label: 'Skipped' },
}

/**
 * Collapsible panel showing recent schedule changes with timeline UI.
 */
export default function ScheduleChangeLog() {
    const [changes, setChanges] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchChanges()
    }, [])

    const fetchChanges = async () => {
        try {
            const data = await api.get('/api/schedule/changes')
            if (data?.changes) {
                setChanges(data.changes)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return null
    if (error || changes.length === 0) return null

    const visibleChanges = expanded ? changes : changes.slice(0, 3)

    return (
        <div className="mb-6 sm:mb-8 animate-fade-in">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-t-xl transition-all duration-200"
                style={{
                    background: 'rgba(10, 17, 40, 0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderBottom: expanded ? '1px solid rgba(255,255,255,0.03)' : undefined,
                }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-base">📋</span>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                        Schedule Changes
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{
                        background: 'rgba(77,163,255,0.15)',
                        color: '#4da3ff',
                    }}>
                        {changes.length}
                    </span>
                </div>
                <span className="text-xs transition-transform duration-200"
                    style={{
                        color: '#64748b',
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                    }}>
                    ▼
                </span>
            </button>

            {/* Timeline */}
            <div
                className="overflow-hidden transition-all duration-300 rounded-b-xl"
                style={{
                    maxHeight: expanded ? '500px' : '200px',
                    background: 'rgba(10, 17, 40, 0.4)',
                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <div className="px-4 py-3 space-y-0">
                    {visibleChanges.map((change, i) => {
                        const config = CHANGE_TYPE_CONFIG[change.change_type] || CHANGE_TYPE_CONFIG.rescheduled
                        const meta = change.metadata || {}

                        return (
                            <div key={change.id || i} className="relative flex gap-3 pb-3"
                                style={{ borderLeft: i < visibleChanges.length - 1 ? `2px solid ${config.color}25` : '2px solid transparent', marginLeft: '8px', paddingLeft: '16px' }}>
                                {/* Timeline dot */}
                                <div className="absolute -left-[5px] top-1 w-3 h-3 rounded-full flex-shrink-0"
                                    style={{
                                        background: config.color,
                                        boxShadow: `0 0 8px ${config.color}50`,
                                    }}
                                />

                                <div className="flex-1 min-w-0">
                                    {/* Change type badge + time */}
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider"
                                            style={{
                                                background: `${config.color}15`,
                                                color: config.color,
                                                border: `1px solid ${config.color}25`,
                                            }}>
                                            {config.icon} {config.label}
                                        </span>
                                        <span className="text-[9px] font-mono" style={{ color: '#475569' }}>
                                            {dayjs(change.created_at).format('MMM D · h:mm A')}
                                        </span>
                                    </div>

                                    {/* Event title */}
                                    {meta.event_title && (
                                        <p className="text-xs font-semibold truncate" style={{ color: '#e2e8f0' }}>
                                            {meta.event_title}
                                        </p>
                                    )}

                                    {/* Time change */}
                                    {change.old_datetime && change.new_datetime && (
                                        <p className="text-[10px] font-mono mt-0.5" style={{ color: '#64748b' }}>
                                            {dayjs(change.old_datetime).format('h:mm A')}
                                            <span style={{ color: '#ff4757' }}> → </span>
                                            {dayjs(change.new_datetime).format('h:mm A, MMM D')}
                                        </p>
                                    )}

                                    {/* Reason */}
                                    <p className="text-[10px] mt-1 leading-relaxed" style={{ color: '#94a3b8' }}>
                                        💬 {change.reason}
                                    </p>

                                    {/* Conflicting event */}
                                    {meta.conflicting_title && (
                                        <p className="text-[9px] font-mono mt-0.5" style={{ color: '#fca5a5' }}>
                                            ↳ Conflict: {meta.conflicting_title}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Show more button */}
                {changes.length > 3 && !expanded && (
                    <button
                        onClick={() => setExpanded(true)}
                        className="w-full py-2 text-center text-[10px] font-semibold uppercase tracking-wider transition-all duration-200"
                        style={{ color: '#4da3ff', background: 'rgba(77,163,255,0.05)' }}>
                        View all {changes.length} changes ↓
                    </button>
                )}
            </div>
        </div>
    )
}
