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

  // Pass serializable config, not class instances
  const agentConfig = {
    baseUrl: AGENT_PLATFORM_URL,
    apiKey: AGP_API_KEY
  };

  const result1 = await findEarningsReport(input, agentConfig);
  const result2 = await extractKeyFigures(result1, agentConfig);

  return {
    step1: result1,
    step2: result2,
    totalSteps: 2
  };
}

async function findEarningsReport(input: string, agentConfig: { baseUrl: string; apiKey: string }) {
  'use step';

  // Create agent inside the step (can't pass class instances to steps)
  const agent = new WebAgent({
    baseUrl: agentConfig.baseUrl,
    apiKey: agentConfig.apiKey
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
  previousResult: { taskId: string; status: string; answer: string },
  agentConfig: { baseUrl: string; apiKey: string }
) {
  'use step';

  // Use the answer from the previous step
  const previousAnswer = previousResult.answer;

  // Create agent inside the step (can't pass class instances to steps)
  const agent = new WebAgent({
    baseUrl: agentConfig.baseUrl,
    apiKey: agentConfig.apiKey
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
