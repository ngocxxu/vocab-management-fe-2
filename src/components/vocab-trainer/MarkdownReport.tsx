'use client';

import { CheckCircle, Copy } from '@solar-icons/react/ssr';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MarkdownReportProps = {
  markdown: string;
};

const MarkdownReport: React.FC<MarkdownReportProps> = ({ markdown }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      toast.success('Markdown report copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy markdown');
    }
  };

  const renderInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const italicMatch = remaining.match(/\*(.+?)\*/);
      const codeMatch = remaining.match(/`(.+?)`/);

      let match = null;
      let matchType: 'bold' | 'italic' | 'code' | null = null;
      let matchIndex = Infinity;

      if (boldMatch && boldMatch.index !== undefined && boldMatch.index < matchIndex) {
        match = boldMatch;
        matchType = 'bold';
        matchIndex = boldMatch.index;
      }
      if (italicMatch && italicMatch.index !== undefined && italicMatch.index < matchIndex) {
        match = italicMatch;
        matchType = 'italic';
        matchIndex = italicMatch.index;
      }
      if (codeMatch && codeMatch.index !== undefined && codeMatch.index < matchIndex) {
        match = codeMatch;
        matchType = 'code';
        matchIndex = codeMatch.index;
      }

      if (match && match.index !== undefined) {
        if (match.index > 0) {
          parts.push(remaining.slice(0, match.index));
        }

        if (matchType === 'bold') {
          parts.push(
            <strong key={key++} className="font-bold text-slate-900 dark:text-white">
              {match[1]}
            </strong>,
          );
        } else if (matchType === 'italic') {
          parts.push(
            <em key={key++} className="italic">
              {match[1]}
            </em>,
          );
        } else if (matchType === 'code') {
          parts.push(
            <code key={key++} className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-sm dark:bg-slate-700">
              {match[1]}
            </code>,
          );
        }

        remaining = remaining.slice(match.index + match[0].length);
      } else {
        parts.push(remaining);
        break;
      }
    }

    return <>{parts}</>;
  };

  const renderMarkdown = (text: string): React.ReactNode => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ');
        if (paragraphText.trim()) {
          elements.push(
            <p key={`p-${elements.length}`} className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300">
              {renderInlineMarkdown(paragraphText)}
            </p>,
          );
        }
        currentParagraph = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <pre
            key={`code-${elements.length}`}
            className="mb-4 overflow-x-auto rounded-lg bg-slate-100 p-4 font-mono text-sm dark:bg-slate-800"
          >
            <code>{codeBlockContent.join('\n')}</code>
          </pre>,
        );
        codeBlockContent = [];
      }
    };

    lines.forEach((line) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushParagraph();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      if (line.trim() === '') {
        flushParagraph();
        return;
      }

      if (line.startsWith('# ')) {
        flushParagraph();
        elements.push(
          <h1 key={`h1-${elements.length}`} className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
            {line.slice(2)}
          </h1>,
        );
        return;
      }

      if (line.startsWith('## ')) {
        flushParagraph();
        elements.push(
          <h2 key={`h2-${elements.length}`} className="mt-6 mb-3 text-2xl font-semibold text-slate-900 dark:text-white">
            {line.slice(3)}
          </h2>,
        );
        return;
      }

      if (line.startsWith('### ')) {
        flushParagraph();
        elements.push(
          <h3 key={`h3-${elements.length}`} className="mt-4 mb-2 text-xl font-semibold text-slate-900 dark:text-white">
            {line.slice(4)}
          </h3>,
        );
        return;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        flushParagraph();
        const listItem = line.slice(2);
        const lastElement = elements[elements.length - 1];
        if (React.isValidElement(lastElement) && lastElement.type === 'ul') {
          const children = (lastElement.props as { children?: React.ReactNode }).children;
          const existingList = Array.isArray(children) ? children : children ? [children] : [];
          elements[elements.length - 1] = (
            <ul key={lastElement.key} className="mb-4 ml-6 list-disc space-y-2">
              {[...existingList, <li key={existingList.length}>{renderInlineMarkdown(listItem)}</li>]}
            </ul>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} className="mb-4 ml-6 list-disc space-y-2">
              <li>{renderInlineMarkdown(listItem)}</li>
            </ul>,
          );
        }
        return;
      }

      if (line.match(/^\d+\.\s/)) {
        flushParagraph();
        const listItem = line.replace(/^\d+\.\s/, '');
        const lastElement = elements[elements.length - 1];
        if (React.isValidElement(lastElement) && lastElement.type === 'ol') {
          const children = (lastElement.props as { children?: React.ReactNode }).children;
          const existingList = Array.isArray(children) ? children : children ? [children] : [];
          elements[elements.length - 1] = (
            <ol key={lastElement.key} className="mb-4 ml-6 list-decimal space-y-2">
              {[...existingList, <li key={existingList.length}>{renderInlineMarkdown(listItem)}</li>]}
            </ol>
          );
        } else {
          elements.push(
            <ol key={`ol-${elements.length}`} className="mb-4 ml-6 list-decimal space-y-2">
              <li>{renderInlineMarkdown(listItem)}</li>
            </ol>,
          );
        }
        return;
      }

      currentParagraph.push(line);
    });

    flushParagraph();
    flushCodeBlock();

    return elements;
  };

  return (
    <Card className="border border-border bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
          Evaluation Report
        </CardTitle>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="rounded-xl border-border bg-white px-4 py-2 text-slate-900 transition-all duration-300 hover:scale-105 dark:bg-slate-900 dark:text-white"
        >
          {copied
            ? (
                <>
                  <CheckCircle size={16} weight="BoldDuotone" className="mr-2 text-emerald-600 dark:text-emerald-400" />
                  Copied!
                </>
              )
            : (
                <>
                  <Copy size={16} weight="BoldDuotone" className="mr-2" />
                  Copy
                </>
              )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {renderMarkdown(markdown)}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarkdownReport;
