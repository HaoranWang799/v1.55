import type { DocumentType, KycIdentityDraft, KycStatus, KycTerm } from './types'

const KYC_STATUS_KEY = 'kyc_status_v1'
const KYC_IDENTITY_KEY = 'kyc_identity_v1'

export const KYC_TERMS: KycTerm[] = [
  {
    id: 'term-age',
    title: '18+ Age Confirmation',
    desc: 'I verify that I am at least 18 years of age.',
    icon: '18_up_rating',
  },
  {
    id: 'term-virtual',
    title: 'Virtual Character Interactions',
    desc: 'I understand entities are virtual AI characters.',
    icon: 'smart_toy',
  },
  {
    id: 'term-adult',
    title: 'Adult Content Acknowledgment',
    desc: 'I consent to mature and explicit themed content.',
    icon: 'warning',
  },
  {
    id: 'term-minor',
    title: 'No Minor Access Guarantee',
    desc: 'I will prevent anyone under 18 from accessing this app.',
    icon: 'no_accounts',
  },
  {
    id: 'term-privacy',
    title: 'Privacy & Data Handling',
    desc: 'I agree with secure handling of verification data.',
    icon: 'policy',
  },
  {
    id: 'term-hardware',
    title: 'Hardware Safety Protocols',
    desc: 'I accept safe usage responsibility for connected devices.',
    icon: 'router',
  },
]

export function getDefaultIdentityDraft(): KycIdentityDraft {
  return {
    documentType: 'id_card',
    frontUploaded: false,
    backUploaded: false,
    passportUploaded: false,
    selfieCompleted: false,
  }
}

export function getKycStatus(): KycStatus {
  const value = localStorage.getItem(KYC_STATUS_KEY)
  if (value === 'not_verified' || value === 'under_review' || value === 'verified' || value === 'rejected') {
    return value
  }
  return 'not_verified'
}

export function setKycStatus(status: KycStatus): void {
  localStorage.setItem(KYC_STATUS_KEY, status)
}

export function getKycIdentityDraft(): KycIdentityDraft {
  try {
    const raw = localStorage.getItem(KYC_IDENTITY_KEY)
    if (!raw) return getDefaultIdentityDraft()
    const parsed = JSON.parse(raw)
    return { ...getDefaultIdentityDraft(), ...parsed }
  } catch {
    return getDefaultIdentityDraft()
  }
}

export function setKycIdentityDraft(draft: KycIdentityDraft): void {
  localStorage.setItem(KYC_IDENTITY_KEY, JSON.stringify(draft))
}

export async function uploadKycDocument(_payload: {
  documentType: DocumentType
  side: 'front' | 'back' | 'passport' | 'selfie'
}): Promise<{ ok: true }> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  return { ok: true }
}

export async function submitKycTerms(_payload: {
  legalName: string
  acceptedTermIds: string[]
}): Promise<{ ok: true }> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  return { ok: true }
}

export async function submitKycVerification(): Promise<{ status: KycStatus }> {
  await new Promise((resolve) => setTimeout(resolve, 350))
  const status: KycStatus = Math.random() > 0.25 ? 'under_review' : 'rejected'
  setKycStatus(status)
  return { status }
}
