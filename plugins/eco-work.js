let cooldowns = {}

let handler = async (m, { conn, isPrems }) => {
  let user = global.db.data.users[m.sender]
  let tiempo = 5 * 60 // 5 minutos

  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    const tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    return conn.reply(m.chat, `✧ Ya chambeaste hace poco we, espera *${tiempo2}* pa seguir buscando la papa.`, m)
  }

  let rsl = Math.floor(Math.random() * 500)
  cooldowns[m.sender] = Date.now()
  user.coin += rsl

  await conn.reply(m.chat, `✧ ${pickRandom(trabajo)} *${toNum(rsl)}* ( *${rsl}* ) ${moneda} 💸.`, m)
}

handler.help = ['work']
handler.tags = ['eco']
handler.command = ['w', 'work', 'chambear', 'chamba', 'trabajar']
handler.group = false
handler.register = true

export default handler

function toNum(number) {
  if (number >= 1000 && number < 1000000) return (number / 1000).toFixed(1) + 'k'
  else if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M'
  else if (number <= -1000 && number > -1000000) return (number / 1000).toFixed(1) + 'k'
  else if (number <= -1000000) return (number / 1000000).toFixed(1) + 'M'
  else return number.toString()
}

function segundosAHMS(segundos) {
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

const trabajo = [
  "✧ Trabajaste como diseñador de memes y te dieron",
  "✧ Le arreglaste el WiFi a una doña y te pagó",
  "✧ Hiciste delivery en tu bici y te ganaste",
  "✧ Vendiste empanadas en la esquina y conseguiste",
  "✧ Ayudaste a un ciego a cruzar la calle y te dio",
  "✧ Te disfrazaste de bot y entretuviste a la mara, te soltaron",
  "✧ Chambeaste como DJ en una fiesta y te pagaron",
  "✧ Le limpiaste el celular a un señor con el dedo y te dio",
  "✧ Trabajaste de cuidador de gatos y te dieron",
  "✧ Ayudaste a hackear una tarea y el alumno te soltó",
  "✧ Vendiste stickers en el grupo y ganaste",
  "✧ Hiciste freelance programando bots y te pagaron",
  "✧ Le hiciste la intro a un youtuber y te dio",
  "✧ Fuiste al mercado a ayudar con las bolsas y te dieron",
  "✧ Actuaste como NPC en una app de IA y te pagaron",
  "✧ Te disfrazaste de Pikachu en la plaza y te tiraron",
  "✧ Fuiste plomero por un día y cobraste",
  "✧ Hiciste pasteles con tu abuela y te tocó",
  "✧ Le arreglaste el WhatsApp a una señora y te soltó",
  "✧ Hiciste memes virales y cobraste por la fama",
  "✧ Reparaste consolas retro y ganaste",
  "✧ Enseñaste a un niño a jugar Minecraft y te dieron",
  "✧ Fuiste jurado en un concurso de baile y ganaste",
  "✧ Trabajaste en un bar sirviendo jugos y te pagaron",
  "✧ Vendiste imágenes AI bien mamalonas y te soltaron",
]