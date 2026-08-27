'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { app } from '@/config/strings';

export function EmbedSnippet({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mt-5">
      <pre className="card overflow-x-auto p-4 text-xs leading-relaxed">
        <code>{snippet}</code>
      </pre>
      <button type="button" onClick={copy} className="btn btn-ghost mt-3 px-4 py-2 text-sm">
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? app.embed.copied : app.embed.copy}
      </button>
    </div>
  );
}
