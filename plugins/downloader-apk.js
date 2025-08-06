import { search, download } from 'aptoide-scraper'

var handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `🚫 Ingresa el nombre de una APK para buscar.`, m)

  try {
    await m.react('🕓') 

    let resultados = await search(text)
    if (!resultados.length) {
      await m.react('❌')
      return
    }

    let app = await download(resultados[0].id)

    let info = `*APKS BY APTOIDE*\n\n`
    info += `📱 *Nombre:* ${app.name}\n`
    info += `📦 *Paquete:* ${app.package}\n`
    info += `🕒 *Actualización:* ${app.lastup}\n`
    info += `📦 *Peso:* ${app.size}`

    await conn.sendFile(m.chat, app.icon, 'thumbnail.jpg', info, m)

    let pesoNum = parseFloat(app.size.replace(/[^0-9.]/g, ''))
    let esGB = app.size.toLowerCase().includes('gb')
    if (esGB || pesoNum > 999) {
      await m.react('⚠️') // archivo muy pesado
      return
    }

    await conn.sendMessage(m.chat, {
      document: { url: app.dllink },
      mimetype: 'application/vnd.android.package-archive',
      fileName: `${app.name}.apk`
    }, { quoted: m })

    await m.react('✅') // listo pa usar

  } catch (e) {
    console.error(e)
    await m.react('❌')
  }
}

handler.tags = ['downloader']
handler.help = ['apk']
handler.command = ['apk']
handler.group = false
handler.register = true

export default handler