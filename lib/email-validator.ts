import dns from "dns"
import { promisify } from "util"

const resolveMx = promisify(dns.resolveMx)

// Common free email providers
const FREE_PROVIDERS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "mail.com",
  "protonmail.com",
  "zoho.com",
  "gmx.com",
]

// Common disposable email domains
const DISPOSABLE_DOMAINS = [
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "throwaway.email",
  "temp-mail.org",
  "getnada.com",
  "maildrop.cc",
]

export interface EmailValidationResult {
  email: string
  status: "valid" | "invalid" | "risky" | "unknown"
  dns_valid: boolean
  smtp_valid: boolean
  disposable: boolean
  free_provider: boolean
  domain: string
  error?: string
}

export async function validateEmail(email: string): Promise<EmailValidationResult> {
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      email,
      status: "invalid",
      dns_valid: false,
      smtp_valid: false,
      disposable: false,
      free_provider: false,
      domain: "",
      error: "Invalid email format",
    }
  }

  const domain = email.split("@")[1].toLowerCase()

  // Check if disposable
  const isDisposable = DISPOSABLE_DOMAINS.includes(domain)

  // Check if free provider
  const isFreeProvider = FREE_PROVIDERS.includes(domain)

  // DNS/MX record validation
  let dnsValid = false
  let smtpValid = false

  try {
    const mxRecords = await resolveMx(domain)
    dnsValid = mxRecords && mxRecords.length > 0
    smtpValid = dnsValid // Simplified - in production you'd do actual SMTP check
  } catch (error) {
    dnsValid = false
    smtpValid = false
  }

  // Determine status
  let status: "valid" | "invalid" | "risky" | "unknown" = "unknown"

  if (!dnsValid) {
    status = "invalid"
  } else if (isDisposable) {
    status = "risky"
  } else if (dnsValid && smtpValid) {
    status = "valid"
  }

  return {
    email,
    status,
    dns_valid: dnsValid,
    smtp_valid: smtpValid,
    disposable: isDisposable,
    free_provider: isFreeProvider,
    domain,
  }
}
