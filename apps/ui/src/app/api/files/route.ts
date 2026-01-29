/**
 * API Route: /api/files
 * 
 * Handles CRUD operations for project files
 * - GET: List files for a project
 * - POST: Create or update a file
 * - DELETE: Delete a file
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/files?projectId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const files = await prisma.file.findMany({
      where: { projectId },
      select: {
        id: true,
        projectId: true,
        path: true,
        content: true,
        updatedAt: true,
      },
      orderBy: { path: "asc" },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("[API /files GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

// POST /api/files
// Body: { projectId, path, content }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, path, content } = body;

    if (!projectId || !path) {
      return NextResponse.json(
        { error: "projectId and path are required" },
        { status: 400 }
      );
    }

    // Upsert: create or update
    const file = await prisma.file.upsert({
      where: {
        projectId_path: {
          projectId,
          path,
        },
      },
      update: {
        content: content ?? "",
        updatedAt: new Date(),
      },
      create: {
        projectId,
        path,
        content: content ?? "",
      },
    });

    console.log(`[API /files POST] Saved: ${path}`);
    return NextResponse.json(file);
  } catch (error) {
    console.error("[API /files POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to save file" },
      { status: 500 }
    );
  }
}

// DELETE /api/files?projectId=xxx&path=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const path = searchParams.get("path");

    if (!projectId || !path) {
      return NextResponse.json(
        { error: "projectId and path are required" },
        { status: 400 }
      );
    }

    await prisma.file.delete({
      where: {
        projectId_path: {
          projectId,
          path,
        },
      },
    });

    console.log(`[API /files DELETE] Deleted: ${path}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API /files DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
