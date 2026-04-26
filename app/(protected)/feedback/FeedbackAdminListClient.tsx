'use client';

import { FeedbackCategory } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';

import {
  getFeedbackListFetch,
  type GetFeedbackListResponse,
} from '@/lib/api/getFeedbackListFetch';

const PAGE_SIZE = 20;

const categoryOptions: { label: string; value: 'ALL' | FeedbackCategory }[] = [
  { label: '전체', value: 'ALL' },
  { label: '버그', value: FeedbackCategory.BUG },
  { label: '아이디어', value: FeedbackCategory.IDEA },
  { label: 'UX', value: FeedbackCategory.UX },
];

export default function FeedbackAdminListClient() {
  const [category, setCategory] = useState<'ALL' | FeedbackCategory>('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GetFeedbackListResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const response = await getFeedbackListFetch({
          page,
          pageSize: PAGE_SIZE,
          category: category === 'ALL' ? undefined : category,
        });

        if (!mounted) return;
        setResult(response);
      } catch (fetchError) {
        if (!mounted) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : '알 수 없는 오류가 발생했습니다.',
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, [category, page]);

  const hasNext = useMemo(() => {
    if (!result) return false;
    return page < result.totalPages;
  }, [page, result]);

  const hasPrev = page > 1;

  return (
    <section className="p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">피드백 관리자</h1>
          <select
            value={category}
            onChange={(event) => {
              setPage(1);
              setCategory(event.target.value as 'ALL' | FeedbackCategory);
            }}
            className="h-10 rounded-md border border-black/20 px-3 text-sm"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </header>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border border-black/10">
          <table className="min-w-full text-sm">
            <thead className="bg-black/5 text-left">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">카테고리</th>
                <th className="px-3 py-2">제목</th>
                <th className="px-3 py-2">이메일</th>
                <th className="px-3 py-2">생성일</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-8 text-center text-black/50" colSpan={5}>
                    목록 불러오는 중...
                  </td>
                </tr>
              ) : result?.items.length ? (
                result.items.map((item) => (
                  <tr key={item.id} className="border-t border-black/10">
                    <td className="px-3 py-2">{item.id}</td>
                    <td className="px-3 py-2">{item.category}</td>
                    <td className="px-3 py-2">{item.title}</td>
                    <td className="px-3 py-2">{item.email ?? '-'}</td>
                    <td className="px-3 py-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-8 text-center text-black/50" colSpan={5}>
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-end gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={!hasPrev || loading}
            className="rounded-md border border-black/20 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            이전
          </button>
          <span className="text-sm text-black/60">{page} 페이지</span>
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
