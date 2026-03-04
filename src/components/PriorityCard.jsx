import { getPriorityColor } from '../lib/priorityEngine'

export default function PriorityCard({ item, index }) {
    const color = getPriorityColor(item.priority)
    const isBreak = item.type === 'break'

    return (
        <div
            className="relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-slide-up"
            style={{
                animationDelay: `${index * 80}ms`,
                animationFillMode: 'backwards',
            }}
        >
            {/* Background */}
            <div
                className="absolute inset-0 rounded-xl"
                style={{
                    background: isBreak
                        ? 'linear-gradient(135deg, #1a1a2e, #12121a)'
                        : `linear-gradient(135deg, ${color.bg}, #12121a)`,
                    border: `1px solid ${isBreak ? '#2a2a3e' : color.border}40`,
                }}
            />

            {/* Content */}
            <div className="relative p-4">
                <div className="flex items-start gap-4">
                    {/* Time column */}
                    <div className="flex-shrink-0 text-center min-w-[70px]">
                        <p className="text-xs font-mono text-neuravex-muted">{item.startDate}</p>
                        <p className="text-sm font-semibold text-neuravex-text">{item.startTime}</p>
                        <div className="w-px h-3 bg-neuravex-border mx-auto my-1" />
                        <p className="text-xs font-mono text-neuravex-muted">{item.endTime}</p>
                    </div>

                    {/* Divider */}
                    <div
                        className="w-1 self-stretch rounded-full min-h-[60px]"
                        style={{ background: isBreak ? '#2a2a3e' : color.border }}
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{item.actionIcon || (isBreak ? '☕' : '📅')}</span>
                            <h3 className="text-sm font-semibold text-neuravex-text truncate">
                                {item.title}
                            </h3>
                        </div>

                        {/* Action clause */}
                        {item.action && !isBreak && (
                            <div className="mt-2 pl-1 border-l-2 border-neuravex-accent/30 ml-1">
                                <p className="text-xs font-medium text-neuravex-accent-light pl-2">
                                    Action: {item.action}
                                </p>
                                {item.recommendation && (
                                    <p className="text-[11px] text-neuravex-muted pl-2 mt-0.5">
                                        💡 {item.recommendation}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Break recommendation */}
                        {isBreak && item.recommendation && (
                            <p className="text-[11px] text-neuravex-muted mt-1 ml-7">
                                {item.recommendation}
                            </p>
                        )}

                        {/* Tags row */}
                        <div className="flex items-center gap-3 mt-2">
                            {item.category && (
                                <span
                                    className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider"
                                    style={{ background: `${color.border}20`, color: color.text }}
                                >
                                    {item.category}
                                </span>
                            )}
                            <span className="text-[11px] text-neuravex-muted font-mono">
                                {item.duration} min
                            </span>
                            {item.venue && (
                                <span className="text-[11px] text-neuravex-muted">
                                    📍 {item.venue}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Priority score */}
                    {!isBreak && (
                        <div className="flex-shrink-0 flex flex-col items-center gap-1">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                                style={{ background: `${color.border}20`, color: color.text }}
                            >
                                {item.priority}
                            </div>
                            <span className="text-[9px] uppercase tracking-wider" style={{ color: color.text }}>
                                {color.label}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
