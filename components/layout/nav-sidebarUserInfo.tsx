'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'next-auth/react';
import { ChevronsUpDown } from 'lucide-react';

export function SidebarUserInfo({
  name,
  image,
}: {
  name: string;
  image?: string;
}) {
  function logout() {
    signOut({ callbackUrl: '/login' });
  }

  return (
    <SidebarMenuItem>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className="w-full min-w-0 h-10 px-2 rounded-lg focus:outline-none hover:bg-[#e7e9e2] data-[state=open]:bg-[#e0e4dc] transition-colors">
            <div className="flex w-full items-center justify-between">
              {/* 왼쪽: 아바타 + 이름 + 상태 */}
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={image} />
                  <AvatarFallback className="bg-[#d5f8ef] text-[#416059] text-xs font-semibold">
                    AR
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col min-w-0">
                  {/* 이름 + 온라인 점 */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-[#30332e] truncate">
                      {name}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>

                  {/* 상태 메시지 */}
                  <span className="text-xs text-[#5c605a] truncate">
                    Online
                  </span>
                </div>
              </div>

              {/* 오른쪽: 드롭다운 힌트 아이콘 */}
              <ChevronsUpDown className="h-4 w-4 text-[#5c605a] opacity-70" />
            </div>
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-56 rounded-xl border border-[#b0b3ac]/30 bg-[#fafaf5] shadow-md p-1"
          align="start"
          sideOffset={6}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem className="rounded-lg text-[#30332e] hover:bg-[#e7e9e2] focus:bg-[#e7e9e2]">
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg text-[#30332e] hover:bg-[#e7e9e2] focus:bg-[#e7e9e2]">
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#b0b3ac]/30" />
          <DropdownMenuItem
            onClick={logout}
            className="rounded-lg text-[#ac3149] hover:bg-[#f3f4ee] focus:bg-[#f3f4ee]"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
