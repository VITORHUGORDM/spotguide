-- CreateTable
CREATE TABLE "itineraries" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_stops" (
    "itinerary_id" UUID NOT NULL,
    "place_id" UUID NOT NULL,
    "position" SMALLINT NOT NULL,

    CONSTRAINT "itinerary_stops_pkey" PRIMARY KEY ("itinerary_id","place_id")
);

-- CreateIndex
CREATE INDEX "idx_itineraries_owner" ON "itineraries"("owner_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_stops_order" ON "itinerary_stops"("itinerary_id", "position");

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_stops" ADD CONSTRAINT "itinerary_stops_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_stops" ADD CONSTRAINT "itinerary_stops_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;
