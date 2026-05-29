export type KycStatus = 'not_verified' | 'under_review' | 'verified' | 'rejected'

export type DocumentType = 'id_card' | 'passport' | 'driver_license'

export type KycTerm = {
  id: string
  title: string
  desc: string
  icon: string
}

export type KycIdentityDraft = {
  documentType: DocumentType
  frontUploaded: boolean
  backUploaded: boolean
  passportUploaded: boolean
  selfieCompleted: boolean
}
