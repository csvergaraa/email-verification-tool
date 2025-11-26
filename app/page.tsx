"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, AlertTriangle, Upload, X, ArrowUp, Shield, Lock, Trash2 } from "lucide-react"
import * as XLSX from "xlsx"

// Types
type VerificationStatus = "valid" | "invalid" | "risky" | "unknown"

interface VerificationResult {
  email: string
  status: VerificationStatus
  details: string
  dns_valid?: boolean
  smtp_valid?: boolean
  disposable?: boolean
  free_provider?: boolean
  domain?: string
}

interface BulkStats {
  total: number
  valid: number
  invalid: number
  risky: number
  unknown: number
}

interface BulkResult {
  email: string
  status: VerificationStatus
  details: string
}

const verifySingleEmail = async (email: string): Promise<VerificationResult> => {
  try {
    const response = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      throw new Error("Verification failed")
    }

    const data = await response.json()

    // Generate details based on validation results
    let details = ""
    if (data.status === "valid") {
      details = "Mailbox exists and is accepting mail."
    } else if (data.status === "invalid") {
      details = data.dns_valid ? "Mailbox does not exist." : "Domain does not accept mail."
    } else if (data.status === "risky") {
      if (data.disposable) {
        details = "Disposable email address detected."
      } else {
        details = "This email may have a high bounce risk."
      }
    } else {
      details = "Could not verify this email address."
    }

    return {
      email: data.email,
      status: data.status,
      details,
      dns_valid: data.dns_valid,
      smtp_valid: data.smtp_valid,
      disposable: data.disposable,
      free_provider: data.free_provider,
      domain: data.domain,
    }
  } catch (error) {
    console.error("[v0] Verification error:", error)
    return {
      email,
      status: "unknown",
      details: "Verification failed. Please try again later.",
    }
  }
}

// Parse emails from file content
const extractEmailsFromText = (text: string): string[] => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const matches = text.match(emailRegex) || []
  // Remove duplicates
  return [...new Set(matches)]
}

// Parse CSV or Excel file
const parseEmailsFromFile = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        let emails: string[] = []

        // Check if it's an Excel file
        if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

          // Extract all emails from all cells
          jsonData.forEach((row) => {
            row.forEach((cell) => {
              if (cell && typeof cell === "string") {
                const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
                const matches = cell.match(emailRegex)
                if (matches) {
                  emails.push(...matches)
                }
              }
            })
          })
        } else {
          // Handle CSV files
          const content = data as string
          emails = extractEmailsFromText(content)
        }

        // Remove duplicates
        const uniqueEmails = [...new Set(emails)]
        resolve(uniqueEmails)
      } catch (error) {
        reject(new Error("Failed to parse file"))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))

    // Read as binary for Excel, as text for CSV
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      reader.readAsBinaryString(file)
    } else {
      reader.readAsText(file)
    }
  })
}

const verifyBulkEmails = async (
  emails: string[],
  onProgress: (current: number, total: number) => void,
): Promise<BulkResult[]> => {
  const BATCH_SIZE = 50 // Process 50 emails at a time
  const allResults: BulkResult[] = []
  let processed = 0

  try {
    // Split emails into batches
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE)

      const response = await fetch("/api/verify-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: batch }),
      })

      if (!response.ok) {
        throw new Error("Bulk verification failed")
      }

      const data = await response.json()

      // Map results to include details
      const batchResults = data.results.map((result: any) => {
        let details = ""
        if (result.status === "valid") {
          details = "Mailbox exists and is accepting mail."
        } else if (result.status === "invalid") {
          details = result.dns_valid ? "Mailbox does not exist." : "Domain does not accept mail."
        } else if (result.status === "risky") {
          if (result.disposable) {
            details = "Disposable email address detected."
          } else {
            details = "This email may have a high bounce risk."
          }
        } else {
          details = "Could not verify this email address."
        }

        return {
          email: result.email,
          status: result.status,
          details,
        }
      })

      allResults.push(...batchResults)
      processed += batch.length

      // Update progress after each batch
      onProgress(processed, emails.length)
    }

    return allResults
  } catch (error) {
    console.error("[v0] Bulk verification error:", error)
    throw error
  }
}

