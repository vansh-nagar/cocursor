import SignInForm from "@/forms/sign-in";
import { requireUnAuth } from "@/lib/auth-utils";
import React from "react";

const page = async () => {
  await requireUnAuth();
  return (
    <>
      <SignInForm />
    </>
  );
};

export default page;
