import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { supabase } from '../lib/supabase'
import {
    getPriorityScore,
    getPriorityColor,
    getNodeDistance,
    sortByPriority,
} from '../lib/priorityEngine'
import EventNode from '../components/EventNode'

const nodeTypes = { eventNode: EventNode }

export default function Mindmap() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    // Fetch events
    useEffect(() => {
        async function fetchEvents() {
            try {
                const { data, error: fetchError } = await supabase
                    .from('events')
                    .select('*')
                    .order('event_datetime', { ascending: true })

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

    // Build nodes and edges when events change
    useEffect(() => {
        if (events.length === 0) {
            setNodes([
                {
                    id: 'center',
                    type: 'default',
                    position: { x: 0, y: 0 },
                    data: { label: '🧠 You' },
                    style: {
                        background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                        color: '#fff',
                        border: '2px solid #a29bfe',
                        borderRadius: '50%',
                        width: 80,
                        height: 80,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 700,
                        boxShadow: '0 0 30px #6c5ce740',
                    },
                    draggable: true,
                },
            ])
            setEdges([])
            return
        }

        const sorted = sortByPriority(events)
        const count = sorted.length
        const newNodes = []
        const newEdges = []

        // Center node
        newNodes.push({
            id: 'center',
            type: 'default',
            position: { x: 0, y: 0 },
            data: { label: '🧠 You' },
            style: {
                background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                color: '#fff',
                border: '2px solid #a29bfe',
                borderRadius: '50%',
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 700,
                boxShadow: '0 0 30px #6c5ce740',
            },
            draggable: true,
        })

        // Event nodes arranged in a circle
        sorted.forEach((event, i) => {
            const score = getPriorityScore(event)
            const distance = getNodeDistance(score)
            const angle = (2 * Math.PI * i) / count - Math.PI / 2
            const x = Math.cos(angle) * (distance + 60)
            const y = Math.sin(angle) * (distance + 60)
            const color = getPriorityColor(score)

            newNodes.push({
                id: event.id,
                type: 'eventNode',
                position: { x: x - 90, y: y - 30 },
                data: { event },
                draggable: true,
            })

            newEdges.push({
                id: `edge-${event.id}`,
                source: 'center',
                target: event.id,
                animated: score > 15,
                style: { stroke: color.border, strokeWidth: 2, opacity: 0.5 },
            })
        })

        setNodes(newNodes)
        setEdges(newEdges)
    }, [events])

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="text-center animate-pulse-slow">
                    <div className="w-16 h-16 mx-auto rounded-full bg-neuravex-accent/20 flex items-center justify-center mb-4">
                        <span className="text-2xl">🧠</span>
                    </div>
                    <p className="text-neuravex-muted text-sm">Loading your mindmap...</p>
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
        <div className="h-[calc(100vh-64px)] relative">
            {/* Event count badge */}
            <div className="absolute top-4 left-4 z-10 bg-neuravex-card/80 backdrop-blur-md border border-neuravex-border rounded-lg px-3 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neuravex-accent animate-pulse" />
                <span className="text-xs text-neuravex-muted">
                    <span className="font-semibold text-neuravex-text">{events.length}</span> events
                </span>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-neuravex-card/80 backdrop-blur-md border border-neuravex-border rounded-lg px-3 py-2 space-y-1">
                {[
                    { label: 'Critical', color: '#dc2626' },
                    { label: 'High', color: '#ea580c' },
                    { label: 'Medium', color: '#eab308' },
                    { label: 'Low', color: '#22c55e' },
                ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-[10px] text-neuravex-muted">{item.label}</span>
                    </div>
                ))}
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.3}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#1a1a2e" gap={30} size={1} />
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        if (node.id === 'center') return '#6c5ce7'
                        const event = node.data?.event
                        if (!event) return '#2a2a3e'
                        return getPriorityColor(getPriorityScore(event)).border
                    }}
                    maskColor="#0a0a0f90"
                />
            </ReactFlow>
        </div>
    )
}
