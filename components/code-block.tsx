'use client';

import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export function CodeBlock({ code, lang = 'typescript' }: CodeBlockProps) {
  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    codeToHtml(code, {
      lang,
      theme: 'github-light',
    })
      .then(setHtml)
      .finally(() => setIsLoading(false));
  }, [code, lang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy code:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-muted rounded-lg h-64 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm hover:bg-primary/90"
      >
        {copied ? (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </span>
        )}
      </button>
      <div 
        className="[&_pre]:!bg-muted [&_pre]:!p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:border"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

