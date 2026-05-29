import type { DocumentType, KycIdentityDraft, KycStatus, KycTerm } from './types'

const KYC_STATUS_KEY = 'kyc_status_v1'
const KYC_IDENTITY_KEY = 'kyc_identity_v1'

export const KYC_TERMS: KycTerm[] = [
  {
    id: 'term-age',
    title: '18+ Age Confirmation',
    titleZh: '18+ 年龄确认',
    desc: 'I verify that I am at least 18 years of age and legally permitted to access adult content.',
    descZh: '我确认我已年满 18 岁，且合法有权访问成人内容。',
    icon: '18_up_rating',
  },
  {
    id: 'term-virtual',
    title: 'Virtual Character Interactions',
    titleZh: '虚拟角色互动',
    desc: 'I understand all entities are virtual AI constructions and not real persons.',
    descZh: '我理解所有实体均为虚拟 AI 构造，并非真实人物。',
    icon: 'smart_toy',
  },
  {
    id: 'term-adult',
    title: 'Adult Content Acknowledgment',
    titleZh: '成人内容确认',
    desc: 'I voluntarily choose to access age-restricted virtual content.',
    descZh: '我自愿选择访问年龄限制的虚拟内容。',
    icon: 'warning',
  },
  {
    id: 'term-minor',
    title: 'No Minor Access Guarantee',
    titleZh: '禁止未成年人访问保证',
    desc: 'I will secure my device to prevent access by anyone under 18.',
    descZh: '我将确保设备安全，防止 18 岁以下人员访问。',
    icon: 'no_accounts',
  },
  {
    id: 'term-privacy',
    title: 'Privacy & Data Handling',
    titleZh: '隐私与数据处理',
    desc: 'I agree to the secure encryption and handling of my verification biometric data.',
    descZh: '我同意对我的验证生物特征数据进行安全加密和处理。',
    icon: 'policy',
  },
  {
    id: 'term-hardware',
    title: 'Hardware Safety Protocols',
    titleZh: '硬件安全协议',
    desc: 'I accept responsibility for safe usage of connected haptic and sensory peripherals.',
    descZh: '我承担安全使用连接触觉和传感外设的责任。',
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
