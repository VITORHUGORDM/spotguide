-- Documento do comerciante (somente hash e máscara)
ALTER TABLE "users" ADD COLUMN "document_hash" CHAR(64),
ADD COLUMN "document_type" VARCHAR(4),
ADD COLUMN "document_mask" VARCHAR(20);

CREATE UNIQUE INDEX "users_document_hash_key" ON "users"("document_hash");

-- Faixa de preço e comodidades dos lugares
ALTER TABLE "places" ADD COLUMN "price_level" SMALLINT,
ADD COLUMN "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "places" ADD CONSTRAINT "places_price_level_check" CHECK ("price_level" IS NULL OR "price_level" BETWEEN 1 AND 4);

-- "@>" (tem todas estas comodidades) usa este índice
CREATE INDEX "idx_places_amenities" ON "places" USING GIN ("amenities");
