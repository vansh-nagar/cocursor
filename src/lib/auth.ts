import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
// import { checkout, polar, portal } from "@polar-sh/better-auth";
// import { polarClient } from "./polar";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: { enabled: true, autoSignIn: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  // plugins: [
  //   polar({
  //     client: polarClient,
  //     createCustomerOnSignUp: true,
  //     use: [
  //       checkout({
  //         products: [
  //           {
  //             productId: "af18fe48-a58f-4c9f-910e-0e9e7e1ac4c1",
  //             slug: "orcha-pro", // Custom slug for easy reference in Checkout URL, e.g. /checkout/orcha-pro
  //           },
  //         ],
  //         successUrl: process.env.POLAR_SUCCESS_URL,
  //         authenticatedUsersOnly: true,
  //       }),
  //     ],
  //   }),
  // ],
});
