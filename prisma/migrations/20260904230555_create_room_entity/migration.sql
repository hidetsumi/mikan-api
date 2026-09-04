-- CreateEnum
CREATE TYPE "room_visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "room_access_mode" AS ENUM ('ANONYMOUS', 'AUTHENTICATED_ONLY');

-- CreateEnum
CREATE TYPE "room_status" AS ENUM ('ACTIVE', 'ARCHIVED', 'EXPIRED');

-- CreateTable
CREATE TABLE "room" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "room_visibility" NOT NULL DEFAULT 'PUBLIC',
    "access_mode" "room_access_mode" NOT NULL DEFAULT 'ANONYMOUS',
    "status" "room_status" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3),
    "last_activity_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "room_slug_key" ON "room"("slug");

-- CreateIndex
CREATE INDEX "room_owner_user_id_idx" ON "room"("owner_user_id");

-- CreateIndex
CREATE INDEX "room_status_idx" ON "room"("status");

-- CreateIndex
CREATE INDEX "room_expires_at_idx" ON "room"("expires_at");

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
