-- =============================================================================
-- ECOCUPON - TABLA DE LEADS DE VEHÍCULOS
-- Ejecutar en: https://rjfcmmzjlguiititkmyh.supabase.co/sql/new
-- =============================================================================

-- Crear tabla leads_autos
CREATE TABLE IF NOT EXISTS leads_autos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  patente text NOT NULL,
  marca text,
  modelo text,
  anio text,
  precio text,
  link text,
  telefono text NOT NULL,
  score integer DEFAULT 5,
  riesgos text,
  recomendacion text,
  resumen text,
  estado text DEFAULT 'nuevo',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_leads_autos_patente ON leads_autos(patente);
CREATE INDEX IF NOT EXISTS idx_leads_autos_telefono ON leads_autos(telefono);
CREATE INDEX IF NOT EXISTS idx_leads_autos_created_at ON leads_autos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_autos_estado ON leads_autos(estado);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_autos_updated_at
  BEFORE UPDATE ON leads_autos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE leads_autos ENABLE ROW LEVEL SECURITY;

-- Política: Solo insertar (anon puede crear leads)
CREATE POLICY "Cualquiera puede crear leads"
  ON leads_autos
  FOR INSERT
  WITH CHECK (true);

-- Política: Solo lectura para autenticados (staff)
CREATE POLICY "Staff puede ver todos los leads"
  ON leads_autos
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: Actualizar solo para staff
CREATE POLICY "Staff puede actualizar leads"
  ON leads_autos
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Vista para dashboard (opcional)
CREATE OR REPLACE VIEW leads_autos_resumen AS
SELECT
  DATE(created_at) as fecha,
  COUNT(*) as total_leads,
  AVG(score) as score_promedio,
  COUNT(CASE WHEN recomendacion = 'COMPRAR' THEN 1 END) as comprar,
  COUNT(CASE WHEN recomendacion = 'NO COMPRAR' THEN 1 END) as no_comprar,
  COUNT(CASE WHEN recomendacion = 'EVALUAR' THEN 1 END) as evaluar
FROM leads_autos
GROUP BY DATE(created_at)
ORDER BY fecha DESC;

-- Comentario
COMMENT ON TABLE leads_autos IS 'Leads de validación de vehículos - EcoCupon';
COMMENT ON COLUMN leads_autos.score IS 'Nivel de riesgo (1-10), menor es mejor';
COMMENT ON COLUMN leads_autos.recomendacion IS 'COMPRAR / NO COMPRAR / EVALUAR';

-- =============================================================================
-- EJEMPLOS DE USO
-- =============================================================================

-- Insertar lead manual (test)
-- INSERT INTO leads_autos (patente, marca, modelo, anio, precio, telefono, score, riesgos, recomendacion)
-- VALUES ('ABCD-12', 'Toyota', 'Yaris', '2018', '$8.500.000', '+56912345678', 3, '{}', 'COMPRAR');

-- Consultar últimos leads
-- SELECT * FROM leads_autos ORDER BY created_at DESC LIMIT 10;

-- Leads por recomendación
-- SELECT recomendacion, COUNT(*) FROM leads_autos GROUP BY recomendacion;

-- =============================================================================
