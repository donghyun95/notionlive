'use client';

import { useMemo, useState } from 'react';

import { createFeedbackFetch } from '@/lib/api/createFeedbackFetch';
import { AnimatePresence, motion } from 'motion/react';
import type { Transition } from 'motion/react';
import {
  Bug,
  Lightbulb,
  MessageSquareWarning,
  Send,
  Sparkles,
  CheckCircle2,
  Loader2,
  Mail,
} from 'lucide-react';

type Category = 'bug' | 'idea' | 'ux';

const categories: {
  id: Category;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'bug',
    label: '버그',
    description: '뭔가 터졌어요',
    icon: Bug,
  },
  {
    id: 'idea',
    label: '아이디어',
    description: '더 좋아질 수 있어요',
    icon: Lightbulb,
  },
  {
    id: 'ux',
    label: '불편함',
    description: '사용감이 묘하게 별로예요',
    icon: MessageSquareWarning,
  },
];

const spring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

export default function FeedbackCard() {
  const [category, setCategory] = useState<Category>('ux');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [mood, setMood] = useState(3);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === category),
    [category],
  );

  const canSubmit = title.trim().length > 1 && message.trim().length > 9;

  async function submitFeedback() {
    if (!canSubmit || status === 'loading') return;

    setStatus('loading');
    setErrorMessage('');

    try {
      await createFeedbackFetch({
        category,
        title,
        message,
        email,
        mood,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
      });

      setStatus('success');
      setTitle('');
      setMessage('');
      setEmail('');
      setMood(3);
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
      );
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitFeedback();
  }

  const SelectedIcon = selectedCategory?.icon ?? MessageSquareWarning;

  return (
    <section className="overflow-y-auto relative mx-auto flex min-h-[720px] w-full max-w-5xl items-center justify-center overflow-hidden rounded-[40px] bg-[#f7f4ee] p-6 text-[#191919] shadow-2xl md:p-10">
      <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-72 w-72 rounded-full bg-black/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-15%] right-[-10%] h-96 w-96 rounded-full bg-[#d7c8ff]/40 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring}
        className="relative grid w-full overflow-hidden rounded-[32px] border border-black/10 bg-white/80 shadow-[0_24px_90px_rgba(0,0,0,0.12)] backdrop-blur-xl md:grid-cols-[0.9fr_1.1fr]"
      >
        <aside className="relative hidden overflow-hidden border-r border-black/10 bg-[#fbfaf7] p-8 md:block">
          <motion.div
            layout
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm shadow-sm"
          >
            <Sparkles size={15} />
            Notion-ish feedback desk
          </motion.div>

          <motion.div layout className="space-y-4">
            <motion.div
              layoutId="category-icon"
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#191919] text-white shadow-lg"
            >
              <SelectedIcon size={28} />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <h2 className="text-3xl font-semibold tracking-[-0.04em]">
                  {selectedCategory?.label} 제보
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-black/55">
                  작은 불편도 사용자 경험을 저해할 수 있습니다. 발견하신 문제를
                  공유해 주시면 개선에 반영하겠습니다.
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Mail size={16} />
              전송 정보
            </div>
            <p className="text-sm leading-6 text-black/55">
              작성하신 내용은 담당자에게 전달되어 서비스 개선에 활용됩니다.
            </p>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="relative p-5 md:p-8">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-medium text-black/45"
              >
                Feedback
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-1 text-3xl font-semibold tracking-[-0.05em] md:text-4xl"
              >
                불편사항을 알려주세요
              </motion.h1>
            </div>

            <motion.div
              whileHover={{ rotate: -6, scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f1eee8]"
            >
              <SelectedIcon size={22} />
            </motion.div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {categories.map((item) => {
              const Icon = item.icon;
              const active = category === item.id;

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  layout
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCategory(item.id)}
                  className={`relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                    active
                      ? 'border-black bg-[#191919] text-white'
                      : 'border-black/10 bg-[#fbfaf7] text-black hover:border-black/25'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-category"
                      className="absolute inset-0 bg-[#191919]"
                      transition={spring}
                    />
                  )}

                  <span className="relative z-10 block">
                    <Icon size={18} />
                    <span className="mt-3 block text-sm font-semibold">
                      {item.label}
                    </span>
                    <span
                      className={`mt-1 block text-xs ${
                        active ? 'text-white/60' : 'text-black/45'
                      }`}
                    >
                      {item.description}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="space-y-4">
            <motion.label layout className="block">
              <span className="mb-2 block text-sm font-medium text-black/60">
                제목
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="예: 결제 버튼이 어디 있는지 모르겠어요"
                className="h-13 w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-4 text-[15px] outline-none transition placeholder:text-black/30 focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/5"
              />
            </motion.label>

            <motion.label layout className="block">
              <span className="mb-2 block text-sm font-medium text-black/60">
                자세한 내용
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="어떤 상황에서 불편했는지 적어주세요. 재현 방법이 있으면 더 좋습니다."
                rows={6}
                className="w-full resize-none rounded-2xl border border-black/10 bg-[#fbfaf7] px-4 py-3 text-[15px] leading-6 outline-none transition placeholder:text-black/30 focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/5"
              />
            </motion.label>

            <div className="grid gap-4 md:grid-cols-[1fr_180px]">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-black/60">
                  불편 지수
                </span>
                <div className="flex h-13 items-center gap-2 rounded-2xl border border-black/10 bg-[#fbfaf7] px-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <motion.button
                      key={value}
                      type="button"
                      whileHover={{ scale: 1.16 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setMood(value)}
                      className={`h-7 w-7 rounded-full text-xs font-semibold transition ${
                        mood >= value
                          ? 'bg-[#191919] text-white'
                          : 'bg-black/5 text-black/35'
                      }`}
                    >
                      {value}
                    </motion.button>
                  ))}
                </div>
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 text-sm font-medium text-emerald-700"
                >
                  <CheckCircle2 size={17} />
                  제보가 전송됐습니다.
                </motion.p>
              ) : status === 'error' ? (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-sm font-medium text-red-600"
                >
                  {errorMessage}
                </motion.p>
              ) : (
                <motion.p
                  key="idle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-sm text-black/45"
                >
                  최소 10자 이상 작성하면 보낼 수 있습니다.
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              onClick={(event) => {
                event.preventDefault();
                void submitFeedback();
              }}
              disabled={!canSubmit || status === 'loading'}
              whileHover={canSubmit ? { y: -2, scale: 1.02 } : undefined}
              whileTap={canSubmit ? { scale: 0.97 } : undefined}
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#191919] px-6 text-sm font-semibold text-white shadow-lg shadow-black/15 transition disabled:cursor-not-allowed disabled:bg-black/25 disabled:shadow-none"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  전송 중
                </>
              ) : (
                <>
                  Send
                  <Send
                    size={16}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </section>
  );
}
