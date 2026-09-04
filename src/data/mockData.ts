import type { QueryResult, SourceCitation } from '../types';

export const SAMPLE_QUERIES = [
  {
    id: 'ashwagandha-stress-capsules',
    title: 'Ashwagandha Extract Formulation for Stress (India & Export to Germany)',
    query: 'I have developed a standardized Ashwagandha + Guduchi extract capsule for stress management. Can I patent it in India and sell it in Germany as an Ayurvedic medicine?',
    category: 'NEW_DRUG_NON_CLASSICAL' as const,
  },
  {
    id: 'chyawanprash-classical',
    title: 'Modified Classical Chyawanprash Formulation',
    query: 'We modified the preparation method of Classical Chyawanprash mentioned in Sharangdhara Samhita to double shelf-life without preservatives. Can we get patent protection?',
    category: 'CLASSICAL_GENERIC' as const,
  },
  {
    id: 'ayurveda-aahar-tea',
    title: 'Ayurveda-Aahar Functional Herbal Tea',
    query: 'We created a daily wellness herbal tea containing Tulsi, Ginger, and Cinnamon marketed under FSSAI Ayurveda-Aahar. What IP protection applies and do we need NBA clearance?',
    category: 'AYURVEDA_AAHAR' as const,
  },
  {
    id: 'curcumin-phytopharm',
    title: 'Standardized Curcumin Phytopharmaceutical Extract',
    query: 'We isolated a purified 98% bioactive fraction of Curcumin with novel liposomal delivery for anti-inflammatory application, supported by Phase I clinical data.',
    category: 'PHYTOPHARMACEUTICAL' as const,
  }
];

export const MASTER_CITATIONS: SourceCitation[] = [
  {
    id: 'pat-sec-3p',
    statuteOrSource: 'The Patents Act, 1970 (Amended 2024)',
    provision: 'Section 3(p)',
    yearOrVersion: 'Act No. 39 of 1970 (2024 Patent Rules)',
    authorityLevel: 'STATUTORY_PRIMARY',
    excerpt: 'An invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not an invention within the meaning of this Act.',
    confidenceScore: 98,
    jurisdiction: 'INDIA',
    url: 'https://ipindia.gov.in/patents-act-1970.htm'
  },
  {
    id: 'pat-sec-3d',
    statuteOrSource: 'The Patents Act, 1970 (Amended 2024)',
    provision: 'Section 3(d)',
    yearOrVersion: 'Act No. 39 of 1970',
    authorityLevel: 'STATUTORY_PRIMARY',
    excerpt: 'The mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance is not patentable.',
    confidenceScore: 96,
    jurisdiction: 'INDIA',
  },
  {
    id: 'bd-act-sec-6',
    statuteOrSource: 'Biological Diversity Act, 2002 (Amended 2023, Rules 2024)',
    provision: 'Section 6(1)',
    yearOrVersion: 'Act 18 of 2003 (Amended Act 2023)',
    authorityLevel: 'STATUTORY_PRIMARY',
    excerpt: 'No person shall apply for any intellectual property right in or outside India for any invention based on any research or information on a biological resource obtained from India without prior approval of the National Biodiversity Authority (NBA).',
    confidenceScore: 99,
    jurisdiction: 'INDIA',
  },
  {
    id: 'wipo-gratk-2024',
    statuteOrSource: 'WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge',
    provision: 'Article 3 & 4',
    yearOrVersion: 'Adopted May 24, 2024 (Geneva)',
    authorityLevel: 'TREATY_INTERNATIONAL',
    excerpt: 'Patent applicants must disclose the country of origin or source of genetic resources and associated traditional knowledge used in inventions. Failure to disclose triggers mandatory review.',
    confidenceScore: 95,
    jurisdiction: 'INTERNATIONAL',
  },
  {
    id: 'tkdl-caraka-1',
    statuteOrSource: 'Traditional Knowledge Digital Library (TKDL) & Caraka Samhita',
    provision: 'Cikitsasthana Ch. 1 (Rasayana Adhyaya)',
    yearOrVersion: 'First Schedule Authoritative Text',
    authorityLevel: 'PHARMACOPOEIA_CLASSICAL',
    excerpt: 'Ashwagandha (Withania somnifera) root prepared in Ksirapaka (milk decoction) documented as Balya (strength-promoting) and Rasayana (rejuvenative/adaptogenic).',
    confidenceScore: 94,
    jurisdiction: 'INDIA',
  },
  {
    id: 'fssai-ayurveda-aahar',
    statuteOrSource: 'FSSAI Food Safety and Standards (Ayurveda Aahar) Regulations',
    provision: 'Regulation 4(2)',
    yearOrVersion: 'Notification 2022',
    authorityLevel: 'REGULATORY_NOTIFICATION',
    excerpt: 'Ayurveda Aahar products shall comply with strict labelling, non-medicinal therapeutic claim prohibitions, and schedule ingredient limits drawn from authoritative Ayurvedic texts.',
    confidenceScore: 92,
    jurisdiction: 'INDIA',
  },
  {
    id: 'ema-herbal-dir',
    statuteOrSource: 'EU Directive 2004/24/EC (Traditional Herbal Medicinal Products Directive)',
    provision: 'Article 16a-16i',
    yearOrVersion: 'EU Herbal Directive',
    authorityLevel: 'TREATY_INTERNATIONAL',
    excerpt: 'Simplified registration available for traditional herbal products showing 30 years of continuous medicinal use, including at least 15 years within the European Union.',
    confidenceScore: 91,
    jurisdiction: 'INTERNATIONAL',
  }
];

