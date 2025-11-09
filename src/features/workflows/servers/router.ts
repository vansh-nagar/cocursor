import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/prisma";
import z from "zod";
import { PAGINATION } from "@/config/constant";
import { NodeType } from "@prisma/client";
import { inngest } from "@/inngest/client";

export const workFlowsRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workflow = await prisma.workflows.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      await inngest.send({
        name: "workflows/execute.workflow",
        data: {
          id: input?.id,
        },
      });

      return workflow;
    }),

  create: protectedProcedure.mutation(({ ctx }) => {
    return prisma.workflows.create({
      data: {
        name: `${ctx.auth.user.name} Workflow ${Date.now()}`,
        userId: ctx.auth.user.id,
        nodes: {
          create: {
            type: "INITIAL",
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

      // Serializable DTOs only (no JSX / ReactNode types)
      const nodes =
        workflow?.nodes.map((node) => ({
          id: node.id,
          position: node.position as { x: number; y: number },
          data: node.data ?? {},
          type: node.type,
          name: node.name,
        })) ?? [];

      const edges =
        workflow?.edge.map((edge) => ({
          id: edge.id,
          source: edge.fromNodeId,
          target: edge.toNodeId,
          sourceHandle: edge.fromOutput ?? undefined,
          targetHandle: edge.toInput ?? undefined,
          data: edge.data ?? {},
        })) ?? [];

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

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            position: z.any(),
            data: z.any(),
          })
        ),
        edges: z.array(
          z.object({
            id: z.string(),
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().optional(),
            targetHandle: z.string().optional(),
            data: z.any().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.workflows.update({
        where: {
          userId: ctx.auth.user.id,
          id: input.id,
        },
        data: {
          nodes: {
            deleteMany: {}, // remove old ones
            createMany: {
              data: input.nodes.map((n) => ({
                id: n.id,
                type: n.type as NodeType,
                name: n.data?.label ?? "Untitled",
                position: n.position,
                data: n.data,
              })),
            },
          },
          edge: {
            deleteMany: {},
            createMany: {
              data: input.edges.map((e) => ({
                id: e.id,
                fromNodeId: e.source,
                toNodeId: e.target,
                fromOutput: e.sourceHandle ?? "main",
                toInput: e.targetHandle ?? "main",
                data: e.data ?? {},
              })),
            },
          },
        },
      });
    }),
});
