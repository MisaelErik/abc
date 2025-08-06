
import { solveFinancialProblem } from '../lib/financialSolver.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Por favor, escribe un problema de matemática financiera después del comando.\n\n*Ejemplo:*\n${usedPrefix + command} ¿Cuál es el interés simple de S/1000 al 5% anual por 2 años?`;

    try {
        await m.reply(`Analizando con *Gemini Studio*... 🧠✨`);

        const { consolidatedMessage, imageUrl, textSolution } = await solveFinancialProblem('gemini_studio', text);

        // Enviar el mensaje de texto consolidado
        await conn.reply(m.chat, consolidatedMessage, m);

        // Enviar la imagen de la solución si se generó correctamente
        if (imageUrl) {
            await conn.sendFile(m.chat, imageUrl, 'solucion.png', 'Aquí tienes la solución paso a paso:', m);
        } else if (textSolution) {
            // Fallback si la imagen no se pudo generar
            await conn.reply(m.chat, textSolution, m);
        } else {
            await conn.reply(m.chat, '⚠️ *Hubo un problema al generar la solución. Por favor, intenta de nuevo.*', m);
        }

    } catch (error) {
        console.error('Error en el comando resolver1:', error);
        await conn.reply(m.chat, `Lo siento, ocurrió un error al procesar tu solicitud con Gemini Studio.\n\n*Detalles:*\n\`\`\`${error.message}\`\`\``, m);
    }
};

handler.help = ['resolver1 <problema>'];
handler.tags = ['tools'];
handler.command = /^(resolver1)$/i;

handler.limit = true; // Opcional: para limitar el uso del comando

export default handler;
