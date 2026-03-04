import { getPriorityColor } from '../lib/priorityEngine'

export default function PriorityCard({ item, index }) {
    const color = getPriorityColor(item.priority)
    const isBreak = item.type === 'break'
    const isCritical = item.priority > 15

    return (
        <div
            className="relative animate-slide-up group"
            style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'backwards',
            }}
        >
            <div className={`
                relative bg-neuravex-bg border-4 border-neuravex-border p-3 sm:p-5 shadow-neo transition-all hover:-translate-x-1 hover:-translate-y-1
                ${isBreak ? 'border-neuravex-muted opacity-80' : ''}
            `}
                style={{
                    '--tw-shadow-color': isBreak ? '#e5e7eb' : color.border
                }}>
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    {/* Time column - Horizontal on mobile, vertical on desktop */}
                    <div className="flex sm:flex-col items-center sm:items-stretch justify-between sm:justify-start w-full sm:w-auto sm:text-center sm:min-w-[80px] border-b-2 sm:border-b-0 border-neuravex-border pb-3 sm:pb-0 opacity-80 sm:opacity-100">
                        <div className="flex sm:flex-col items-baseline sm:items-center gap-2 sm:gap-0">
                            <p className="text-[10px] font-black font-mono text-neuravex-text opacity-50 uppercase tracking-widest hidden sm:block">{item.startDate}</p>
                            <p className="text-lg sm:text-xl font-black text-neuravex-text tracking-tighter sm:mt-1">{item.startTime}</p>
                        </div>
                        <div className="hidden sm:block w-full h-1 bg-neuravex-border my-2 shadow-neo-sm opacity-30" />
                        <span className="sm:hidden text-xs font-black mx-2 opacity-50">TO</span>
                        <p className="text-sm font-black text-neuravex-text opacity-70">{item.endTime}</p>
                    </div>

                    {/* Divider - Hidden on mobile */}
                    <div
                        className="hidden sm:block w-1.5 self-stretch border-r-2 border-neuravex-border opacity-20 min-h-[70px]"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-start sm:items-center gap-3 mb-2">
                            <span className="text-xl sm:text-2xl filter drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)] mt-1 sm:mt-0">
                                {item.actionIcon || (isBreak ? '☕' : '📅')}
                            </span>
                            <div className="flex flex-col flex-1 min-w-0 pr-12 sm:pr-0">
                                <span className={`text-[10px] w-fit font-black uppercase tracking-widest px-2 border-2 ${isBreak ? 'bg-neuravex-surface text-neuravex-text border-neuravex-muted' :
                                    'bg-neuravex-accent-light text-neuravex-bg border-neuravex-border'
                                    }`}>
                                    {isBreak ? 'system break' : item.type || 'event'}
                                </span>
                                <h3 className={`text-lg sm:text-xl font-black uppercase tracking-tight truncate mt-1 ${isBreak ? 'text-neuravex-text/50' : 'text-neuravex-text'}`} title={item.title}>
                                    {item.title}
                                </h3>
                            </div>
                        </div>

                        {/* Action clause */}
                        {item.action && !isBreak && (
                            <div className="mt-4 bg-neuravex-surface border-2 border-neuravex-border p-3 shadow-neo-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: color.border }} />
                                <p className="text-sm font-black uppercase tracking-tight" style={{ color: color.border }}>
                                    {item.action}
                                </p>
                                {item.recommendation && (
                                    <p className="text-xs text-neuravex-text font-bold mt-1 font-mono">
                                        {item.recommendation}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Break recommendation */}
                        {isBreak && item.recommendation && (
                            <p className="text-sm text-neuravex-text font-black font-mono mt-2 opacity-60">
                                {item.recommendation}
                            </p>
                        )}

                        {/* Tags row */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4">
                            {item.category && (
                                <span
                                    className="px-2 py-0 border-2 text-[10px] font-black uppercase tracking-widest bg-neuravex-surface mb-1 sm:mb-0"
                                    style={{ borderColor: color.border, color: color.border }}
                                >
                                    {item.category}
                                </span>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-neuravex-text uppercase tracking-widest bg-neuravex-surface px-2 border-2 border-neuravex-border">
                                    ⏱ {item.duration} min
                                </span>
                            </div>
                            {item.venue && (
                                <span className="text-[10px] font-black text-neuravex-text uppercase tracking-widest opacity-60">
                                    📍 {item.venue}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Priority score - Absolute on mobile to prevent squishing */}
                    {!isBreak && (
                        <div className="absolute sm:relative top-3 right-3 sm:top-0 sm:right-0 flex-shrink-0 flex flex-col items-center gap-1 z-10">
                            <div
                                className="w-10 h-10 sm:w-14 sm:h-14 border-2 sm:border-4 border-neuravex-border flex flex-col items-center justify-center shadow-neo-sm font-black"
                                style={{ background: color.bg, color: color.border }}
                            >
                                <span className="text-sm sm:text-xl">{item.priority}</span>
                                <span className="text-[6px] sm:text-[8px] uppercase tracking-widest mt-[-2px]">pts</span>
                            </div>
                            <span className="hidden sm:block text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: color.border }}>
                                {color.label}
                            </span>
                        </div>
                    )}
                </div>

                {/* Corner Decoration */}
                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10px] right-[-10px] w-20 h-4 bg-neuravex-border rotate-45 opacity-20" />
                </div>
            </div>
        </div>
    )
}
