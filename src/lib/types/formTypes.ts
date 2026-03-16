export interface PersonInfo {
  lastName: string
  firstName: string
  middleName: string
  address: string
  phone: string
  workplace: string
  position: string
}

export interface FormState {
  caseNumber: string
  lastName: string
  firstName: string
  middleName: string
  address: string
  classCount: string
  profession: string

  cert9: boolean
  cert11: boolean
  diplomaProfessional: boolean
  needsDorm: boolean

  mother: PersonInfo
  father: PersonInfo

  note: string

  docs: Record<string, boolean>
  copyDocs: Record<string, boolean>
}