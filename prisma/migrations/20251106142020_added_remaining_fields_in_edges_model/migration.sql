-- AlterTable
ALTER TABLE "public"."Edge" ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "label" TEXT;
