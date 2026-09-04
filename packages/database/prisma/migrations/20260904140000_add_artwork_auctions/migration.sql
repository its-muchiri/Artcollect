-- Artwork auctions (docs/11-style continuation): one scheduled sale window
-- per artwork; status is derived from startsAt/endsAt at read time. This
-- migration is marked applied on databases where the table already exists
-- (created via `prisma db push` during development) — see the project's
-- migration-reconciliation note.

-- CreateTable
CREATE TABLE "artwork_auctions" (
    "id" TEXT NOT NULL,
    "artwork_id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "starting_price_minor" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artwork_auctions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artwork_auctions_artwork_id_key" ON "artwork_auctions"("artwork_id");

-- CreateIndex
CREATE INDEX "artwork_auctions_starts_at_idx" ON "artwork_auctions"("starts_at");

-- AddForeignKey
ALTER TABLE "artwork_auctions" ADD CONSTRAINT "artwork_auctions_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "artworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
