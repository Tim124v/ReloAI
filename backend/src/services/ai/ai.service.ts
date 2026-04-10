import OpenAI from 'openai';
import { buildPrompt } from './prompt.builder';
import { parseAIResponse } from './response.formatter';

function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Add it in the Secrets tab.');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function runAIAnalysis(mode: string, input: object): Promise<object> {
  try {
    const prompt = buildPrompt(mode, input);
    const openai = getOpenAI();

    const completionPromise = openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a relocation advisor. Respond ONLY with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2500,
      temperature: 0.7,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI service timeout')), 30000);
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]);

    const rawText = completion.choices[0].message.content || '{}';
    const result = parseAIResponse(rawText);

    return {
      result,
      tokens: completion.usage?.total_tokens ?? 0,
    };
  } catch (error) {
    console.error('[ai.service] runAIAnalysis failed', error);
    throw error;
  }
}
