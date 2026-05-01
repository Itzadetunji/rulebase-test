import type { ComplianceRule } from './types'

export const BASE_COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: 'no-misleading-claims',
    title: 'No misleading claims or guaranteed returns',
    description:
      'Do not claim guaranteed profits, risk-free outcomes, or unrealistic performance certainty.'
  },
  {
    id: 'risk-and-fee-disclosure',
    title: 'Proper risk and fee disclosure',
    description:
      'Provide balanced disclosure for relevant risks, fees, and conditions when discussing financial products.'
  },
  {
    id: 'pii-and-sensitive-data',
    title: 'Protection of PII and sensitive data',
    description:
      'Do not expose or solicit sensitive personal data without proper secure handling and justification.'
  },
  {
    id: 'professional-regulatory-tone',
    title: 'Professional tone and regulatory compliance',
    description:
      'Maintain professional conduct and avoid language that may violate UDAAP, AML, or similar compliance standards.'
  }
]
