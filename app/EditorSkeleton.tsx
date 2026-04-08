export function EditorSkeleton() {
  return (
    <main className="flex-1 py-10">
      <div className="mx-auto w-[692px]">
        <div className="mb-4 h-10 w-72 animate-pulse rounded bg-gray-200" />
        <div className="mb-8 h-4 w-40 animate-pulse rounded bg-gray-200" />

        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-9/12 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-10/12 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="my-8 h-48 w-full animate-pulse rounded-xl bg-gray-200" />

        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-8/12 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-10/12 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-7/12 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </main>
  );
}
