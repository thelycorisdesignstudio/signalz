export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  description: string;
  intelligenceSummary: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  linkedinUrl?: string;
  companyId: string;
}

export interface ActivitySignal {
  id: string;
  companyId: string;
  type: 'website_visit' | 'pricing_page_view' | 'whitepaper_download' | 'webinar_registration';
  description: string;
  timestamp: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface InternalNote {
  id: string;
  companyId: string;
  content: string;
  updatedAt: string;
}

export interface LinkedInParsingStatus {
  field: string;
  status: 'success' | 'error' | 'not_found';
  message: string;
}
