/**
 * API Route: /api/projects
 * 
 * Handles CRUD operations for projects
 * - GET: List all projects or get a specific project
 * - POST: Create a new project
 * - DELETE: Delete a project
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/projects or /api/projects?id=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          files: {
            select: { id: true, path: true, updatedAt: true },
          },
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(project);
    }

    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { files: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("[API /projects GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects
// Body: { name }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, initialFiles } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        files: initialFiles
          ? {
              create: initialFiles.map((file: { path: string; content: string }) => ({
                path: file.path,
                content: file.content,
              })),
            }
          : undefined,
      },
      include: {
        files: true,
      },
    });

    console.log(`[API /projects POST] Created project: ${name} (${project.id})`);
    return NextResponse.json(project);
  } catch (error) {
    console.error("[API /projects POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    console.log(`[API /projects DELETE] Deleted project: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API /projects DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
