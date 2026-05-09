import { useState, useRef, useEffect, useCallback } from 'react';
import { UserBubble, AIBubble, LoadingBubble } from './MessageBubble';
import DemoFallback from './DemoFallback';
import resources from '../data/resources.json';

/* ---------- Icons ---------- */
function Icon({ d, size = 20, stroke = 1.75, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {d}
    </svg>
  );
}

const Send = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    }
  />
);

const Compass = (p) => (
  <Icon
    {...p}
    d={
      <>
        <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
        <circle cx="12" cy="12" r="10" />
      </>
    }
  />
);

/* ---------- Resource lookup map ---------- */
const resourceById = Object.fromEntries(resources.map((r) => [r.id, r]));

/* ---------- Parse AI text into blocks ----------
   Splits on [ref:some-id] tokens.
   Text segments become { type: 'text', content } blocks.
   Recognised refs become { type: 'resource', resource } blocks.
   Unrecognised refs are kept as plain text.
   During streaming, only text blocks are emitted (no resource cards mid-stream).
*/
function parseBlocks(text, isStreaming) {
  const parts = text.split(/(\[ref:[^\]]+\])/g);
  const blocks = [];

  for (const part of parts) {
    const match = part.match(/^\[ref:([^\]]+)\]$/);
    if (match) {
      const id = match[1];
      const resource = resourceById[id];
      if (resource && !isStreaming) {
        blocks.push({ type: 'resource', resource });
      } else {
        // During streaming keep as text; unrecognised ids also as text
        const last = blocks[blocks.length - 1];
        if (last?.type === 'text') {
          last.content += isStreaming ? '' : part;
        } else if (!isStreaming) {
          blocks.push({ type: 'text', content: part });
        }
      }
    } else if (part) {
      const last = blocks[blocks.length - 1];
      if (last?.type === 'text') {
        last.content += part;
      } else {
        blocks.push({ type: 'text', content: part });
      }
    }
  }

  return blocks.filter((b) => b.type !== 'text' || b.content.trim() !== '');
}

/* ---------- Empty state ---------- */
function EmptyState({ onSuggestion }) {
  const suggestions = [
    'I need a place to stay tonight in Toronto',
    'How do I file a refugee claim?',
    'I need help finding work in Ontario',
  ];

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6 py-12 text-center fade-up">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-white">
        <Compass size={26} stroke={2} />
      </span>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
        Hi — I'm here to help you find verified housing, legal aid, and employment support in Canada. What do you need help with today?
      </h2>
      <p className="mt-3 text-base leading-relaxed text-gray-500">
        You can write in plain language. Nothing you share is logged or sent to a government agency.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestion(s)}
            className="inline-flex min-h-11 items-center rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition hover:border-stone-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Input bar ---------- */
function InputBar({ value, onChange, onSubmit, disabled }) {
  const textareaRef = useRef(null);

  // Auto-resize textarea up to max-height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="border-t border-stone-200 bg-stone-50">
      <form
        className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Message Arrive
        </label>
        <textarea
          ref={textareaRef}
          id="chat-input"
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Tell me what you need help with…"
          disabled={disabled}
          className="flex-1 resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base leading-relaxed text-neutral-900 placeholder:text-gray-500 shadow-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 focus:ring-offset-stone-50 disabled:bg-stone-100"
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-base font-medium text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-gray-500 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50"
        >
          <Send size={18} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}

