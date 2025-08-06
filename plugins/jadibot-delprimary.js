let handler = async (m, { conn, text }) => {
  if (!text || !text.endsWith('@g.us')) {
    return m.reply('Debes escribir el ID del grupo, ejemplo:\n.delprimary 120363xxxxx@g.us')
  }

  const groupId = text.trim()

  // Verifica si el bot está en ese grupo
  try {
    const participants = await conn.groupMetadata(groupId).then(res => res.participants)
    const userInGroup = participants.find(p => p.id === m.sender)

    if (!userInGroup) return m.reply('No estás en ese grupo, no podés modificarlo.')

    if (!userInGroup.admin && userInGroup.role !== 'admin' && userInGroup.role !== 'superadmin') {
      return m.reply('No sos admin en ese grupo, no podés borrar el bot principal.')
    }

    if (!global.db.data.chats[groupId]) global.db.data.chats[groupId] = {}

    if (!global.db.data.chats[groupId].primaryBot) {
      return m.reply('Ese grupo no tiene un bot principal asignado.')
    }

    delete global.db.data.chats[groupId].primaryBot

    m.reply(`✅ Se eliminó el bot principal del grupo:\n*${groupId}*`)
  } catch (e) {
    console.error(e)
    m.reply('No pude acceder a ese grupo. Asegúrate de que el bot esté dentro del grupo y el ID sea correcto.')
  }
}

handler.help = ['delprimary <IDgrupoxxxx@g.us>']
handler.tags = ['serbot']
handler.command = ['delprimary']

export default handler