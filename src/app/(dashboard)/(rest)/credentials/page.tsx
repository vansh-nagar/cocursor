import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SiBox, SiDropbox, SiGoogledrive, SiSlack } from "react-icons/si";

const Connections = [
  {
    name: "Slack",
    icon: SiSlack,
    color: "#611f69",
    connected: false,
  },
  {
    name: "Google Drive",
    icon: SiGoogledrive,
    color: "#4285F4",
    connected: true,
  },
  {
    name: "Dropbox",
    icon: SiDropbox,
    color: "#0061FF",
    connected: false,
  },

  {
    name: "Box",
    icon: SiBox,
    color: "#0061FF",
    connected: false,
  },
];

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
        <CardContent className=" flex flex-col gap-2">
          {Connections.map((connection) => (
            <div
              key={connection.name}
              className=" border shadow rounded-xl p-4 flex justify-between items-center"
            >
              <div className=" flex items-center justify-center  gap-4 ">
                <connection.icon size={30} color={connection.color} />{" "}
                <span>{connection.name}</span>
              </div>
              <div>
                <Button>
                  {connection.connected ? "Disconnect" : "Connect Now"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
