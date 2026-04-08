import { useState, useEffect } from 'react'

/**
 * Floating toast notification for schedule conflicts.
 * Shows when two events overlap within 30 minutes.
 * Auto-dismisses after 15 seconds if no action taken.
 *
 * Props:
 * - conflicts: Array of { eventA, eventB, overlapMinutes }
 * - onResolve: (conflictIndex, action, chosenEventId) => void
 * - onDismiss: (conflictIndex) => void
 */
export default function ConflictNotification({ conflicts = [], onResolve, onDismiss }) {
    const [dismissed, setDismissed] = useState(new Set())
    const [animatingOut, setAnimatingOut] = useState(new Set())

    // Auto-dismiss after 15s
    useEffect(() => {
        if (conflicts.length === 0) return
        const timers = conflicts.map((_, i) => {
            if (dismissed.has(i)) return null
            return setTimeout(() => handleDismiss(i), 15000)
        })
        return () => timers.forEach((t) => t && clearTimeout(t))
    }, [conflicts.length, dismissed])

    const handleDismiss = (index) => {
        setAnimatingOut((prev) => new Set(prev).add(index))
        setTimeout(() => {
            setDismissed((prev) => new Set(prev).add(index))
            setAnimatingOut((prev) => {
                const next = new Set(prev)
                next.delete(index)
                return next
            })
            onDismiss?.(index)
        }, 300)
    }

    const handleResolve = (index, action, eventId) => {
        setAnimatingOut((prev) => new Set(prev).add(index))
        setTimeout(() => {
            setDismissed((prev) => new Set(prev).add(index))
            onResolve?.(index, action, eventId)
        }, 300)
    }

    const visibleConflicts = conflicts
        .map((c, i) => ({ ...c, index: i }))
        .filter((c) => !dismissed.has(c.index))

    if (visibleConflicts.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
            style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {visibleConflicts.map((conflict) => {
                const isExiting = animatingOut.has(conflict.index)
                return (
                    <div
                        key={conflict.index}
                        className="pointer-events-auto rounded-xl p-4 relative overflow-hidden"
                        style={{
                            background: 'rgba(15, 20, 45, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 77, 77, 0.4)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(255, 77, 77, 0.15)',
                            animation: isExiting
                                ? 'slideOutRight 0.3s ease-in forwards'
                                : 'slideInRight 0.4s ease-out',
                        }}
                    >
                        {/* Pulsing border glow */}
                        <div className="absolute inset-0 rounded-xl pointer-events-none animate-pulse"
                            style={{
                                border: '1px solid rgba(255, 77, 77, 0.3)',
                                boxShadow: 'inset 0 0 20px rgba(255, 77, 77, 0.05)',
                            }}
                        />

                        {/* Left accent bar */}
                        <div className="absolute top-0 left-0 w-1 h-full animate-pulse"
                            style={{ background: '#ff4757', boxShadow: '0 0 12px rgba(255, 71, 87, 0.6)' }}
                        />

                        {/* Close button */}
                        <button
                            onClick={() => handleDismiss(conflict.index)}
                            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-xs transition-all duration-150 hover:scale-110"
                            style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}
                        >
                            ✕
                        </button>

                        <div className="pl-3">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">⚠️</span>
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ff4757' }}>
                                    Schedule Conflict
                                </span>
                            </div>

                            {/* Conflict details */}
                            <p className="text-xs font-medium mb-1" style={{ color: '#e2e8f0' }}>
                                <span className="font-bold" style={{ color: '#ffa502' }}>"{conflict.eventA?.title}"</span>
                                {' '}overlaps with{' '}
                                <span className="font-bold" style={{ color: '#ffa502' }}>"{conflict.eventB?.title}"</span>
                            </p>
                            <p className="text-[10px] font-mono mb-3" style={{ color: '#64748b' }}>
                                {conflict.overlapMinutes} min overlap detected
                            </p>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleResolve(conflict.index, 'reschedule', conflict.eventB?.id)}
                                    className="flex-1 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
                                    style={{
                                        background: 'rgba(255, 159, 67, 0.15)',
                                        border: '1px solid rgba(255, 159, 67, 0.3)',
                                        color: '#ff9f43',
                                    }}
                                >
                                    🔄 Reschedule
                                </button>
                                <button
                                    onClick={() => handleResolve(conflict.index, 'keep', null)}
                                    className="flex-1 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
                                    style={{
                                        background: 'rgba(61, 220, 151, 0.1)',
                                        border: '1px solid rgba(61, 220, 151, 0.25)',
                                        color: '#3ddc97',
                                    }}
                                >
                                    ✓ Keep Both
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(120%); opacity: 0; }
                    to   { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to   { transform: translateX(120%); opacity: 0; }
                }
            `}</style>
        </div>
    )
}
