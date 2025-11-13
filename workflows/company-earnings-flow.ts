import { env } from '@/env';
import { WebAgent } from '@h-company/agp-sdk-js';
import { RetryableError } from 'workflow';

const AGENT_PLATFORM_URL = env.AGP_BASE_URL;
const AGP_API_KEY = env.AGP_API_KEY;

export async function companyEarningsFlow(input: string) {
  'use workflow';

  if (!AGP_API_KEY) {
    throw new Error('AGP_API_KEY is not set');
  }

  const result1 = await findEarningsReport(input);
  const result2 = await extractKeyFigures(result1);

  return {
    step1: result1,
    step2: result2,
    totalSteps: 2
  };
}

async function findEarningsReport(input: string) {
  'use step';

  // Access env variables directly in the step
  const agent = new WebAgent({
    baseUrl: AGENT_PLATFORM_URL,
    apiKey: AGP_API_KEY
  });

  const task = await agent.runAndWait(
    `Find the most recent earnings report/presentation by the renewable infrastructure group ticker TRIG. And provide me the link.`,
    {
      startUrl: 'https://bing.com',
      waitTimeout: 600000
    }
  );

  // Extract the answer from ChatMessageEvents
  const chatMessages = task.getChatMessages();
  const answerMessage = chatMessages.find((msg) => msg.data.type === 'answer');
  const answer = answerMessage?.data.content;
  if (!answer) {
    throw new RetryableError('No answer found');
  }

  // Return only serializable data (plain object)
  return {
    taskId: task.id,
    status: task.status,
    answer
  };
}

async function extractKeyFigures(
  previousResult: { taskId: string; status: string; answer: string }
) {
  'use step';

  // Use the answer from the previous step
  const previousAnswer = previousResult.answer;

  // Access env variables directly in the step
  const agent = new WebAgent({
    baseUrl: AGENT_PLATFORM_URL,
    apiKey: AGP_API_KEY
  });

  const task = await agent.runAndWait(
    `Find the 5 most significant figures from the presentation/report. Here is the link from the previous search: ${previousAnswer}`,
    {
      startUrl: '',
      waitTimeout: 600000
    }
  );

  // Extract the answer from ChatMessageEvents
  const chatMessages = task.getChatMessages();
  const answerMessage = chatMessages.find((msg) => msg.data.type === 'answer');
  const answer = answerMessage?.data.content;
  if (!answer) {
    throw new RetryableError('No answer found');
  }
  return answer;
}
