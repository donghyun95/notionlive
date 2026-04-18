import { useQuery } from '@tanstack/react-query';

import { pagePublicInfoFetch } from '@/lib/api/getPublishedFetch';

export function ReadOnlyPopOverEmoticon({
  pagenodeID,
}: {
  pagenodeID: number;
}) {
  const { data: publicData } = useQuery({
    queryKey: ['pagePublicInfo', pagenodeID],
    queryFn: () => pagePublicInfoFetch(pagenodeID),
    enabled: !!pagenodeID, // pageId 없으면 실행 안 함
    refetchInterval: 2000,
  });
  if (!publicData) {
    return null;
  }
  return (
    <div className="mt-20 mb-4">
      <div className="min-w-0  mx-auto max-w-[100%] md:max-w-[768px] md:min-w-[768px] commonPadding">
        <span className="text-5xl">{publicData.icon}</span>
      </div>
    </div>
  );
}
