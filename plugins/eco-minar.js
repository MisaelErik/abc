let cooldowns = {}

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

  let coin = pickRandom([20, 5, 7, 8, 88, 40, 50, 70, 90, 999, 300])
  let emerald = pickRandom([1, 5, 7, 8])
  let iron = pickRandom([5, 6, 7, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80])
  let gold = pickRandom([20, 5, 7, 8, 88, 40, 50])
  let coal = pickRandom([20, 5, 7, 8, 88, 40, 50, 80, 70, 60, 100, 120, 600, 700, 64])
  let stone = pickRandom([200, 500, 700, 800, 900, 4000, 300])

  let img = 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745557957843.jpeg'
  let time = user.lastmiming + 600000

  if (new Date() - user.lastmiming < 600000) {
    return conn.reply(m.chat, `
⏳ *Aún estás descansando*
> ❒ Vuelve a minar en › *${msToTime(time - new Date())}*
`.trim(), m)
  }

  let exp = Math.floor(Math.random() * 1000)
  let info = `
⛏️ *Te adentraste en las profundidades de la mina...*

✎ *Recompensas obtenidas* ›
> ✨ Exp › *${exp}*
> 💸 ${moneda} › *${coin}*
> ♦️ Esmeraldas › *${emerald}*
> 🔩 Hierro › *${iron}*
> 🏅 Oro › *${gold}*
> 🕋 Carbón › *${coal}*
> 🪨 Piedra › *${stone}*
`.trim()

  await conn.sendFile(m.chat, img, 'mina.jpg', info, m)
  await m.react('⛏️')

  user.health -= 50
  user.pickaxedurability -= 30
  user.coin += coin
  user.iron += iron
  user.gold += gold
  user.emerald += emerald
  user.coal += coal
  user.stone += stone
  user.lastmiming = new Date() * 1
}

handler.help = ['minar']
handler.tags = ['eco']
handler.command = ['minar', 'miming', 'mine']
handler.register = true
handler.group = false

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60)
  return `${minutes} m y ${seconds} s`
}