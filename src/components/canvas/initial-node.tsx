import { MousePointer2, Plus, Slack } from "lucide-react";
import { PlaceholderNode } from "@/components/placeholder-node";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const options = [
  {
    title: "Slack Message",
    description: "Send a message to a Slack channel or user.",
    icon: Slack,
  },
  {
    title: "Click",
    description: "Send a message to a Slack channel or user.",
    icon: MousePointer2,
  },
];

const InitialNode = ({ id, data }: any) => {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <PlaceholderNode>
          <div className=" flex  justify-center items-center  cursor-pointer">
            <Plus className="  size-4" />
          </div>
        </PlaceholderNode>
      </DrawerTrigger>{" "}
      <DrawerContent>
        <DrawerClose />
        <DrawerHeader className="text-left">
          <DrawerTitle className=" text-xl">Add Node</DrawerTitle>
          <DrawerDescription className="text-xs">
            Make changes to your node here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="grid w-full max-w-xl items-start gap-3 p-3">
          {options.map((option) => (
            <DrawerClose className=" cursor-pointer" asChild>
              <div className="  border  flex gap-3 p-3 rounded-xl">
                <option.icon size={30} strokeWidth={1} />
                <div>
                  <AlertTitle className=" text-sm">{option.title}</AlertTitle>
                  <AlertDescription className="text-xs">
                    {option.description}
                  </AlertDescription>
                </div>
              </div>
            </DrawerClose>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default InitialNode;
