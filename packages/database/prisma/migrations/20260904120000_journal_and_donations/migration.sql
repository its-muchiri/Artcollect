-- Journal posts (ArtCollect editorial) + donation causes/donations
-- (TikoYetu payment rail), docs/11-style continuation work. Donations
-- reuse the order pattern: pending row at checkout, transitions only on
-- verified provider calls, unique providerRef/webhookEventId for
-- idempotency under races and retries.

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "DonationCauseStatus" AS ENUM ('draft', 'published', 'closed');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "cover_image_key" TEXT,
    "author_name" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "PostStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_causes" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "country" TEXT,
    "organiser_name" TEXT NOT NULL,
    "goal_minor" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "cover_image_key" TEXT,
    "status" "DonationCauseStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donation_causes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "cause_id" TEXT NOT NULL,
    "donor_email" TEXT NOT NULL,
    "donor_name" TEXT,
    "message" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "amount_minor" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'pending',
    "provider_ref" TEXT,
    "webhook_event_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "donation_causes_slug_key" ON "donation_causes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "donations_provider_ref_key" ON "donations"("provider_ref");

-- CreateIndex
CREATE UNIQUE INDEX "donations_webhook_event_id_key" ON "donations"("webhook_event_id");

-- CreateIndex
CREATE INDEX "donations_cause_id_status_idx" ON "donations"("cause_id", "status");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_cause_id_fkey" FOREIGN KEY ("cause_id") REFERENCES "donation_causes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
