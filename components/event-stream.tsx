'use client';

import React, { useEffect, useRef } from 'react';

interface GenericEvent {
  type: string;
  timestamp: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

interface EventStreamProps {
  events: GenericEvent[];
  isRunning?: boolean;
  apiKey?: string;
}

const EventStream: React.FC<EventStreamProps> = ({ events, isRunning = false, apiKey }) => {
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive (only within the container)
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [events]);

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return timestamp;
    }
  };

  const getEventColor = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes('completed')) return 'text-green-7';
    if (type.includes('error')) return 'text-red-7';
    if (type.includes('started')) return 'text-blue-7';
    return 'text-gray-7';
  };

  const getProxiedImageUrl = (imageUrl: string) => {
    if (!apiKey) return imageUrl;
    return `/api/screenshot-proxy?url=${encodeURIComponent(imageUrl)}&token=${encodeURIComponent(apiKey)}`;
  };

  const renderEventContent = (event: GenericEvent) => {
    const data = event.data as Record<string, unknown> | undefined;
    let mainContent = null;

    // Handle screenshot events
    if (data?.type === 'screenshot' && data?.content && typeof data.content === 'string') {
      mainContent = (
        <div>
          <img
            src={getProxiedImageUrl(data.content)}
            alt="Screenshot"
            className="rounded-lg border border-gray-3 w-full h-auto"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
        </div>
      );
    }
    // Handle web action events
    else if (event.type.toLowerCase().includes('web_action') && data?.action && typeof data.action === 'object' && data.action !== null) {
      const action = data.action as Record<string, unknown>;
      const actionType = typeof action.action_type === 'string' ? action.action_type : 'Action performed';
      const description = typeof action.description === 'string' ? action.description : null;
      
      mainContent = (
        <div className="space-y-2">
          <div className="text-14-medium-body text-gray-8">
            {actionType}
          </div>
          {description && (
            <div className="text-14-regular-body text-gray-7">
              {description}
            </div>
          )}
        </div>
      );
    }
    // Handle chat message events
    else if (event.type.toLowerCase().includes('chat_message') && data?.content && typeof data.content === 'string') {
      mainContent = (
        <div className="text-14-regular-body text-gray-8 leading-relaxed">
          {data.content}
        </div>
      );
    }
    // Handle thinking events
    else if (event.type.toLowerCase().includes('thinking') && data?.thought && typeof data.thought === 'string') {
      mainContent = (
        <div className="text-14-regular-body text-gray-7 italic leading-relaxed">
          {data.thought}
        </div>
      );
    }
    // Handle completed events
    else if (event.type.toLowerCase().includes('completed')) {
      mainContent = (
        <div className="text-14-medium-body text-green-8 leading-relaxed">
          Task completed successfully
        </div>
      );
    }
    // Generic fallback - try to find a displayable field
    else if (data && Object.keys(data).length > 0) {
      const displayField = (data.message || data.content || data.description) as string | undefined;
      if (displayField && typeof displayField === 'string') {
        mainContent = (
          <div className="text-14-regular-body text-gray-8 leading-relaxed">
            {displayField}
          </div>
        );
      }
    }

    // Always show collapsible event data if available
    const hasData = data && Object.keys(data).length > 0;

    return (
      <div className="space-y-2">
        {mainContent}
        {hasData && (
          <details className="text-13-mono-regular-body text-gray-6">
            <summary className="cursor-pointer text-12-medium-heading text-gray-6 hover:text-gray-7">
              View Event Data
            </summary>
            <pre className="mt-2 p-2 bg-gray-2 rounded text-12-regular-heading overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  };

  const hasScreenshots = (event: GenericEvent) => {
    const data = event.data as Record<string, unknown> | undefined;
    return data?.pre_action_screenshot || data?.post_action_screenshot;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto objective-scroll">
        <div className="max-w-3xl mx-auto space-y-4 p-4">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-5">
              <div className="text-center">
                <p className="text-14-regular-body">Events will appear here as the agent runs...</p>
              </div>
            </div>
          ) : (
            <>
              {events.map((event, index) => (
                <div key={`${event.timestamp}-${index}`} className="mb-6">
                  {/* Event header with type and timestamp */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-12-medium-heading uppercase tracking-wide font-semibold ${getEventColor(event.type)}`}>
                        {event.type.replace('agent.', '').replace(/_/g, ' ')}
                      </span>
                      <span className="text-10-mono-medium-heading text-gray-6 bg-gray-3 px-2 py-0.5 rounded">
                        {(() => {
                          const data = event.data as Record<string, unknown> | undefined;
                          const dataType = data?.type;
                          return typeof dataType === 'string' ? dataType : event.type;
                        })()}
                      </span>
                    </div>
                    <span className="text-12-regular-heading text-gray-6 font-mono">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>

                  {/* Event content */}
                  <div className="mt-1">
                    {renderEventContent(event)}

                    {/* Screenshots if available */}
                    {(() => {
                      if (!hasScreenshots(event)) return null;
                      
                      const data = event.data as Record<string, unknown> | undefined;
                      const preScreenshot = typeof data?.pre_action_screenshot === 'string' ? data.pre_action_screenshot : null;
                      const postScreenshot = typeof data?.post_action_screenshot === 'string' ? data.post_action_screenshot : null;
                      
                      return (
                        <div className="mt-3 space-y-3">
                          {preScreenshot && (
                            <div>
                              <p className="text-12-medium-heading text-gray-6 mb-2">Before Action:</p>
                              <img
                                src={getProxiedImageUrl(preScreenshot)}
                                alt="Pre-action screenshot"
                                className="rounded-lg border border-gray-3 w-full h-auto"
                                style={{ maxHeight: '300px', objectFit: 'contain' }}
                              />
                            </div>
                          )}
                          {postScreenshot && (
                            <div>
                              <p className="text-12-medium-heading text-gray-6 mb-2">After Action:</p>
                              <img
                                src={getProxiedImageUrl(postScreenshot)}
                                alt="Post-action screenshot"
                                className="rounded-lg border border-gray-3 w-full h-auto"
                                style={{ maxHeight: '300px', objectFit: 'contain' }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
              <div ref={eventsEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Loader at bottom when agent is running */}
      {isRunning && (
        <div className="border-t border-gray-3 bg-gray-1 p-4">
          <div className="max-w-3xl mx-auto flex items-center justify-center gap-3">
            <div className="animate-spin h-4 w-4 border-2 border-h-green border-t-transparent rounded-full"></div>
            <span className="text-12-regular-heading text-gray-6">
              Agent is running...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventStream;

