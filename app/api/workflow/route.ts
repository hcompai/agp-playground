import { NextResponse } from 'next/server';
import { type Run, start } from 'workflow/api';
import { executeAgentWorkflow } from '@/workflows/agent-workflow';
import { companyEarningsFlow } from '@/workflows/company-earnings-flow';
import { env } from '@/env';

export async function POST(request: Request) {
  const { pattern, configs, apiKey, agentPlatformUrl } = await request.json();
  let run: Run<unknown> | undefined;

  switch (pattern) {
    case 'company-earnings':
      run = await start(companyEarningsFlow, ['Find earnings report']);
      break;
    case 'agent': {
      // Agent Platform Workflow - use provided configs or defaults
      const agentConfigs = configs || [];

      if (agentConfigs.length === 0) {
        return NextResponse.json({ error: 'No configurations provided' }, { status: 400 });
      }

      const agentCredentials = {
        apiKey: apiKey || env.AGP_API_KEY,
        agentPlatformUrl: agentPlatformUrl || env.AGP_BASE_URL
      };

      run = await start(executeAgentWorkflow, [agentConfigs, agentCredentials]);
      break;
    }
    default:
      return NextResponse.json({ error: 'Invalid pattern' }, { status: 400 });
  }

  const runId = run.runId;
  return NextResponse.json({ runId });
}
