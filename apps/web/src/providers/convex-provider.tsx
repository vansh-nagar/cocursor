"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

export const ClientConvexProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      <ConvexProvider client={convex}></ConvexProvider>
      {children}
    </>
  );
};

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
