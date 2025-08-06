let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = await conn.getName(senderId)
  let moneda = global.moneda || '💸' // por si querés personalizar el emoji/nombre

  let tiempo = 5 * 60
  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempo * 1000 - Date.now()) / 1000))
    return m.reply(`✦ Ya te venís usando mucho eso we espera *${tiempo2}* pa volver a usar *#slut*.`)
  }

  cooldowns[senderId] = Date.now()

  let senderCoin = users[senderId].coin || 0
  let randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  while (randomUserId === senderId) {
    randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  }

  let randomUserCoin = users[randomUserId].coin || 0
  let minAmount = 15
  let maxAmount = 50
  let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
  let randomOption = Math.floor(Math.random() * 14)

  const frases = [
    `✦ Le agarraste la verga a @${randomUserId.split("@")[0]} y lo dejaste temblando 😩\n➩ Ganaste *${amountTaken} ${moneda}*`,
    `✦ Le diste una nalgada a @${randomUserId.split("@")[0]} que gritó "ay papi" 🔥\n➩ *+${amountTaken} ${moneda}*`,
    `✦ Le hiciste el gawk gawk 3000 a @${randomUserId.split("@")[0]} sin piedad 🤤\n➩ Te pagó *${amountTaken} ${moneda}*`,
    `✦ Usaste las dos manos y la boca a la vez con @${randomUserId.split("@")[0]}, quedó mudo 🤯\n➩ *${amountTaken} ${moneda}*`,
    `✦ Le rebotaste encima a @${randomUserId.split("@")[0]} que ya no sabe si está vivo 💀\n➩ *+${amountTaken} ${moneda}*`,
    `✦ Le hiciste un baile sucio a @${randomUserId.split("@")[0]} en plena calle 🥵\n➩ Te tiró *${amountTaken} ${moneda}*`,
    `✦ Te pusiste en 4 y @${randomUserId.split("@")[0]} no dudó 🤯\n➩ Se te cayeron *${amountTaken} ${moneda}* de la cola`,
    `✦ Le lambiste el ombligo a @${randomUserId.split("@")[0]} sin que lo pidiera 💦\n➩ Te dejó *${amountTaken} ${moneda}* en el calzón`,
    `✦ Te dejaron amarrado a una silla por @${randomUserId.split("@")[0]} y te pagó igual 🪢\n➩ *+${amountTaken} ${moneda}*`,
    `✦ Te grabaron haciendo cosas con @${randomUserId.split("@")[0]} 📸\n➩ Viral y *${amountTaken} ${moneda}* en Only`,
    `✦ Hiciste un rapidín en el baño con @${randomUserId.split("@")[0]} 🧻\n➩ Te dejó propina de *${amountTaken} ${moneda}*`,
    `✦ Le hiciste el helicóptero con la cola a @${randomUserId.split("@")[0]} 🤸‍♂️\n➩ Te dio *${amountTaken} ${moneda}*`,
    `✦ Te puso 4 patas @${randomUserId.split("@")[0]} y le gustó tanto que te pagó 🤕\n➩ *${amountTaken} ${moneda}* ganadas`,
    `✦ Te hiciste pasar por delivery y se lo entregaste a @${randomUserId.split("@")[0]} 🍆📦\n➩ *${amountTaken} ${moneda}*`,
  ]

  const frasesFail = [
    `✦ Le mordiste la verga sin querer y te demandaron 😭\n➩ Perdiste ${moneda} por bruto`,
    `✦ El cliente te vomitó del asco we 💩\n➩ Te descontaron ${moneda}`,
    `✦ Te resbalaste y caíste encima del cliente, te tocó pagar hospital 🏥\n➩ Te quitaron ${moneda}`,
    `✦ No te bañaste y olías a culo we 🤢\n➩ Te cancelaron el servicio y te cobraron`,
    `✦ Le hablaste de tu ex en medio del acto 💔\n➩ Te bloqueó y te cobró el tiempo`,
  ]

  switch (randomOption) {
    case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
    case 8: case 9: case 10: case 11: case 12: case 13:
      users[senderId].coin += amountTaken
      users[randomUserId].coin -= amountTaken
      conn.sendMessage(m.chat, {
        text: frases[randomOption],
        mentions: [randomUserId],
        ...global.rcanal
      }, { quoted: m })
      break

    default:
      let amountSubtracted = Math.min(Math.floor(Math.random() * (senderCoin - minAmount + 1)) + minAmount, maxAmount)
      users[senderId].coin -= amountSubtracted
      m.reply(`${frasesFail.random()}\n\n➩ Se restan *-${amountSubtracted} ${moneda}* a ${senderName}`)
      break
  }

  global.db.write()
}

handler.tags = ['eco']
handler.help = ['slut']
handler.command = ['slut', 'protituirse']
handler.register = true
handler.group = false

export default handler

function segundosAHMS(segundos) {
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos}m ${segundosRestantes}s`
}

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)]
}