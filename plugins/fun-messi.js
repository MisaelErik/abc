import axios from "axios";

const MESSI_JSON_URL = `https://raw.githubusercontent.com/davidprospero123/api-anime/main/BOT-JSON/Messi.json`;
const MESSI_CONTEXT = new Set(); // IDs de mensajes enviados por el bot con Messi

let handler = async (m, { conn, text, command }) => {
    const isMessiCommand = /^messi$/i.test(command);
    const isNext = /^(siguiente|otra|ver más|mas)$/i.test(text);
    const isReplyToMessi = m.quoted && MESSI_CONTEXT.has(m.quoted.id);

    if (!isMessiCommand && !(isNext && isReplyToMessi)) return;

    let res = (await axios.get(MESSI_JSON_URL)).data;
    let url = res[Math.floor(Math.random() * res.length)];

    let sentMsg = await conn.sendMessage(
        m.chat,
        {
            image: { url },
            caption: "*Aquí tienes*"
        },
        { quoted: m }
    );

    // Guardamos el ID del mensaje por si responden con "siguiente"
    if (sentMsg.key && sentMsg.key.id) {
        MESSI_CONTEXT.add(sentMsg.key.id);
        setTimeout(() => MESSI_CONTEXT.delete(sentMsg.key.id), 60 * 1000); // Se limpia en 1 min
    }
};

handler.help = ['messi'];
handler.tags = ['fun'];
handler.command = /^messi$/i;

export default handler;