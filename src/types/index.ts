export type Jurisdiction = 'INDIA' | 'INTERNATIONAL';

export type AyurvedicCategory = 
  | 'CLASSICAL_GENERIC' 
  | 'PROPRIETARY_MEDICINE' 
  | 'NEW_DRUG_NON_CLASSICAL' 
  | 'PHYTOPHARMACEUTICAL' 
  | 'AYURVEDA_AAHAR' 
  | 'COSMETIC';

export type IPRightType = 
  | 'PATENT' 
  | 'TRADEMARK' 
  | 'GEOGRAPHICAL_INDICATION' 
  | 'DESIGN' 
  | 'COPYRIGHT' 
  | 'TRADE_SECRET' 
  | 'PLANT_VARIETY' 
  | 'ABS_DUTY';

export type AgentType = 'RESEARCHER' | 'AUDITOR' | 'DEVILS_ADVOCATE' | 'STRATEGIST';

export interface AgentStep {
  agent: AgentType;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'flagged';
  details: string;
  timestamp: string;
  findings?: string[];
}

export interface SourceCitation {
  id: string;
  statuteOrSource: string;
  provision: string; // e.g. "Section 3(p)"
  yearOrVersion: string; // e.g. "Patents Act 1970 (Amended 2024)"
  authorityLevel: 'STATUTORY_PRIMARY' | 'REGULATORY_NOTIFICATION' | 'TREATY_INTERNATIONAL' | 'PHARMACOPOEIA_CLASSICAL' | 'PATENT_RECORD';
  excerpt: string;
  confidenceScore: number; // 0-100
  url?: string;
  jurisdiction: Jurisdiction;
}

export interface IPRightAnalysis {
  type: IPRightType;
  title: string;
  status: 'ELIGIBLE' | 'CONDITIONAL' | 'HIGH_RISK_BARRED' | 'NOT_APPLICABLE';
  summary: string;
  keyRequirements: string[];
  citations: SourceCitation[];
}

export interface ABSAnalysis {
  isApplicable: boolean;
  resourceOrigin: string; // e.g. "Indian Biological Resource (Withania somnifera)"
  dutyType: 'APPROVAL_REQUIRED' | 'BENEFIT_SHARING_ROYALTY' | 'EXEMPTED_LOCAL_PRACTITIONER';
  authority: string; // "National Biodiversity Authority (NBA)"
  statutoryBasis: string; // "Biological Diversity Act 2002 (Amended 2023, Rules 2024)"
  requiredActions: string[];
  kaniModelInsight?: string;
}

export interface TKOverlapMatch {
  classicalText: string; // e.g. "Caraka Samhita - Chikitsasthana 1.1"
  ayurvedicName: string; // "Ashwagandha (अश्वगंधा)"
  botanicalName: string; // "Withania somnifera"
  modernTerm: string; // "Adaptogenic alkaloid compound"
  overlapScore: number; // e.g. 78%
  similarityDetails: string;
  status: 'PRIOR_ART_BAR' | 'NOVEL_EXTRACT_POTENTIAL' | 'CLASSICAL_TEXT_EXCLUDED';
}

export interface ProductClassificationResult {
  category: AyurvedicCategory;
  title: string;
  confidence: number;
  description: string;
  regulatoryBody: string; // e.g. "AYUSH Ministry / CDSCO / FSSAI"
  evidenceRequirements: string[];
  ipPosture: string;
  absPosture: string;
}

export interface IPReadinessPassport {
  overallScore: number;
  patentabilityScore: number;
  tkClearanceScore: number;
  absComplianceScore: number;
  regulatoryReadinessScore: number;
  exportReadinessScore: number;
  criticalBlockers: string[];
  recommendedRoadmap: string[];
}

export interface EvidenceNode {
  id: string;
  label: string;
  type: 'QUERY' | 'ENTITY' | 'TK_RECORD' | 'STATUTE' | 'VERDICT';
  subText?: string;
}

export interface EvidenceEdge {
  source: string;
  target: string;
  label: string;
}

export interface QueryResult {
  queryId: string;
  userQuery: string;
  jurisdiction: Jurisdiction;
  classification: ProductClassificationResult;
  ipMap: IPRightAnalysis[];
  absAnalysis: ABSAnalysis;
  tkOverlap: TKOverlapMatch[];
  readinessPassport: IPReadinessPassport;
  agentSteps: AgentStep[];
  citations: SourceCitation[];
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  legalDisclaimer: string;
}

export interface AuditHistoryItem {
  id: string;
  query: string;
  title: string;
  timestamp: string;
  score: number;
  result: QueryResult;
}

