'use client';

import * as React from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  useInviteActionMutation,
  usePendingInvites,
} from './tanstack-query-collection';

type PendingInviteItem = {
  id: string;
  workspaceId: number;
  inviterId: string;
  inviteeUserId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  workspace: {
    id: number;
    name: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
  inviter: {
    id: string;
    name: string;
    email: string;
  };
};

type InviteNotificationCardProps = {
  item: PendingInviteItem;
  read: boolean;
  loadingAction?: 'accept' | 'reject' | null;
  onRead: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
};

function formatRelativeTime(dateString: string) {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = now.getTime() - target.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return target.toLocaleDateString('ko-KR');
}

function InviteNotificationCard({
  item,
  read,
  loadingAction = null,
  onRead,
  onAccept,
  onReject,
}: InviteNotificationCardProps) {
  const isLoading = loadingAction !== null;

  return (
    <div
      className={`flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
        !read ? 'bg-blue-50/60' : ''
      }`}
    >
      <div className="pt-1">
        {!read ? (
          <span className="block h-2 w-2 rounded-full bg-blue-500" />
        ) : (
          <span className="block h-2 w-2 rounded-full bg-transparent" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-5">
            워크스페이스 초대가 도착했습니다
          </p>

          {!read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => onRead(item.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {item.inviter.name}
          </span>
          님이{' '}
          <span className="font-medium text-foreground">
            {item.workspace.name}
          </span>
          에 초대했습니다.
        </p>

        <p className="mt-1 text-xs text-muted-foreground">권한: {item.role}</p>

        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none"
            disabled={isLoading}
            onClick={() => onAccept(item.id)}
          >
            {loadingAction === 'accept' ? '수락 중...' : '수락'}
            <Check size={20} strokeWidth={2.5} className="text-green-600" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-none"
            disabled={isLoading}
            onClick={() => onReject(item.id)}
          >
            {loadingAction === 'reject' ? '거절 중...' : '거절'}
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {formatRelativeTime(item.createdAt)}
        </p>
      </div>
    </div>
  );
}

export function NotificationButton() {
  const { data: session } = useSession();
  const userId = session?.user.id ?? '';

  const { data: PendingInvites, isLoading, error } = usePendingInvites(userId);
  console.log(PendingInvites);
  const [readIds, setReadIds] = React.useState<string[]>([]);
  const [hiddenIds, setHiddenIds] = React.useState<string[]>([]);
  const [actionLoading, setActionLoading] = React.useState<
    Record<string, 'accept' | 'reject' | null>
  >({});
  const { mutate: InviteMutation, isPending } = useInviteActionMutation();
  const inviteNotifications = React.useMemo(() => {
    if (!PendingInvites || !Array.isArray(PendingInvites)) return [];

    return PendingInvites.filter(
      (item: PendingInviteItem) =>
        item.status === 'PENDING' && !hiddenIds.includes(item.id),
    );
  }, [PendingInvites, hiddenIds]);

  const unreadCount = inviteNotifications.filter(
    (item: PendingInviteItem) => !readIds.includes(item.id),
  ).length;

  const markAsRead = (id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAllAsRead = () => {
    setReadIds((prev) => [
      ...new Set([
        ...prev,
        ...inviteNotifications.map((item: PendingInviteItem) => item.id),
      ]),
    ]);
  };

  const handleAccept = async (id: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: 'accept' }));

      InviteMutation({ inviteId: id, type: 'ACCEPT' });

      setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setHiddenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } catch (error) {
      console.error('초대 수락 실패:', error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: 'reject' }));
      InviteMutation({ inviteId: id, type: 'DECLINE' });
      // TODO: 실제 거절 API 연결
      // await rejectInvite(id);

      setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setHiddenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } catch (error) {
      console.error('초대 거절 실패:', error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 gap-2 px-4 text-stone-600 hover:bg-stone-100"
        >
          <Bell className="h-4 w-4" />
          <span className="text-sm font-medium">알림</span>

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h4 className="text-sm font-semibold">알림</h4>
            <p className="text-xs text-muted-foreground">
              워크스페이스 초대를 확인하세요
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={markAllAsRead}
            >
              모두 읽음
            </Button>
          )}
        </div>

        <Separator />

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              알림을 불러오는 중입니다.
            </div>
          ) : error ? (
            <div className="px-4 py-10 text-center text-sm text-red-500">
              알림을 불러오지 못했습니다.
            </div>
          ) : inviteNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <Bell className="mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">알림이 없습니다</p>
              <p className="text-xs text-muted-foreground">
                새로운 초대 알림이 오면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {PendingInvites.map((item: PendingInviteItem) => (
                <InviteNotificationCard
                  key={item.id}
                  item={item}
                  read={readIds.includes(item.id)}
                  loadingAction={actionLoading[item.id]}
                  onRead={markAsRead}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="p-2">
          <Button variant="ghost" className="w-full justify-center text-sm">
            모든 알림 보기
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
