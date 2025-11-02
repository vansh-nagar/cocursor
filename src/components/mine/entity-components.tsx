import Link from "next/link";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";

type entityHeaderProps = {
  title: string;
  description: string;
  newButtonLabel?: string;
  disabled?: boolean;
  isCreating: boolean;
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { newButtonHref: string; onNew?: never }
  | { onNew: never; newButtonHref?: never }
);

export const EntityHeader = ({
  title,
  description,
  newButtonLabel,
  disabled,
  isCreating,
  onNew,
  newButtonHref,
}: entityHeaderProps) => {
  return (
    <div className=" flex flex-row  items-center  justify-between gap-4">
      <div className=" flex flex-col ">
        <h1 className=" text-2xl font-medium ">{title}</h1>
        <p className=" text-sm text-muted-foreground ">{description}</p>
      </div>
      <div className=" flex flex-row ">
        {!onNew && newButtonHref && (
          <Link href={newButtonHref}>
            <Button disabled={disabled || isCreating}>
              <PlusIcon />
              {newButtonLabel}
            </Button>{" "}
          </Link>
        )}
        {onNew && (
          <Button disabled={disabled || isCreating} onClick={onNew}>
            <PlusIcon />
            {newButtonLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export const EntityContainer = ({
  header,
  search,
  pagination,
  children,
}: {
  header: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Card className=" flex flex-col gap-4 border-none shadow-none">
      <CardHeader>{header}</CardHeader>
      <CardContent>{search}</CardContent>
      <CardContent>{pagination}</CardContent>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
