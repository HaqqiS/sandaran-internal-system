"use client";

import {
  IconArrowRight,
  IconUserCheck,
  IconUserExclamation,
} from "@tabler/icons-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { formatWitaDate } from "~/lib/time-utils";
import { cn } from "~/lib/utils";

export interface PendingUserItem {
  id: string;
  name: string;
  email: string;
  createdAt: Date | string;
  image?: string | null;
}

interface PendingUsersCardProps {
  users: PendingUserItem[];
  totalPendingCount: number;
  className?: string;
}

export function PendingUsersCard({
  users,
  totalPendingCount,
  className,
}: PendingUsersCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Card className={cn("flex flex-col justify-between", className)}>
      <CardHeader className="p-4 md:p-5 border-b pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <IconUserExclamation className="h-4 w-4 text-status-warning shrink-0" />
          <CardTitle className="text-sm font-semibold tracking-tight">
            Persetujuan Pengguna
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-semibold px-2 py-0.5",
            totalPendingCount > 0
              ? "border-status-warning bg-status-warning-bg text-status-warning"
              : "text-muted-foreground",
          )}
        >
          {totalPendingCount} Menunggu
        </Badge>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        {users.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
            <IconUserCheck className="h-6 w-6 text-status-success mx-auto opacity-80" />
            <p className="font-medium text-foreground">
              Tidak ada antrean persetujuan
            </p>
            <p>Semua pendaftaran pengguna telah ditinjau.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 text-xs shrink-0">
                    {user.image && (
                      <AvatarImage src={user.image} alt={user.name} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-muted-foreground block">
                    {formatWitaDate(user.createdAt, { shortMonth: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 border-t bg-muted/20">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full min-h-11 md:min-h-9 justify-between text-xs font-medium active:scale-95 transition-transform"
        >
          <Link href="/users">
            Kelola Seluruh Pengguna
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
