'use client';
import { Check, Link2, Sparkles, Share2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '../ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelectedData } from '@/app/Providers/ClientDataProvider';
import { pagePublicInfoFetch } from '@/lib/api/getPublishedFetch';
import { togglePublishFetch } from '@/lib/api/togglePublishFetch';

export function PublishButton({}: any) {
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
  const pageNodeID = useSelectedData((state) => state.pageNodeID);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const { data: publicData } = useQuery({
    queryKey: ['pagePublicInfo', Number(pageNodeID)],
    queryFn: () => pagePublicInfoFetch(pageNodeID),
    enabled: !!pageNodeID,
  });
  console.log(pageNodeID, '페이지 아이디');
  const toggleMutation = useMutation({
    mutationFn: (pageId: number) => togglePublishFetch(pageId),
    onSuccess: (data, pageId) => {
      queryClient.invalidateQueries({
        queryKey: ['pagePublicInfo', Number(pageId)],
      });
    },
  });

  const handleTogglePublish = () => {
    if (!pageNodeID) return;
    toggleMutation.mutate(pageNodeID);
  };

  if (!publicData) return null;

  const shareUrl = publicData.publictoken
    ? `${baseUrl}/share/${publicData.publictoken}`
    : '';

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className="
      h-8 rounded-lg px-4
      bg-[#4e45e4]
      text-[#fbf7ff]
      text-xs font-semibold
      hover:bg-[#4135d8]
      active:opacity-80
      transition-all
      shadow-none
    "
        >
          Share
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={10} className="w-[360px] p-0">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-24 from-zinc-100 via-white to-zinc-50" />
          <div className="relative p-5">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#4F46E5] text-white shadow-sm">
                    <Share2 className="h-4 w-4 " />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold tracking-tight">
                      Publish & Share
                    </h3>
                    <p className="text-xs text-zinc-500">
                      공개 링크를 켜고 복사할 수 있어요
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`
                  rounded-full px-2.5 py-1 text-[11px] font-medium
                  ${
                    publicData.ispublished
                      ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                      : 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200'
                  }
                `}
              >
                {publicData.ispublished ? 'Live' : 'Private'}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="publish-mode"
                    className="text-sm font-medium text-zinc-800"
                  >
                    Publish Mode
                  </Label>
                  <p className="text-xs leading-relaxed text-zinc-500">
                    이 페이지를 외부 링크로 공유할 수 있도록 설정합니다.
                  </p>
                </div>

                <Switch
                  id="publish-mode"
                  checked={publicData.ispublished ?? false}
                  onCheckedChange={handleTogglePublish}
                  disabled={toggleMutation.isPending}
                  className="
    data-[state=checked]:bg-[#4F46E5]
    data-[state=unchecked]:bg-gray-300
  "
                />
              </div>
            </div>

            <div className="my-4">
              <Separator className="bg-zinc-200/80" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500">Share link</p>

              <div className="flex items-center gap-2">
                <div
                  className="
                    group flex h-12 min-w-0 flex-1 items-center rounded-2xl
                    border border-zinc-200/80 bg-zinc-50/80 px-3
                    shadow-inner
                  "
                >
                  <div className="mr-3 shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
                    <Link2 className="h-4 w-4 text-zinc-500" />
                  </div>
                  <span className="truncate text-sm text-zinc-600">
                    {shareUrl || 'Public link will appear here'}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopy}
                  disabled={!publicData.ispublished || !shareUrl}
                  className="
                    h-12 rounded-2xl px-4
                    bg-[#4F46E5] text-white
                    hover:bg-[#3323CC]
                    shadow-[0_10px_24px_rgba(24,24,27,0.24)]
                    disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none
                  "
                >
                  {copied ? (
                    <span className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      Copied
                    </span>
                  ) : (
                    'Copy'
                  )}
                </Button>
              </div>

              {!publicData.ispublished && (
                <p className="pt-1 text-xs text-zinc-400">
                  Publish Mode를 켜야 링크가 활성화됩니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
