-- Add TicketingEventCategory (docs/11_maximalist_redesign_plan.md Phase 1):
-- drives per-event visual style routing on TikoYetu event pages. Existing
-- rows default to 'other' (the calm default surface).

-- CreateEnum
CREATE TYPE "TicketingEventCategory" AS ENUM ('art', 'music', 'nightlife', 'streetart', 'editorial', 'other');

-- AlterTable
ALTER TABLE "ticketing_events" ADD COLUMN "category" "TicketingEventCategory" NOT NULL DEFAULT 'other';
