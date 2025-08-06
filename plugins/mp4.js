import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Pásame el link de YouTube')

  try {
    // Llamada a tu API
    const apiUrl = `https://myapiadonix.vercel.app/api/hd?url=${encodeURIComponent(text)}`
    const res = await axios.get(apiUrl)

    if (!res.data || !res.data.success) {
      return m.reply('No se pudo obtener el video o la API falló')
    }

    const { title, download } = res.data.data

    // Enviar video directo
    await conn.sendMessage(m.chat, {
      video: { url: download },
      caption: `🎬 *${title}*`,
      mimetype: 'video/mp4'
    }, { quoted: m })

  } catch (error) {
    console.error(error)
    m.reply('Error al obtener o enviar el video, intenta luego')
  }
}

handler.command = /^mp4$/i

export default handler