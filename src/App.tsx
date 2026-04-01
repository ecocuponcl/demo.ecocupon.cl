import { useState } from 'react'
import './App.css'

function App() {
  const [patente, setPatente] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [anio, setAnio] = useState('')
  const [precio, setPrecio] = useState('')
  const [link, setLink] = useState('')
  const [telefono, setTelefono] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{
    valido: boolean
    score?: number
    riesgos?: string[]
    recomendacion?: string
    mensaje?: string
  } | null>(null)

  // Validación formato patente chilena
  const validarPatente = (patente: string): boolean => {
    // Formatos válidos: ABCD-12, ABC-12, AA-12-34
    const regex = /^[A-Z]{2,4}[0-9]{2,4}$/i
    return regex.test(patente.replace(/-/g, ''))
  }

  // Calcular score preliminar (sin APIs)
  const calcularScore = (): { score: number; riesgos: string[]; recomendacion: string } => {
    let score = 5
    const riesgos: string[] = []

    // Año antiguo
    if (anio && parseInt(anio) < 2012) {
      score += 2
      riesgos.push('Vehículo > 10 años')
    }

    // Precio muy bajo
    if (precio) {
      const precioNum = parseInt(precio.replace(/[^0-9]/g, ''))
      if (precioNum < 3000000) {
        score += 2
        riesgos.push('Precio bajo vs mercado')
      }
    }

    // Sin link de publicación
    if (!link) {
      score += 1
      riesgos.push('Sin publicación visible')
    }

    // Patente inválida
    if (!validarPatente(patente)) {
      score += 3
      riesgos.push('Formato de patente inválido')
    }

    const recomendacion = score >= 7 ? 'NO COMPRAR' : score >= 5 ? 'EVALUAR CON CUIDADO' : 'BUENA OPCIÓN'

    return { score: Math.min(score, 10), riesgos, recomendacion }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResultado(null)

    // Validar patente primero
    if (!validarPatente(patente)) {
      setResultado({
        valido: false,
        mensaje: 'Formato de patente inválido. Ejemplos: ABCD-12, ABC-1234, AA-12-34'
      })
      setLoading(false)
      return
    }

    // Preparar datos
    const data = {
      patente: patente.toUpperCase(),
      marca,
      modelo,
      anio,
      precio,
      link,
      telefono,
      timestamp: new Date().toISOString()
    }

    try {
      // Enviar a webhook n8n
      const response = await fetch('https://n8n.smarterbot.cl/webhook/ecocupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      // Calcular score local
      const analisis = calcularScore()

      setResultado({
        valido: true,
        ...analisis,
        mensaje: 'Patente válida ✔️ - Análisis completado'
      })

      // Si hay error en el webhook, continuar igual (modo offline)
      if (!response.ok) {
        console.warn('Webhook no respondió, pero el análisis local funciona')
      }
    } catch (error) {
      console.error('Error enviando datos:', error)
      // Modo offline - mostrar resultado igual
      const analisis = calcularScore()
      setResultado({
        valido: true,
        ...analisis,
        mensaje: 'Patente válida ✔️ - Análisis local (sin conexión a servidor)'
      })
    }

    setLoading(false)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🚗 EcoCupon Validador</h1>
        <p>Valida tu vehículo antes de comprar</p>
      </header>

      <main className="main">
        <form id="autoForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="patente">Patente *</label>
            <input
              id="patente"
              name="patente"
              type="text"
              placeholder="Ej: ABCD-12"
              value={patente}
              onChange={(e) => setPatente(e.target.value)}
              required
              maxLength={8}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="marca">Marca</label>
              <input
                id="marca"
                name="marca"
                type="text"
                placeholder="Ej: Toyota"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modelo">Modelo</label>
              <input
                id="modelo"
                name="modelo"
                type="text"
                placeholder="Ej: Yaris"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="anio">Año</label>
              <input
                id="anio"
                name="anio"
                type="text"
                placeholder="Ej: 2018"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                maxLength={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="precio">Precio</label>
              <input
                id="precio"
                name="precio"
                type="text"
                placeholder="Ej: $8.500.000"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="link">Link publicación</label>
            <input
              id="link"
              name="link"
              type="url"
              placeholder="https://yapo.cl/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">WhatsApp *</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              placeholder="+56 9 1234 5678"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              maxLength={12}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Validando...' : 'Validar vehículo'}
          </button>
        </form>

        {resultado && (
          <div className={`resultado ${resultado.valido ? 'valido' : 'invalido'}`}>
            <h2>{resultado.valido ? '✅ Vehículo Validado' : '❌ Patente Inválida'}</h2>
            <p className="mensaje">{resultado.mensaje}</p>

            {resultado.valido && resultado.score && (
              <>
                <div className="score-box">
                  <div className="score-number">{resultado.score}/10</div>
                  <div className="score-label">Nivel de Riesgo</div>
                </div>

                <div className="riesgos-box">
                  <h3>⚠️ Detectamos:</h3>
                  <ul>
                    {resultado.riesgos?.map((riesgo, i) => (
                      <li key={i}>{riesgo}</li>
                    ))}
                  </ul>
                </div>

                <div className="recomendacion-box">
                  <strong>Recomendación:</strong> {resultado.recomendacion}
                </div>

                <div className="cta-box">
                  <p>¿Quieres validación completa con informe detallado + asesoría?</p>
                  <a
                    href={`https://wa.me/56912345678?text=Quiero%20informe%20completo%20de%20la%20patente%20${patente}`}
                    className="whatsapp-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📱 Obtener informe completo $9.990
                  </a>
                  <a
                    href={`https://wa.me/56912345678?text=Quiero%20asesoría%20para%20comprar%20${marca}%20${modelo}`}
                    className="asesor-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💬 Hablar con asesor
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Validación rápida y segura • EcoCupon Chile</p>
      </footer>
    </div>
  )
}

export default App
