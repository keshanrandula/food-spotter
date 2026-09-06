export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  temperature = 0.7,
  responseFormat?: { type: 'json_object' }
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3-8b-instruct:free';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const payload: Record<string, any> = {
    model,
    messages,
    temperature,
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://localhost:3000',
      'X-Title': 'Find Restaurant App',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API call failed [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}
