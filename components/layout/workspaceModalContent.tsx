'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserPlus,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Command,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
type MemberRole = 'Admin' | 'Member' | 'Guest';

type Member = {
  id: number;
  name: string;
  email: string;
  role: MemberRole;
};

const DEFAULT_WORKSPACE_NAME = 'Design Team Workspace';

const DEFAULT_MEMBERS: Member[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia@example.com',
    role: 'Admin',
  },
  {
    id: 2,
    name: 'Noah Kim',
    email: 'noah@example.com',
    role: 'Member',
  },
  {
    id: 3,
    name: 'Emma Lee',
    email: 'emma@example.com',
    role: 'Guest',
  },
];

export function WorkspaceSettings() {
  const [workspaceName, setWorkspaceName] = useState(DEFAULT_WORKSPACE_NAME);
  const [inviteKeyword, setInviteKeyword] = useState('');
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);

  const filteredMembers = useMemo(() => {
    const keyword = inviteKeyword.trim().toLowerCase();

    if (!keyword) return members;

    return members.filter((member) => {
      return (
        member.name.toLowerCase().includes(keyword) ||
        member.email.toLowerCase().includes(keyword)
      );
    });
  }, [inviteKeyword, members]);

  const handleSaveWorkspaceName = () => {
    console.log('save workspace name:', workspaceName);
  };

  const handleInvite = () => {
    console.log('invite member keyword:', inviteKeyword);
  };

  const handleUpdateRole = (memberId: number, role: MemberRole) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role } : member,
      ),
    );
  };

  const handleRemoveMember = (memberId: number) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  const handleDeleteWorkspace = () => {
    console.log('delete workspace');
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto bg-white text-slate-900 font-sans selection:bg-slate-200 ">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <WorkspaceSettingsHeader />

          <div className="space-y-12">
            <WorkspaceIdentitySection
              workspaceName={workspaceName}
              onChangeWorkspaceName={setWorkspaceName}
              onSave={handleSaveWorkspaceName}
            />

            <WorkspaceInviteMembersSection
              inviteKeyword={inviteKeyword}
              onChangeInviteKeyword={setInviteKeyword}
              onInvite={handleInvite}
            />

            <WorkspaceMembersSection
              members={filteredMembers}
              totalCount={members.length}
              onUpdateRole={handleUpdateRole}
              onRemoveMember={handleRemoveMember}
            />

            <WorkspaceDangerZoneSection
              onDeleteWorkspace={handleDeleteWorkspace}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function WorkspaceSettingsHeader() {
  return (
    <h1 className="mb-10 text-3xl font-semibold tracking-tight">
      Workspace Settings
    </h1>
  );
}

type WorkspaceIdentitySectionProps = {
  workspaceName: string;
  onChangeWorkspaceName: (value: string) => void;
  onSave: () => void;
};

function WorkspaceIdentitySection({
  workspaceName,
  onChangeWorkspaceName,
  onSave,
}: WorkspaceIdentitySectionProps) {
  return (
    <section>
      <div className="mb-4">
        <Label className="text-sm font-semibold text-slate-900">
          General Identity
        </Label>
        <p className="mt-1 text-sm text-slate-500">
          This is how your workspace will appear to other collaborators and in
          your notifications.
        </p>
      </div>

      <div className="relative flex items-center">
        <Input
          value={workspaceName}
          onChange={(e) => onChangeWorkspaceName(e.target.value)}
          className="h-12 rounded-full border-slate-200 bg-slate-100/50 pl-4 pr-24 transition-all focus-visible:ring-slate-400"
        />
        <Button
          onClick={onSave}
          className="absolute right-1 h-10 rounded-full bg-slate-800 px-6 text-white transition-all active:scale-95 hover:bg-slate-900"
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </section>
  );
}

type WorkspaceInviteMembersSectionProps = {
  inviteKeyword: string;
  onChangeInviteKeyword: (value: string) => void;
  onInvite: () => void;
};

function WorkspaceInviteMembersSection({
  inviteKeyword,
  onChangeInviteKeyword,
  onInvite,
}: WorkspaceInviteMembersSectionProps) {
  const results = inviteKeyword
    ? ['jenny@example.com', 'michael@example.com', 'sophia@example.com']
    : [];

  return (
    <section>
      <div className="mb-4">
        <Label className="text-sm font-semibold text-slate-900">
          Invite Members
        </Label>
        <p className="mt-1 text-sm text-slate-500">
          Add new designers or clients to your workspace.
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">
          <Search className="h-4 w-4" />
        </div>

        <Input
          value={inviteKeyword}
          onChange={(e) => onChangeInviteKeyword(e.target.value)}
          placeholder="Search by name or email address..."
          className="h-12 rounded-full border-slate-200 bg-slate-100/50 pl-11 pr-28 focus-visible:ring-slate-400"
        />

        <Button
          onClick={onInvite}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 rounded-full bg-slate-800 px-6 text-white hover:bg-slate-900 active:scale-95"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite
        </Button>

        {inviteKeyword.trim().length > 0 && (
          <div className="absolute top-full z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <Command>
              <CommandList>
                {results.length === 0 ? (
                  <CommandEmpty>No users found.</CommandEmpty>
                ) : (
                  results.map((user) => (
                    <CommandItem
                      key={user}
                      onSelect={() => onChangeInviteKeyword(user)}
                      className="cursor-pointer"
                    >
                      {user}
                    </CommandItem>
                  ))
                )}
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    </section>
  );
}

type WorkspaceMembersSectionProps = {
  members: Member[];
  totalCount: number;
  onUpdateRole: (memberId: number, role: MemberRole) => void;
  onRemoveMember: (memberId: number) => void;
};

function WorkspaceMembersSection({
  members,
  totalCount,
  onUpdateRole,
  onRemoveMember,
}: WorkspaceMembersSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Label className="text-sm font-semibold text-slate-900">
          Member Management
        </Label>
        <Badge
          variant="secondary"
          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500"
        >
          {totalCount} ACTIVE
        </Badge>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {members.map((member, index) => (
            <WorkspaceMemberItem
              key={member.id}
              member={member}
              index={index}
              onUpdateRole={onUpdateRole}
              onRemoveMember={onRemoveMember}
            />
          ))}
        </AnimatePresence>

        {members.length === 0 && <WorkspaceMembersEmptyState />}
      </div>
    </section>
  );
}

type WorkspaceMemberItemProps = {
  member: Member;
  index: number;
  onUpdateRole: (memberId: number, role: MemberRole) => void;
  onRemoveMember: (memberId: number) => void;
};

function WorkspaceMemberItem({
  member,
  index,
  onUpdateRole,
  onRemoveMember,
}: WorkspaceMemberItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-center justify-between rounded-full border border-slate-200 bg-slate-100/50 p-1 pl-5 transition-colors hover:border-slate-300"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
          <WorkspaceMemberRoleIcon role={member.role} />
        </div>

        <div className="flex items-baseline gap-2 overflow-hidden">
          <span className="whitespace-nowrap text-sm font-medium">
            {member.name}
          </span>
          <span className="truncate text-xs text-slate-400">
            ({member.email})
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Select
          value={member.role}
          onValueChange={(value: MemberRole) => onUpdateRole(member.id, value)}
        >
          <SelectTrigger className="h-9 w-[110px] rounded-full border-none bg-transparent font-medium text-slate-600 transition-colors hover:bg-slate-200/50 focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-xl">
            <SelectItem value="Admin" className="rounded-lg">
              Admin
            </SelectItem>
            <SelectItem value="Member" className="rounded-lg">
              Member
            </SelectItem>
            <SelectItem value="Guest" className="rounded-lg">
              Guest
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemoveMember(member.id)}
          className="h-9 w-9 rounded-full text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function WorkspaceMemberRoleIcon({ role }: { role: MemberRole }) {
  if (role === 'Admin') return <Shield className="h-4 w-4" />;
  if (role === 'Member') return <UserCheck className="h-4 w-4" />;
  return <User className="h-4 w-4" />;
}

function WorkspaceMembersEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-3xl border-2 border-dashed border-slate-100 py-12 text-center"
    >
      <p className="text-sm text-slate-400">
        No members in this workspace yet.
      </p>
    </motion.div>
  );
}

type WorkspaceDangerZoneSectionProps = {
  onDeleteWorkspace: () => void;
};

function WorkspaceDangerZoneSection({
  onDeleteWorkspace,
}: WorkspaceDangerZoneSectionProps) {
  return (
    <section>
      <Card className="overflow-hidden rounded-2xl border-red-200 bg-red-50/50 shadow-none">
        <CardContent className="p-6">
          <div className="mb-4">
            <Label className="text-sm font-semibold text-red-900">
              Danger Zone
            </Label>
            <p className="mt-1 text-sm text-red-700/70">
              Permanently delete this workspace and all its data.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={onDeleteWorkspace}
            className="h-10 rounded-xl border-red-200 px-6 text-red-600 transition-all active:scale-95 hover:bg-red-100 hover:text-red-700"
          >
            Delete Workspace
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
