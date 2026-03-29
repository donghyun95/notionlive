'use client';

import * as React from 'react';
import {
  AudioWaveform,
  Blocks,
  Calendar,
  Command,
  Home,
  Inbox,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { NavPersonalSpace } from './nav-personalSpace';
import { NavMain } from './nav-main';
import { NavSecondary } from './nav-secondary';
import { NavWorkspaces } from './nav-workspaces';
import { TeamSwitcher } from './team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useQuery } from '@tanstack/react-query';
import { getSidebarData } from '@/lib/api/getSidebarData';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

import { useEffect } from 'react';
import { useSelectedData } from '@/app/Providers/ClientDataProvider';
import { getAncestorPathFetch } from '@/lib/api/getAncestorPathFetch';
// type SidebarData = {
//   teams: any[];
//   navMain: any[];
//   workspaces: any[];
//   favorites: any[];
//   navSecondary: any[];
// };

// This is sample data.
// const data = {
//   teams: [
//     {
//       name: "Acme Inc",
//       logo: Command,
//       plan: "Enterprise",
//     },
//     {
//       name: "Acme Corp.",
//       logo: AudioWaveform,
//       plan: "Startup",
//     },
//     {
//       name: "Evil Corp.",
//       logo: Command,
//       plan: "Free",
//     },
//   ],
//   navMain: [
//     {
//       title: "Search",
//       url: "#",
//       icon: Search,
//     },

//     {
//       title: "Home",
//       url: "#",
//       icon: Home,
//       isActive: true,
//     },
//   ],
//   navSecondary: [
//     {
//       title: "Settings",
//       url: "#",
//       icon: Settings2,
//     },
//     {
//       title: "Trash",
//       url: "#",
//       icon: Trash2,
//     },
//     {
//       title: "Help",
//       url: "#",
//       icon: MessageCircleQuestion,
//     },
//   ],
//   favorites: [
//     {
//       name: "Project Management & Task Tracking",
//       url: "#",
//       emoji: "📊",
//     },
//     {
//       name: "Family Recipe Collection & Meal Planning",
//       url: "#",
//       emoji: "🍳",
//     },
//     {
//       name: "Fitness Tracker & Workout Routines",
//       url: "#",
//       emoji: "💪",
//     },
//     {
//       name: "Book Notes & Reading List",
//       url: "#",
//       emoji: "📚",
//     },
//     {
//       name: "Sustainable Gardening Tips & Plant Care",
//       url: "#",
//       emoji: "🌱",
//     },
//     {
//       name: "Language Learning Progress & Resources",
//       url: "#",
//       emoji: "🗣️",
//     },
//     {
//       name: "Home Renovation Ideas & Budget Tracker",
//       url: "#",
//       emoji: "🏠",
//     },
//     {
//       name: "Personal Finance & Investment Portfolio",
//       url: "#",
//       emoji: "💰",
//     },
//     {
//       name: "Movie & TV Show Watchlist with Reviews",
//       url: "#",
//       emoji: "🎬",
//     },
//     {
//       name: "Daily Habit Tracker & Goal Setting",
//       url: "#",
//       emoji: "✅",
//     },
//   ],
//   workspaces: [
//     {
//       name: "Personal Life Management",
//       emoji: "🏠",
//       pages: [
//         {
//           name: "Daily Journal & Reflection",
//           url: "#",
//           emoji: "📔",
//         },
//         {
//           name: "Health & Wellness Tracker",
//           url: "#",
//           emoji: "🍏",
//         },
//         {
//           name: "Personal Growth & Learning Goals",
//           url: "#",
//           emoji: "🌟",
//         },
//       ],
//     },
//     {
//       name: "Professional Development",
//       emoji: "💼",
//       pages: [
//         {
//           name: "Career Objectives & Milestones",
//           url: "#",
//           emoji: "🎯",
//         },
//         {
//           name: "Skill Acquisition & Training Log",
//           url: "#",
//           emoji: "🧠",
//         },
//         {
//           name: "Networking Contacts & Events",
//           url: "#",
//           emoji: "🤝",
//         },
//       ],
//     },
//     {
//       name: "Creative Projects",
//       emoji: "🎨",
//       pages: [
//         {
//           name: "Writing Ideas & Story Outlines",
//           url: "#",
//           emoji: "✍️",
//         },
//         {
//           name: "Art & Design Portfolio",
//           url: "#",
//           emoji: "🖼️",
//         },
//         {
//           name: "Music Composition & Practice Log",
//           url: "#",
//           emoji: "🎵",
//         },
//       ],
//     },
//     {
//       name: "Home Management",
//       emoji: "🏡",
//       pages: [
//         {
//           name: "Household Budget & Expense Tracking",
//           url: "#",
//           emoji: "💰",
//         },
//         {
//           name: "Home Maintenance Schedule & Tasks",
//           url: "#",
//           emoji: "🔧",
//         },
//         {
//           name: "Family Calendar & Event Planning",
//           url: "#",
//           emoji: "📅",
//         },
//       ],
//     },
//     {
//       name: "Travel & Adventure",
//       emoji: "",
//       pages: [
//         {
//           name: "Trip Planning & Itineraries",
//           url: "#",
//           emoji: "🗺️",
//         },
//         {
//           name: "Travel Bucket List & Inspiration",
//           url: "#",
//           emoji: "🌎",
//         },
//         {
//           name: "Travel Journal & Photo Gallery",
//           url: "#",
//           emoji: "📸",
//         },
//       ],
//     },
//   ],
// };
// {
//   workspaces: [],
//   personal: {
//     workspace: {
//       id: 2,
//       name: "slslsl's Personal WorkSpace",
//       type: 'PERSONAL',
//       createdAt: 2026-03-21T06:59:22.125Z,
//       updatedAt: 2026-03-21T06:59:22.125Z
//     },
//     rootPages: [ [Object] ]
//   }
// }
const isPositiveInt = (n) => Number.isInteger(n) && n > 0;

export function AppSidebar({
  initialPage,
  ...props
}: { initialPage: any } & React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const searchParamsPageId = searchParams.get('PageId');
  const pageNodeID = useSelectedData((state) => state.pageNodeID);
  const setPageNodeID = useSelectedData((state) => state.setPageNodeID);
  // console.log(`paramPageId = ${searchParamsPageId}`);

  if (!searchParamsPageId) {
  }
  const userId = session?.user.id;
  const { data: user } = useQuery({
    queryKey: ['initialPage', userId],
    queryFn: getSidebarData,
    initialData: initialPage,
    staleTime: 1000 * 30,
  });
  const { data: ancestorPath } = useQuery({
    queryKey: [
      'ancestorPath',
      searchParamsPageId ? searchParamsPageId : pageNodeID,
    ],
    queryFn: () =>
      getAncestorPathFetch(
        searchParamsPageId ? searchParamsPageId : pageNodeID,
      ),
    staleTime: 0,
  });
  useEffect(() => {
    if (searchParamsPageId && isPositiveInt(searchParamsPageId)) {
      setPageNodeID(searchParamsPageId);
    }
  });
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={user.workspaces} />
        {/* <NavMain items={data.navMain} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavWorkspaces workspaces={user.workspaces} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
        <NavPersonalSpace pages={user.personal.rootPages} path={ancestorPath} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
