-- AlterTable
ALTER TABLE "forms" ADD COLUMN     "isMultistep" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "steps" JSONB,
ALTER COLUMN "fields" DROP NOT NULL;
