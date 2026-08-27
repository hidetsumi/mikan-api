-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_hash_key" ON "refresh_token"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_replaced_by_token_id_key" ON "refresh_token"("replaced_by_token_id");

-- CreateIndex
CREATE INDEX "refresh_token_family_idx" ON "refresh_token"("family");

-- CreateIndex
CREATE INDEX "refresh_token_expires_at_idx" ON "refresh_token"("expires_at");

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_replaced_by_token_id_fkey" FOREIGN KEY ("replaced_by_token_id") REFERENCES "refresh_token"("id") ON DELETE SET NULL ON UPDATE CASCADE;

