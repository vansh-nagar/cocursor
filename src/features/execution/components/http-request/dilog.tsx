import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import z from "zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

const formSchema = z.object({
  endpoint: z.string().url("Invalid URL"),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  body: z.string().optional(),
});

export type HTTPFormType = z.infer<typeof formSchema>;

export const HTTPRequestDialog = ({
  isOpen,
  onClose,
  onSubmit,
  defaultEndpoint = "",
  defaultMethod = "GET",
  defaultBody = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultMethod?: "GET" | "POST" | "PUT" | "DELETE";
  defaultEndpoint?: string;
  defaultBody?: string;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: defaultEndpoint,
      method: defaultMethod,
      body: defaultBody,
    },
  });

  // useEffect(() => {
  //   if (isOpen) {
  //     form.reset({
  //       endpoint: defaultEndpoint,
  //       method: defaultMethod,
  //       body: defaultBody,
  //     });
  //   }
  // }, [isOpen, defaultEndpoint, defaultBody, defaultMethod, form]);

  const watchMethod = form.watch("method");
  const showBodyField = ["POST", "PUT"].includes(watchMethod);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>HTTP Request</DialogTitle>
          <DialogDescription>
            Configure settings for the HTTP Request here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className=" space-y-8 mt-4"
          >
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className=" w-full">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the HTTP method for the request.
                  </FormDescription>
                  <FormMessage />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="https://www.arclabs.space/"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the full URL for the HTTP request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showBodyField && (
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Body</FormLabel>

                    <FormControl>
                      <Textarea
                        placeholder={`
                        \n{\n  "userId" : 1,\n  "title" : "Sample Title",\n  "body" : "Sample Body"\n}`}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the request body for the HTTP request.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className=" w-full mt-4">
              Save Settings
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
