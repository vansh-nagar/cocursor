import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/prisma";
import type { Edge, Node } from "@xyflow/react";

import z from "zod";
import { PAGINATION } from "@/config/constant";

export const workFlowsRouter = createTRPCRouter({
  create: protectedProcedure.mutation(({ ctx }) => {
    return prisma.workflows.create({
      data: {
        name: `${ctx.auth.user.name} Workflow ${Date.now()}`,
        userId: ctx.auth.user.id,
        nodes: {
          create: {
            type: "DEFAULT",
            name: "Start Node",
            position: { x: 0, y: 0 },
          },
        },
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

  //TODO: Update Name
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

  //TODO: include nodes and edges
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflows.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        include: {
          nodes: true,
          edge: true,
        },
      });

      const nodes: Node[] = workflow?.nodes.map((node) => ({
        id: node.id,
        position: node.position as { x: number; y: number },
        data: node.data,
        type: node.type,
      })) as Node[];

      const edges: Edge[] =
        workflow?.edge.map((edge) => {
          return {
            id: edge.id,
            source: edge.fromNodeId,
            target: edge.toNodeId,
            sourceHandle: edge.fromOutput || undefined,
            targetHandle: edge.toInput || undefined,
            type: "InitialNode",
            data: {}, // required by React Flow
          } as Edge;
        }) || [];

      return {
        id: workflow?.id,
        name: workflow?.name,
        nodes,
        edges,
      };
    }),

  //TODO: add pagination
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const [items, totalCount] = await Promise.all([
        prisma.workflows.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.workflows.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const haveNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        totalPages,
        haveNextPage,
        hasPrevPage,
        items,
        totalCount,
      };
    }),
});
