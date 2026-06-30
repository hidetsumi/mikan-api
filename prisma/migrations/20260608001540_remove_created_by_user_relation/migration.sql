/*
  Warnings:

  - You are about to drop the column `created_by_guest_id` on the `todo` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_user_id` on the `todo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "todo" DROP CONSTRAINT "todo_created_by_user_id_fkey";

-- AlterTable
ALTER TABLE "todo" DROP COLUMN "created_by_guest_id",
DROP COLUMN "created_by_user_id",
ADD COLUMN     "owner_guest_id" TEXT;