export default function EmailVerificationTool() {
  // Tab state
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")

  // Single check state
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)

  // Bulk check states
  const [file, setFile] = useState<File | null>(null)
  const [bulkEmails, setBulkEmails] = useState<string[]>([])
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([])
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState<BulkStats | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const [showBackToTop, setShowBackToTop] = useState(false)

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  // Handle single email verification
  const handleSingleVerify = async () => {
    setResult(null)

    if (!email.trim()) {
      alert("Email address is required")
      return
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address")
      return
    }

    setLoading(true)
    try {
      const result = await verifySingleEmail(email)
      setResult(result)
    } catch (error) {
      setResult({
        email,
        status: "unknown",
        details: "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFile(file)
    setBulkResults([])

    try {
      const emails = await parseEmailsFromFile(file)
      setBulkEmails(emails)
    } catch (error) {
      alert("Failed to parse file. Please try again.")
      setFile(null)
      setBulkEmails([])
    }
  }

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ]

    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      alert("Please upload a valid CSV or Excel file")
      return
    }

    setFile(file)
    setBulkResults([])

    try {
      const emails = await parseEmailsFromFile(file)
      setBulkEmails(emails)
    } catch (error) {
      alert("Failed to parse file. Please try again.")
      setFile(null)
      setBulkEmails([])
    }
  }

  // Handle bulk verification
  const handleBulkVerify = async () => {
    if (bulkEmails.length === 0) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const results = await verifyBulkEmails(bulkEmails, (current, total) => {
        setProgress((current / total) * 100)
      })
      setBulkResults(results)
      setStats(calculateStats(results))
    } catch (error) {
      alert("Verification failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Calculate statistics
  const calculateStats = (results: BulkResult[]): BulkStats => {
    return {
      total: results.length,
      valid: results.filter((r) => r.status === "valid").length,
      invalid: results.filter((r) => r.status === "invalid").length,
      risky: results.filter((r) => r.status === "risky").length,
      unknown: results.filter((r) => r.status === "unknown" || !["valid", "invalid", "risky"].includes(r.status))
        .length,
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (bulkResults.length === 0) return

    const resultsToExport = statusFilter ? bulkResults.filter((r) => r.status === statusFilter) : bulkResults

    const csvContent = [["Email", "Status", "Details"], ...resultsToExport.map((r) => [r.email, r.status, r.details])]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = statusFilter ? `verification-report-${statusFilter}.csv` : "verification-report.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Clear results
  const handleClearResults = () => {
    setBulkResults([])
    setStats(null)
    setProgress(0)
    setFile(null)
    setBulkEmails([])
    setStatusFilter(null)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down more than 300px
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex justify-center pt-8">
          <img
            src="https://vergaratec.com/townsend/images/logo.png"
            alt="Townsend Solutions"
            width={240}
            className="h-auto"
          />
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-[#1E40AF]">
            Email List Hygiene
          </div>
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Email Verification Tool</h1>
          <p className="text-balance text-lg text-slate-600">
            Check single emails or upload a list to verify addresses before adding them to your mailing list.
          </p>
        </div>

        {/* Privacy Badge */}
        <div className="mb-6">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="font-semibold text-green-900">100% Private & Secure</h3>
                <div className="space-y-1 text-sm text-green-800">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" />
                    <span>No data is stored in any database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>All emails are processed in memory and immediately discarded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" />
                    <span>GDPR compliant - zero data retention</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-white p-6 shadow-md md:p-8">
          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("single")}
              className={`flex-1 border-b-2 px-4 py-2 font-medium transition-colors md:flex-none ${
                activeTab === "single"
                  ? "border-[#1E40AF] text-[#1E40AF]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Single Check
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 border-b-2 px-4 py-2 font-medium transition-colors md:flex-none ${
                activeTab === "bulk"
                  ? "border-[#1E40AF] text-[#1E40AF]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Bulk Check
            </button>
          </div>

          {/* Single Check Tab */}
          {activeTab === "single" && (
            <div>
              <div className="mb-4">
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email to verify
                </label>
                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={loading}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 disabled:opacity-60"
                  />
                  <button
                    onClick={handleSingleVerify}
                    disabled={loading}
                    className="rounded-lg bg-[#1E40AF] px-6 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Verify email"}
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1E40AF] border-t-transparent" />
                  <span>Verifying email address...</span>
                </div>
              )}

              {/* Result */}
              {result && !loading && (
                <div aria-live="polite" className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    {result.status === "valid" && (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                          Valid email
                        </span>
                      </>
                    )}
                    {result.status === "invalid" && (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                          Invalid email
                        </span>
                      </>
                    )}
                    {result.status === "risky" && (
                      <>
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                          Risky email
                        </span>
                      </>
                    )}
                    {result.status === "unknown" && (
                      <>
                        <X className="h-5 w-5 text-slate-600" />
                        <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
                          Unknown
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-700">{result.details}</p>

                  {result.domain && (
                    <div className="mt-3 border-t border-slate-200 pt-3">
                      <p className="text-xs font-medium text-slate-700 mb-1">Technical Details:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>Domain: {result.domain}</div>
                        <div>DNS Valid: {result.dns_valid ? "Yes" : "No"}</div>
                        <div>SMTP Valid: {result.smtp_valid ? "Yes" : "No"}</div>
                        <div>Disposable: {result.disposable ? "Yes" : "No"}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Helper Text */}
              {!result && !loading && (
                <p className="mt-4 text-sm text-slate-500">
                  We perform real DNS and SMTP validation to verify email addresses.
                </p>
              )}
            </div>
          )}

          {/* Bulk Check Tab */}
          {activeTab === "bulk" && (
            <div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">Bulk email verification</h3>
              <p className="mb-4 text-sm text-slate-600">
                Upload a spreadsheet and we'll scan it for email addresses, then verify each one using DNS and SMTP
                checks.
              </p>

              {/* Upload Area */}
              <div className="mb-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`rounded-xl border-2 border-dashed p-6 transition-colors ${
                      isDragging
                        ? "border-[#1E40AF] bg-blue-50"
                        : "border-slate-300 bg-white hover:border-[#1E40AF] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-3 rounded-full bg-slate-100 p-3">
                        <Upload className="h-6 w-6 text-slate-600" />
                      </div>
                      <p className="mb-1 text-sm font-medium text-slate-700">Drop your file here or click to upload</p>
                      <p className="text-xs text-slate-500">Supports .xlsx, .xls and .csv files</p>
                    </div>
                  </div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
              </div>

              {/* File Info */}
              {file && (
                <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-600">
                      Detected {bulkEmails.length} unique email address{bulkEmails.length !== 1 ? "es" : ""}
                    </p>
                  </div>
                  {!isProcessing && (
                    <button
                      onClick={handleClearResults}
                      className="ml-2 rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={handleBulkVerify}
                disabled={!file || bulkEmails.length === 0 || isProcessing}
                className="w-full rounded-lg bg-[#1E40AF] px-6 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isProcessing ? "Verifying list..." : "Verify all emails"}
              </button>

              {/* Progress */}
              {isProcessing && (
                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-sm text-slate-600">
                    <span>
                      Verifying {Math.round(progress)}% of {bulkEmails.length} emails...
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-[#1E40AF] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    This may take a few seconds depending on your list size.
                  </p>
                </div>
              )}

              {/* Results Summary */}
              {stats && bulkResults.length > 0 && (
                <div aria-live="polite" className="mt-6">
                  <h4 className="mb-4 text-lg font-semibold text-slate-900">Verification report</h4>

                  <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                    <button
                      onClick={() => setStatusFilter(null)}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        statusFilter === null
                          ? "border-slate-400 bg-slate-100 shadow-md"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                      <p className="text-xs text-slate-600">Total</p>
                    </button>
                    <button
                      onClick={() => setStatusFilter(statusFilter === "valid" ? null : "valid")}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        statusFilter === "valid"
                          ? "border-green-400 bg-green-100 shadow-md"
                          : "border-green-200 bg-green-50 hover:bg-green-100"
                      }`}
                    >
                      <p className="text-2xl font-bold text-green-700">{stats.valid}</p>
                      <p className="text-xs text-green-600">Valid</p>
                    </button>
                    <button
                      onClick={() => setStatusFilter(statusFilter === "invalid" ? null : "invalid")}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        statusFilter === "invalid"
                          ? "border-red-400 bg-red-100 shadow-md"
                          : "border-red-200 bg-red-50 hover:bg-red-100"
                      }`}
                    >
                      <p className="text-2xl font-bold text-red-700">{stats.invalid}</p>
                      <p className="text-xs text-red-600">Invalid</p>
                    </button>
                    <button
                      onClick={() => setStatusFilter(statusFilter === "risky" ? null : "risky")}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        statusFilter === "risky"
                          ? "border-amber-400 bg-amber-100 shadow-md"
                          : "border-amber-200 bg-amber-50 hover:bg-amber-100"
                      }`}
                    >
                      <p className="text-2xl font-bold text-amber-700">{stats.risky}</p>
                      <p className="text-xs text-amber-600">Risky</p>
                    </button>
                    <button
                      onClick={() => setStatusFilter(statusFilter === "unknown" ? null : "unknown")}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        statusFilter === "unknown"
                          ? "border-slate-400 bg-slate-200 shadow-md"
                          : "border-slate-200 bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      <p className="text-2xl font-bold text-slate-700">{stats.unknown}</p>
                      <p className="text-xs text-slate-600">Unknown</p>
                    </button>
                  </div>

                  {statusFilter && (
                    <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2 text-sm">
                      <span className="text-blue-700">
                        Showing {bulkResults.filter((r) => r.status === statusFilter).length} {statusFilter} email(s)
                      </span>
                      <button
                        onClick={() => setStatusFilter(null)}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear filter
                      </button>
                    </div>
                  )}

                  {/* Results Table */}
                  <div className="mb-4 overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-700">
                        <tr>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(statusFilter ? bulkResults.filter((r) => r.status === statusFilter) : bulkResults).map(
                          (result, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 font-medium text-slate-900">{result.email}</td>
                              <td className="px-4 py-3">
                                {result.status === "valid" && (
                                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                    Valid
                                  </span>
                                )}
                                {result.status === "invalid" && (
                                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                                    Invalid
                                  </span>
                                )}
                                {result.status === "risky" && (
                                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                    Risky
                                  </span>
                                )}
                                {result.status === "unknown" && (
                                  <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                                    Unknown
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{result.details}</td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions */}
                  <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      onClick={handleExportCSV}
                      className="rounded-lg bg-[#1E40AF] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      {statusFilter ? `Download ${statusFilter} emails (CSV)` : "Download report (CSV)"}
                    </button>
                    <button
                      onClick={handleClearResults}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      Clear results
                    </button>
                  </div>

                  {/* Tips */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h5 className="mb-2 font-semibold text-slate-900">List hygiene tips</h5>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li className="flex gap-2">
                        <span className="text-[#1E40AF]">•</span>
                        <span>Avoid uploading purchased or scraped email lists.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#1E40AF]">•</span>
                        <span>Re-verify older lists before large campaigns.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#1E40AF]">•</span>
                        <span>Remove hard bounces regularly to protect your sender reputation.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E40AF] text-white shadow-lg transition-all hover:bg-[#1E40AF]/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-50/80 backdrop-blur-sm py-4 text-center text-sm text-slate-600 border-t border-slate-200">
        Townsend Solutions - All Rights Reserved. Design by Vergara Design.
      </footer>
    </div>
  )
}
