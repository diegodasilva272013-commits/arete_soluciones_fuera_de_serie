'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

export function TranscriptSection({ transcript }: { transcript: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card-premium">
      <button onClick={() => setOpen(v => !v)} className="flex w-full items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-brand-gold" />
          <span className="text-sm font-semibold text-brand-text">Transcripción de la clase</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-brand-muted" /> : <ChevronDown className="h-4 w-4 text-brand-muted" />}
      </button>
      {open && (
        <div className="mt-4 max-h-96 overflow-y-auto border-t border-[rgba(212,175,55,0.08)] pt-4">
          <p className="text-sm text-brand-muted leading-relaxed whitespace-pre-wrap">{transcript}</p>
        </div>
      )}
    </div>
  );
}
