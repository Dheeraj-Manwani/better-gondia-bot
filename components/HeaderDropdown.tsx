"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  // DropdownMenuPortal,
  DropdownMenuSeparator,
  // DropdownMenuShortcut,
  // DropdownMenuSub,
  // DropdownMenuSubContent,
  // DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, LogOut, Mail } from "lucide-react";
import { signIn, useSession } from "next-auth/react";

import { appSession } from "@/lib/auth";
import { cn, resetApp } from "@/lib/clientUtils";

export function HeaderDropdown() {
  const session = useSession() as unknown as appSession;

  const handleEmailLogin = () => {
    signIn("google");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          " bg-white border-none",
          session.status !== "authenticated" && "w-36"
        )}
        align="end"
      >
        {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
        {/* <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            New Team
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuItem disabled>API</DropdownMenuItem> */}
        {/* <DropdownMenuSeparator /> */}
        {session.status === "authenticated" && (
          <>
            <DropdownMenuLabel className="font-semibold">
              {session.data.user?.email}
            </DropdownMenuLabel>
            {session.data.user?.role !== "USER" && (
              <DropdownMenuLabel className="text-[12px] text-right p-0 m-0 font-semibold">
                ({session.data.user?.role})
              </DropdownMenuLabel>
            )}
            <DropdownMenuSeparator className="border border-gray-200" />
          </>
        )}
        {session.status !== "authenticated" && (
          <DropdownMenuItem
            className="hover:bg-[#E5DDD5] flex justify-between"
            onClick={handleEmailLogin}
          >
            <span>Gmail Login</span>
            <Mail />
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="hover:bg-[#E5DDD5] flex justify-between"
          onClick={() => {
            resetApp();
          }}
        >
          <span>Log out</span>
          <LogOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
