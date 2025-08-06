let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = conn.getName(senderId)

  let tiempo = 5 * 60 // 5 minutos en segundos
  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempo * 1000 - Date.now()) / 1000))
    return m.reply(`🚨 Ya hiciste un crimen, esperá *${tiempo2}* pa no caer preso we.`)
  }
  cooldowns[senderId] = Date.now()

  let senderCoin = users[senderId].coin || 0
  let posiblesVictimas = Object.keys(users).filter(id => id !== senderId)
  if (posiblesVictimas.length === 0) return m.reply(`⚠ No hay víctimas pa' robar.`)

  let randomUserId = posiblesVictimas[Math.floor(Math.random() * posiblesVictimas.length)]
  let randomUserCoin = users[randomUserId].coin || 0

  let minAmount = 15
  let maxAmount = 50
  let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount

  const moneda = '💰'

  const frases = {
    exito: [
      `✧ Le cagaste la vida a @${randomUserId.split("@")[0]} y le arrebataste *${amountTaken} ${moneda}*.`,
      `⚠ Con un machetazo y un susto le quitaste *${amountTaken} ${moneda}* a @${randomUserId.split("@")[0]}.`,
      `❀ Le metiste una buena trompada y le sacaste *${amountTaken} ${moneda}*.`,
      `☄︎ Partiste la madre a @${randomUserId.split("@")[0]} y saliste con *${amountTaken} ${moneda}*.`,
      `🔪 Le diste piso y te robaste *${amountTaken} ${moneda}*, qué perrote.`,
      `💸 Desvalijaste como todo un capo y te pelaste con *${amountTaken} ${moneda}*.`,
      `💀 Atracaste en la esquina y saliste con *${amountTaken} ${moneda}*.`,
      `😈 Le hiciste la 13-14 y le volaste *${amountTaken} ${moneda}*.`,
      `🧨 Le explotaste la cartera y te largaste con *${amountTaken} ${moneda}*.`,
      `🔥 No supo ni qué pedo y ya le habías quitado *${amountTaken} ${moneda}*.`,
      `🐒 Lo agarraste de pendejo y le tumbaste *${amountTaken} ${moneda}*.`,
      `🎭 Usaste máscara y todo, y asaltaste por *${amountTaken} ${moneda}*.`,
      `🚬 Te le apareciste como sombra y lo dejaste sin *${amountTaken} ${moneda}*.`,
      `🏃‍♂️ Le hiciste el pase mágico y le bajaste *${amountTaken} ${moneda}*.`,
      `🧤 Le metiste la mano al bolsillo y ni cuenta se dio, *${amountTaken} ${moneda}*.`,
      `🕶 Con estilo y facha te lo tranzaste por *${amountTaken} ${moneda}*.`
    ],
    atrapado: [
      `⚠ Te cazaron y te quitaron *${amountTaken} ${moneda}* por mamón.`,
      `❀ Policía te agarró y perdiste *${amountTaken} ${moneda}*, qué sad.`,
      `✧ Te descubrieron y te robaron *${amountTaken} ${moneda}*, rata torpe.`,
      `☄︎ Te pillaron con las manos en la masa y perdiste *${amountTaken} ${moneda}*.`,
      `🚓 Te agarraron los tombos y te metieron la macana por robar *${amountTaken} ${moneda}*.`,
      `👮‍♂️ La jura te tundió y te volaron *${amountTaken} ${moneda}*.`,
      `🧱 Te metiste con los duros y te dejaron sin nada.`,
      `🩻 Te cacharon en cámara y te reventaron por *${amountTaken} ${moneda}*.`,
      `🥴 Saliste pa'l hospital y encima sin billete.`,
      `🙃 Te tropezaste huyendo y te quitaron *${amountTaken} ${moneda}*.`,
      `🥵 Se te cayó el botín en plena fuga, qué mamada.`,
      `🚔 Llegó la patrulla y te bajaron con todo.`,
      `💢 Una doña te agarró a bolsazos y perdiste *${amountTaken} ${moneda}*.`
    ],
    semi: [
      `⚠ Lograste robar pero te vieron y solo agarraste *${amountTaken} ${moneda}*.`,
      `❀ Hiciste un robo chueco y solo te quedaron *${amountTaken} ${moneda}*.`,
      `✧ Le quitaste algo, pero te cacharon y solo te quedaron *${amountTaken} ${moneda}*.`,
      `☄︎ Robaste a medias y sacaste *${amountTaken} ${moneda}*.`,
      `🫥 Te tembló la mano pero igual agarraste *${amountTaken} ${moneda}*.`,
      `🥷 Medio ninja fuiste y te llevaste *${amountTaken} ${moneda}*.`,
      `😬 Lo hiciste todo nervioso y te escapaste con *${amountTaken} ${moneda}*.`,
      `💨 Fuiste rápido pero no tanto, te llevaste *${amountTaken} ${moneda}*.`,
      `🤕 Casi te revientan pero saliste con *${amountTaken} ${moneda}*.`,
      `👟 Corriste como loco y apenas te quedó *${amountTaken} ${moneda}*.`,
      `🐀 Te agarraste lo que pudiste y saliste huyendo.`,
      `😅 Medio robo, medio susto, y *${amountTaken} ${moneda}* de ganancia.`,
      `🤡 Estabas por lograrlo pero hiciste ruido y saliste con lo que pudiste.`
    ]
  }

  let randomOption = Math.floor(Math.random() * 3)

  switch (randomOption) {
    case 0:
      users[senderId].coin += amountTaken
      users[randomUserId].coin -= amountTaken
      await conn.sendMessage(m.chat, {
        text: frases.exito[Math.floor(Math.random() * frases.exito.length)],
        contextInfo: {
          mentionedJid: [randomUserId],
          ...global.rcanal
        }
      }, { quoted: m })
      break
    case 1:
      let amountSubtracted = Math.min(Math.floor(Math.random() * (senderCoin - minAmount + 1)) + minAmount, maxAmount)
      users[senderId].coin -= amountSubtracted
      await conn.sendMessage(m.chat, {
        text: frases.atrapado[Math.floor(Math.random() * frases.atrapado.length)],
        contextInfo: global.rcanal
      }, { quoted: m })
      break
    case 2:
      let smallAmountTaken = Math.min(Math.floor(Math.random() * (randomUserCoin / 2 - minAmount + 1)) + minAmount, maxAmount)
      users[senderId].coin += smallAmountTaken
      users[randomUserId].coin -= smallAmountTaken
      await conn.sendMessage(m.chat, {
        text: frases.semi[Math.floor(Math.random() * frases.semi.length)],
        contextInfo: {
          mentionedJid: [randomUserId],
          ...global.rcanal
        }
      }, { quoted: m })
      break
  }

  global.db.write()
}

handler.tags = ['eco']
handler.help = ['crime']
handler.command = ['crimen', 'crime']
handler.register = true
handler.group = false

export default handler

function segundosAHMS(segundos) {
  let horas = Math.floor(segundos / 3600)
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}