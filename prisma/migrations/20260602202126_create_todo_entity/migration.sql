-- CreateEnum
CREATE TYPE "todo_status" AS ENUM ('PENDING', 'COMPLETED', 'IN_PROGRESS', 'ON_HOLD', 'CANCELLED');

-- CreateTable
CREATE TABLE "todo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "todo_status" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL,
    "owner_user_id" TEXT,
    "room_id" TEXT,
    "created_by_user_id" TEXT,
    "created_by_guest_id" TEXT,
    "assigned_user_id" TEXT,
    "due_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "todo_owner_user_id_idx" ON "todo"("owner_user_id");

-- CreateIndex
CREATE INDEX "todo_room_id_idx" ON "todo"("room_id");

-- CreateIndex
CREATE INDEX "todo_status_idx" ON "todo"("status");

-- CreateIndex
CREATE INDEX "todo_created_at_idx" ON "todo"("created_at");

-- CreateIndex
CREATE INDEX "todo_due_at_idx" ON "todo"("due_at");

-- CreateIndex
CREATE INDEX "todo_room_id_status_created_at_idx" ON "todo"("room_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "todo_owner_user_id_status_created_at_idx" ON "todo"("owner_user_id", "status", "created_at");

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
