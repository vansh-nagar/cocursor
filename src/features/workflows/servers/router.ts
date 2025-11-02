import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/prisma";
import z from "zod";

export const workFlowsRouter = createTRPCRouter({
  create: protectedProcedure.mutation(({ ctx }) => {
    return prisma.workflows.create({
      data: {
        name: "TODO",
        userId: ctx.auth.user.id,
      },
    });
  }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.workflows.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),

  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.workflows.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return prisma.workflows.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),

  //TODO: add pagination
  getMany: protectedProcedure.query(({ ctx }) => {
    return prisma.workflows.findMany({
      where: {
        userId: ctx.auth.user.id,
      },
    });
  }),
});
