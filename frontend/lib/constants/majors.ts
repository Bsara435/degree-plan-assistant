/**
 * AUI Majors organized by School and Degree Level
 * School of Science and Engineering (SSE)
 * School of Humanities and Social Sciences (SHSS/SSAH) - Currently using SHAS in codebase
 * School of Business Administration (SBA)
 */

// SSE - School of Science & Engineering
export const SSE_UNDERGRADUATE = [
  // Computer-related
  "Computer Science (BSCS / BSCSC)",
  "Artificial Intelligence & Robotization (BSAIR)",
  "Big Data Analytics (BSBDA)",
  "Cloud & Mobile Software Engineering",
  "Computer Systems / Systems-oriented Informatics (BSCSys)",
  "Digital Industry (BSDI)",
  // Engineering / Engineering-Management
  "Engineering & Management Science (BSEMS)",
  "General Engineering (BSGE)",
  "Renewable Energy Systems Engineering (BSRESE)",
  "Manufacturing & Logistics Engineering (MLE)",
  "Engineering Decision Support Systems",
] as const;

export const SSE_GRADUATE = [
  "Software Engineering (MSc)",
  "Computer Science (MSc)",
  "Computer Networks (MSc)",
  "Information Systems Security (MSc)",
  "Biotechnology (MSc)",
  "Sustainable Energy Management (MSc)",
] as const;

// SHSS / SSAH - School of Humanities & Social Sciences
export const SHSS_UNDERGRADUATE = [
  "International Studies (B.A.)",
  "Communication Studies (B.A.)",
  "Environmental Studies & Sustainability (B.Sc.)",
  "Territorial Planning and Management (B.Sc.)",
  "Human Resource Development (B.Sc.)",
  "Digital Humanities and Cultural Production (B.A.)",
  "Psychology (B.A.)",
] as const;

export const SHSS_GRADUATE = [
  "Human Resource Development (M.Sc.)",
  "International Studies & Diplomacy (M.A.)",
  "North African and Middle Eastern Studies (M.A.)",
  "Communication Studies & Digital Media (M.A.)",
  "AI and Human Society (M.A.)",
  "Governance Development and Public Policy (M.Sc.)",
] as const;

// SBA - School of Business Administration
export const SBA_UNDERGRADUATE = [
  "Bachelor of Business Administration (BBA) - Finance",
  "Bachelor of Business Administration (BBA) - Management",
  "Bachelor of Business Administration (BBA) - Marketing",
  "Bachelor of Business Administration (BBA) - Logistics / Supply Chain Management",
  "Bachelor of Business Administration (BBA) - International Business / International Trade",
  "Bachelor of Business Administration (BBA) - Business-AI & Analytics",
] as const;

export const SBA_GRADUATE = [
  "Master of Business Administration (MBA)",
  "Executive MBA (EMBA)",
  "Part-time MBA",
  "Executive Leadership Academy",
  "Master of Science in Digital Marketing and Analytics (MSDMA)",
  "Master of Science in International Trade",
  "Master of Science in Logistics & Supply Chain",
] as const;

// Combine all majors for validation
export const ALL_MAJORS = [
  ...SSE_UNDERGRADUATE,
  ...SSE_GRADUATE,
  ...SHSS_UNDERGRADUATE,
  ...SHSS_GRADUATE,
  ...SBA_UNDERGRADUATE,
  ...SBA_GRADUATE,
] as const;

// Majors by school (for easy lookup)
export const MAJORS_BY_SCHOOL: Record<string, readonly string[]> = {
  SSE: [...SSE_UNDERGRADUATE, ...SSE_GRADUATE],
  SHAS: [...SHSS_UNDERGRADUATE, ...SHSS_GRADUATE], // Note: Using SHAS to match existing codebase
  SBA: [...SBA_UNDERGRADUATE, ...SBA_GRADUATE],
};

// Majors by school and degree level
export const MAJORS_BY_SCHOOL_AND_LEVEL: Record<
  string,
  { undergraduate: readonly string[]; graduate: readonly string[] }
> = {
  SSE: {
    undergraduate: SSE_UNDERGRADUATE,
    graduate: SSE_GRADUATE,
  },
  SHAS: {
    undergraduate: SHSS_UNDERGRADUATE,
    graduate: SHSS_GRADUATE,
  },
  SBA: {
    undergraduate: SBA_UNDERGRADUATE,
    graduate: SBA_GRADUATE,
  },
};

// School options
export const SCHOOLS = [
  { value: "SSE", label: "School of Science and Engineering (SSE)" },
  { value: "SHAS", label: "School of Humanities and Social Sciences (SHAS)" },
  { value: "SBA", label: "School of Business Administration (SBA)" },
] as const;

