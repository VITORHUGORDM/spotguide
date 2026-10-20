-- Índices para os filtros de estado/cidade, ordenação por nota e capa das fotos
CREATE INDEX "idx_places_active_state_city" ON "places"("is_active", "state", "city");

CREATE INDEX "idx_places_active_rating" ON "places"("is_active", "average_rating" DESC, "total_reviews" DESC);

CREATE INDEX "idx_photos_place_cover" ON "place_photos"("place_id", "is_cover" DESC, "display_order");

-- O filtro de estado compara pela sigla (SP), então padroniza o que já foi cadastrado por extenso
UPDATE "places"
SET "state" = CASE translate(lower(trim("state")), 'áàâãéêíóôõúç', 'aaaaeeiooouc')
    WHEN 'acre' THEN 'AC'
    WHEN 'alagoas' THEN 'AL'
    WHEN 'amapa' THEN 'AP'
    WHEN 'amazonas' THEN 'AM'
    WHEN 'bahia' THEN 'BA'
    WHEN 'ceara' THEN 'CE'
    WHEN 'distrito federal' THEN 'DF'
    WHEN 'espirito santo' THEN 'ES'
    WHEN 'goias' THEN 'GO'
    WHEN 'maranhao' THEN 'MA'
    WHEN 'mato grosso' THEN 'MT'
    WHEN 'mato grosso do sul' THEN 'MS'
    WHEN 'minas gerais' THEN 'MG'
    WHEN 'para' THEN 'PA'
    WHEN 'paraiba' THEN 'PB'
    WHEN 'parana' THEN 'PR'
    WHEN 'pernambuco' THEN 'PE'
    WHEN 'piaui' THEN 'PI'
    WHEN 'rio de janeiro' THEN 'RJ'
    WHEN 'rio grande do norte' THEN 'RN'
    WHEN 'rio grande do sul' THEN 'RS'
    WHEN 'rondonia' THEN 'RO'
    WHEN 'roraima' THEN 'RR'
    WHEN 'santa catarina' THEN 'SC'
    WHEN 'sao paulo' THEN 'SP'
    WHEN 'sergipe' THEN 'SE'
    WHEN 'tocantins' THEN 'TO'
    ELSE "state"
  END
WHERE length(trim("state")) > 2;

UPDATE "places" SET "state" = upper(trim("state")) WHERE length(trim("state")) = 2 AND "state" <> upper(trim("state"));
