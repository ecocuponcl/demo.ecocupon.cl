# 🚗 EcoCupon Validador - Deploy Rápido

## ✅ Checklist Hoy

```bash
[ ] form funcionando
[ ] webhook responde 200
[ ] Gemini devuelve score
[ ] 1 lead guardado en DB
```

---

## 1️⃣ Frontend (Vercel)

### Archivos listos:
- ✅ `src/App.tsx` - Formulario completo + validación
- ✅ `src/App.css` - Estilos modernos
- ✅ `vercel.json` - Configuración Vite

### Deploy automático:
```bash
cd /Users/mac/dev/2026/demo.ecocupon.cl
git add .
git commit -m "feat: validador de vehículos EcoCupon"
git push
```

Luego en Vercel:
1. Ir a https://vercel.com/dashboard
2. Proyecto `demo.ecocupon.cl`
3. **Redeploy** del último commit

URL: **https://demo.ecocupon.cl**

---

## 2️⃣ n8n Workflow

### Importar workflow:
1. Abrir https://n8n.smarterbot.cl
2. Click en **Workflows** → **Import from File**
3. Seleccionar: `n8n-workflow-ecocupon.json`
4. Activar workflow (toggle **Active**)

### Configurar credenciales:

#### Gemini API:
1. Ir a **Credentials** → **Add Credential**
2. Tipo: **HTTP Request**
3. Nombre: `Gemini API Key`
4. En el workflow, reemplazar `{{ $env.GEMINI_API_KEY }}` por tu key real
   - O crear variable de entorno en n8n: `GEMINI_API_KEY=tu-key`

#### Supabase Postgres:
1. Ir a **Credentials** → **Add Credential**
2. Tipo: **PostgreSQL**
3. Configurar:
   ```
   Host: rjfcmmzjlguiititkmyh.supabase.co
   Database: postgres
   User: postgres
   Password: [tu password de Supabase]
   Port: 5432
   SSL: true
   ```

### Webhook URL:
```
POST https://n8n.smarterbot.cl/webhook/ecocupon
```

---

## 3️⃣ Supabase Database

### Ejecutar schema:
1. Ir a https://rjfcmmzjlguiititkmyh.supabase.co
2. **SQL Editor** → **New Query**
3. Copiar contenido de `supabase-schema.sql`
4. **Run**

### Verificar tabla:
```sql
SELECT * FROM leads_autos ORDER BY created_at DESC LIMIT 10;
```

---

## 4️⃣ Test Completo

### Desde el frontend:
1. Abrir https://demo.ecocupon.cl
2. Llenar formulario:
   ```
   Patente: ABCD-12
   Marca: Toyota
   Modelo: Yaris
   Año: 2018
   Precio: $8.500.000
   Link: https://yapo.cl/...
   Teléfono: +56912345678
   ```
3. Click en **Validar vehículo**

### Verificar en n8n:
1. Ir a workflow **EcoCupon - Validador**
2. **Executions** → Ver última ejecución
3. Debe mostrar **Success**

### Verificar en Supabase:
```sql
SELECT * FROM leads_autos WHERE patente = 'ABCD-12' ORDER BY created_at DESC;
```

---

## 5️⃣ WhatsApp de Venta

### Actualizar número en `App.tsx`:
Buscar línea:
```tsx
href={`https://wa.me/56912345678?text=...`}
```

Reemplazar `56912345678` por tu número real de ventas.

---

## 🎯 Flujo Completo

```
Usuario → demo.ecocupon.cl
           ↓
     Llena formulario
           ↓
     POST → n8n webhook
           ↓
     Gemini analiza vehículo
           ↓
     Supabase guarda lead
           ↓
     Frontend muestra resultado
           ↓
     Usuario click WhatsApp
           ↓
     Venta cerrada 💰
```

---

## 🚨 Solución de Problemas

### Frontend no envía datos:
```bash
# Ver console.log en browser (F12)
# Verificar URL del webhook en App.tsx
```

### Webhook no responde:
```bash
# Test manual:
curl -X POST https://n8n.smarterbot.cl/webhook/ecocupon \
  -H "Content-Type: application/json" \
  -d '{"patente":"ABCD-12","telefono":"+56912345678"}'
```

### Gemini no responde:
- Verificar API key en n8n
- Checkear quota en https://makersuite.google.com/app/apikey

### Supabase no guarda:
- Verificar credenciales Postgres en n8n
- Confirmar tabla creada con schema SQL

---

## 📊 Métricas

### Dashboard SQL:
```sql
-- Leads por día
SELECT DATE(created_at) as fecha, COUNT(*) as total
FROM leads_autos
GROUP BY DATE(created_at)
ORDER BY fecha DESC;

-- Tasa de conversión
SELECT 
  recomendacion,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM leads_autos
GROUP BY recomendacion;

-- Score promedio
SELECT AVG(score) as score_promedio FROM leads_autos;
```

---

## 🔥 Siguientes Pasos

### Fase 2 (cuando funcione básico):
- [ ] Integrar API Registro Civil (validar patente real)
- [ ] Scraping Yapo/Chileautos (precios mercado)
- [ ] Pasarela de pago (MercadoPago/Flow)
- [ ] Reporte PDF automático
- [ ] Email automático al usuario

### Fase 3 (escalar):
- [ ] Dashboard de ventas
- [ ] Seguimiento automático (Telegram/Email)
- [ ] Integración con CRM
- [ ] Múltiples asesores

---

**Deploy inicial:** ~15 minutos  
**Test completo:** ~5 minutos  
**Primer lead:** ¡Inmediato!

¿Listo para vender? 🚀
