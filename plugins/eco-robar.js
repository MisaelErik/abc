const ro = 30;

const handler = async (m, { conn, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender];
  const time = user.lastrob2 + 7200000;

  if (new Date - user.lastrob2 < 7200000) {
    return conn.reply(m.chat, `
❀ *Información de Robo*

➪ *Usuario ›* @${m.sender.split('@')[0]}

> ✧ *Estado ›* Enfriando
> ✧ *Tiempo Restante ›* ${msToTime(time - new Date())}
`, m, { mentions: [m.sender], ...global.rcanal });
  }

  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;

  if (!who) {
    return conn.reply(m.chat, `
❀ *Información de Robo*

➪ *Usuario ›* @${m.sender.split('@')[0]}

> ✧ *Error ›* Debes mencionar a alguien pa' asaltarlo
`, m, { mentions: [m.sender], ...global.rcanal });
  }

  if (!(who in global.db.data.users)) {
    return conn.reply(m.chat, `
❀ *Información de Robo*

➪ *Usuario ›* @${m.sender.split('@')[0]}

> ✧ *Error ›* Ese maje ni en la base está
`, m, { mentions: [m.sender], ...global.rcanal });
  }

  const target = global.db.data.users[who];
  const rob = Math.floor(Math.random() * ro);

  if (target.coin < rob) {
    return conn.reply(m.chat, `
❀ *Información de Robo*

➪ *Usuario ›* @${m.sender.split('@')[0]}

> ✧ *Estado ›* Fallido
> ✧ *Motivo ›* @${who.split`@`[0]} anda más seco que el río
`, m, { mentions: [m.sender, who], ...global.rcanal });
  }

  user.coin += rob;
  target.coin -= rob;
  user.lastrob2 = new Date * 1;

  conn.reply(m.chat, `
❀ *Información de Robo*

➪ *Ladrón ›* @${m.sender.split('@')[0]}
➪ *Víctima ›* @${who.split('@')[0]}

> ✧ *Botín ›* ${rob} ${moneda}
> ✧ *Estado ›* Robo exitoso
`, m, { mentions: [m.sender, who], ...global.rcanal });
};

handler.help = ['robar'];
handler.tags = ['eco'];
handler.command = ['robar', 'steal', 'rob'];
handler.group = false;
handler.register = true;

export default handler;

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return `${hours}h ${minutes}m ${seconds}s`;
}
