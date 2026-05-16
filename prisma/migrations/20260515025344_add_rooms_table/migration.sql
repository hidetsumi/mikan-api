-- CreateEnum
CREATE TYPE "room_visibility" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "room_access_mode" AS ENUM ('view_only', 'comment_only', 'edit');

-- CreateEnum
CREATE TYPE "room_status" AS ENUM ('open', 'closed');

-- CreateTable
CREATE TABLE "room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner_user_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "visibility" "room_visibility" NOT NULL,
    "access_mode" "room_access_mode" NOT NULL,
    "status" "room_status" NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "room_slug_key" ON "room"("slug");
