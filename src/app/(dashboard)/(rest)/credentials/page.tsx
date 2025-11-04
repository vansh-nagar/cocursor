import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";

const Page = () => {
  return (
    <div>
      <Card className="  border-none shadow-none">
        <CardHeader>
          {" "}
          <div className=" flex flex-col ">
            <h1 className=" text-2xl font-medium ">Credentials</h1>
            <p className=" text-sm text-muted-foreground ">
              Update and manage your credentials
            </p>
          </div>{" "}
        </CardHeader>
        <CardContent>
          <div></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
