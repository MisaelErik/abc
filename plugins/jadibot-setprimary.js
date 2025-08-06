import fs from 'fs'
import path from 'path'

let handler = async (m, { text }) => {
  if (!text || !text.replace(/[^0-9]/g, '')) {
    return m.reply('Debes etiquetar al bot que quieres hacer principal en este grupo.')
  }

  let number = text.replace(/[^0-9]/g, '')
  let botJid = number + '@s.whatsapp.net'
  let subbotPath = path.join('./JadiBots', number, 'creds.json')

  // Validar si ese número tiene un subbot (existe el creds.json)
  if (!fs.existsSync(subbotPath)) {
    return m.reply(`El número *${number}* no corresponde a un Subbot válido (no se encontró su creds.json en JadiBots).`)
  }

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  global.db.data.chats[m.chat].primaryBot = botJid

  m.reply(`✅ El bot principal para este grupo ahora es:\n*${botJid}*`)
}

handler.help = ['setprimary @bot']
handler.tags = ['serbot']
handler.command = ['setprimary']
handler.admin = true

export default handler