/* ---------- ChatBox ----------
   Props:
     province   — from onboarding context
     status     — from onboarding context
     needs      — from onboarding context
     filteredResources — pre-filtered array from filterResources()
     onSendMessage(msg, history) — async generator or fetch call; see watsonxClient
     onError(filteredResources) — called when request fails/times out
*/
export default function ChatBox({
  province,
  status,
  needs,
  filteredResources = [],
  sendMessage,
}) {
  // messages: Array<{ id, role: 'user'|'ai', text?, rawText?, blocks?, error? }>
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  // 'idle' | 'loading' | 'streaming'
  const [chatStatus, setChatStatus] = useState('idle');
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef(null);
  const timeoutRef = useRef(null);

  // Scroll to bottom whenever messages or streaming text change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatStatus, streamingText]);

  // Build history array for the API call (exclude error messages)
  function buildHistory() {
    return messages
      .filter((m) => !m.error)
      .map((m) => ({
        role: m.role,
        content: m.role === 'user' ? m.text : m.rawText ?? '',
      }));
  }

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || chatStatus !== 'idle') return;

    setInput('');
    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setChatStatus('loading');
    setStreamingText('');

    const history = buildHistory();

    // 15-second timeout guard
    let timedOut = false;
    timeoutRef.current = setTimeout(() => {
      timedOut = true;
      setChatStatus('idle');
      setStreamingText('');
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'ai', error: true, rawText: '' },
      ]);
    }, 15000);

    try {
      let accumulated = '';
      let firstChunk = true;

      await sendMessage(
        { message: text, history, province, status, needs, filteredResources },
        (chunk) => {
          if (timedOut) return;
          if (firstChunk) {
            clearTimeout(timeoutRef.current);
            firstChunk = false;
            setChatStatus('streaming');
          }
          accumulated += chunk;
          setStreamingText(accumulated);
        }
      );

      if (timedOut) return;
      clearTimeout(timeoutRef.current);

      // Streaming done — commit the full message with parsed blocks
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'ai',
          rawText: accumulated,
          blocks: parseBlocks(accumulated, false),
        },
      ]);
      setChatStatus('idle');
      setStreamingText('');
    } catch (err) {
      if (timedOut) return;
      clearTimeout(timeoutRef.current);
      console.error('chat error:', err);
      setChatStatus('idle');
      setStreamingText('');
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'ai', error: true, rawText: '' },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, chatStatus, messages, province, status, needs, filteredResources, sendMessage]);

  function handleRetry() {
    // Remove the last error message and re-enable input
    setMessages((prev) => prev.filter((m, i) => !(m.error && i === prev.length - 1)));
  }

  const inputDisabled = chatStatus !== 'idle';

  const isEmpty = messages.length === 0 && chatStatus === 'idle';

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Message list */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        aria-label="Conversation"
      >
        <div
          className={[
            'mx-auto max-w-3xl px-4 sm:px-6',
            isEmpty ? 'h-full' : 'py-6 sm:py-8',
          ].join(' ')}
        >
          {isEmpty ? (
            <EmptyState
              onSuggestion={(s) => {
                setInput(s);
              }}
            />
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => {
                if (msg.role === 'user') {
                  return <UserBubble key={msg.id} text={msg.text} />;
                }
                if (msg.error) {
                  return (
                    <DemoFallback
                      key={msg.id}
                      filteredResources={filteredResources}
                      onRetry={handleRetry}
                    />
                  );
                }
                return (
                  <AIBubble
                    key={msg.id}
                    blocks={msg.blocks ?? []}
                  />
                );
              })}

              {/* Loading dots */}
              {chatStatus === 'loading' && <LoadingBubble />}

              {/* Streaming in-progress AI bubble */}
              {chatStatus === 'streaming' && (
                <AIBubble
                  blocks={parseBlocks(streamingText, true)}
                  streaming
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Input bar */}
      <InputBar
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={inputDisabled}
      />

      {/* Dot-loader + caret animations */}
      <style>{`
        @keyframes dot {
          0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
        .dot { animation: dot 1.2s infinite ease-in-out; }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }

        @keyframes caret { 50% { opacity: 0; } }
        .caret {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: currentColor;
          margin-left: 2px;
          vertical-align: -2px;
          animation: caret 1s steps(2) infinite;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 320ms cubic-bezier(0.22, 1, 0.36, 1); }

        @media (prefers-reduced-motion: reduce) {
          .dot, .caret, .fade-up { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

