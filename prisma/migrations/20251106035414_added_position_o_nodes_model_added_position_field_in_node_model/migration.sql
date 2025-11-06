/*
  Warnings:

  - Added the required column `position` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Node" ADD COLUMN     "position" JSONB NOT NULL;
