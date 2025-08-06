import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import fluent_ffmpeg from 'fluent-ffmpeg'
import { fileTypeFromBuffer } from 'file-type'
import webp from 'node-webpmux'

const tmp = path.join(process.cwd(), 'tmp')
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)

async function addExif(webpSticker, packname, author) {
  const img = new webp.Image()
  const stickerPackId = crypto.randomBytes(32).toString('hex')
  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    emojis: ['✨', '💫', '❀']
  }
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00
  ])
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  const exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)
  await img.load(webpSticker)
  img.exif = exif
  return await img.save(null)
}

async function urlToSticker(url, packname, author) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('No se pudo descargar imagen')
  const img = await res.buffer()
  const type = await fileTypeFromBuffer(img)
  if (!type) throw new Error('Tipo de archivo inválido')

  const tmpFile = path.join(tmp, `${Date.now()}.${type.ext}`)
  const outFile = `${tmpFile}.webp`
  await fs.promises.writeFile(tmpFile, img)

  await new Promise((resolve, reject) => {
    fluent_ffmpeg(tmpFile)
      .addOutputOptions([
        `-vcodec`, `libwebp`, `-vf`,
        `scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,fps=15, pad=512:512:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`
      ])
      .toFormat('webp')
      .save(outFile)
      .on('end', resolve)
      .on('error', reject)
  })

  const buffer = await fs.promises.readFile(outFile)
  fs.promises.unlink(tmpFile).catch(() => {})
  fs.promises.unlink(outFile).catch(() => {})

  return await addExif(buffer, packname, author)
}

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`✐ Ejemplo de uso:\n❀ .${command} cats`)

  try {
    let resBusqueda = await fetch(`https://zenzxz.dpdns.org/search/stickerlysearch?query=${encodeURIComponent(text)}`)
    let jsonBusqueda = await resBusqueda.json()

    if (!jsonBusqueda.status || !Array.isArray(jsonBusqueda.data) || jsonBusqueda.data.length === 0) {
      return m.reply('✿ No encontré stickers con ese nombre ✦')
    }

    let elegido = jsonBusqueda.data[Math.floor(Math.random() * jsonBusqueda.data.length)]
    let resDetalle = await fetch(`https://zenzxz.dpdns.org/tools/stickerlydetail?url=${encodeURIComponent(elegido.url)}`)
    let jsonDetalle = await resDetalle.json()

    if (!jsonDetalle.status || !jsonDetalle.data || !Array.isArray(jsonDetalle.data.stickers) || jsonDetalle.data.stickers.length === 0) {
      return m.reply('✦ Ocurrió un error al traer los stickers ✐')
    }

    let nombrePack = jsonDetalle.data.name || 'Sin nombre'
    let autorPack = jsonDetalle.data.author?.name || 'Desconocido'

    await m.reply(`❐ Se enviarán 5 stickers de:\n✧ *${nombrePack}*\npor ✿ *${autorPack}*`)

    let maxStickers = 5
    for (let i = 0; i < Math.min(jsonDetalle.data.stickers.length, maxStickers); i++) {
      let img = jsonDetalle.data.stickers[i].imageUrl
      let buffer = await urlToSticker(img, nombrePack, autorPack)
      await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
    }
  } catch (err) {
    console.error(err)
    m.reply('❀ Ups... ocurrió un error al procesar los stickers ✧')
  }
}

handler.help = ['stickersearch *<texto>*']
handler.tags = ['sticker']
handler.command = ['stickersearch']
handler.register = true
export default handler