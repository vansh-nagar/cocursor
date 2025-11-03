"use client";
import React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  FolderOpenIcon,
  KeyIcon,
  LogOutIcon,
  MoonIcon,
  RefreshCcwIcon,
  SidebarClose,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHasActiveSubscription } from "@/hooks/use-subscriptions";

const menuItems = [
  {
    title: "Workflows",
    items: [
      {
        title: "Workflows",
        icon: FolderOpenIcon,
        url: "/workflows",
      },
      {
        title: "Credentials",
        icon: KeyIcon,
        url: "/credentials",
      },
      {
        title: "Executions",
        icon: RefreshCcwIcon,
        url: "/executions",
      },
    ],
  },
];

const SidebarComponent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { hasActiveSubscription, subscription, isLoading, isError } =
    useHasActiveSubscription();

  console.log(
    "Subscription status:",
    hasActiveSubscription,
    subscription,
    isLoading,
    isError
  );

  return (
    <Sidebar className=" border-dashed rounded-br-2xl  overflow-hidden">
      <SidebarHeader>
        <SidebarMenuItem>
          <div className=" flex  items-center pr-2">
            <Link href="/">
              <Image
                className=" invert dark:block hidden"
                src="/logo/logo1.svg"
                alt="ORHCA"
                width={120}
                height={40}
              />
              <Image
                className="dark:hidden block"
                src="/logo/logo1.svg"
                alt="ORHCA"
                width={120}
                height={40}
              />
            </Link>
          </div>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup
            className=" gap-2"
            key={group.title}
            title={group.title}
          >
            {group.items.map((item) => (
              <SidebarMenuButton
                isActive={
                  item.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.url)
                }
                key={item.title}
                asChild
                tooltip={item.title}
              >
                <Link
                  prefetch
                  href={item.url}
                  className="flex items-center p-2 hover:bg-gray-200 rounded"
                >
                  <item.icon className="mr-2" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            ))}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className=" gap-2">
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className=" w-full">
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 block transition-all dark:hidden dark:-rotate-90" />
                <Moon className=" h-[1.2rem] w-[1.2rem] hidden rotate-90 transition-all dark:block dark:rotate-0" />
                <span>Toggle theme</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
        {/* {!hasActiveSubscription && !isLoading && (
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                authClient.checkout({
                  slug: "orcha-pro",
                });
              }}
              className=" gap-4"
              tooltip={"Update to Pro"}
            >
              <StarIcon />
              <span>upgrade to pro</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <SidebarMenuItem>
          <SidebarMenuButton className=" gap-4" tooltip={"Billing portal"}>
            <CreditCard />
            <span>Billing Portal </span>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
        <SidebarMenuItem>
          <SidebarMenuButton
            className=" gap-4"
            tooltip={"Billing portal"}
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/sign-in");
                  },
                },
              })
            }
          >
            <LogOutIcon />
            <span>Log out </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarComponent;
