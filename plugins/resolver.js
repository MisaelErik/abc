import { solveFinancialProblemTextOnly } from '../lib/financialSolver.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Por favor, escribe un problema de matemática financiera después del comando.\n\n*Ejemplo:*\n${usedPrefix + command} ¿Cuál es el interés simple de S/1000 al 5% anual por 2 años?`;

    try {
        await m.reply(`Analizando con *Gemini Studio*... 🧠✨`);

        const resultText = await solveFinancialProblemTextOnly('gemini_studio', text);

        await conn.reply(m.chat, resultText, m);

    } catch (error) {
        console.error('Error en el comando resolver:', error);
        await conn.reply(m.chat, `Lo siento, ocurrió un error al procesar tu solicitud con Gemini Studio.\n\n*Detalles:*\n\`\`\`${error.message}\`\`\``, m);
    }
};

handler.help = ['resolver <problema>'];
handler.tags = ['tools'];
handler.command = /^(resolver)$/i;

handler.limit = true;

export default handler;
