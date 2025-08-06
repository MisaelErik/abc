// code creado por 
// github.com/Ado-rgb
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { promisify } from 'util'
import { pipeline } from 'stream'

const streamPipeline = promisify(pipeline)

const handler = async (msg, { conn, __dirname }) => {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  const audioMsg = quoted?.audioMessage
  const docMsg = quoted?.documentMessage
  const isAudioDoc = docMsg?.mimetype?.startsWith('audio')

  if (!audioMsg && !isAudioDoc) {
    await conn.sendMessage(msg.key.remoteJid, {
      text: `🎧 Responde a un *audio dañado* o *mp3* para repararlo.`,
    }, { quoted: msg })
    return
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: '🕒', key: msg.key }
  })

  const tmpDir = path.join(__dirname, '../tmp')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

  const inputFile = path.join(tmpDir, `${Date.now()}_input.mp3`)
  const outputFile = path.join(tmpDir, `${Date.now()}_fixed.mp3`)

  try {
    const stream = await downloadContentFromMessage(audioMsg ? audioMsg : docMsg, 'audio')
    const fileWriter = fs.createWriteStream(inputFile)
    for await (const chunk of stream) {
      fileWriter.write(chunk)
    }
    fileWriter.end()

    const start = Date.now()

    await new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .format('mp3')
        .save(outputFile)
        .on('end', resolve)
        .on('error', reject)
    })

    const time = ((Date.now() - start) / 1000).toFixed(1)

    await conn.sendMessage(msg.key.remoteJid, {
      audio: fs.readFileSync(outputFile),
      mimetype: 'audio/mpeg',
      fileName: `audio_reparado.mp3`,
      ptt: audioMsg?.ptt || false,
      caption: `✅ Audio reparado correctamente.\n⏱️ Tiempo de proceso: ${time}s`
    }, { quoted: msg })

    fs.unlinkSync(inputFile)
    fs.unlinkSync(outputFile)

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '✅', key: msg.key }
    })

  } catch (err) {
    console.error('Error al reparar audio:', err)
    await conn.sendMessage(msg.key.remoteJid, {
      text: `❌ Error al procesar el audio.`
    }, { quoted: msg })

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '❌', key: msg.key }
    })
  }
}

handler.command = ['reparar']  
handler.tags = ['tools']
handler.help = ['reparar']
export default handler
