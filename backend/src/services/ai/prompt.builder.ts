function getString(input: object, key: string, fallback = ''): string {
  const value = (input as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : fallback;
}

export function buildCountryPrompt(input: object): string {
  const profession = getString(input, 'profession');
  const budget = getString(input, 'budget');
  const language = getString(input, 'language', 'English');
  const goals = getString(input, 'goals');

  return `Analyze and recommend the 5 best countries for relocation for this profile:
- Profession: ${profession}
- Monthly budget: ${budget}
- Preferred working language: ${language}
- Goals: ${goals}

Respond with EXACTLY this JSON structure (no other text):
{
  "summary": "2-3 sentence personalized relocation strategy",
  "countries": [
    {
      "name": "Country Name",
      "flag": "🇵🇹",
      "score": 92,
      "reasons": ["Specific reason 1", "Specific reason 2", "Specific reason 3"],
      "visa": "Visa type: requirements and timeline",
      "cost": "$X,XXX–$X,XXX/month",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1", "Con 2"]
    }
  ],
  "plan": [
    "Month 1: Research specific action",
    "Month 2: Document preparation",
    "Month 3: Visa application",
    "Month 4–6: Transition planning",
    "Month 6–12: Move and settle"
  ],
  "checklist": [
    "Obtain apostille on birth certificate",
    "Open international bank account",
    "Get criminal background check",
    "Research health insurance options",
    "Join expat communities in target country"
  ]
}

Tailor everything to the profession and goals. Be specific, not generic. Score from 0-100.`;
}

export function buildPlanPrompt(input: object): string {
  return `Create a practical relocation action plan for this input as valid JSON only:
${JSON.stringify(input)}
`;
}

export function buildVisaPrompt(input: object): string {
  return `Provide visa-focused relocation guidance for this input as valid JSON only:
${JSON.stringify(input)}
`;
}

export function buildCostPrompt(input: object): string {
  return `Provide relocation cost-focused guidance for this input as valid JSON only:
${JSON.stringify(input)}
`;
}

const strategies = {
  country: buildCountryPrompt,
  plan: buildPlanPrompt,
  visa: buildVisaPrompt,
  cost: buildCostPrompt,
};

export function buildPrompt(mode: string, input: object): string {
  const strategy = strategies[mode as keyof typeof strategies] ?? strategies.country;
  return strategy(input);
}
