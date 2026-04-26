import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Command,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Save,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  User2,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { useState } from 'react';
type User = {
  id: string | number;
  name: string;
  email: string;
  image?: string;
};
type WorkspaceInviteMembersSectionProps = {
  inviteKeyword: string;
  onChangeInviteKeyword: (value: string) => void;
  onInvite: () => void;
  onSearch: (value: String) => void;
  userlist: [];
  selectedUser: User | null;
  setSelectedUser: (value: User | null) => void;
};

export function WorkspaceInviteMembersSection({
  inviteKeyword,
  onChangeInviteKeyword,
  onInvite,
  userlist = [],
  selectedUser,
  setSelectedUser,
}: WorkspaceInviteMembersSectionProps) {
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
      <InviteMember
        userlist={userlist}
        onInvite={onInvite}
        inviteKeyword={inviteKeyword}
        onChangeInviteKeyword={onChangeInviteKeyword}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      ></InviteMember>
    </section>
  );
}

type UserCommandItemProps = {
  name: string;
  email: string;
  iconURL: string;
  onSelect?: () => void;
};

export function UserCommandItem({
  name,
  email,
  iconURL,
  onSelect,
}: UserCommandItemProps) {
  return (
    <CommandItem
      value={`${name} ${email}`}
      onSelect={onSelect}
      className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition aria-selected:bg-slate-100 hover:bg-slate-100"
    >
      {/* avatar / icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 transition group-data-[selected=true]:bg-white">
        <img src={iconURL}></img>
      </div>

      {/* text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-800">
            {name}
          </p>
        </div>

        <p className="mt-1 truncate text-xs text-slate-500">{email}</p>
      </div>
    </CommandItem>
  );
}

type InviteMemberProps = {
  userlist: User[];
  onInvite: (ev: any) => void;
  onChangeInviteKeyword: any;
  inviteKeyword: any;
  selectedUser: User | null;
  setSelectedUser: (value: User | null) => void;
};

export default function InviteMember({
  userlist,
  onInvite,
  onChangeInviteKeyword,
  inviteKeyword,
  selectedUser,
  setSelectedUser,
}: InviteMemberProps) {
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleRemoveSelectedUser = () => {
    setSelectedUser(null);
  };

  return (
    <div className="relative">
      <div className="relative h-12">
        {!selectedUser ? (
          <>
            <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">
              <Search className="h-4 w-4" />
            </div>

            <Input
              value={inviteKeyword}
              onChange={(ev) => onChangeInviteKeyword(ev.target.value)}
              placeholder="Search by name or email address..."
              className="h-12 rounded-full border-slate-200 bg-slate-100/50 pl-11 pr-28 focus-visible:ring-slate-400"
            />
          </>
        ) : (
          <div className="flex h-12 items-center rounded-full border border-slate-200 bg-slate-100/50 pl-3 pr-28">
            <div className="flex min-w-0 flex-1 items-center">
              <div className="flex h-9 min-w-0 max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 shadow-sm">
                <img
                  src={selectedUser.image || '/default-profile.png'}
                  alt={selectedUser.name}
                  className="h-6 w-6 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {selectedUser.name}
                  </div>
                  <div className="truncate text-[11px] leading-none text-slate-500">
                    {selectedUser.email}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveSelectedUser}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={onInvite}
          className="absolute right-1 top-1/2 h-10 -translate-y-1/2 rounded-full bg-slate-800 px-6 text-white hover:bg-slate-900 active:scale-95"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite
        </Button>
      </div>

      {!selectedUser && inviteKeyword.trim().length > 0 && (
        <div className="absolute top-full z-30 mt-3 w-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-2 shadow-2xl ring-1 ring-black/5">
          <Command>
            <CommandList>
              {userlist.length === 0 ? (
                <CommandEmpty>No users found.</CommandEmpty>
              ) : (
                userlist.map((user) => (
                  <UserCommandItem
                    key={user.id}
                    onSelect={() => handleSelectUser(user)}
                    name={user.name}
                    email={user.email}
                    iconURL={user.image || ''}
                  />
                ))
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
