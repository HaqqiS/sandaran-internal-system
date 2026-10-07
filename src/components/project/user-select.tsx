"use client";

import { IconSelector, IconUserSearch } from "@tabler/icons-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useSearchUsers } from "~/hooks";
import { useDebounce } from "~/hooks/use-debounce";

interface UserSelectProps {
  onSelect: (userId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

type UserItem = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export function UserSelect({
  onSelect,
  disabled = false,
  placeholder = "Pilih pengguna...",
}: UserSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { data: users, isLoading } = useSearchUsers(debouncedSearch);

  const handleSelect = (user: UserItem) => {
    setSelectedUser(user);
    onSelect(user.id);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={selectedUser.image || undefined} />
                <AvatarFallback className="text-xs">
                  {selectedUser.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {selectedUser.name || selectedUser.email}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        portal={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Cari pengguna..."
            value={search}
            onValueChange={setSearch}
            autoFocus={false}
          />
          <CommandList className="max-h-[160px] mt-2">
            {isLoading ? (
              <CommandEmpty>
                <div className="flex items-center justify-center py-2">
                  <IconUserSearch className="mr-2 h-4 w-4 animate-pulse" />
                  Mencari...
                </div>
              </CommandEmpty>
            ) : !users?.length ? (
              <CommandEmpty>Pengguna tidak ditemukan.</CommandEmpty>
            ) : (
              <CommandGroup>
                {users?.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => handleSelect(user)}
                    className="mb-1 flex items-center gap-3 last:mb-0"
                    data-checked={selectedUser?.id === user.id}
                  >
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col min-w-0">
                      <span className="truncate text-sm font-medium">
                        {user.name || "Tidak Diketahui"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
