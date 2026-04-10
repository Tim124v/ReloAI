function tryParseJson(raw: string): object | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as object;
    return null;
  } catch (error) {
    console.error('[response.formatter] JSON parse failed', error);
    return null;
  }
}

function cleanJsonFence(raw: string): string {
  return raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
}

export function parseAIResponse(raw: string): object {
  const direct = tryParseJson(raw);
  if (direct) return direct;

  const cleaned = cleanJsonFence(raw);
  const parsedCleaned = tryParseJson(cleaned);
  if (parsedCleaned) return parsedCleaned;

  throw new Error('Invalid AI response format');
}
