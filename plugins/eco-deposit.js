import db from '../lib/database.js'

let handler = async (m, { args }) => {
  let user = global.db.data.users[m.sender]

  if (!args[0]) return m.reply(`✧ Ingresa la cantidad de *${moneda}* que deseas depositar.`)

  if (args[0] === 'all') {
    let count = parseInt(user.coin)
    if (!count || count < 1) return m.reply(`❀ No tienes nada para depositar.`)
    user.coin -= count
    user.bank += count
    await m.reply(`✿ Depositaste *${count} ${moneda}* en el banco. Ya no te lo pueden robar alv.`)
    return
  }

  if (isNaN(args[0])) return m.reply(`✦ Ingresa una cantidad válida.\nEjemplo: *#d 5000*`)

  let count = parseInt(args[0])
  if (!user.coin || user.coin < 1) return m.reply(`✧ No tienes nada en tu cartera.`)
  if (user.coin < count) return m.reply(`❀ Solo tienes *${user.coin} ${moneda}* en la cartera.`)

  user.coin -= count
  user.bank += count

  await m.reply(`✿ Depositaste *${count} ${moneda}* en el banco.`)
}

handler.help = ['depositar']
handler.tags = ['eco']
handler.command = ['deposit', 'depositar', 'dep', 'aguardar']
handler.group = false
handler.register = true

export default handler