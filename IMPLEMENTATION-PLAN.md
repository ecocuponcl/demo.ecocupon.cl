# 🚗 Plan de Implementación: Validador de Vehículos EcoCupon

## 📋 Contexto y Objetivo

### Situación Actual
- **Tenant principal:** `ecocupon.cl` (validador de vehículos)
- **Sub-tenant:** `demo.ecocupon.cl` (ya online en Vercel)
- **Referencia:** `https://elcerokm.com/asesoria-compra-auto`

### Objetivo
Transformar `demo.ecocupon.cl` en un **validador de vehículos** que:
1. Valide patentes de vehículos chilenos
2. Ofrezca asesoría de compra (similar a El Cero Km)
3. Conecte con el ecosistema EcoCupon

---

## 🔍 Análisis de Referencia: El Cero Km

### Flujo Actual (elcerokm.com)
```
1. Usuario selecciona Marca → Modelo → Año
2. Completa datos de compra (color, financiación, timeline)
3. Paga servicio ($149.900 ARS)
4. Especialista negocia con ~12 concesionarios
5. Usuario recibe mejor oferta
```

### Funcionalidades Clave
- ✅ Selector de marca/modelo
- ✅ Formulario de condiciones de compra
- ✅ Pasarela de pago
- ✅ Asignación de especialista
- ✅ Negociación con red de concesionarios
- ✅ Seguimiento hasta entrega

---

## 🎯 Propuesta: Validador EcoCupon

### Diferenciación
En lugar de solo asesoría de compra, **EcoCupon valida el vehículo** antes de la compra:

```
1. Usuario ingresa PATENTE → Validación de formato
2. Sistema verifica:
   - ✅ Formato válido (Chile)
   - ✅ Historial del vehículo (si hay datos)
   - ✅ Estado de patente
   - ✅ Multas/gravámenes
3. Usuario recibe reporte + cupón de descuento si compra
```

### Flujo Propuesto
```
┌─────────────────────────────────────────────────────────┐
│  1. Landing Page (demo.ecocupon.cl)                     │
│     - Hero: "Valida tu vehículo antes de comprar"       │
│     - Input: Patente                                    │
│     - CTA: "Validar Ahora"                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  2. Validación de Patente                               │
│     - Verifica formato (ABCD-12, AA-12-34, etc.)       │
│     - Llama a API del Registro Civil (si disponible)   │
│     - Retorna: ✅ Válido / ❌ Inválido                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  3. Resultados + EcoCupon                               │
│     - Muestra estado del vehículo                       │
│     - Ofrece cupón de descuento para compra             │
│     - Opción: "Quiero asesoría de compra"               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  4. Conversión                                          │
│     - Lead a n8n (webhook)                              │
│     - Asigna especialista                               │
│     - Inicia proceso de negociación                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Arquitectura Técnica

### Stack Actual
```
Frontend: Vite + React + TypeScript (✅ ya configurado)
Backend:  Picoclaw API (gemini-proxy)
Deploy:   Vercel (✅ ya online)
```

### Componentes a Implementar

#### 1️⃣ Frontend (demo.ecocupon.cl)
```
src/
├── components/
│   ├── PatentValidator.tsx      # Input + validación formato
│   ├── VehicleReport.tsx        # Resultados de validación
│   ├── BrandSelector.tsx        # Selector marca/modelo
│   ├── PurchaseForm.tsx         # Formulario de compra
│   └── EcoCuponOffer.tsx        # Cupón de descuento
├── services/
│   ├── patent.ts                # Validación de patente
│   ├── vehicle.ts               # API de vehículos
│   └── gemini.ts                # (ya existe)
└── pages/
    ├── Home.tsx                 # Landing principal
    └── Results.tsx              # Página de resultados
```

#### 2️⃣ Backend (Picoclaw / n8n)
```
API Endpoints:
- POST /api/validate/patent      → Valida formato patente
- GET  /api/vehicle/{patent}     → Obtiene datos del vehículo
- POST /api/lead                 → Guarda lead en n8n
- POST /api/ecocupon/generate    → Genera cupón
```

#### 3️⃣ Base de Datos (Supabase)
```sql
-- Tabla: vehicles
- patent (PK)
- brand
- model
- year
- color
- status (active/stolen/restricted)
- last_validation

-- Tabla: validations
- id (PK)
- patent (FK)
- user_email
- user_phone
- validation_date
- result
- source (registro_civil/api)

