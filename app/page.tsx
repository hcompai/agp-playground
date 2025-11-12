'use client';

import { useState, useMemo, useEffect } from 'react';
import { WebAgent } from '@h-company/agp-sdk-js';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CodeBlock } from '@/components/code-block';
import { SaveConfigDialog } from '@/components/save-config-dialog';
import { SavedConfigs } from '@/components/saved-configs';
import EventStream from '@/components/event-stream';
import { saveConfiguration, type SavedConfiguration } from '@/lib/storage';
import { env } from '@/env';
import Link from 'next/link';
import { SparkleIcon, DownloadIcon, CheckIcon } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';

type RunMethod = 'run' | 'runAndWait';
type ViewMode = 'configure' | 'code';

const INITIAL_TASK = "Explore H Company's website to discover their recent blog posts, click on the latest post and read to the bottom of the page. Summarize the interesting findings and explain why they're significant for the AI and automation industry.";

export default function Home() {
  // Auth state
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Task state
  const [objective, setObjective] = useState(INITIAL_TASK);
  const [startUrl, setStartUrl] = useState('https://hcompany.ai');
  const [selectedRunMethod, setSelectedRunMethod] = useState<RunMethod>('run');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('configure');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [savedConfigKey, setSavedConfigKey] = useState(0);
  
  // Agent state
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  
  // Event stream state
  const [events, setEvents] = useState<any[]>([]);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [taskStatus, setTaskStatus] = useState<string>('');

  // Load API key from local storage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('agp-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      try {
        WebAgent.fromApiKey(storedApiKey, {
          baseUrl: env.AGP_BASE_URL,
        });
        setIsAuthenticated(true);
      } catch {
        // Invalid stored key, clear it
        localStorage.removeItem('agp-api-key');
      }
    }
  }, []);

  // Fetch available agents when authenticated
  useEffect(() => {
    const fetchAgents = async () => {
      if (!isAuthenticated || !apiKey) return;
      
      setIsLoadingAgents(true);
      try {
        const agent = WebAgent.fromApiKey(apiKey, { baseUrl: env.AGP_BASE_URL });
        const agents = await agent.listAgents();
        setAvailableAgents(agents);
        
        // Set default agent if available
        if (agents.length > 0 && !selectedAgent) {
          setSelectedAgent(agents[0].agent_identifier);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch agents:', error);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, [isAuthenticated, apiKey]);

  // Cleanup polling when component unmounts
  useEffect(() => {
    return () => {
      if (currentTask) {
        currentTask.stopPolling();
      }
    };
  }, [currentTask]);

  // Generate code example based on current configuration
  const codeExample = useMemo(() => {
    const authSetup = `const agent = WebAgent.fromApiKey('your-api-key-here', {
  baseUrl: '${env.AGP_BASE_URL}',
});`;

    const agentIdentifierLine = selectedAgent ? `  agentIdentifier: '${selectedAgent}',\n` : '';
    const taskConfig = `{
  startUrl: '${startUrl}',
${agentIdentifierLine}  ${selectedRunMethod === 'run' ? 'autoStart: true,' : ''}${selectedRunMethod === 'runAndWait' ? 'waitTimeout: 600000, // 10 minutes' : ''}
}`;

    const methodCall = selectedRunMethod === 'run'
      ? `const task = await agent.run(
  \`${objective}\`,
  ${taskConfig}
);

// Attach event listeners
task.onStatusChange((status) => {
  console.log('Status:', status);
});

task.onUpdate((data) => {
  console.log('Update:', data);
});

// Start polling for events
task.startPolling();`
      : `const task = await agent.runAndWait(
  \`${objective}\`,
  ${taskConfig}
);

console.log('Task completed:', task.status);`;

    return `import { WebAgent } from '@h-company/agp-sdk-js';

${authSetup}

${methodCall}`;
  }, [selectedRunMethod, objective, startUrl, selectedAgent]);

  // Initialize API Key Auth
  const initAPIKeyAuth = () => {
    if (!apiKey.trim()) return;

    try {
      // Validate API key format
      WebAgent.fromApiKey(apiKey, {
        baseUrl: env.AGP_BASE_URL,
      });

      // Save to local storage
      localStorage.setItem('agp-api-key', apiKey);
      setIsAuthenticated(true);
    } catch (error) {
      const err = error as Error;
      // eslint-disable-next-line no-console
      console.error('Failed to initialize API key auth:', err.message);
    }
  };

  // Clear API Key Auth
  const clearAPIKeyAuth = () => {
    localStorage.removeItem('agp-api-key');
    setApiKey('');
    setIsAuthenticated(false);
  };

  // Save configuration
  const handleSaveConfiguration = (name: string) => {
    saveConfiguration({
      name,
      startUrl,
      objective,
      runMethod: selectedRunMethod,
      code: codeExample,
    });
    setSavedConfigKey(prev => prev + 1); // Force re-render of SavedConfigs
  };

  // Load configuration
  const handleLoadConfiguration = (config: SavedConfiguration) => {
    setStartUrl(config.startUrl);
    setObjective(config.objective);
    // Filter out deprecated runStepByStep method
    const runMethod = config.runMethod === 'runStepByStep' ? 'run' : config.runMethod;
    setSelectedRunMethod(runMethod as RunMethod);
    setViewMode('configure'); // Switch to configure view when loading
  };

  // Attach all listeners to a task
  const attachTaskListeners = (task: any) => {
    task.onStatusChange((status: string) => {
      setTaskStatus(status);
    });

    task.onUpdate((event: any) => {
      setEvents((prev) => [...prev, event]);
    });

    // Start polling for events
    task.startPolling();
  };

  // Run a single task using SDK directly
  const executeTask = async () => {
    if (!objective.trim() || !isAuthenticated) return;

    try {
      // Stop polling on previous task if exists
      if (currentTask) {
        currentTask.stopPolling();
      }

      setIsRunning(true);
      setResult(null);
      setEvents([]); // Clear previous events

      // Initialize agent
      const agent = WebAgent.fromApiKey(apiKey, { baseUrl: env.AGP_BASE_URL });

      const taskOptions = {
        startUrl: startUrl.trim(),
        agentIdentifier: selectedAgent || undefined,
      };

      let task;

      // Execute based on selected method
      if (selectedRunMethod === 'runAndWait') {
        task = await agent.runAndWait(objective.trim(), {
          ...taskOptions,
          waitTimeout: 600000, // 10 minutes
        });
        
        setResult({
          taskId: task.id,
          status: task.status,
          method: 'runAndWait',
          agent: selectedAgent || 'default',
          message: 'Task completed and waited for result',
        });
      } else {
        // run
        task = await agent.run(objective.trim(), {
          ...taskOptions,
          autoStart: true,
        });

        setResult({
          taskId: task.id,
          status: task.status,
          method: 'run',
          agent: selectedAgent || 'default',
          message: 'Task started in background',
        });
      }

      if (task) {
        setCurrentTask(task);
        setTaskStatus(task.status);
        attachTaskListeners(task);
      }
    } catch (error) {
      const err = error as Error;
      // eslint-disable-next-line no-console
      console.error('Task execution failed:', err);
      setResult({ error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-background p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-24-bold-heading text-gray-8">
              AgP Playground
            </h1>
            <p className="text-14-regular-body text-gray-6 mt-1">
              Test and experiment with the Agent Platform SDK
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* API Key Input */}
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <CheckIcon className="w-4 h-4 text-gray-6" />
              )}
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="API Key"
                disabled={isAuthenticated}
                className="w-48 px-3 py-1.5 border border-gray-4 rounded-md disabled:bg-gray-3 text-14-regular-body focus:outline-none focus:ring-2 focus:ring-gray-6"
              />
              {!isAuthenticated ? (
                <Button
                  onClick={initAPIKeyAuth}
                  variant="default"
                  size="sm"
                >
                  Auth
                </Button>
              ) : (
                <Button
                  onClick={clearAPIKeyAuth}
                  variant="outline"
                  size="sm"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="h-6 w-px bg-gray-4" /> {/* Divider */}
            <Link href="/workflow-builder">
              <Button variant="outline">
                <SparkleIcon className="w-4 h-4 mr-2" />
                Workflow Builder
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Task Execution */}
            <div className="bg-gray-1 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-24-medium-heading text-gray-8">Task Execution</h2>
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-gray-2 rounded-lg p-1">
              <button
                onClick={() => setViewMode('configure')}
                className={`px-3 py-1.5 rounded-md text-14-medium-body transition-colors ${
                  viewMode === 'configure'
                    ? 'bg-gray-1 text-gray-8 shadow-sm'
                    : 'text-gray-6 hover:text-gray-8'
                }`}
              >
                Configure
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1.5 rounded-md text-14-medium-body transition-colors ${
                  viewMode === 'code'
                    ? 'bg-gray-1 text-gray-8 shadow-sm'
                    : 'text-gray-6 hover:text-gray-8'
                }`}
              >
                Code
              </button>
              </div>
            </div>
            
            {/* Actions */}
          <div className="flex items-center gap-3">
              <SavedConfigs 
                key={savedConfigKey} 
                onLoad={handleLoadConfiguration} 
                refreshKey={savedConfigKey}
              />
              <Button
                onClick={() => setIsSaveDialogOpen(true)}
                disabled={!objective.trim()}
                variant="ghost"
                size="sm"
              >
                <DownloadIcon className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
          
          {viewMode === 'configure' && (
          <div className="space-y-4">
            {/* Start URL */}
            <div>
              <label htmlFor="startUrl" className="block text-14-medium-body text-gray-8 mb-2">
                Start URL
              </label>
              <input
                id="startUrl"
                type="url"
                value={startUrl}
                onChange={(e) => setStartUrl(e.target.value)}
                placeholder="https://hcompany.ai"
                disabled={!isAuthenticated}
                className="w-full px-3 py-2 border border-gray-4 rounded-lg text-14-regular-body text-gray-8 placeholder-gray-5 disabled:bg-gray-3 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Agent Selector */}
            <div>
              <label htmlFor="agent" className="block text-14-medium-body text-gray-8 mb-2">
                Agent {isLoadingAgents && <span className="text-gray-6 text-12-regular-body">(loading...)</span>}
              </label>
              <Select
                value={selectedAgent}
                onValueChange={(value: string) => setSelectedAgent(value)}
                disabled={!isAuthenticated || isLoadingAgents || availableAgents.length === 0}
              >
                <SelectTrigger id="agent">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.map((agent) => (
                    <SelectItem key={agent.agent_identifier} value={agent.agent_identifier}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableAgents.length > 0 && selectedAgent && (
                <p className="text-12-regular-body text-gray-6 mt-1">
                  {availableAgents.find(a => a.agent_identifier === selectedAgent)?.description}
                </p>
              )}
            </div>

            {/* Objective */}
            <div>
              <label htmlFor="objective" className="block text-14-medium-body text-gray-8 mb-2">
                Objective
              </label>
              <textarea
                id="objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Describe what you want the agent to accomplish..."
                disabled={!isAuthenticated}
                rows={4}
                className="w-full px-3 py-2 border border-gray-4 rounded-lg text-14-regular-body text-gray-8 placeholder-gray-5 disabled:bg-gray-3 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              />
            </div>

            {/* Run Method */}
            <div>
              <label htmlFor="runMethod" className="block text-14-medium-body text-gray-8 mb-2">
                Run Method
              </label>
            <Select
                value={selectedRunMethod}
                onValueChange={(value: RunMethod) => setSelectedRunMethod(value)}
                disabled={!isAuthenticated}
            >
                <SelectTrigger id="runMethod">
                  <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="run">run() - Async</SelectItem>
                  <SelectItem value="runAndWait">runAndWait() - Sync</SelectItem>
              </SelectContent>
            </Select>
            </div>

            {/* Run Button */}
            <Button
              onClick={executeTask}
              disabled={!isAuthenticated || !objective.trim() || isRunning}
              className="w-full"
            >
              {isRunning ? 'Running...' : 'Run Task'}
            </Button>
          </div>
          )}

          {/* Code View */}
          {viewMode === 'code' && (
            <div>
              <CodeBlock code={codeExample} />
            </div>
          )}
            </div>

            {/* Result */}
            {result && (
              <div className="bg-gray-1 rounded-lg shadow p-6">
                <h2 className="text-24-medium-heading mb-4 text-gray-8">Result</h2>
                <pre className="bg-gray-2 p-4 rounded overflow-x-auto text-13-mono-regular-body text-gray-8">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Right Column - Event Stream */}
          <div className="space-y-6">
            {/* Event Stream */}
            <div className="bg-gray-1 rounded-lg shadow overflow-hidden" style={{ height: '850px' }}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-24-medium-heading text-gray-8">
                Event Stream {events.length > 0 && `(${events.length})`}
              </h2>
              <Button
                onClick={() => setEvents([])}
                variant="secondary"
                size="sm"
              >
                Clear Events
              </Button>
            </div>

            {currentTask && (
              <div className="pt-4 border-t border-gray-3">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-4">
                      {currentTask.liveViewUrl && (
                        <a
                          href={currentTask.liveViewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-12-regular-body text-gray-7 hover:text-gray-8 hover:underline"
                        >
                          Live View →
                        </a>
                      )}
                      <a
                        href={`https://surfer.hcompany.ai/surfer-view/${currentTask.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-12-regular-body text-gray-7 hover:text-gray-8 hover:underline"
                      >
                        View in Surfer →
                      </a>
                    </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                  <span className={`inline-flex items-center justify-center text-12-medium-heading px-3 py-1.5 rounded-md border ${
                        taskStatus === 'running' ? 'bg-gray-2 text-gray-8 border-gray-4' :
                        taskStatus === 'completed' ? 'bg-gray-8 text-gray-1 border-gray-8' :
                        taskStatus === 'failed' ? 'bg-gray-6 text-gray-1 border-gray-7' :
                        taskStatus === 'paused' ? 'bg-gray-3 text-gray-7 border-gray-4' :
                        'bg-gray-2 text-gray-6 border-gray-4'
                      }`}>
                        {taskStatus}
                      </span>
                    <Button
                      onClick={async () => {
                        if (currentTask) {
                          try {
                            await currentTask.pause();
                          } catch (error: any) {
                            // eslint-disable-next-line no-console
                            console.error('Pause failed:', error.message);
                          }
                        }
                      }}
                      disabled={taskStatus !== 'running'}
                      variant="secondary"
                      size="sm"
                    >
                      Pause
                    </Button>
                    <Button
                      onClick={async () => {
                        if (currentTask) {
                          try {
                            await currentTask.resume();
                          } catch (error: any) {
                            // eslint-disable-next-line no-console
                            console.error('Resume failed:', error.message);
                          }
                        }
                      }}
                      disabled={taskStatus !== 'paused'}
                      variant="secondary"
                      size="sm"
                    >
                      Resume
                    </Button>
                    <Button
                      onClick={async () => {
                        if (currentTask) {
                          try {
                            await currentTask.stop();
                          } catch (error: any) {
                            // eslint-disable-next-line no-console
                            console.error('Stop failed:', error.message);
                          }
                        }
                      }}
                      disabled={!['running', 'paused'].includes(taskStatus)}
                      variant="default"
                      size="sm"
                    >
                      Stop
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
              <div className={currentTask ? "h-[calc(100%-185px)]" : "h-[calc(100%-73px)]"}>
            <EventStream 
              events={events} 
              isRunning={taskStatus === 'running'}
              apiKey={apiKey}
            />
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Configuration Dialog */}
      <SaveConfigDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveConfiguration}
      />
    </div>
  );
}
