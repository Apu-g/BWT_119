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
import CategoryNode from '../components/CategoryNode'

const nodeTypes = { eventNode: EventNode, categoryNode: CategoryNode }

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
        const newNodes = []
        const newEdges = []

        // 1. Center node
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

        // 2. Group events by category
        const categories = {}
        sorted.forEach((event) => {
            const cat = event.category || 'other'
            if (!categories[cat]) categories[cat] = []
            categories[cat].push(event)
        })

        const categoryKeys = Object.keys(categories)
        const catCount = categoryKeys.length

        // Category circle radius
        const catRadius = 300

        // 3. Create Category nodes and their respective Event nodes
        categoryKeys.forEach((cat, catIndex) => {
            // Determine a base color for the category using the highest priority event in that category
            const eventsInCat = categories[cat]
            const highestEvent = eventsInCat[0] // Since they are already sorted by priority
            const color = getPriorityColor(getPriorityScore(highestEvent))

            const catId = `cat-${cat}`
            const catAngle = (2 * Math.PI * catIndex) / catCount - Math.PI / 2

            // Plot category position
            const cx = Math.cos(catAngle) * catRadius
            const cy = Math.sin(catAngle) * catRadius

            // Add Category Node
            newNodes.push({
                id: catId,
                type: 'categoryNode',
                position: { x: cx - 70, y: cy - 20 },
                data: { label: cat, color },
                draggable: true,
            })

            // Add Edge from Center to Category
            newEdges.push({
                id: `edge-center-${cat}`,
                source: 'center',
                target: catId,
                type: 'default', // Bezier curve
                style: { stroke: color.border, strokeWidth: 3, opacity: 0.6 },
                animated: true,
            })

            // Radially fan out the events belonging to this category from the category node
            const eventCount = eventsInCat.length
            const spreadAngle = (Math.PI / 3) // 60 degrees spread per category cluster
            const startAngle = catAngle - spreadAngle / 2

            eventsInCat.forEach((event, eIndex) => {
                const eAngle = eventCount === 1
                    ? catAngle
                    : startAngle + (spreadAngle * (eIndex / (eventCount - 1)))

                // Add distance outward from the category node
                const score = getPriorityScore(event)
                const distanceOut = getNodeDistance(score) + 100 // Extra padding from cat node

                const ex = cx + Math.cos(eAngle) * distanceOut
                const ey = cy + Math.sin(eAngle) * distanceOut

                newNodes.push({
                    id: event.id,
                    type: 'eventNode',
                    position: { x: ex - 90, y: ey - 30 },
                    data: { event },
                    draggable: true,
                })

                newEdges.push({
                    id: `edge-${cat}-${event.id}`,
                    source: catId,
                    target: event.id,
                    type: 'default', // Bezier curve
                    animated: score > 15,
                    style: { stroke: color.border, strokeWidth: 2, opacity: 0.4 },
                })
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
