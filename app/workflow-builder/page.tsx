'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/code-block';
import { WorkflowConfigSelector } from '@/components/workflow-config-selector';
import { type SavedConfiguration } from '@/lib/storage';
import { env } from '@/env';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/theme-toggle';

type WorkflowPattern = 'agent' | 'company-earnings';

export default function WorkflowBuilderPage() {
  const [selectedWorkflowConfigs, setSelectedWorkflowConfigs] = useState<SavedConfiguration[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<WorkflowPattern>('agent');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  // Generate workflow code without quoted directives to avoid triggering the loader
  const workflowCode = useMemo(() => {
    if (selectedWorkflowConfigs.length === 0) {
      return `// Select configurations to build your workflow

import { WebAgent } from '@h-company/agp-sdk-js';

export async function myWorkflow(input: string) {
  "useworkflow";

  
  // Add steps by selecting saved configurations
  
  return { result: "workflow complete" };
}`;
    }

    const authSetup = `  const agent = new WebAgent({
    baseUrl: '${env.AGP_BASE_URL}',
  });`;

    // Generate workflow steps
    const workflowSteps = selectedWorkflowConfigs.map((config, index) => {
      const resultVar = `result${index + 1}`;
      return `  const ${resultVar} = await executeStep${index + 1}(${index === 0 ? 'input' : `result${index}`}, agent);`;
    }).join('\n');

    // Generate step functions
    const stepFunctions = selectedWorkflowConfigs.map((config, index) => {
      const stepNum = index + 1;
      const inputParam = index === 0 ? 'input: string' : `previousResult: unknown`;
      
      return `async function executeStep${stepNum}(${inputParam}, agent: WebAgent) {
  "usestep";
  
  const task = await agent.${config.runMethod}(
    \`${config.objective}\`,
    {
      startUrl: '${config.startUrl}',
      ${config.runMethod === 'run' ? 'autoStart: true,' : ''}${config.runMethod === 'runAndWait' ? 'waitTimeout: 600000, // 10 minutes' : ''}
    }
  );
  
  return task;
}`;
    }).join('\n\n');

    const lastResult = `result${selectedWorkflowConfigs.length}`;

    return `import { WebAgent } from '@h-company/agp-sdk-js';

export async function myWorkflow(input: string) {
  "useworkflow";
  
${authSetup}

${workflowSteps}
  
  return { result: ${lastResult} };
}

${stepFunctions}`;
  }, [selectedWorkflowConfigs]);

  // Workflow handlers
  const handleAddToWorkflow = (config: SavedConfiguration) => {
    if (!selectedWorkflowConfigs.find(c => c.id === config.id)) {
      setSelectedWorkflowConfigs([...selectedWorkflowConfigs, config]);
    }
  };

  const handleRemoveFromWorkflow = (configId: string) => {
    setSelectedWorkflowConfigs(selectedWorkflowConfigs.filter(c => c.id !== configId));
  };

  const handleMoveWorkflowStep = (fromIndex: number, toIndex: number) => {
    const newConfigs = [...selectedWorkflowConfigs];
    const [removed] = newConfigs.splice(fromIndex, 1);
    newConfigs.splice(toIndex, 0, removed);
    setSelectedWorkflowConfigs(newConfigs);
  };

  // Execute workflow
  const executeWorkflow = async () => {
    // Agent pattern requires configs, others don't
    if (selectedPattern === 'agent' && selectedWorkflowConfigs.length === 0) return;

    try {
      setIsRunning(true);
      setResult(null);

      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern: selectedPattern,
          configs: selectedPattern === 'agent' ? selectedWorkflowConfigs.map(c => ({
            name: c.name,
            objective: c.objective,
            startUrl: c.startUrl,
            runMethod: c.runMethod,
          })) : undefined,
          agentPlatformUrl: env.AGP_BASE_URL,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      const err = error as Error;
      // eslint-disable-next-line no-console
      console.error('Workflow execution failed:', err);
      setResult({ error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-background p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-24-bold-heading text-gray-8">Workflow Builder</h1>
            <p className="text-14-regular-body text-gray-6 mt-1">
              Chain multiple agent configurations into durable workflows
            </p>
          </div>
          <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Test Suite
            </Button>
          </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="bg-gray-1 border border-gray-4 rounded-lg shadow p-6 mb-6">
          <p className="text-14-regular-body text-gray-6 mb-6">
            Build durable, fault-tolerant workflows using{' '}
            <a 
              href="https://useworkflow.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-7 hover:text-gray-8 hover:underline"
            >
              Workflow DevKit
            </a>
            . Save configurations from the main test suite, then add them here as workflow steps.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Left: Step Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-24-medium-heading text-gray-8">Workflow Steps</h2>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedPattern}
                    onValueChange={(value: WorkflowPattern) => setSelectedPattern(value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agent Platform</SelectItem>
                      <SelectItem value="company-earnings">Company Earnings</SelectItem>  
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={executeWorkflow}
                    disabled={(selectedPattern === 'agent' && selectedWorkflowConfigs.length === 0) || isRunning}
                    size="sm"
                  >
                    {isRunning ? (
                      <>
                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Running...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Run Workflow
                      </>
                    )}
                  </Button>
                  {selectedPattern === 'agent' && (
                    <WorkflowConfigSelector 
                      selectedConfigs={selectedWorkflowConfigs}
                      onAdd={handleAddToWorkflow}
                    />
                  )}
                </div>
              </div>

              {selectedPattern === 'agent' ? (
                selectedWorkflowConfigs.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-4 rounded-lg p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-5 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-18-bold-heading text-gray-8 mb-2">No steps added yet</p>
                    <p className="text-14-regular-body text-gray-6 mb-4">
                      Add saved configurations to build your workflow
                    </p>
                    <Link href="/">
                      <Button variant="outline" size="sm">
                        Go to Test Suite to Save Configurations
                      </Button>
                    </Link>
                  </div>
                ) : (
                <div className="space-y-3">
                  {selectedWorkflowConfigs.map((config, index) => (
                    <div
                      key={config.id}
                      className="bg-gray-2 rounded-lg p-4 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex flex-col gap-1 pt-1">
                            <button
                              onClick={() => handleMoveWorkflowStep(index, index - 1)}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-1 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              aria-label="Move up"
                            >
                              <svg className="w-3 h-3 text-gray-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleMoveWorkflowStep(index, index + 1)}
                              disabled={index === selectedWorkflowConfigs.length - 1}
                              className="p-1 hover:bg-gray-1 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              aria-label="Move down"
                            >
                              <svg className="w-3 h-3 text-gray-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-10-mono-medium-heading text-gray-6 bg-gray-1 px-2 py-0.5 rounded">
                                Step {index + 1}
                              </span>
                              <span className="text-14-medium-heading text-gray-8 truncate">
                                {config.name}
                              </span>
                            </div>
                            <div className="text-12-regular-body text-gray-6 truncate mb-1">
                              {config.runMethod} • {config.startUrl}
                            </div>
                            <div className="text-12-regular-body text-gray-6 line-clamp-2">
                              {config.objective}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFromWorkflow(config.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-3 rounded transition-all shrink-0"
                          aria-label="Remove step"
                        >
                          <svg className="w-4 h-4 text-gray-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                )
              ) : (
                <div className="border-2 border-dashed border-gray-4 rounded-lg p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-5 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-18-bold-heading text-gray-8 mb-2">Pre-configured Workflow</p>
                  <p className="text-14-regular-body text-gray-6">
                    This workflow is ready to run with example data. Click "Run Workflow" to test it.
                  </p>
                </div>
              )}

              {selectedPattern === 'agent' && selectedWorkflowConfigs.length > 0 && (
                <div className="mt-4 p-4 bg-gray-2 rounded-lg">
                  <h3 className="text-14-medium-heading text-gray-8 mb-2">Workflow Summary</h3>
                  <div className="space-y-1 text-12-regular-body text-gray-6">
                    <div className="flex justify-between">
                      <span>Total Steps:</span>
                      <span className="font-medium text-gray-7">{selectedWorkflowConfigs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Duration:</span>
                      <span className="font-medium text-gray-7">~{selectedWorkflowConfigs.length * 2} minutes</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Generated Code */}
            <div>
              <h2 className="text-24-medium-heading text-gray-8 mb-4">
                {selectedPattern === 'agent' ? 'Generated Workflow Code' : 'Workflow Information'}
              </h2>
              {selectedPattern === 'agent' ? (
                <>
                  <CodeBlock code={workflowCode} />
                  
                  {selectedWorkflowConfigs.length > 0 && (
                <div className="mt-4 p-4 bg-gray-2 border border-gray-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-7 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-12-regular-body">
                      <p className="font-medium text-gray-8 mb-1">How to use this workflow:</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-6">
                        <li>Copy the generated code above</li>
                        <li>Create a new file in your project (e.g., <code className="bg-gray-3 px-1 py-0.5 rounded text-gray-8">workflows/my-workflow.ts</code>)</li>
                        <li>Paste the code and update the API key</li>
                        <li>Import and call the workflow function</li>
                        <li>See the <a href="https://useworkflow.dev/docs" target="_blank" rel="noopener noreferrer" className="text-gray-7 hover:text-gray-8 hover:underline">Workflow DevKit docs</a> for more details</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
                </>
              ) : (
                <div className="bg-gray-2 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-18-bold-heading text-gray-8 mb-2">
                        {selectedPattern === 'company-earnings' && 'Company Earnings Flow'}
                      </h3>
                      <p className="text-14-regular-body text-gray-6">
                        {selectedPattern === 'company-earnings' && 'Finds recent earnings reports and extracts key figures using web agents.'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-1 rounded-lg p-4">
                      <p className="text-14-medium-body text-gray-8 mb-2">This workflow includes:</p>
                      <ul className="text-14-regular-body text-gray-6 space-y-1 list-disc list-inside">
                        {selectedPattern === 'company-earnings' && (
                          <>
                            <li>Step 1: Search for recent earnings report</li>
                            <li>Step 2: Extract key figures from report</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workflow Results */}
        {result && (
          <div className="bg-gray-1 border border-gray-4 rounded-lg shadow p-6 mt-6">
            <h2 className="text-24-medium-heading text-gray-8 mb-4">Workflow Results</h2>
            
            {result.error ? (
              <div className="bg-gray-3 border border-gray-5 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-gray-7 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-8 mb-1">Error</p>
                    <p className="text-sm text-muted-foreground">{String(result.error)}</p>
                  </div>
                </div>
              </div>
            ) : result.runId ? (
              <div className="space-y-4">
                <div className="bg-gray-2 border border-gray-4 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-7 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-8 mb-1">Workflow Started Successfully</p>
                      <p className="text-14-regular-body text-gray-6 mb-3">
                        Your workflow is running in the background. Use the Workflow DevKit observability UI to monitor progress.
                      </p>
                      <div className="bg-gray-3 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-12-medium-body text-gray-6">Run ID:</span>
                        </div>
                        <code className="text-12-mono-regular-body text-gray-8 break-all">{String(result.runId)}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const runId = result.runId as string;
                            navigator.clipboard.writeText(runId);
                          }}
                        >
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Run ID
                        </Button>
                        <a
                          href="https://useworkflow.dev/docs/observability"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Observability Docs
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-2 rounded-lg p-4">
                  <h3 className="text-14-medium-heading text-gray-8 mb-2">How to monitor your workflow:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-12-regular-body text-gray-6">
                    <li>Open a terminal in your project directory</li>
                    <li>Run: <code className="bg-gray-3 px-1 py-0.5 rounded text-12-mono-regular-body text-gray-8">npx workflow inspect runs --web</code></li>
                    <li>Click on your Run ID to see real-time progress, logs, and step details</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-xs overflow-auto">
                  <code>{JSON.stringify(result, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

