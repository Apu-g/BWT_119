import { Handle, Position } from '@xyflow/react'

export default function CategoryNode({ data }) {
    const { label, color } = data

    return (
        <div
            className="relative px-6 py-2.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-[1.02] cursor-pointer group flex items-center justify-center min-w-[140px]"
            style={{
                background: `linear-gradient(135deg, ${color.bg}, ${color.bg}80)`,
                border: `2px solid ${color.border}`,
                boxShadow: `0 0 25px ${color.border}40, 0 4px 15px rgba(0,0,0,0.5)`,
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-transparent !border-0 !w-0 !h-0"
            />

            {/* Glowing inner shadow */}
            <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 15px ${color.border}80` }}
            />

            <h3 className="text-sm font-bold tracking-widest uppercase drop-shadow-md text-white">
                {label}
            </h3>

            <Handle
                type="source"
                position={Position.Right}
                className="!bg-transparent !border-0 !w-0 !h-0"
            />
        </div>
    )
}
