import OpenAI from 'openai';

export type AnalysisMode = 'country' | 'plan' | 'visa' | 'cost';

export interface ModeConfig {
  label: string;
  description: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'input' | 'textarea' | 'select';
    placeholder?: string;
    options?: string[];
    required: boolean;
  }>;
}

export const MODE_CONFIGS: Record<AnalysisMode, ModeConfig> = {
  country: {
    label: 'Country Analysis',
    description: 'Find the 5 best countries for your profile',
    fields: [
      { key: 'profession', label: 'Profession / Job title', type: 'input', placeholder: 'e.g. Software Engineer', required: true },
      { key: 'budget', label: 'Monthly budget', type: 'input', placeholder: 'e.g. $2,000–3,000/month', required: true },
      { key: 'language', label: 'Working language', type: 'select', options: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Russian', 'Arabic', 'Chinese'], required: false },
      { key: 'goals', label: 'Relocation goals', type: 'textarea', placeholder: 'e.g. Low taxes, warm climate, EU residency, safe for family…', required: true },
    ],
  },
  plan: {
    label: 'Relocation Plan',
    description: 'Step-by-step plan for a specific country',
    fields: [
      { key: 'profession', label: 'Profession / Job title', type: 'input', placeholder: 'e.g. Software Engineer', required: true },
      { key: 'budget', label: 'Monthly budget', type: 'input', placeholder: 'e.g. $2,000–3,000/month', required: true },
      { key: 'language', label: 'Working language', type: 'select', options: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Russian', 'Arabic', 'Chinese'], required: false },
      { key: 'destination', label: 'Destination country', type: 'input', placeholder: 'e.g. Portugal, UAE, Thailand', required: true },
    ],
  },
  visa: {
    label: 'Visa Guidance',
    description: 'Visa options, requirements and process',
    fields: [
      { key: 'nationality', label: 'Your nationality / passport', type: 'input', placeholder: 'e.g. Russian, Ukrainian, Indian', required: true },
      { key: 'profession', label: 'Profession / Job title', type: 'input', placeholder: 'e.g. Software Engineer', required: true },
      { key: 'destination', label: 'Destination country', type: 'input', placeholder: 'e.g. Portugal, UAE, Germany', required: true },
      { key: 'goals', label: 'Stay purpose', type: 'textarea', placeholder: 'e.g. Remote work, long-term residency, family reunification, startup…', required: true },
    ],
  },
  cost: {
    label: 'Cost Estimation',
    description: 'Detailed monthly cost breakdown for a destination',
    fields: [
      { key: 'destination', label: 'Destination country / city', type: 'input', placeholder: 'e.g. Lisbon, Dubai, Chiang Mai', required: true },
      { key: 'lifestyle', label: 'Lifestyle level', type: 'select', options: ['Budget', 'Comfortable', 'Premium'], required: true },
      { key: 'profession', label: 'Profession (for housing needs)', type: 'input', placeholder: 'e.g. Remote worker, Freelancer', required: false },
      { key: 'goals', label: 'Special requirements', type: 'textarea', placeholder: 'e.g. family of 3, need a car, private school for kids…', required: false },
    ],
  },
};

export interface CountryResult {
  summary: string;
  countries: Array<{
    name: string; flag: string; score: number;
    reasons: string[]; visa: string; cost: string;
    pros: string[]; cons: string[];
  }>;
  plan: string[];
  checklist: string[];
}

export interface PlanResult {
  destination: string;
  summary: string;
  phases: Array<{ phase: string; duration: string; tasks: string[] }>;
  requirements: string[];
  costs: { visa: string; monthly: string; oneTime: string };
  tips: string[];
}

export interface VisaResult {
  destination: string;
  summary: string;
  visaTypes: Array<{
    name: string;
    duration: string;
    requirements: string[];
    process: string[];
    cost: string;
    processingTime: string;
    difficulty: 'easy' | 'moderate' | 'hard';
  }>;
  documents: string[];
  tips: string[];
}

export interface CostResult {
  destination: string;
  lifestyle: string;
  summary: string;
  breakdown: {
    housing: { range: string; notes: string };
    food: { range: string; notes: string };
    transport: { range: string; notes: string };
    utilities: { range: string; notes: string };
    healthcare: { range: string; notes: string };
    entertainment: { range: string; notes: string };
  };
  total: { min: string; max: string };
  comparison: string;
  tips: string[];
}

export type AnyResult = CountryResult | PlanResult | VisaResult | CostResult;

function buildPrompt(mode: AnalysisMode, input: Record<string, string>): { system: string; user: string } {
  if (mode === 'country') {
    return {
      system: `You are a world-class international relocation advisor. Recommend the 5 best countries for relocation based on user profile. Respond with valid JSON only — no markdown, no text outside JSON.`,
      user: `Profile: Profession: ${input.profession}, Budget: ${input.budget}, Language: ${input.language || 'English'}, Goals: ${input.goals}

Return EXACTLY:
{"summary":"2-3 sentence strategy","countries":[{"name":"","flag":"🇵🇹","score":92,"reasons":["..."],"visa":"...","cost":"$X–$X/mo","pros":["..."],"cons":["..."]}],"plan":["Month 1: ..."],"checklist":["..."]}`,
    };
  }

  if (mode === 'plan') {
    return {
      system: `You are a world-class international relocation advisor. Create a detailed relocation plan for someone moving to a specific country. Respond with valid JSON only.`,
      user: `Profile moving to ${input.destination}: Profession: ${input.profession}, Budget: ${input.budget}, Language: ${input.language || 'English'}

Return EXACTLY:
{"destination":"${input.destination}","summary":"...","phases":[{"phase":"Phase 1: Research","duration":"Months 1-2","tasks":["..."]}],"requirements":["..."],"costs":{"visa":"...","monthly":"...","oneTime":"..."},"tips":["..."]}`,
    };
  }

  if (mode === 'visa') {
    return {
      system: `You are an expert international immigration lawyer and visa consultant. Provide accurate, practical visa guidance. Respond with valid JSON only.`,
      user: `Nationality: ${input.nationality}, Profession: ${input.profession}, Destination: ${input.destination}, Purpose: ${input.goals}

Return EXACTLY:
{"destination":"${input.destination}","summary":"...","visaTypes":[{"name":"...","duration":"...","requirements":["..."],"process":["..."],"cost":"...","processingTime":"...","difficulty":"moderate"}],"documents":["..."],"tips":["..."]}

Difficulty must be one of: easy, moderate, hard.`,
    };
  }

  // cost
  return {
    system: `You are a relocation finance expert. Provide accurate, up-to-date cost of living estimates. Respond with valid JSON only.`,
    user: `Destination: ${input.destination}, Lifestyle: ${input.lifestyle || 'Comfortable'}, Profile: ${input.profession || 'Remote worker'}, Notes: ${input.goals || 'none'}

Return EXACTLY:
{"destination":"${input.destination}","lifestyle":"${input.lifestyle}","summary":"...","breakdown":{"housing":{"range":"$X–$X","notes":"..."},"food":{"range":"$X–$X","notes":"..."},"transport":{"range":"$X–$X","notes":"..."},"utilities":{"range":"$X–$X","notes":"..."},"healthcare":{"range":"$X–$X","notes":"..."},"entertainment":{"range":"$X–$X","notes":"..."}},"total":{"min":"$X,XXX","max":"$X,XXX"},"comparison":"vs. US/EU average...","tips":["..."]}`,
  };
}

function validateResult(mode: AnalysisMode, result: Record<string, unknown>): boolean {
  if (mode === 'country') return Array.isArray(result.countries) && result.countries.length > 0;
  if (mode === 'plan') return Array.isArray(result.phases) && result.phases.length > 0;
  if (mode === 'visa') return Array.isArray(result.visaTypes) && result.visaTypes.length > 0;
  if (mode === 'cost') return typeof result.breakdown === 'object' && result.breakdown !== null;
  return false;
}

export async function runAiAnalysis(
  mode: AnalysisMode,
  input: Record<string, string>,
  apiKey: string,
): Promise<{ result: AnyResult; tokens: number }> {
  const openai = new OpenAI({ apiKey });
  const { system, user } = buildPrompt(mode, input);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2500,
    temperature: 0.7,
  });

  const rawText = completion.choices[0].message.content || '{}';
  let result: Record<string, unknown>;
  try {
    result = JSON.parse(rawText);
  } catch {
    throw new Error('AI returned malformed JSON. Try again.');
  }

  if (!validateResult(mode, result)) {
    throw new Error('AI returned incomplete data. Try again.');
  }

  return { result: result as unknown as AnyResult, tokens: completion.usage?.total_tokens ?? 0 };
}
