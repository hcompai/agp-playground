import { WebAgent } from '@h-company/agp-sdk-js';
import { env } from '@/env';

const AGENT_PLATFORM_URL = env.AGP_BASE_URL;
const AGP_API_KEY = env.AGP_API_KEY;

export async function executeAgentWorkflow(
  configs: Array<{
    name: string;
    objective: string;
    startUrl: string;
    runMethod: 'run' | 'runAndWait' | 'runStepByStep';
  }>
) {
  'use workflow';

  const results = [];

  for (const config of configs) {
    const stepResult = await executeAgentStep(config);
    results.push(stepResult);
  }

  return {
    steps: results,
    totalSteps: configs.length
  };
}

async function executeAgentStep(
  config: {
    name: string;
    objective: string;
    startUrl: string;
    runMethod: 'run' | 'runAndWait' | 'runStepByStep';
  }
) {
  'use step';

  // Access env variables directly in the step
  const agent = AGP_API_KEY
    ? new WebAgent({ apiKey: AGP_API_KEY, baseUrl: AGENT_PLATFORM_URL })
    : new WebAgent({ baseUrl: AGENT_PLATFORM_URL });

  let task;

  // Use longer timeouts for workflow steps (10 minutes)
  const AGENT_TIMEOUT = 600000; // 10 minutes in milliseconds

  if (config.runMethod === 'runAndWait') {
    task = await agent.runAndWait(config.objective, {
      startUrl: config.startUrl,
      waitTimeout: AGENT_TIMEOUT
    });
  } else if (config.runMethod === 'run') {
    task = await agent.run(config.objective, {
      startUrl: config.startUrl,
      autoStart: true
    });
  } else {
    task = await agent.runStepByStep(config.objective, {
      startUrl: config.startUrl
    });
  }

  // Wait for task completion (with timeout)
  if (config.runMethod !== 'runAndWait') {
    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Task ${task.id} did not complete within ${AGENT_TIMEOUT}ms`));
      }, AGENT_TIMEOUT);

      task.onStatusChange((status: string) => {
        if (['completed', 'failed'].includes(status)) {
          clearTimeout(timeoutId);
          resolve(undefined);
        }
      });
    });
  }

  return {
    name: config.name,
    taskId: task.id,
    status: task.status
  };
}
