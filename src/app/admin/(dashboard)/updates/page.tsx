'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    RefreshCw,
    Download,
    CheckCircle2,
    AlertTriangle,
    Shield,
    Zap,
    Info,
    ChevronDown,
    ChevronUp,
    Package,
    Sparkles,
    Loader2,
    XCircle,
    AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface PackageInfo {
    name: string
    version: string
    latest: string
    wanted: string
    type: 'dependencies' | 'devDependencies'
    severity?: 'critical' | 'high' | 'moderate' | 'low'
    vulnerability?: string
    description?: string
}

interface UpdateAnalysis {
    summary: {
        total: number
        critical: number
        high: number
        moderate: number
        low: number
        security: boolean
    }
    packages: PackageInfo[]
    aiRecommendations?: string[]
}

export default function UpdatesPage() {
    const [analysis, setAnalysis] = useState<UpdateAnalysis | null>(null)
    const [loading, setLoading] = useState(true)
    const [installing, setInstalling] = useState(false)
    const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set())
    const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set())
    const [showRecommendations, setShowRecommendations] = useState(true)

    useEffect(() => {
        checkUpdates()
    }, [])

    const checkUpdates = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/admin/updates', {
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const contentType = response.headers.get('content-type')
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || errorData.error || 'Failed to check updates')
            }

            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response from server')
            }

            const data = await response.json()
            setAnalysis(data)

            // Auto-select security and critical updates
            const autoSelect = new Set<string>()
            data.packages?.forEach((pkg: PackageInfo) => {
                if (pkg.severity === 'critical' || pkg.vulnerability) {
                    autoSelect.add(pkg.name)
                }
            })
            setSelectedPackages(autoSelect)

            toast.success(`Found ${data.summary?.total || 0} update(s) available`)
        } catch (error: any) {
            console.error('Check updates error:', error)
            toast.error(error.message || 'Failed to check updates. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const togglePackage = (name: string) => {
        const newSelected = new Set(selectedPackages)
        if (newSelected.has(name)) {
            newSelected.delete(name)
        } else {
            newSelected.add(name)
        }
        setSelectedPackages(newSelected)
    }

    const toggleSelectAll = () => {
        if (selectedPackages.size === analysis?.packages.length) {
            setSelectedPackages(new Set())
        } else {
            setSelectedPackages(new Set(analysis?.packages.map(p => p.name) || []))
        }
    }

    const toggleExpand = (name: string) => {
        const newExpanded = new Set(expandedPackages)
        if (newExpanded.has(name)) {
            newExpanded.delete(name)
        } else {
            newExpanded.add(name)
        }
        setExpandedPackages(newExpanded)
    }

    const installUpdates = async () => {
        if (selectedPackages.size === 0) {
            toast.error('No packages selected')
            return
        }

        setInstalling(true)
        try {
            const response = await fetch('/api/admin/updates/install', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packages: Array.from(selectedPackages),
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to install updates')
            }

            const result = await response.json()
            toast.success(result.message || 'Updates installed successfully')

            // Refresh after installation
            await checkUpdates()
        } catch (error: any) {
            toast.error(error.message || 'Failed to install updates')
        } finally {
            setInstalling(false)
        }
    }

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case 'critical': return 'from-red-500 to-rose-500'
            case 'high': return 'from-orange-500 to-amber-500'
            case 'moderate': return 'from-yellow-500 to-lime-500'
            case 'low': return 'from-blue-500 to-cyan-500'
            default: return 'from-gray-500 to-slate-500'
        }
    }

    const getSeverityBadge = (severity?: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200'
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'low': return 'bg-blue-100 text-blue-700 border-blue-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600">Checking for updates...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Updates</h1>
                    <p className="text-gray-600 mt-1">Manage npm package updates</p>
                </div>
                <button
                    onClick={checkUpdates}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {analysis && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Total */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Total Updates</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{analysis.summary.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Critical */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Critical</p>
                                    <p className="text-3xl font-bold text-red-600 mt-1">{analysis.summary.critical}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* High */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">High Priority</p>
                                    <p className="text-3xl font-bold text-orange-600 mt-1">{analysis.summary.high}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Security</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-1">
                                        {analysis.summary.security ? 'Yes' : 'No'}
                                    </p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${analysis.summary.security ? 'bg-gradient-to-br from-purple-500 to-violet-500' : 'bg-gray-200'}`}>
                                    <Shield className={`w-6 h-6 ${analysis.summary.security ? 'text-white' : 'text-gray-400'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Recommendations */}
                    {analysis.aiRecommendations && analysis.aiRecommendations.length > 0 && (
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                            <button
                                onClick={() => setShowRecommendations(!showRecommendations)}
                                className="flex items-center gap-3 w-full"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-bold text-gray-900">AI Recommendations</h3>
                                    <p className="text-sm text-gray-600">Priority update suggestions based on security & stability</p>
                                </div>
                                {showRecommendations ? (
                                    <ChevronUp className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-600" />
                                )}
                            </button>

                            <AnimatePresence>
                                {showRecommendations && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-4 space-y-2"
                                    >
                                        {analysis.aiRecommendations.map((rec, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-3 p-3 bg-white/70 rounded-lg border border-purple-100"
                                            >
                                                <Zap className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-gray-700">{rec}</p>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-200 shadow-lg">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleSelectAll}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedPackages.size === analysis.packages.length}
                                    onChange={() => {}}
                                    className="w-4 h-4 text-orange-500 rounded"
                                />
                                {selectedPackages.size === analysis.packages.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-900">{selectedPackages.size}</span> package(s) selected
                            </p>
                        </div>

                        <button
                            onClick={installUpdates}
                            disabled={installing || selectedPackages.size === 0}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                        >
                            {installing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Installing...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Install Selected
                                </>
                            )}
                        </button>
                    </div>

                    {/* Packages List */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Available Updates</h2>
                        </div>

                        {analysis.packages.length === 0 ? (
                            <div className="p-12 text-center">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">All up to date!</h3>
                                <p className="text-gray-600">All packages are at their latest versions</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {analysis.packages.map((pkg, idx) => (
                                    <motion.div
                                        key={pkg.name}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="px-6 py-4">
                                            <div className="flex items-start gap-4">
                                                {/* Checkbox */}
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPackages.has(pkg.name)}
                                                    onChange={() => togglePackage(pkg.name)}
                                                    className="mt-1 w-4 h-4 text-orange-500 rounded"
                                                />

                                                {/* Package Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getSeverityBadge(pkg.severity)}`}>
                                                            {pkg.severity || 'low'}
                                                        </span>
                                                        {pkg.vulnerability && (
                                                            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
                                                                <Shield className="w-3 h-3" />
                                                                Security
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-600">Current:</span>
                                                            <span className="font-mono text-gray-900">{pkg.version}</span>
                                                        </div>
                                                        <span className="text-gray-400">→</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-600">Latest:</span>
                                                            <span className="font-mono text-green-600 font-semibold">{pkg.latest}</span>
                                                        </div>
                                                    </div>

                                                    {pkg.vulnerability && (
                                                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                                            <div className="flex items-start gap-2">
                                                                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-semibold text-red-900">Security Vulnerability</p>
                                                                    <p className="text-sm text-red-700 mt-1">{pkg.vulnerability}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Expand Button */}
                                                {pkg.vulnerability && (
                                                    <button
                                                        onClick={() => toggleExpand(pkg.name)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        {expandedPackages.has(pkg.name) ? (
                                                            <ChevronUp className="w-5 h-5 text-gray-600" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-gray-600" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
