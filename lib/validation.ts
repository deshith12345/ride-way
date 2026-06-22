const emailPattern = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/
const sriLankanMobilePattern = /^7[01245678]\d{7}$/

export function isValidEmailAddress(value: string) {
    const email = value.trim().toLowerCase()

    if (email.length < 6 || email.length > 254) return false
    if (!emailPattern.test(email)) return false
    if (email.includes("..")) return false

    const [local, domain] = email.split("@")
    if (!local || !domain || local.length > 64) return false
    if (local.startsWith(".") || local.endsWith(".")) return false

    return domain
        .split(".")
        .every((part) => part.length > 0 && !part.startsWith("-") && !part.endsWith("-"))
}

export function normalizeSriLankanMobile(value: string) {
    const raw = value.trim()
    if (!raw) return null

    let digits = raw.replace(/[^\d]/g, "")

    if (digits.startsWith("0094")) {
        digits = `94${digits.slice(4)}`
    }

    let local = ""

    if (digits.startsWith("94") && digits.length === 11) {
        local = digits.slice(2)
    } else if (digits.startsWith("0") && digits.length === 10) {
        local = digits.slice(1)
    } else if (digits.length === 9) {
        local = digits
    }

    if (!sriLankanMobilePattern.test(local)) return null

    return `+94${local}`
}

export const sriLankanMobileHelpText = "Use a valid Sri Lankan mobile number from Dialog, Mobitel, Hutch, Airtel, or SLT Mobile. Example: +94 77 123 4567."
