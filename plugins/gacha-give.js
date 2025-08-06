import { promises as fs } from 'fs'

const charactersFilePath = './database/characters.json'
const haremFilePath = './database/harem.json'

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('ꕥ No pudimos atrapar la información de personajes.\n> ● *Si crees que es un fallo, repórtalo usando /report*')
    }
}

async function saveCharacters(characters) {
    try {
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
    } catch (error) {
        throw new Error('ꕥ No pudimos guardar los datos de characters.json.\n> ● *Intenta de nuevo más tarde.*')
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8')
        return JSON.parse(data)
    } catch {
        return []
    }
}

async function saveHarem(harem) {
    try {
        await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2))
    } catch (error) {
        throw new Error('ꕥ No pudimos guardar los datos de harem.json.\n> ● *Intenta de nuevo más tarde.*')
    }
}

let handler = async (m, { conn, args }) => {
    const userId = m.sender

    if (args.length < 2) {
        await conn.sendMessage(m.chat, { 
            text: 'ꕥ Debes especificar el nombre del personaje y mencionar a quién quieras regalarlo.\n> ● *Ejemplo ›* /regalar Aika Sano @usuario', 
            ...global.rcanal 
        }, { quoted: m })
        return
    }

    const characterName = args.slice(0, -1).join(' ').toLowerCase().trim()
    let who = m.mentionedJid[0]

    if (!who) {
        await conn.sendMessage(m.chat, { 
            text: 'ꕥ Debes mencionar a un usuario válido.\n> ● *Ejemplo ›* /regalar Aika Sano @usuario', 
            ...global.rcanal 
        }, { quoted: m })
        return
    }

    try {
        const characters = await loadCharacters()
        const character = characters.find(c => c.name.toLowerCase() === characterName && c.user === userId)

        if (!character) {
            await conn.sendMessage(m.chat, { 
                text: `ꕥ El personaje *${characterName}* no está reclamado por ti.\n> ● *Usa /harem para ver tu lista.*`, 
                ...global.rcanal 
            }, { quoted: m })
            return
        }

        character.user = who
        await saveCharacters(characters)

        const harem = await loadHarem()
        const userEntryIndex = harem.findIndex(entry => entry.userId === who)

        if (userEntryIndex !== -1) {
            harem[userEntryIndex].characterId = character.id
            harem[userEntryIndex].lastClaimTime = Date.now()
        } else {
            harem.push({
                userId: who,
                characterId: character.id,
                lastClaimTime: Date.now()
            })
        }

        await saveHarem(harem)

        await conn.sendMessage(m.chat, { 
            text: `ꕥ *${character.name}* ahora pertenece a @${who.split('@')[0]}!\n> ● *¡Que disfrute su nuevo/a waifu!*`, 
            mentions: [who],
            ...global.rcanal 
        }, { quoted: m })
    } catch (error) {
        await conn.sendMessage(m.chat, { 
            text: `ꕥ No se pudo completar la acción.\n> ● *Error ›* ${error.message}`, 
            ...global.rcanal 
        }, { quoted: m })
    }
}

handler.help = ['regalar']
handler.tags = ['gacha']
handler.command = ['regalar', 'givewaifu', 'givechar']
handler.group = false
handler.register = true

export default handler