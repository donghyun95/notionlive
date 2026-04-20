'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  User2,
  ChevronDown,
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
import { WorkspaceInviteMembersSection } from './WorkspaceInviteMembersSection';
import { useQueryClient } from '@tanstack/react-query';
import {
  addMemberMutation,
  useRemoveWorkspaceMemberMutation,
  useSearchUsers,
  useDeleteWorkspaceMutation,
  useRenameWorkspaceMutation,
  useWorkspaceMembers,
} from './tanstack-query-collection';
import { useSession } from 'next-auth/react';
type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

type Member = {
  role: MemberRole;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};
type User = {
  id: string | number;
  name: string;
  email: string;
  image?: string;
};
export function WorkspaceSettings({
  workspaceId,
  workspaceNameProps,
  onClose,
}: {
  workspaceId: number;
  workspaceNameProps: string;
  onClose?: () => void;
}) {
  const [workspaceName, setWorkspaceName] = useState(workspaceNameProps);
  const [inviteKeyword, setInviteKeyword] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { mutate: addMemberMutate } = addMemberMutation();
  const { data: users, isLoading } = useSearchUsers(inviteKeyword, workspaceId);
  const {
    data: workspaceMembers,
    isLoading: useWorkspaceMembersLoading,
    isError,
  } = useWorkspaceMembers(workspaceId);
  console.log('workspaceMembers:', workspaceMembers);

  const { mutate: removeMemberMutate } = useRemoveWorkspaceMemberMutation();
  const { mutate: mutateWorkspaceName } = useRenameWorkspaceMutation();
  const { mutate: deleteWorkspaceMutate } = useDeleteWorkspaceMutation();
  const { data: session } = useSession();
  const router = useRouter();
  const sessionUserId = session?.user.id || '';

  const handleSaveWorkspaceName = () => {
    mutateWorkspaceName({
      workspaceId,
      name: workspaceName,
      userId: sessionUserId,
    });
    console.log('save workspace name:', workspaceName);
  };
  const handleSearchInput = (value) => {
    setInviteKeyword(value);
  };

  const handleInvite = () => {
    if (!selectedUser) return;
    if (typeof selectedUser?.id === 'string') {
      addMemberMutate({
        workspaceId,
        inviteeUserId: selectedUser?.id,
        role: 'MEMBER',
      });
      setSelectedUser(null);
      setInviteKeyword('');
    }
  };

  const handleUpdateRole = (_memberId: string, _role: MemberRole) => {};

  const handleRemoveMember = (memberId: string) => {
    removeMemberMutate({
      workspaceId,
      userId: memberId,
    });
  };

  const handleDeleteWorkspace = () => {
    deleteWorkspaceMutate(
      { workspaceId },
      {
        onSuccess: () => {
          setWorkspaceName('');
          setInviteKeyword('');
          setSelectedUser(null);
          onClose?.();
          if (session?.user.id) {
            router.push(`/dashboard/${session.user.id}`);
          }
        },
      },
    );
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto bg-white text-slate-900 font-sans selection:bg-slate-200">
      <div className="mx-auto max-w-2xl px-4 py-6 min-w-[50vw]">
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
              userlist={users}
              onSearch={handleSearchInput}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
            />

            <WorkspaceMembersSection
              members={workspaceMembers || []}
              totalCount={workspaceMembers ? workspaceMembers.length : 0}
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

type WorkspaceMembersSectionProps = {
  members: Member[];
  totalCount: number;
  onUpdateRole: (memberId: string, role: MemberRole) => void;
  onRemoveMember: (memberId: string) => void;
};

function WorkspaceMembersSection({
  members,
  totalCount,
  onUpdateRole,
  onRemoveMember,
}: WorkspaceMembersSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60">
          Member Management
        </span>
        <span className="text-xs font-medium text-on-surface-variant">
          3 Active Members
        </span>
      </div>
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="divide-y divide-outline-variant/10">
          {members.map((member, index) => (
            <WorkspaceMemberItem
              key={index}
              member={member.user}
              index={index}
              role={member.role}
              onRemoveMember={onRemoveMember}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type WorkspaceMemberItemProps = {
  member: Member['user'];
  index: number;
  onUpdateRole: (memberId: string, role: MemberRole) => void;
  onRemoveMember: (memberId: string) => void;
  role: MemberRole;
};

function WorkspaceMemberItem({
  member,
  index,
  onUpdateRole,
  onRemoveMember,
  role,
}: WorkspaceMemberItemProps) {
  console.log(role);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="px-6 py-4 flex items-center justify-between hover:bg-surface-container-high transition-colors group"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6dXKY0NLt-wbTp4du0s3Y5Iqf1k3-LTDr9_f3_59M462W-90Zl9xq1YQD8H1hV4tBNddCzaQCgEP782gl-sCW6ZH-tfyKHctX3jgnHJ_HcyJzj-V6L730E2ciN30OAnU5mqMbTBC3kal6LRlr7zMTA7RGEF-M4Nr_kbu2g9FqU9OIfbJiO5y_EwhS0Gg-xZmKCtRHbBjpfBQ8zKIdEVWEwSOFKydp6fVgwZweTiKirB-2_uKa0laGA8G00xqBulaV2cGGuuEhwdpP"
          alt="Emma Lee"
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="flex flex-col items-baseline gap-2 overflow-hidden ">
          <span className="text-sm font-bold text-on-surface">
            {member.name}
          </span>
          <span className="text-xs text-on-surface-variant">
            ({member.email})
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Select
          value={role}
          onValueChange={(value: MemberRole) => onUpdateRole(member.id, value)}
        >
          <SelectTrigger className="h-9 w-[110px] rounded-full border-none bg-transparent font-medium text-slate-600 transition-colors hover:bg-slate-200/50 focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-xl">
            <SelectItem value="OWNER" className="rounded-lg">
              OWNER
            </SelectItem>
            <SelectItem value="MEMBER" className="rounded-lg">
              MEMBER
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemoveMember(member.id)}
          className="text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
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
