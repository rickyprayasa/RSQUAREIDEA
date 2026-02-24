export interface PasswordStrengthResult {
    score: number // 0-4
    label: string
    color: string
    feedback: string[]
    valid: boolean
}

/**
 * Calculate password strength
 * Returns score from 0 (weak) to 4 (very strong)
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
    const feedback: string[] = []
    let score = 0

    // Minimum length check
    if (password.length >= 8) {
        score += 1
    } else {
        feedback.push('Minimal 8 karakter')
    }

    // Length bonus
    if (password.length >= 12) {
        score += 1
    } else if (password.length < 8) {
        feedback.push('Gunakan minimal 12 karakter untuk keamanan lebih baik')
    }

    // Character variety checks
    const hasLowercase = /[a-z]/.test(password)
    const hasUppercase = /[A-Z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

    const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecial].filter(Boolean).length

    if (varietyCount >= 3) {
        score += 1
    } else {
        if (!hasLowercase) feedback.push('Tambahkan huruf kecil')
        if (!hasUppercase) feedback.push('Tambahkan huruf besar')
        if (!hasNumbers) feedback.push('Tambahkan angka')
        if (!hasSpecial) feedback.push('Tambahkan simbol/karakter special')
    }

    // Bonus for all 4 types
    if (varietyCount === 4 && password.length >= 12) {
        score = Math.min(4, score + 1)
    }

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
        score = Math.max(0, score - 1)
        feedback.push('Hindari pengulangan karakter')
    }

    if (/^[0-9]+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
        score = Math.max(0, score - 1)
        feedback.push('Gunakan kombinasi karakter yang lebih beragam')
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(4, score))

    // Generate result based on score
    const labels = ['Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat']
    const colors = ['red', 'orange', 'yellow', 'lime', 'green']
    const valid = score >= 2 // Minimum acceptable strength

    return {
        score,
        label: labels[score],
        color: colors[score],
        feedback,
        valid,
    }
}

/**
 * Check if password meets minimum requirements
 */
export function validatePasswordRequirements(password: string): {
    valid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (password.length < 8) {
        errors.push('Password minimal 8 karakter')
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password harus mengandung huruf kecil')
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password harus mengandung huruf besar')
    }

    if (!/\d/.test(password)) {
        errors.push('Password harus mengandung angka')
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password harus mengandung karakter special')
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Generate a random strong password
 */
export function generateStrongPassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    const allChars = lowercase + uppercase + numbers + special
    let password = ''

    // Ensure at least one of each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
}