-- Tabla: leads
- id (PK)
- patent (FK)
- interested (boolean)
- budget
- financing_type
- assigned_to
- status
```

---

## 🗓️ Plan de Implementación por Fases

### FASE 1: Validador de Patentes (Día 1-2)
**Objetivo:** MVP funcional de validación de formato

#### Tareas:
- [ ] **1.1** Crear componente `PatentValidator.tsx`
  - Input de patente
  - Validación regex (formatos chilenos)
  - Feedback visual (✅/❌)

- [ ] **1.2** Servicio `patent.ts`
  - Función `validateFormat(patent: string): boolean`
  - Función `normalizePatent(patent: string): string`

- [ ] **1.3** Actualizar `App.tsx`
  - Reemplazar template Vite con landing page
  - Hero section con input de patente
  - CTA "Validar"

- [ ] **1.4** Deploy de prueba en Vercel

#### Criterio de Aceptación:
```
Usuario ingresa "ABCD-12" → ✅ Patente válida
Usuario ingresa "ABC123" → ❌ Formato inválido
```

---

### FASE 2: Reporte de Vehículo (Día 3-5)
**Objetivo:** Mostrar información del vehículo validado

#### Tareas:
- [ ] **2.1** Integrar API externa (si disponible)
  - Registro Civil (chile)
  - Autofact (historial de accidentes)
  - API de multas municipales

- [ ] **2.2** Componente `VehicleReport.tsx`
  - Muestra: marca, modelo, año, color
  - Alertas: multas, gravámenes, robo
  - Score de confianza (0-100)

- [ ] **2.3** Servicio `vehicle.ts`
  - `getVehicleInfo(patent: string): Promise<VehicleData>`
  - `getVehicleHistory(patent: string): Promise<HistoryData>`

- [ ] **2.4** Tablas Supabase
  - Crear schema `vehicles` y `validations`
  - Configurar RLS policies

#### Criterio de Aceptación:
```
Usuario valida patente → Ve reporte completo con:
- Datos del vehículo
- Historial (si disponible)
- Alertas (si existen)
```

---

### FASE 3: EcoCupon + Conversión (Día 6-8)
**Objetivo:** Generar cupón y capturar leads

#### Tareas:
- [ ] **3.1** Componente `EcoCuponOffer.tsx`
  - Muestra descuento disponible
  - Código de cupón único
  - Expiración (24-48 horas)

- [ ] **3.2** Formulario de compra (`PurchaseForm.tsx`)
  - Datos de contacto
  - Presupuesto
  - Tipo de financiación
  - Timeline de entrega

- [ ] **3.3** Webhook n8n
  - Endpoint: `POST /api/lead`
  - Trigger: nuevo lead calificado
  - Acción: asignar especialista

- [ ] **3.4** Servicio Gemini (opcional)
  - Chat de ayuda en la página
  - Respuestas automáticas a preguntas frecuentes

#### Criterio de Aceptación:
```
Usuario valida → Ve cupón → Completa formulario → Lead en n8n
```

---

### FASE 4: Integración con El Cero Km (Día 9-12)
**Objetivo:** Clonar funcionalidad de asesoría completa

#### Tareas:
- [ ] **4.1** Selector de marca/modelo
  - API de marcas disponibles
  - Filtrado por año/presupuesto

- [ ] **4.2** Pasarela de pago
  - Integrar MercadoPago/Flow
  - Servicio de $149.900 (o precio CLP)

- [ ] **4.3** Dashboard de especialista
  - Ver leads asignados
  - Actualizar estado de negociación
  - Notificar al usuario

- [ ] **4.4** Red de concesionarios
  - Base de datos de partners
  - API para solicitar cotizaciones
  - Comparador de ofertas

#### Criterio de Aceptación:
```
Usuario paga servicio → Especialista asignado → 
Recibe 3 cotizaciones → Cierra compra
```

---

## 🔐 Consideraciones de Seguridad

### API Keys
- ✅ Gemini: Ya está detrás de proxy (Picoclaw)
- ⚠️ Registro Civil: Necesitará backend propio
- ⚠️ Supabase: Usar solo anon key en frontend

### Datos Sensibles
- Patentes: Información pública, pero limitar rate limiting
- Emails/teléfonos: Encriptar en Supabase
- Pagos: Usar pasarela externa (no almacenar cards)

### Rate Limiting
```
- Validaciones por IP: 10/hora
- Validaciones por patente: 5/día
- API calls a externos: 100/hora
```

---

## 📊 Métricas de Éxito

### KPIs Técnicos
- [ ] Tiempo de validación < 2 segundos
- [ ] Uptime > 99%
- [ ] Error rate < 1%

### KPIs de Negocio
- [ ] Conversion rate: 5% (validación → lead)
- [ ] Lead → Cliente: 20%
- [ ] Ticket promedio: $149.900 CLP

---

## 🚀 Próximos Pasos Inmediatos

### Hoy (Día 1):
1. **Definir alcance mínimo (MVP)**
   - ¿Solo validador de formato?
   - ¿O incluir reporte de vehículo?

2. **Configurar entorno de desarrollo**
   ```bash
   cd demo.ecocupon.cl
   npm install
   npm run dev
   ```

3. **Crear estructura de carpetas**
   ```bash
   mkdir -p src/components src/services src/pages
   ```

4. **Empezar con `PatentValidator.tsx`**

### Mañana (Día 2):
- Deploy del validador en Vercel
- Test con patentes reales
- Iterar sobre feedback

---

## 🎯 Decisión Requerida

**¿Por dónde querés arrancar?**

### Opción A: MVP Rápido (1-2 días)
- Solo validador de formato de patente
- Landing page simple
- Sin integración con APIs externas
- **Ventaja:** Online rápido para validar idea

### Opción B: Validador Completo (5-7 días)
- Validación de formato + reporte de vehículo
- Integración con APIs (Registro Civil, Autofact)
- Captura de leads en n8n
- **Ventaja:** Producto más completo desde el inicio

### Opción C: Clon El Cero Km (10-15 días)
- Todo lo anterior + asesoría de compra completa
- Pasarela de pago
- Red de concesionarios
- **Ventaja:** Réplica exacta del modelo de negocio

---

**Recomendación:** Empezar con **Opción A** (MVP) y iterar rápido.
Podemos tener el validador online en 24-48 horas y validar si hay interés.

¿Qué opinas?
