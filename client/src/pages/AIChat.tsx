
import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  GraduationCap,
  Lightbulb,
  CalendarCheck,
  Plus,
  Trash2,
  User,
  MessageCircle,
  LoaderCircle
} from 'lucide-react';
import { api } from '../services/api';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const suggestions = [
  {
    title: 'Explain a concept',
    description: 'Understand difficult topics',
    prompt: 'Explain Object-Oriented Programming in simple language with examples.',
    icon: BookOpen,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10'
  },
  {
    title: 'Exam preparation',
    description: 'Prepare smarter for exams',
    prompt: 'Give me an effective study strategy for my upcoming university exams.',
    icon: GraduationCap,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10'
  },
  {
    title: 'Study tips',
    description: 'Build better study habits',
    prompt: 'Give me five practical tips to improve my concentration while studying.',
    icon: Lightbulb,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10'
  },
  {
    title: 'My study plan',
    description: 'Improve your schedule',
    prompt: 'How can I create a balanced and effective daily study plan?',
    icon: CalendarCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  }
];

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(customMessage?: string) {
    const message = (customMessage ?? input).trim();

    if (!message || loading) return;

    const previousMessages = messages;

    const updatedMessages: ChatMessage[] = [
      ...previousMessages,
      { role: 'user', content: message }
    ];

    setMessages(updatedMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const chatHistory = previousMessages
  .filter(
    (item) =>
      (item.role === 'user' || item.role === 'assistant') &&
      typeof item.content === 'string' &&
      item.content.trim().length > 0 &&
      item.content.length <= 2000
  )
  .slice(-10)
  .map((item) => ({
    role: item.role,
    content: item.content.trim()
  }));

console.log('AI Chat History:', chatHistory);

const response = await api.post('/ai/chat', {
  message,
  history: chatHistory
});

      const aiMessage = response.data.data.message;

      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: aiMessage }
      ]);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Unable to connect to StudyPilot AI. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function startNewChat() {
    if (loading) return;

    setMessages([]);
    setInput('');
    setError('');
    inputRef.current?.focus();
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-150px)] max-w-5xl flex-col">

      {/* Page Heading */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-lg bg-violet-500/10 p-2">
              <Sparkles size={17} className="text-violet-400" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              AI Learning Assistant
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Study Buddy<span className="text-violet-400">.</span>
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Your personal companion for smarter learning.
          </p>
        </div>

        <button
          onClick={startNewChat}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          New chat
        </button>
      </div>

      {/* Chat Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0D1220]/80 shadow-2xl shadow-black/20">

        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 md:px-6">

          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
              <span className="text-2xl">🤖</span>

              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-[#0D1220] bg-emerald-400" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                StudyPilot AI
              </h2>

              <p className="mt-0.5 text-xs text-emerald-400">
                Your learning buddy is online
              </p>
            </div>
          </div>

          <button
            onClick={startNewChat}
            disabled={loading || messages.length === 0}
            title="Clear conversation"
            aria-label="Clear conversation"
            className="rounded-xl p-2.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Trash2 size={17} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 md:p-7">

          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="mx-auto max-w-2xl py-6">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 ring-1 ring-violet-400/20">
                <Sparkles size={30} className="text-violet-300" />
              </div>

              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-white">
                  Hey, learner! 👋
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                  What shall we learn together today? Ask me anything and let's make learning easier.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      onClick={() => sendMessage(item.prompt)}
                      disabled={loading}
                      className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-violet-500/[0.06] disabled:cursor-not-allowed"
                    >
                      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>
                        <Icon size={20} className={item.color} />
                      </div>

                      <h4 className="text-sm font-semibold text-slate-200 transition group-hover:text-white">
                        {item.title}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conversation Messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  message.role === 'assistant'
                    ? 'bg-gradient-to-br from-violet-500 to-indigo-600'
                    : 'border border-white/10 bg-white/[0.06]'
                }`}
              >
                {message.role === 'assistant' ? (
                 <span className="text-xl">🤖</span>
                ) : (
                  <User size={17} className="text-slate-300" />
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 md:max-w-[75%] ${
                  message.role === 'assistant'
                    ? 'rounded-tl-sm border border-white/[0.07] bg-white/[0.04] text-slate-200'
                    : 'rounded-tr-sm bg-violet-600 text-white'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                <span className="text-xl">🤖</span>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
                <LoaderCircle size={15} className="animate-spin text-violet-400" />
                <span className="text-xs text-slate-400">
                  StudyPilot is thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-5 mb-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-xs text-red-300 md:mx-7">
            {error}
          </div>
        )}

        {/* Message Composer */}
        <div className="border-t border-white/[0.07] bg-[#0A0F1B]/70 p-4 md:p-5">

          <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-[#151C2C] p-2 transition focus-within:border-violet-400/40 focus-within:ring-2 focus-within:ring-violet-500/10">

            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
              maxLength={2000}
              placeholder="Ask me anything about your studies..."
              className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20 transition hover:scale-105 hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send size={18} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-[11px] text-slate-600">
              <MessageCircle size={11} className="mr-1 inline" />
              Enter to send · Shift + Enter for a new line
            </p>

            <p className="text-[11px] text-slate-600">
              {input.length}/2000
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-4 text-center text-[11px] text-slate-600">
        AI can make mistakes. Always verify important academic information.
      </p>
    </div>
  );
}
