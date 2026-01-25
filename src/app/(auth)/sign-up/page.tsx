import SignUpForm from "@/forms/sign-up";
import { requireUnAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireUnAuth();
  return (
    <>
      <SignUpForm />
    </>
  );
};

export default Page;
