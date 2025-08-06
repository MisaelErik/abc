var handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let now = Date.now()
  let cooldown = 2 * 60 * 60 * 1000 // 2 horas en ms
  let nextClaim = (user.lastclaim || 0) + cooldown

  if (now < nextClaim) {
    let wait = msToTime(nextClaim - now)
    return conn.reply(m.chat, `✦ *Ya reclamaste tu premio diario*\n\n✧ Vuelve en: *${wait}*`, m)
  }

  // Recompensas random entre 100 y 500
  let coin = Math.floor(Math.random() * 401) + 100
  let exp = Math.floor(Math.random() * 401) + 100
  let diamond = Math.floor(Math.random() * 401) + 100

  user.coin += coin
  user.exp += exp
  user.diamond += diamond
  user.lastclaim = now

  let texto = 
`✦ *Recompensa Diaria* ✦

❐ ✧ XP: *+${exp}*
❐ Diamantes: *+${diamond}*
❐ ${moneda}: *+${coin}*`

  await conn.reply(m.chat, texto, m, rcanal)
}

handler.help = ['daily', 'claim']
handler.tags = ['rpg']
handler.command = ['daily', 'diario']
handler.group = false
handler.register = true

export default handler

function msToTime(duration) {
  let hours = Math.floor(duration / (1000 * 60 * 60))
  let minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))

  let hDisplay = hours > 0 ? (hours < 10 ? '0' + hours : hours) + ' Horas ' : ''
  let mDisplay = minutes > 0 ? (minutes < 10 ? '0' + minutes : minutes) + ' Minutos' : ''

  return hDisplay + mDisplay
}