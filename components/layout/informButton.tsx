'use client';

import * as React from 'react';
import { Bell, Check, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  read?: boolean;
};

const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: '새 댓글이 달렸습니다',
    description: '홍길동님이 페이지에 댓글을 남겼습니다.',
    time: '방금 전',
    read: false,
  },
  {
    id: 2,
    title: '문서가 공유되었습니다',
    description: '디자인 회의록 문서가 팀원에게 공유되었습니다.',
    time: '10분 전',
    read: false,
  },
  {
    id: 3,
    title: '업데이트가 저장되었습니다',
    description: '변경사항이 정상적으로 저장되었습니다.',
    time: '1시간 전',
    read: true,
  },
];

export function NotificationButton() {
  const [notifications, setNotifications] =
    React.useState<NotificationItem[]>(mockNotifications);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 px-4 gap-2 text-stone-600 hover:bg-stone-100"
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
              최신 활동을 확인하세요
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
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <Bell className="mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">알림이 없습니다</p>
              <p className="text-xs text-muted-foreground">
                새로운 알림이 오면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                    !item.read ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <div className="pt-1">
                    {!item.read ? (
                      <span className="block h-2 w-2 rounded-full bg-blue-500" />
                    ) : (
                      <span className="block h-2 w-2 rounded-full bg-transparent" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-5">
                        {item.title}
                      </p>

                      {!item.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => markAsRead(item.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                </div>
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
