'use client';
import { useEffect, useMemo, useState } from 'react';

import {
  getFeedbackListFetch,
  type GetFeedbackListResponse,
} from '@/lib/api/getFeedbackListFetch';

type FeedbackCategoryValue = 'BUG' | 'IDEA' | 'UX';
type CategoryFilter = 'ALL' | FeedbackCategoryValue;

const categoryOptions: { label: string; value: CategoryFilter }[] = [
  { label: 'ALL', value: 'ALL' },
  { label: 'BUG', value: 'BUG' },
  { label: 'IDEA', value: 'IDEA' },
  { label: 'UX', value: 'UX' },
];
const pageSizeOptions = [20, 50, 100] as const;

function formatCreatedAt(value: string) {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  }).formatToParts(new Date(value));

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${getPart('year')}.${getPart('month')}.${getPart('day')} ${getPart('hour')}:${getPart('minute')}`;
}

export default function FeedbackList() {
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [pageSize, setPageSize] =
    useState<(typeof pageSizeOptions)[number]>(20);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GetFeedbackListResponse | null>(null);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<number>>(
    new Set(),
  );
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadFeedbackList = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getFeedbackListFetch(
          {
            page,
            pageSize,
            category: category === 'ALL' ? undefined : category,
          },
          { signal: controller.signal },
        );

        setResult(response);
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === 'AbortError'
        ) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : '알 수 없는 오류가 발생했습니다.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadFeedbackList();

    return () => {
      controller.abort();
    };
  }, [category, page, pageSize, reloadKey]);

  const totalPages = result?.totalPages ?? 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const renderedItems = useMemo(() => result?.items ?? [], [result]);

  const toggleMessageExpand = (id: number) => {
    setExpandedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const retryLoad = () => {
    setReloadKey((prev) => prev + 1);
  };

  return (
    <section className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">피드백 관리자</h1>

          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as CategoryFilter);
                setPage(1);
              }}
              className="h-10 rounded-md border border-black/20 px-3 text-sm"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(
                  Number(
                    event.target.value,
                  ) as (typeof pageSizeOptions)[number],
                );
                setPage(1);
              }}
              className="h-10 rounded-md border border-black/20 px-3 text-sm"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </header>

        {loading ? (
          <div className="rounded-lg border border-black/10 p-8 text-center text-sm text-black/60">
            목록 불러오는 중...
          </div>
        ) : error ? (
          <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              onClick={retryLoad}
              className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm"
            >
              재시도
            </button>
          </div>
        ) : renderedItems.length === 0 ? (
          <div className="rounded-lg border border-black/10 p-8 text-center text-sm text-black/60">
            조건에 맞는 feedback 없음
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-black/10">
            <table className="min-w-full text-sm">
              <thead className="bg-black/5 text-left">
                <tr>
                  <th className="px-3 py-2">category</th>
                  <th className="px-3 py-2">title</th>
                  <th className="px-3 py-2">message</th>
                  <th className="px-3 py-2">email</th>
                  <th className="px-3 py-2">mood</th>
                  <th className="px-3 py-2">pageUrl</th>
                  <th className="px-3 py-2">createdAt</th>
                </tr>
              </thead>
              <tbody>
                {renderedItems.map((item) => {
                  const expanded = expandedMessageIds.has(item.id);

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-black/10 align-top"
                    >
                      <td className="px-3 py-2">{item.category}</td>
                      <td className="px-3 py-2">{item.title}</td>
                      <td className="px-3 py-2">
                        <div
                          className="whitespace-pre-wrap"
                          style={
                            expanded
                              ? undefined
                              : {
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }
                          }
                        >
                          {item.message}
                        </div>
                        {item.message.length > 90 && (
                          <button
                            onClick={() => toggleMessageExpand(item.id)}
                            className="mt-1 text-xs text-blue-600 hover:underline"
                          >
                            {expanded ? '접기' : '더보기'}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2">{item.email ?? '-'}</td>
                      <td className="px-3 py-2">{item.mood}</td>
                      <td className="max-w-[260px] px-3 py-2">
                        {item.pageUrl ? (
                          <a
                            href={item.pageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-blue-600 hover:underline"
                            title={item.pageUrl}
                          >
                            {item.pageUrl}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        {formatCreatedAt(item.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <footer className="flex items-center justify-end gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={!hasPrev || loading}
            className="rounded-md border border-black/20 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            이전
          </button>
          <span className="text-sm text-black/60">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasNext || loading}
            className="rounded-md border border-black/20 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        </footer>
      </div>
    </section>
  );
}
