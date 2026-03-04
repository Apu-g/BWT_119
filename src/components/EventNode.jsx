import { Handle, Position } from '@xyflow/react'
import { getPriorityColor, getPriorityScore } from '../lib/priorityEngine'
import dayjs from 'dayjs'

export default function EventNode({ data }) {
    const { event } = data
    const score = getPriorityScore(event)
    const color = getPriorityColor(score)

    return (
        <div
            className="relative px-4 py-3 rounded-xl min-w-[180px] max-w-[220px] backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer group"
            style={{
                background: color.bg,
                border: `1.5px solid ${color.border}`,
                boxShadow: `0 0 20px ${color.border}30, 0 4px 12px rgba(0,0,0,0.4)`,
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-transparent !border-0 !w-0 !h-0"
            />

            {/* Priority badge */}
            <div
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: color.border, color: '#0a0a0f' }}
            >
                {score}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold truncate" style={{ color: color.text }}>
                {event.title}
            </h3>

            {/* Date */}
            <p className="text-[11px] mt-1 opacity-70 font-mono" style={{ color: color.text }}>
                {dayjs(event.event_datetime).format('MMM D, h:mm A')}
            </p>

            {/* Category */}
            <span
                className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider"
                style={{ background: `${color.border}30`, color: color.text }}
            >
                {event.category}
            </span>

            {/* Hover glow */}
            <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 20px ${color.border}20` }}
            />

            <Handle
                type="source"
                position={Position.Right}
                className="!bg-transparent !border-0 !w-0 !h-0"
            />
        </div>
    )
}
