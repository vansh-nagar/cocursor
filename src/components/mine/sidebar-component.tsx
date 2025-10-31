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
  CreditCard,
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
  const parthname = usePathname();

  return (
    <Sidebar>
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
                    ? parthname === "/"
                    : parthname.startsWith(item.url)
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
          <SidebarMenuButton className=" gap-4" tooltip={"Update to Pro"}>
            <MoonIcon />
            <span>Dark mode</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton className=" gap-4" tooltip={"Update to Pro"}>
            <StarIcon />
            <span>upgrade to pro</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton className=" gap-4" tooltip={"Billing portal"}>
            <CreditCard />
            <span>Billing Portal </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
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
