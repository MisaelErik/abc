async function handler(m, { conn, args, usedPrefix, command }) {
  const user = global.db.data.users[m.sender]
  const type = 'coin'
  const bankType = 'bank'

  const moneda = global.moneda || '¥'
  const emoji = '✧'
  const emoji2 = '𐂂'

  if (!args[0] || !args[1]) {
    const helpMessage = `${emoji} Debes mencionar a quien quieras regalar *${moneda}*.\n> Ejemplo » *${usedPrefix + command} 25000 @usuario*`.trim()
    return conn.sendMessage(m.chat, { text: helpMessage, mentions: [m.sender] }, { quoted: m })
  }

  const count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(100, (isNumber(args[0]) ? parseInt(args[0]) : 100)))

  const who = m.mentionedJid?.[0] || (
    args[1] ? (args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net') : ''
  )

  if (!who) {
    return conn.sendMessage(m.chat, {
      text: `${emoji2} Debes regalar al menos *100 ${moneda}* y mencionar al usuario.`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  if (!(who in global.db.data.users)) {
    return conn.sendMessage(m.chat, {
      text: `${emoji2} El usuario *${who}* no está en la base de datos.`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  if (user[bankType] < count) {
    return conn.sendMessage(m.chat, {
      text: `${emoji2} No tienes suficientes ${moneda} en tu banco para transferir.\n> *TIP :* para que esto funcione tienes que tener tus ${moneda} en el banco.`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  user[bankType] -= count
  global.db.data.users[who][type] += count

  const totalEnBanco = user[bankType].toLocaleString()
  const nombre = await conn.getName(who)
  const mención = '@' + who.split('@')[0]

  const mensaje = `
✿ Transferiste *${moneda}${count.toLocaleString()} Yenes* a *${nombre}* ${mención}
> Ahora tienes *${moneda}${totalEnBanco}* en tu banco.
`.trim()

  return conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [who]
  }, { quoted: m })
}

handler.help = ['pay']
handler.tags = ['eco']
handler.command = ['pay', 'transferir']
handler.group = false
handler.register = true

export default handler

function isNumber(x) {
  return !isNaN(x)
}