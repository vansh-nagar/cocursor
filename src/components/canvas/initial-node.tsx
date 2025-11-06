import { Handle, Position } from "@xyflow/react";
import { MousePointer2, Plus, Slack } from "lucide-react";
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";
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
      <DrawerTrigger>
        <div className=" hover:scale-105 transition-all duration-300 flex items-center justify-center  p-4  rounded-md  bg-background cursor-pointer border border-dashed">
          <Plus />
        </div>
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
