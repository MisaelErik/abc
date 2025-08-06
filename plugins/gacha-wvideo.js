import { promises as fs } from 'fs'

const charactersFilePath = './database/characters.json'
const haremFilePath = './database/harem.json'

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    throw new Error('✎ No se pudo cargar el archivo *characters.json*.')
  }
}

async function loadHarem() {
  try {
    const data = await fs.readFile(haremFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

let handler = async (m, { conn, command, args }) => {
  if (!args.length) {
    return conn.sendMessage(m.chat, {
      text: `
ꕥ Debes proporcionar el nombre de un personaje
> ● *Ejemplo ›* ${command} Roxy Migurdia
`.trim(),
      ...global.rcanal
    }, { quoted: m })
  }

  const characterName = args.join(' ').toLowerCase().trim()

  try {
    const characters = await loadCharacters()
    const character = characters.find(c => c.name.toLowerCase() === characterName)

    if (!character) {
      return conn.sendMessage(m.chat, {
        text: `
✎ No se encontró › *${characterName}*
> ❒ Verifica que el nombre esté correcto
`.trim(),
        ...global.rcanal
      }, { quoted: m })
    }

    if (!character.vid || !character.vid.length) {
      return conn.sendMessage(m.chat, {
        text: `
✎ No hay videos registrados para › *${character.name}*
> ❒ Intenta con otro personaje
`.trim(),
        ...global.rcanal
      }, { quoted: m })
    }

    const randomVideo = character.vid[Math.floor(Math.random() * character.vid.length)]
    const caption = `
✩ Nombre › *${character.name}*
✿ Género › *${character.gender}*
❒ Fuente › *${character.source}*
`.trim()

    const sendAsGif = Math.random() < 0.5
    await conn.sendMessage(m.chat, {
      video: { url: randomVideo },
      gifPlayback: sendAsGif,
      caption,
      ...global.rcanal
    }, { quoted: m })

  } catch (error) {
    await conn.sendMessage(m.chat, {
      text: `
✘ Error al cargar el video › ${error.message}
> ❒ Intenta de nuevo más tarde
`.trim(),
      ...global.rcanal
    }, { quoted: m })
  }
}

handler.help = ['wvideo']
handler.tags = ['gacha']
handler.command = ['charvideo', 'wvideo', 'waifuvideo']
handler.register = true

export default handler