
import { solveFinancialProblem } from '../lib/financialSolver.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Por favor, escribe un problema de matemática financiera después del comando.\n\n*Ejemplo:\n${usedPrefix + command} ¿Cuál es el interés simple de S/1000 al 5% anual por 2 años?`;

    try {
        await m.reply(`Analizando con *Llama*... 🧠✨`);

        const { consolidatedMessage, imageBuffer } = await solveFinancialProblem('llama', text);

        // Enviar el mensaje de texto consolidado
        await conn.reply(m.chat, consolidatedMessage, m);

        // Enviar la imagen de la solución si se generó correctamente
        if (imageBuffer) {
            await conn.sendFile(m.chat, imageBuffer, 'solucion.png', 'Aquí tienes la solución paso a paso:', m);
        } else {
            // Fallback si la imagen no se pudo generar
            await conn.reply(m.chat, '⚠️ *Hubo un problema al generar la imagen de la solución. Por favor, revisa los pasos en el texto anterior.*', m);
        }

    } catch (error) {
        console.error('Error en el comando resolver4:', error);
        await conn.reply(m.chat, `Lo siento, ocurrió un error al procesar tu solicitud con Llama.\n\n*Detalles:\n\`\`\`${error.message}\`\`\``, m);
    }
};

handler.help = ['resolver4 <problema>'];
handler.tags = ['tools'];
handler.command = /^(resolver4)$/i;

handler.limit = true;

export default handler;
