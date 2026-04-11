'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { exportAnalysisToPDF } from '@/lib/pdf-export'

interface AnalysisItem {
  id: string
  mode: string
  input: Record<string, unknown>
  output: Record<string, unknown>
  createdAt: string
}

export default function AnalysisDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const { user, loading: authLoading } = useAuth()

  const [analysis, setAnalysis] = useState<AnalysisItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (authLoading) return
    if (!id) return

    apiFetch(`/api/requests/${id}`)
      .then((data) => setAnalysis(data))
      .catch((err) => setError(err.message || 'Failed to load analysis'))
      .finally(() => setLoading(false))
  }, [authLoading, id, router, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent 
            rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Analysis not found'}</p>
          <Link href="/dashboard" 
            className="text-indigo-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(analysis.createdAt).toLocaleDateString(
    'en-US', { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const modeBadgeColors: Record<string, string> = {
    country: 'bg-blue-100 text-blue-700',
    plan: 'bg-green-100 text-green-700',
    visa: 'bg-purple-100 text-purple-700',
    cost: 'bg-orange-100 text-orange-700',
  }
  const badgeColor = modeBadgeColors[analysis.mode] || 'bg-gray-100 text-gray-700'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center 
          justify-between">
          <Link href="/dashboard"
            className="flex items-center gap-2 text-gray-600 
              hover:text-indigo-600 transition-colors text-sm font-medium">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportAnalysisToPDF(analysis)}
              className="flex items-center gap-2 bg-indigo-600 text-white 
                px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <span className="text-sm text-gray-400">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Title */}
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold 
            capitalize ${badgeColor}`}>
            {analysis.mode}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">
            Analysis Result
          </h1>
        </div>

        {/* Input card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase 
            tracking-wide mb-4">Your Profile</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(analysis.input).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 capitalize mb-1">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {String(value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Output card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase 
            tracking-wide mb-4">Analysis Result</h2>

          {/* Countries output */}
          {Array.isArray((analysis.output as any)?.countries) && (
            <div className="space-y-3">
              {(analysis.output as any).countries.map(
                (country: any, i: number) => (
                <div key={i} className="flex items-start gap-4 p-4 
                  bg-gray-50 rounded-lg">
                  <span className="text-2xl font-bold text-indigo-600 
                    min-w-[2rem]">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {country.name}
                      </h3>
                      {country.score && (
                        <span className="text-xs bg-indigo-100 
                          text-indigo-700 px-2 py-0.5 rounded-full">
                          {country.score}/100
                        </span>
                      )}
                    </div>
                    {country.visa && (
                      <p className="text-sm text-gray-600">
                        🛂 {country.visa}
                      </p>
                    )}
                    {country.cost && (
                      <p className="text-sm text-gray-600">
                        💰 {country.cost}
                      </p>
                    )}
                    {country.pros && (
                      <p className="text-sm text-green-700 mt-1">
                        ✓ {Array.isArray(country.pros) 
                          ? country.pros.join(', ') 
                          : country.pros}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Plan/phases output */}
          {Array.isArray((analysis.output as any)?.phases) && (
            <div className="space-y-3">
              {(analysis.output as any).phases.map(
                (phase: any, i: number) => (
                <div key={i} className="border-l-4 border-indigo-400 
                  pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {phase.title}
                    </h3>
                    {phase.duration && (
                      <span className="text-xs text-gray-400">
                        {phase.duration}
                      </span>
                    )}
                  </div>
                  {Array.isArray(phase.steps) && (
                    <ul className="space-y-1">
                      {phase.steps.map((step: string, j: number) => (
                        <li key={j} className="text-sm text-gray-600 
                          flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Fallback: raw JSON if structure unknown */}
          {!(analysis.output as any)?.countries && 
           !(analysis.output as any)?.phases && (
            <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto
              text-gray-600 max-h-96">
              {JSON.stringify(analysis.output, null, 2)}
            </pre>
          )}
        </div>

      </div>
    </div>
  )
}
