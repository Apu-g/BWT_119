import { useState } from 'react'

export default function CancelModal({ event, onClose, onConfirm }) {
    const [reason, setReason] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        onConfirm(event.id, reason)
    }

    if (!event) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass rounded-2xl w-full max-w-sm overflow-hidden animate-slide-up"
                style={{ borderColor: 'rgba(255, 77, 77, 0.3)', boxShadow: '0 0 30px rgba(255, 77, 77, 0.15)' }}>

                {/* Header glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-nv-critical shadow-[0_0_15px_#ff4d4d]" />

                <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                        <span className="text-2xl">✕</span>
                    </div>

                    <h2 className="text-xl font-bold text-nv-text tracking-tight mb-2">Cancel Event</h2>
                    <p className="text-sm text-nv-text-dim mb-4 leading-relaxed">
                        Are you sure you want to delete <span className="font-semibold text-nv-text">{event.title}</span>?
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-nv-text-muted uppercase tracking-wider mb-2" htmlFor="reason">
                                Cancellation Reason (Optional)
                            </label>
                            <input
                                id="reason"
                                type="text"
                                className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                                placeholder="E.g., Finished early, not needed anymore..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-nv-text-dim hover:text-white transition-colors"
                                style={{ background: 'rgba(255,255,255,0.05)' }}
                            >
                                Never mind
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
                                style={{
                                    background: 'rgba(255, 77, 77, 0.15)',
                                    color: '#ff4d4d',
                                    border: '1px solid rgba(255, 77, 77, 0.3)',
                                }}
                            >
                                Delete Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
