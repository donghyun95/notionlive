import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSelfandChildrenFetch } from '@/lib/api/getSelfandChildrenFetch';
import { pagePublicInfoFetch } from '@/lib/api/getPublishedFetch';

export function ReadOnlyTitle({ pagenodeID }: { pagenodeID: number }) {
  const { data: publicData } = useQuery({
    queryKey: ['pagePublicInfo', pagenodeID],
    queryFn: () => pagePublicInfoFetch(pagenodeID),
    enabled: !!pagenodeID, // pageId 없으면 실행 안 함
    refetchInterval: 2000,
  });
  const title = publicData.title ?? '';
  return (
    <div className="min-w-0 my-6 mx-auto max-w-[100%] md:max-w-[768px] md:min-w-[768px] commonPadding border-0 outline-none text-[40px] font-bold leading-[1.2] font-['Pretendard',sans-serif]">
      {title}
    </div>
  );
}
