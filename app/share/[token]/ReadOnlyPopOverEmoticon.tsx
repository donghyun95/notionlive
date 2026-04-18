import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSelfandChildrenFetch } from '@/lib/api/getSelfandChildrenFetch';
import { useState, useEffect } from 'react';
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
  console.log('publicData in emoticon', publicData);
  const [Emoticon, setEmoticon] = useState(undefined);
  if (!publicData) {
    return null;
  }
  return (
    <div className="mt-20 mb-4 mx-auto">
      <div className="min-w-0  mx-auto max-w-[100%] md:max-w-[768px] md:min-w-[768px] commonPadding">
        <span className="text-5xl">{publicData.icon}</span>
      </div>
    </div>
  );
}
