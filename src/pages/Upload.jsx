import { useState, useRef } from 'react'

export default function Upload() {
    const [text, setText] = useState('')
    const [file, setFile] = useState(null)
    const [status, setStatus] = useState(null) // { type: 'success' | 'error', message: string }
    const [loading, setLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!text.trim() && !file) {
            setStatus({ type: 'error', message: 'Please enter text or upload a file.' })
            return
        }

        setLoading(true)
        setStatus(null)

        try {
            const formData = new FormData()
            if (file) {
                formData.append('file', file)
            }
            if (text.trim()) {
                formData.append('text', text.trim())
            }

            const res = await fetch('/api/process-event', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) throw new Error(`Server error: ${res.status}`)
            setStatus({ type: 'success', message: 'Event processed successfully ✨' })
            setText('')
            setFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Failed to process event.' })
        } finally {
            setLoading(false)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
        else if (e.type === 'dragleave') setDragActive(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files?.[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
            <div className="w-full max-w-xl animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neuravex-accent/10 border border-neuravex-accent/30 mb-4 animate-float">
                        <svg className="w-8 h-8 text-neuravex-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-neuravex-accent-light to-purple-400 bg-clip-text text-transparent">
                        Upload Event
                    </h1>
                    <p className="text-neuravex-muted mt-2 text-sm">
                        Paste text, drop a PDF, or upload an image — Neuravex will do the rest.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Text input */}
                    <div>
                        <label htmlFor="event-text" className="block text-xs font-medium text-neuravex-muted uppercase tracking-wider mb-2">
                            Event Description
                        </label>
                        <textarea
                            id="event-text"
                            rows={4}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder='e.g. "Math exam tomorrow at 4 PM in Room 201"'
                            className="w-full bg-neuravex-surface border border-neuravex-border rounded-xl p-4 text-neuravex-text placeholder-neuravex-muted/50 focus:outline-none focus:border-neuravex-accent focus:ring-1 focus:ring-neuravex-accent/30 transition-all resize-none font-mono text-sm"
                        />
                    </div>

                    {/* File upload */}
                    <div>
                        <label className="block text-xs font-medium text-neuravex-muted uppercase tracking-wider mb-2">
                            Upload File
                        </label>
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                ${dragActive
                                    ? 'border-neuravex-accent bg-neuravex-accent/5 scale-[1.02]'
                                    : 'border-neuravex-border hover:border-neuravex-accent/50 hover:bg-neuravex-surface'
                                }
              `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.webp"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                            />

                            {file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-neuravex-accent/20 flex items-center justify-center">
                                        <span className="text-lg">📄</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-neuravex-text">{file.name}</p>
                                        <p className="text-xs text-neuravex-muted">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setFile(null)
                                            if (fileInputRef.current) fileInputRef.current.value = ''
                                        }}
                                        className="ml-2 text-neuravex-muted hover:text-red-400 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <svg className="mx-auto w-10 h-10 text-neuravex-muted/50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <p className="text-sm text-neuravex-muted">
                                        Drop a <span className="text-neuravex-accent-light font-medium">PDF</span> or{' '}
                                        <span className="text-neuravex-accent-light font-medium">Image</span> here, or click to browse
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-neuravex-accent to-purple-500 hover:from-purple-500 hover:to-neuravex-accent text-white shadow-lg shadow-neuravex-accent/20 hover:shadow-neuravex-accent/40 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            'Process Event'
                        )}
                    </button>

                    {/* Status Message */}
                    {status && (
                        <div
                            className={`p-4 rounded-xl text-sm font-medium text-center animate-slide-up ${status.type === 'success'
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                                }`}
                        >
                            {status.message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
