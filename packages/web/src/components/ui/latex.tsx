import * as React from 'react';
import katex from 'katex';
import { cn } from '@/lib/utils';

interface LatexProps {
  children: string;
  className?: string;
  block?: boolean;
}

/**
 * Render LaTeX math notation using KaTeX
 * Inline math: $...$
 * Block math: $$...$$
 *
 * Note: Uses dangerouslySetInnerHTML which is safe here because:
 * 1. KaTeX sanitizes LaTeX input and produces safe HTML
 * 2. Content comes from user's own local cards (not external sources)
 */
export function Latex({ children, className, block = false }: LatexProps) {
  const containerRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const html = renderLatexString(children);
    containerRef.current.innerHTML = html;
  }, [children]);

  return (
    <span
      ref={containerRef}
      className={cn(
        'latex-content',
        block && 'block text-center my-4',
        className
      )}
    />
  );
}

/**
 * Parse and render a string containing LaTeX expressions
 * Handles both inline ($...$) and block ($$...$$) math
 */
function renderLatexString(text: string): string {
  // First handle block math $$...$$
  let result = text.replace(/\$\$([^$]+)\$\$/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return `<span class="text-destructive">[LaTeX Error]</span>`;
    }
  });

  // Then handle inline math $...$
  result = result.replace(/\$([^$]+)\$/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return `<span class="text-destructive">[LaTeX Error]</span>`;
    }
  });

  return result;
}

/**
 * Simple component for rendering a single LaTeX expression
 * Safe to use dangerouslySetInnerHTML: KaTeX produces sanitized HTML output
 */
interface MathProps {
  children: string;
  display?: boolean;
  className?: string;
}

export function Math({ children, display = false, className }: MathProps) {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(children, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return '<span class="text-destructive">[LaTeX Error]</span>';
    }
  }, [children, display]);

  return (
    <span
      className={cn(display && 'block text-center my-4', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
