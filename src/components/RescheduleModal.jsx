import { useState } from 'react'
import dayjs from 'dayjs'
import { supabase, getCurrentUserId } from '../lib/supabase'
import { api } from '../lib/api'

/**
 * Slide-up modal for rescheduling an event with explanation.
 *
 * Props:
 * - event: the event object to reschedule
 * - conflictingEvent: (optional) the event causing the conflict
 * - suggestedTime: (optional) ISO string for suggested new time
 * - reason: (optional) pre-filled reason
 * - onClose: () => void
 * - onRescheduled: (updatedEvent) => void
 */
export default function RescheduleModal({
    event,
    conflictingEvent,
    suggestedTime,
    reason: initialReason,
    onClose,
    onRescheduled,
}) {
    const suggested = suggestedTime
        ? dayjs(suggestedTime)
        : dayjs(event.event_datetime).add(2, 'hour')

    const [newDate, setNewDate] = useState(suggested.format('YYYY-MM-DD'))
    const [newTime, setNewTime] = useState(suggested.format('HH:mm'))
    const [reason, setReason] = useState(
        initialReason ||
        (conflictingEvent
            ? `Conflict with "${conflictingEvent.title}" — moved to avoid overlap.`
            : 'Manually rescheduled by user.')
    )
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const oldTime = dayjs(event.event_datetime)
    const newDateTime = dayjs(`${newDate}T${newTime}`)

    const handleSave = async () => {
        if (!newDate || !newTime) {
            setError('Please select a date and time')
            return
        }

        if (newDateTime.isBefore(dayjs())) {
            setError('Cannot reschedule to a past time')
            return
        }

        setSaving(true)
        setError('')

        try {
            const newISO = newDateTime.toISOString()

            // Update event in database
            const { data, error: updateErr } = await supabase
                .from('events')
                .update({ event_datetime: newISO })
                .eq('id', event.id)
                .select()

            if (updateErr) throw updateErr

            // Log the change with explanation
            try {
                await api.post('/api/schedule/changes', {
                    event_id: event.id,
                    change_type: conflictingEvent ? 'conflict_resolved' : 'user_moved',
                    old_datetime: event.event_datetime,
                    new_datetime: newISO,
                    reason,
                    conflicting_event_id: conflictingEvent?.id || null,
                    metadata: {
                        event_title: event.title,
                        conflicting_title: conflictingEvent?.title || null,
                    },
                })
            } catch (logErr) {
                console.warn('Failed to log schedule change:', logErr)
            }

            setSuccess(true)
            setTimeout(() => {
                onRescheduled?.(data?.[0] || { ...event, event_datetime: newISO })
                onClose?.()
            }, 1200)
        } catch (err) {
            setError(err.message || 'Failed to reschedule')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
            {/* Backdrop */}
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

            {/* Modal */}
            <div
                className="relative w-full max-w-md mx-4 rounded-t-2xl sm:rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(15, 22, 50, 0.97)',
                    border: '1px solid rgba(77,163,255,0.2)',
                    boxShadow: '0 -8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(77,163,255,0.1)',
                    animation: 'slideUpModal 0.35s ease-out',
                }}
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-3 flex items-center justify-between"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🔄</span>
                        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#e2e8f0' }}>
                            Reschedule Event
                        </h3>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all duration-150 hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                        ✕
                    </button>
                </div>

                <div className="px-5 py-4 space-y-4">
                    {/* Event info */}
                    <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
                            {event.title}
                        </p>
                        <p className="text-xs font-mono mt-1" style={{ color: '#64748b' }}>
                            Current: {oldTime.format('MMM D, YYYY · h:mm A')}
                        </p>
                        {conflictingEvent && (
                            <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                                <span className="text-xs">⚠️</span>
                                <span className="text-[10px] font-medium" style={{ color: '#fca5a5' }}>
                                    Conflicts with "{conflictingEvent.title}"
                                </span>
                            </div>
                        )}
                    </div>

                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-3xl mb-3"
                                style={{ background: 'rgba(61,220,151,0.15)', border: '1px solid rgba(61,220,151,0.3)' }}>
                                ✅
                            </div>
                            <p className="text-sm font-bold" style={{ color: '#3ddc97' }}>
                                Rescheduled Successfully!
                            </p>
                            <p className="text-xs font-mono mt-1" style={{ color: '#64748b' }}>
                                Moved to {newDateTime.format('MMM D · h:mm A')}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* New date/time */}
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: '#94a3b8' }}>
                                    New Date & Time
                                </label>
                                <div className="flex gap-2">
                                    <input type="date" value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#e2e8f0',
                                            colorScheme: 'dark',
                                        }}
                                    />
                                    <input type="time" value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                        className="w-28 px-3 py-2.5 rounded-xl text-sm outline-none"
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#e2e8f0',
                                            colorScheme: 'dark',
                                        }}
                                    />
                                </div>
                                {newDate && newTime && (
                                    <p className="text-[10px] font-mono mt-1.5" style={{ color: '#4da3ff' }}>
                                        → {newDateTime.format('ddd, MMM D · h:mm A')}
                                    </p>
                                )}
                            </div>

                            {/* Reason/explanation */}
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: '#94a3b8' }}>
                                    Reason for change
                                </label>
                                <textarea value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none"
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#e2e8f0',
                                    }}
                                    placeholder="Why is this being rescheduled?"
                                />
                            </div>

                            {error && (
                                <div className="px-3 py-2 rounded-xl text-xs font-medium"
                                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <button onClick={onClose}
                                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                                    style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-[2] py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300"
                                    style={{
                                        background: saving ? 'rgba(77,163,255,0.3)' : 'linear-gradient(135deg, #4da3ff, #6366f1)',
                                        color: '#fff',
                                        boxShadow: saving ? 'none' : '0 4px 20px rgba(77,163,255,0.35)',
                                    }}>
                                    {saving ? '⏳ Saving...' : '✓ Confirm Reschedule'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideUpModal {
                    from { transform: translateY(100%); opacity: 0; }
                    to   { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
