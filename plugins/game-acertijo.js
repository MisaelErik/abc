import { promises as fs } from 'fs'
const acertijosPath = './database/acertijos.json'

let acertijoActual = null
const tiempoLimite = 60000
const maxIntentos = 6

async function cargarAcertijos() {
  try {
    const data = await fs.readFile(acertijosPath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const acertijos = await cargarAcertijos()
  if (acertijos.length === 0) return conn.reply(m.chat, 'No hay acertijos disponibles 🤷‍♂️', m)

  if (!acertijoActual) {
    const idx = Math.floor(Math.random() * acertijos.length)
    acertijoActual = {
      ...acertijos[idx],
      inicio: Date.now(),
      jugador: m.sender,
      chat: m.chat,
      intentos: 0
    }
    return conn.reply(m.chat, `
🎭 *¡ACERTIJO NUEVO PA' TI!* 🎭

${acertijoActual.pregunta}

*Responde rápido antes de que se acabe el tiempo* (60 segundos) y solo tienes 6 intentos.

*Usa:* ${usedPrefix}${command} <tu respuesta>
    `.trim(), m)
  }

  if (m.sender !== acertijoActual.jugador) {
    return conn.reply(m.chat, `❗ Solo @${acertijoActual.jugador.split`@`[0]} puede responder este acertijo.`, m, { mentions: [acertijoActual.jugador] })
  }

  if (!text) return conn.reply(m.chat, `✎ Responde el acertijo con: *${usedPrefix}${command} <tu respuesta>*`, m)

  acertijoActual.intentos++

  if (text.toLowerCase().trim() === acertijoActual.respuesta) {
    await conn.reply(m.chat, `
🎉 ¡Bien hecho @${m.sender.split`@`[0]}! 🎉
Acertaste el acertijo:

${acertijoActual.pregunta}

Respuesta: *${acertijoActual.respuesta}*

👏 Eres un duro, felicidades w
    `.trim(), m, { mentions: [m.sender] })
    acertijoActual = null
  } else {
    if (acertijoActual.intentos >= maxIntentos) {
      await conn.reply(m.chat, `
❌ Se te acabaron los intentos (6) :c

⌛ Se acabó el tiempo para responder!

La respuesta correcta era: *${acertijoActual.respuesta}*

${acertijoActual.pregunta}
      `.trim(), m)
      acertijoActual = null
    } else {
      await conn.reply(m.chat, `❌ Incorrecto, intenta otra vez.\n\nIntento *${acertijoActual.intentos}* de *${maxIntentos}*\n\nPregunta: ${acertijoActual.pregunta}`, m)
    }
  }
}

setInterval(() => {
  if (!acertijoActual) return
  if (Date.now() - acertijoActual.inicio > tiempoLimite) {
    global.conn?.sendMessage(
      acertijoActual.chat,
      {
        text: `⌛ Se acabó el tiempo para responder!\n\n${acertijoActual.pregunta}\n\nLa respuesta era: *${acertijoActual.respuesta}*`
      },
      { mentions: [acertijoActual.jugador] }
    )
    acertijoActual = null
  }
}, 15000)

handler.help = ['acertijo']
handler.tags = ['game']
handler.command = ['acertijo', 'adivinanza']
handler.register = true
handler.group = false

export default handler
