import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  const start = performance.now()

  // Obtener el número del bot actual (la sesión activa)
  const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
  const configPath = path.join('./JadiBots', botActual, 'config.json')

  let nombreBot = global.namebot || '✧ ʏᴜʀᴜ ʏᴜʀɪ ✧'

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.name) nombreBot = config.name
    } catch (err) {
      console.log('⚠️ No se pudo leer config del subbot:', err)
    }
  }

  // Esperamos un pequeño mensaje para medir ping real
  const sentMsg = await conn.sendMessage(m.chat, { text: '🏓 Midiendo ping...' }, { quoted: m })

  const end = performance.now()
  const realPing = Math.round(end - start)

  // Si Baileys tiene ping nativo lo mostramos también
  const wsPing = conn?.ws?.ping?.last || 0

  await conn.sendMessage(m.chat, { 
    text: `☁︎ *Ping:* ${realPing} ms\n> ${nombreBot}` 
  }, { quoted: sentMsg })
}

handler.command = ['p', 'ping']
export default handler