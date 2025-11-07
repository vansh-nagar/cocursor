/*
  Warnings:

  - The values [DEFAULT,INPUT,OUTPUT,GROUP] on the enum `NodeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."NodeType_new" AS ENUM ('INITIAL', 'MANUAL_TRIGGER', 'HTTP_REQUEST');
ALTER TABLE "public"."Node" ALTER COLUMN "type" TYPE "public"."NodeType_new" USING ("type"::text::"public"."NodeType_new");
ALTER TYPE "public"."NodeType" RENAME TO "NodeType_old";
ALTER TYPE "public"."NodeType_new" RENAME TO "NodeType";
DROP TYPE "public"."NodeType_old";
COMMIT;