export function getMockAnalysisForQuery(userQueryText: string, jurisdiction: 'INDIA' | 'INTERNATIONAL'): QueryResult {
  const qLower = userQueryText.toLowerCase();
  const isExportQuery = qLower.includes('export') || qLower.includes('germany') || qLower.includes('eu');
  const isClassical = qLower.includes('chyawanprash') || qLower.includes('classical') || qLower.includes('samhita');
  const isPhytopharm = qLower.includes('curcumin') || qLower.includes('phytopharmaceutical') || qLower.includes('fraction');
  const isTea = qLower.includes('tea') || qLower.includes('aahar') || qLower.includes('wellness');

  let category: QueryResult['classification']['category'] = 'NEW_DRUG_NON_CLASSICAL';
  let catTitle = 'New / Non-Classical Ayurvedic Formulation';
  let catDesc = 'Formulation containing standardized extracts or novel combinations not directly transcribed from First-Schedule classical texts.';
  
  let overallScore = 76;
  let patentabilityScore = 72;
  let tkClearanceScore = 68;
  let absComplianceScore = 78;
  let regulatoryReadinessScore = 84;
  let exportReadinessScore = isExportQuery ? 62 : 82;

  if (isClassical) {
    category = 'CLASSICAL_GENERIC';
    catTitle = 'Classical / Generic Ayurvedic Formulation';
    catDesc = 'Formulation derived directly from First-Schedule authoritative texts (e.g. Caraka Samhita, Sharangdhara Samhita).';
    overallScore = 45;
    patentabilityScore = 22;
    tkClearanceScore = 18;
    absComplianceScore = 65;
    regulatoryReadinessScore = 80;
    exportReadinessScore = isExportQuery ? 38 : 60;
  } else if (isPhytopharm) {
    category = 'PHYTOPHARMACEUTICAL';
    catTitle = 'Phytopharmaceutical Drug (CDSCO Route)';
    catDesc = 'Purified fraction of medicinal plant with standardized active markers requiring safety, toxicity and clinical evidence.';
    overallScore = 88;
    patentabilityScore = 86;
    tkClearanceScore = 92;
    absComplianceScore = 84;
    regulatoryReadinessScore = 90;
    exportReadinessScore = isExportQuery ? 82 : 94;
  } else if (isTea) {
    category = 'AYURVEDA_AAHAR';
    catTitle = 'Ayurveda-Aahar Functional Wellness Product';
    catDesc = 'Food or dietary product prepared in accordance with FSSAI Ayurveda-Aahar Regulations 2022.';
    overallScore = 82;
    patentabilityScore = 74;
    tkClearanceScore = 80;
    absComplianceScore = 88;
    regulatoryReadinessScore = 92;
    exportReadinessScore = isExportQuery ? 70 : 86;
  }

  return {
    queryId: 'q-' + Date.now(),
    userQuery: userQueryText,
    jurisdiction,
    classification: {
      category,
      title: catTitle,
      confidence: 91,
      description: catDesc,
      regulatoryBody: category === 'CLASSICAL_GENERIC' ? 'Ministry of Ayush (State Licensing Authority)' : category === 'PHYTOPHARMACEUTICAL' ? 'CDSCO (Central Drugs Standard Control Organization)' : 'AYUSH SLA & FSSAI',
      evidenceRequirements: [
        'Proof of standardized active markers (HPLC fingerprinting)',
        'Heavy metal, pesticide & micro-organism safety limits',
        'Traditional Knowledge (TK) non-infringement audit',
        category === 'PHYTOPHARMACEUTICAL' ? 'Phase I-III Clinical Trial Evidence' : 'Stability data & manufacturing protocol'
      ],
      ipPosture: category === 'CLASSICAL_GENERIC' ? 'Classical text in public domain; barred under Patent Sec 3(p), protected defensively via TKDL.' : 'Novel extraction process & standardized ratio eligible for process patent; product formulation faces Sec 3(p) scrutiny.',
      absPosture: 'Mandatory National Biodiversity Authority (NBA) approval required prior to commercialization & IP filing under BD Act 2023.'
    },
    ipMap: [
      {
        type: 'PATENT',
        title: 'Patent Eligibility Assessment',
        status: category === 'CLASSICAL_GENERIC' ? 'HIGH_RISK_BARRED' : 'CONDITIONAL',
        summary: category === 'CLASSICAL_GENERIC' 
          ? 'Formulation derived directly from classical text faces an absolute patent bar under Section 3(p) of Patents Act 1970.' 
          : 'Process of extraction and synergistic novel ratios eligible for Process Patent. Product patent restricted by Section 3(p) unless synergistic efficacy proved under Sec 3(d).',
        keyRequirements: [
          'Prove non-obvious synergistic enhancement over crude extract',
          'Disclose origin of biological resource (Ashwagandha / Guduchi) from India',
          'File NBA Section 6 pre-approval before patent grant',
          'WIPO GRATK Treaty mandatory country-of-origin disclosure'
        ],
        citations: [MASTER_CITATIONS[0], MASTER_CITATIONS[1], MASTER_CITATIONS[3]]
      },
      {
        type: 'TRADEMARK',
        title: 'Brand & Product Name Protection',
        status: 'ELIGIBLE',
        summary: 'Proprietary brand name (e.g. "AshwaCalm™") highly eligible for registration under Trademarks Act 1999. Classical Sanskrit names (e.g. "Ashwagandha Churna") are descriptive and non-registerable.',
        keyRequirements: ['Distinctive word mark / logo', 'Non-descriptive of active Ayurvedic ingredient'],
        citations: []
      },
      {
        type: 'DESIGN',
        title: 'Packaging & Delivery Mechanism Design',
        status: 'ELIGIBLE',
        summary: 'Novel delivery packaging, bottle contour, or unique capsule aesthetic registerable under Designs Act 2000.',
        keyRequirements: ['New or original visual shape', 'Not previously published in any country'],
        citations: []
      },
      {
        type: 'ABS_DUTY',
        title: 'Biological Diversity & ABS Compliance',
        status: 'CONDITIONAL',
        summary: 'Section 6 of BD Act 2023 requires NBA authorization before filing IP for biological resources obtained from India.',
        keyRequirements: ['Submit Form III to National Biodiversity Authority', 'Execute Benefit Sharing Agreement / Royalty Pool'],
        citations: [MASTER_CITATIONS[2]]
      }
    ],
    absAnalysis: {
      isApplicable: true,
      resourceOrigin: 'Indian Biological Resource: Withania somnifera (Ashwagandha) & Tinospora cordifolia (Guduchi)',
      dutyType: 'APPROVAL_REQUIRED',
      authority: 'National Biodiversity Authority (NBA, Chennai)',
      statutoryBasis: 'Biological Diversity Act 2002 (Amended 2023, Rules 2024)',
      requiredActions: [
        'File NBA Form III prior to commercial IP application',
        'Establish traditional community knowledge provenance',
        'Comply with Nagoya Protocol Access & Benefit Sharing (ABS) guidelines',
        'Deposit voucher specimen in recognized herbarium/repository'
      ],
      kaniModelInsight: 'Inspired by the Kani-Arogyapacha (Jeevani) model: If indigenous community knowledge was leveraged for wild sourcing, a mandatory 2-5% benefit-sharing trust fund must be created.'
    },
    tkOverlap: [
      {
        classicalText: 'Caraka Samhita - Chikitsasthana Rasayana Adhyaya 1.1',
        ayurvedicName: 'Ashwagandha (अश्वगंधा)',
        botanicalName: 'Withania somnifera',
        modernTerm: 'Adaptogenic alkaloid (Withanolide A)',
        overlapScore: 78,
        similarityDetails: 'High therapeutic overlap for anxiety, stress, and Rasayana (rejuvenation) properties.',
        status: 'PRIOR_ART_BAR'
      },
      {
        classicalText: 'Bhavaprakasa Nighantu - Guducyadi Varga',
        ayurvedicName: 'Guduchi (गुडूची / अमृता)',
        botanicalName: 'Tinospora cordifolia',
        modernTerm: 'Immunomodulatory diterpene compounds',
        overlapScore: 64,
        similarityDetails: 'Immune boosting and stress resilience combination documented in Ayurvedic Nighantus.',
        status: 'NOVEL_EXTRACT_POTENTIAL'
      }
    ],
    readinessPassport: {
      overallScore,
      patentabilityScore,
      tkClearanceScore,
      absComplianceScore,
      regulatoryReadinessScore,
      exportReadinessScore,
      criticalBlockers: [
        'Traditional Knowledge (TK) prior-art overlap under Sec 3(p)',
        'Mandatory National Biodiversity Authority (NBA) approval pending',
        isExportQuery ? 'EU Novel Food / EMA Herbal Regulation clearance required for Germany market entry' : 'Standardized HPLC marker validation pending'
      ],
      recommendedRoadmap: [
        'Shift strategy from raw product patent to novel hydro-alcoholic extraction process patent',
        'Submit NBA Form III application under BD Act 2023 for biological resource access clearance',
        'Perform TKDL comprehensive prior-art search across Sanskrit & Tamil classical corpora',
        'Register Trademark for proprietary brand identity in Class 5 (Pharmaceuticals / AYUSH)',
        isExportQuery ? 'Prepare EMA Traditional Herbal Medicinal Product (THMPD) dossier for EU export' : 'Obtain State SLA license under Drugs & Cosmetics Rule 158B'
      ]
    },
    agentSteps: [
      {
        agent: 'RESEARCHER',
        title: 'Multi-Source Evidence Retrieval',
        status: 'completed',
        details: 'Scanned Patents Act 1970, BD Act 2023, TKDL Database, Caraka Samhita, WIPO GRATK Treaty 2024 & EMA Guidelines.',
        timestamp: '17:43:02',
        findings: ['Found 2 TKDL records matching Withania somnifera stress claims', 'Identified Patent Sec 3(p) prior art barrier', 'Verified WIPO 2024 GRATK disclosure clause']
      },
      {
        agent: 'AUDITOR',
        title: 'Statutory Verification & Date Audit',
        status: 'completed',
        details: 'Audited statutory provisions against 2023 Biodiversity Amendments and 2024 Patent Rules.',
        timestamp: '17:43:04',
        findings: ['Confirmed BD Act 2023 Sec 6 applies to Indian biological resources', 'Verified citation accuracy: Patents Act Sec 3(p) active without revocation']
      },
      {
        agent: 'DEVILS_ADVOCATE',
        title: 'Risk & Contradiction Stress-Testing',
        status: 'completed',
        details: 'Stress-tested claims for potential rejections by Indian Patent Office (IPO) examiners.',
        timestamp: '17:43:05',
        findings: ['WARNING: IPO examiners routinely reject raw plant extract claims under Sec 3(p)', 'Exporting to Germany without EU THMPD registration will cause regulatory embargo']
      },
      {
        agent: 'STRATEGIST',
        title: 'Actionable IP & ABS Roadmap Synthesis',
        status: 'completed',
        details: 'Formulated multi-regime legal strategy isolating process patent, trademark, and NBA compliance.',
        timestamp: '17:43:06',
        findings: ['Pivot to Process Patent + Synergy Data', 'File NBA Form III', 'Register Brand Trademark']
      }
    ],
    citations: MASTER_CITATIONS,
    nodes: [
      { id: 'n-user', label: 'User Formulation', type: 'QUERY', subText: 'Ashwagandha + Guduchi' },
      { id: 'n-ashwa', label: 'Withania somnifera', type: 'ENTITY', subText: 'Botanical Resource' },
      { id: 'n-tkdl', label: 'Caraka Samhita TK', type: 'TK_RECORD', subText: 'Prior Art Documented' },
      { id: 'n-sec3p', label: 'Patents Act Sec 3(p)', type: 'STATUTE', subText: 'TK Exclusion Bar' },
      { id: 'n-nba', label: 'BD Act 2023 Sec 6', type: 'STATUTE', subText: 'NBA Approval Mandatory' },
      { id: 'n-verdict', label: 'Process Patent + ABS Path', type: 'VERDICT', subText: 'Recommended IP Strategy' }
    ],
    edges: [
      { source: 'n-user', target: 'n-ashwa', label: 'Contains ingredient' },
      { source: 'n-ashwa', target: 'n-tkdl', label: 'Matches classical text' },
      { source: 'n-tkdl', target: 'n-sec3p', label: 'Triggers patent bar' },
      { source: 'n-ashwa', target: 'n-nba', label: 'Requires NBA clearance' },
      { source: 'n-sec3p', target: 'n-verdict', label: 'Guides IP pivot' },
      { source: 'n-nba', target: 'n-verdict', label: 'Mandates compliance' }
    ],
    legalDisclaimer: 'DISCLAIMER: IP-SAKTI Sahayak provides source-cited legal & regulatory information grounded in official statutes and traditional knowledge corpora. This information does not constitute formal legal advice. Consult a registered Patent Agent or AYUSH IP Facilitator for official filings.'
  };
}
