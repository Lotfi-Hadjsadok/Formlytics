/*
  Warnings:

  - You are about to drop the `user_preferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."user_preferences" DROP CONSTRAINT "user_preferences_formId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_preferences" DROP CONSTRAINT "user_preferences_userId_fkey";

-- AlterTable
ALTER TABLE "forms" ADD COLUMN     "styling" JSONB;

-- DropTable
DROP TABLE "public"."user_preferences";
