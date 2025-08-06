import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
import { createHash } from 'crypto'

let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const nombre = user.name || await conn.getName(m.sender)
  const pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')
  const numero = PhoneNumber('+' + m.sender.replace(/[^0-9]/g, '')).getNumber('international')
  const fecha = moment().tz('America/Tegucigalpa')
  const sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)
  const moneda = global.moneda || '¥'

  if (!user.registered) {
    return m.reply(`🔰 No estás registrado aún.\n➤ Usa: *.reg ${nombre}.18*`)
  }

  const textoPerfil = `
✿ Perfil de usuario *${nombre}* ✿

${moneda} : *${user.coin.toLocaleString()}*
✨ *Exp:* *${user.exp.toLocaleString()} XP*

🧾 *Número:* ${numero}
🆔 *ID único:* ${sn}
📅 *Registrado el:* ${fecha.format('DD/MM/YYYY')}
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: textoPerfil,
    ...global.rcanal
  }, { quoted: m })
}

handler.help = ['perfil']
handler.tags = ['eco']
handler.command = ['perfil', 'yo', 'miperfil']
export default handler