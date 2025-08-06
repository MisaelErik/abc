import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from 'node-fetch';
import FormData from 'form-data';
import { Readable } from 'stream';

// =================================================================================================
// --- 1. CONFIGURACIÓN CENTRALIZADA ---
// =================================================================================================
const config = {
    OPENROUTER_MODELS: {
        kimi: 'moonshotai/kimi-dev-72b:free',
        mistral: 'mistralai/mistral-7b-instruct:free',
        deepseek: 'deepseek/deepseek-chat',
        llama: 'meta-llama/llama-3.2-11b-vision-instruct:free',
    },
    FORMULA_LATEX_TEMPLATES: {
        'formula_util_dias_entre_fechas': 'n_{dias} = \\text{DiasEntre}(fecha_{final}, fecha_{inicial})',
        'formula_util_fraccion_anio': 'n = \\frac{n_{dias}}{360}',
        'formula_is_I_from_Pjn': 'I = P \\cdot j \\cdot n',
        'formula_is_S_from_Pjn': 'S = P(1 + j \\cdot n)',
        'formula_is_P_from_Sjn': 'P = \\frac{S}{1 + j \\cdot n}',
        'formula_is_P_from_Ijn': 'P = \\frac{I}{j \\cdot n}',
        'formula_is_n_from_SPI': 'n = \\frac{\\frac{S}{P} - 1}{j}',
        'formula_is_n_from_IPj': 'n = \\frac{I}{P \\cdot j}',
        'formula_is_j_from_SPn': 'j = \\frac{\\frac{S}{P} - 1}{n}',
        'formula_is_j_from_IPn': 'j = \\frac{I}{P \\cdot n}',
        'formula_ic_S_from_Pin': 'S = P(1 + i)^{n}',
        'formula_monto_unico_P_from_S': 'P = S(1 + i)^{-n}',
        'formula_ic_I_from_Pin': 'I = P[(1 + i)^{n} - 1]',
        'formula_ic_P_from_Iin': 'P = \\frac{I}{(1 + i)^{n} - 1}',
        'formula_ic_n_from_SPi': 'n = \\frac{\\log(\\frac{S}{P})}{\\log(1 + i)}',
        'formula_ic_i_from_SPn': 'i = \\left(\\frac{S}{P}\\right)^{\\frac{1}{n}} - 1',
        'formula_ic_S_from_Pjm': 'S = P\\left(1 + \\frac{j}{m}\\right)^{n}',
        'formula_monto_unico_P_from_S_con_capitalizacion': 'P = S\\left(1 + \\frac{j}{m}\\right)^{-n}',
        'formula_tasa_proporcional': 'i_{prop} = j \\cdot \\frac{n_{dias\\_deseado}}{n_{dias\\_conocido}}',
        'formula_tasa_efectiva_from_nominal': 'i = \\left(1 + \\frac{j}{m}\\right)^{m \\cdot t} - 1',
        'formula_tasa_equivalente': 'i_{eq} = (1 + i_{conocida})^{\\frac{n_{dias\\_deseado}}{n_{dias\\_conocido}}} - 1',
        'formula_tasa_real': 'r = \\frac{i - pi}{1 + pi}',
        'formula_dr_D_from_Sin': 'D = S\\left[1 - (1 + i)^{-n}\\right]',
        'formula_dr_P_from_Sin': 'P = S(1 + i)^{-n}',
        'formula_dbs_DB_from_Sdn': 'D_{B} = S \\cdot d \\cdot n',
        'formula_dbs_P_from_Sdn': 'P = S(1 - d \\cdot n)',
        'formula_db_DB_from_Sden': 'D_{B} = S\\left[1 - (1 - de)^{n}\\right]',
        'formula_db_P_from_Sden': 'P = S(1 - de)^{n}',
        'formula_db_S_from_DBden': 'S = \\frac{D_{B}}{1 - (1 - de)^{n}}',
        'formula_db_de_from_DBSn': 'd_{e} = 1 - \\left(1 - \\frac{D_{B}}{S}\\right)^{\\frac{1}{n}}',
        'formula_db_de_from_Psn': 'd_{e} = 1 - \\left(\\frac{P}{S}\\right)^{\\frac{1}{n}}',
        'formula_av_S_from_Rin': 'S_{v} = R \\left[ \\frac{(1 + i)^{n} - 1}{i} \\right]',
        'formula_anualidad_vencida_P_from_R': 'P_{v} = R \\left[ \\frac{1 - (1 + i)^{-n}}{i} \\right]',
        'formula_av_R_from_Sin': 'R = S_{v} \\left[ \\frac{i}{(1 + i)^{n} - 1} \\right]',
        'formula_av_R_from_Pin': 'R = P_{v} \\left[ \\frac{i}{1 - (1 + i)^{-n}} \\right]',
        'formula_av_n_from_SRi': 'n = \\frac{\\log(\\frac{S \\cdot i}{R} + 1)}{\\log(1 + i)}',
        'formula_av_n_from_PRi': 'n = -\\frac{\\log(1 - \\frac{P \\cdot i}{R})}{\\log(1 + i)}',
        'formula_aa_S_from_Rin': 'S_{a} = R \\left[ \\frac{(1 + i)^{n} - 1}{i} \\right] (1+i)',
        'formula_aa_P_from_Rin': 'P_{a} = R \\left[ \\frac{1 - (1 + i)^{-n}}{i} \\right] (1+i)',
        'formula_aa_R_from_Sin': 'R = \\frac{S_{a}}{1+i} \\left[ \\frac{i}{(1 + i)^{n} - 1} \\right]',
        'formula_aa_R_from_Pin': 'R = \\frac{P_{a}}{1+i} \\left[ \\frac{i}{1 - (1 + i)^{-n}} \\right]',
        'formula_aa_n_from_PRi': 'n = -\\frac{\\log(1 - \\frac{P \\cdot i}{R(1+i)})}{\\log(1 + i)}',
        'formula_aa_n_from_SRi': 'n = \\frac{\\log(\\frac{S \\cdot i}{R(1+i)} + 1)}{\\log(1 + i)}',
        'formula_adv_P_from_Rink': 'P_{adv} = R \\left[ \\frac{1 - (1 + i)^{-n}}{i} \\right] (1+i)^{-k}',
        'formula_ada_P_from_Rink': 'P_{ada} = R \\left[ \\frac{1 - (1 + i)^{-n}}{i} \\right] (1+i) (1+i)^{-k}',
        'formula_ada_n_from_PRik': 'n = -\\frac{\\log(1 - \\frac{P \\cdot i}{R (1+i)^{1-k}})}{\\log(1+i)}',
        'formula_ada_k_from_PRin': 'k = \\frac{\\log(\\frac{R(1-(1+i)^{-n})(1+i)}{P \\cdot i})}{\\log(1+i)}',
        'formula_ga_P_from_Gin': 'P = \\frac{G}{i} \\left[ \\frac{1 - (1+i)^{-n}}{i} - n(1+i)^{-n} \\right]',
        'formula_ga_S_from_Gin': 'S = \\frac{G}{i} \\left[ \\frac{(1+i)^{n} - 1}{i} - n \\right]',
        'formula_gg_P_from_Rgin': 'P = R \\left[ \\frac{1 - (\\frac{1+g}{1+i})^{n}}{i-g} \\right]',
        'formula_gg_S_from_Rgin': 'S = R \\left[ \\frac{(1+i)^{n} - (1+g)^{n}}{i-g} \\right]',
        'formula_prestamo_saldo_N': 'Saldo_{N} = P \\left[ \\frac{(1+i)^{n} - (1+i)^{N}}{(1+i)^{n} - 1} \\right]',
        'formula_prestamo_amortizacion_N': 'Amortizacion_{N} = \\frac{P \\cdot i}{1-(1+i)^{-n}} (1+i)^{N-1-n}',
        'formula_prestamo_interes_N': 'Interes_{N} = \\frac{P \\cdot i}{1-(1+i)^{-n}} (1 - (1+i)^{N-1-n})',
        'formula_prestamo_A1_from_Pin': 'A_1 = \\frac{P \\cdot i}{1-(1+i)^{-n}} (1+i)^{-n}',
        'formula_prestamo_de_from_RinN': 'DE_N = R (1+i)^{-n} \\left[ \\frac{(1+i)^{N}-1}{i} \\right]',
        'formula_prestamo_de_from_PinN': 'DE_N = P \\left[ \\frac{(1+i)^{N}-1}{(1+i)^{n}-1} \\right]',
        'formula_prestamo_de_from_A1iN': 'DE_N = A_1 \\left[ \\frac{(1+i)^{N}-1}{i} \\right]',
        'formula_ic_n_from_IPi': 'n = \\frac{\\log(\\frac{I}{P} + 1)}{\\log(1 + i)}',
        'formula_ic_i_from_IPn': 'i = \\left(\\frac{I}{P} + 1\\right)^{\\frac{1}{n}} - 1',
        'formula_ic_j_from_SPnm': 'j = m \\left[ \\left(\\frac{S}{P}\\right)^{\\frac{1}{n}} - 1 \\right]',
        'formula_drs_D_from_Sjn': 'D = \\frac{S \\cdot j \\cdot n}{1 + j \\cdot n}',
        'formula_dbs_S_from_DBdn': 'S = \\frac{D_{B}}{d \\cdot n}',
        'formula_dbs_d_from_DBSn': 'd = \\frac{D_{B}}{S \\cdot n}',
        'formula_dbs_n_from_DBSd': 'n = \\frac{D_{B}}{S \\cdot d}',
        'formula_db_n_from_DBSde': 'n = \\frac{\\log(1 - \\frac{D_{B}}{S})}{\\log(1 - de)}',
        'formula_adv_n_from_PRik': 'n = -\\frac{\\log(1 - \\frac{P(1+i)^{k} i}{R})}{\\log(1 + i)}',
        'formula_adv_k_from_PRin': 'k = \\frac{\\log(\\frac{R(1-(1+i)^{-n})}{P i})}{\\log(1+i)}',
        'formula_ga_R_from_Gin': 'R_{eq} = G \\left[ \\frac{1}{i} - \\frac{n}{(1+i)^{n} - 1} \\right]',
        'formula_util_suma': 'Resultado = valor1 + valor2',
        'formula_util_resta': 'Resultado = valor1 - valor2',
        'formula_util_multiplicacion': 'Resultado = valor1 \\cdot valor2',
        'formula_util_division': 'Resultado = \\frac{valor1}{valor2}'
    },
    VARIABLE_DESCRIPTIONS: {
        P: 'Capital inicial o Presente', S: 'Monto final o Futuro', I: 'Interés total generado', j: 'Tasa de interés nominal (anual)', i: 'Tasa de interés efectiva por período', n: 'Número de períodos (años, meses, días)', t: 'Tiempo en años', m: 'Frecuencia de capitalización por año', k: 'Número de períodos de diferimiento', R: 'Monto de la renta o cuota periódica', G: 'Gradiente aritmético', g: 'Tasa de crecimiento del gradiente geométrico', d: 'Tasa de descuento simple o bancaria', de: 'Tasa de descuento efectiva', DB: 'Monto del Descuento Bancario', pi: 'Tasa de inflación (π)', N: 'Número de la cuota específica a analizar', A1: 'Monto de la primera amortización', DE_N: 'Derecho de extinguir una deuda después del pago N',
    }
};

const availableFormulas = Object.keys(config.FORMULA_LATEX_TEMPLATES).join('\n - ');
const PLAN_GENERATION_SYSTEM_PROMPT = `
Eres un experto en finanzas que crea planes de cálculo paso a paso para resolver problemas.
Tu respuesta DEBE ser un objeto JSON con la siguiente estructura:

{
  "interpretation": "<Breve descripción de cómo interpretaste el problema>",
  "initial_data": { "<variable_1>": <valor_1>, "<variable_2>": <valor_2> },
  "calculation_steps": [
    {
      "step_name": "<Nombre del paso>",
      "formula_name": "<nombre_de_la_formula>",
      "inputs": { "<param_1>": "{{variable_or_value}}", "<param_2>": "{{variable_or_value}}" },
      "target_variable": "<nombre_de_la_variable_resultado>"
    }
  ],
  "final_variable": "<nombre_de_la_variable_final>"
}

---
INSTRUCCIONES CLAVE:
1.  **Extracción de Datos:** Extrae con extrema precisión todos los valores numéricos del problema. NO realices conversiones en el JSON. Extrae los números crudos.
2.  **Manejo de Tasas:** El motor de cálculo puede realizar conversiones de tiempo y proporciones. La tarea de la IA es planificar los pasos. Por ejemplo, para convertir una tasa nominal a una efectiva, o una efectiva a otra, se requiere una secuencia de pasos lógicos.
3.  **No Incluir Valores Indefinidos:** Si no puedes determinar un valor numérico, NO lo incluyas en "initial_data".
4.  **Uso de Fórmulas:** Utiliza ÚNICAMENTE las fórmulas de la LISTA.
5.  **Encadenamiento:** Usa \`{{nombre_de_la_variable}}\` para referenciar el resultado de un paso anterior en el campo "inputs".
---

EJEMPLO DE RESPUESTA CORRECTA: Para el problema "Calcule la tasa efectiva que se acumuló en una operación a interés compuesto en el plazo de 62 días. En esta operación se aplicó una TNA de 0,1903 capitalizable trimestralmente."
\`\`\`json
{
  "interpretation": "El problema requiere calcular la tasa efectiva para un período de 62 días a partir de una Tasa Nominal Anual (TNA) capitalizable trimestralmente.",
  "initial_data": {
    "j": 0.1903,
    "n_dias_deseado": 62,
    "n_dias_conocido_nominal": 360,
    "n_dias_capitalizacion": 90
  },
  "calculation_steps": [
    {
      "step_name": "Calcular la tasa proporcional trimestral a partir de la TNA.",
      "formula_name": "formula_tasa_proporcional",
      "inputs": {
        "j": "{{j}}",
        "n_dias_deseado": "{{n_dias_capitalizacion}}",
        "n_dias_conocido": "{{n_dias_conocido_nominal}}"
      },
      "target_variable": "i_trimestral"
    },
    {
      "step_name": "Calcular la tasa equivalente para los 62 días a partir de la tasa efectiva trimestral.",
      "formula_name": "formula_tasa_equivalente",
      "inputs": {
        "i_conocida": "{{i_trimestral}}",
        "n_dias_deseado": "{{n_dias_deseado}}",
        "n_dias_conocido": "{{n_dias_capitalizacion}}"
      },
      "target_variable": "i_62_dias"
    }
  ],
  "final_variable": "i_62_dias"
}
\`\`\`

LISTA DE FÓRMULAS DISPONIBLES:
 - ${availableFormulas}
`;

async function callGoogleStudio(systemPrompt, userPrompt) {
    const apiKey = global.APIKeys.gemini_studio;
    if (!apiKey || apiKey.includes('...')) throw new Error("API key for Google AI Studio is not configured.");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([systemPrompt, userPrompt]);
    return await result.response.text();
}

async function callOpenRouter(provider, systemPrompt, userPrompt) {
    const model = config.OPENROUTER_MODELS[provider];
    const apiKey = global.APIKeys[provider];
    if (!apiKey || apiKey.includes('...')) throw new Error(`API key for ${provider} is not configured.`);
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: model,
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        }),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenRouter API error for ${provider}: ${response.status} ${errorBody}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
}

async function generateCalculationPlan(provider, problem) {
    const userPrompt = `Problema a resolver: "${problem}"`;
    let rawJsonText;
    try {
        if (provider === 'gemini_studio') {
            rawJsonText = await callGoogleStudio(PLAN_GENERATION_SYSTEM_PROMPT, userPrompt);
        } else {
            rawJsonText = await callOpenRouter(provider, PLAN_GENERATION_SYSTEM_PROMPT, userPrompt);
        }

        console.log('--- RAW JSON RESPONSE FROM AI ---');
        console.log(rawJsonText);
        console.log('-----------------------------------');

        // --- INICIO DE LA CORRECCIÓN ---

        // 1. Busca el bloque de código JSON en la respuesta de la IA.
        const jsonMatch = rawJsonText.match(/```json\s*([\s\S]*?)\s*```/);

        // 2. Comprueba si se encontró el bloque. Si no, asume que la respuesta es JSON puro.
        let jsonString;
        if (jsonMatch && jsonMatch[1]) {
            jsonString = jsonMatch[1].trim();
        } else {
            // Si la IA devuelve JSON sin los ```, esto funcionará como respaldo.
            jsonString = rawJsonText.trim();
        }

        // 3. (Opcional pero recomendado) Limpia comas finales que a veces las IAs añaden.
        jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');

        // 4. Parsea el string JSON a un objeto JavaScript.
        return JSON.parse(jsonString);

        // --- FIN DE LA CORRECCIÓN ---

    } catch (error) {
        // Añade más contexto al error para facilitar la depuración futura.
        console.error(`[AI Service] Error parsing or executing plan from ${provider}. Raw text: "${rawJsonText}"`, error);
        throw new Error(`Failed to generate or parse calculation plan from ${provider}.`);
    }
}
// ... (resto del código del archivo financialSolver.js) ...

// =================================================================================================
// --- 3. MOTOR DE CÁLCULO ---
// =================================================================================================
function executePlan(plan) {
    const calculatedVariables = { ...plan.initial_data };
    const executedSteps = [];
    plan.calculation_steps.forEach(step => {
        const resolvedInputs = resolveStepInputs(step.inputs, calculatedVariables);
        const { result, substituted_formula, formula } = calculateStep(step, resolvedInputs);
        calculatedVariables[step.target_variable] = result;
        executedSteps.push({ ...step, inputs: resolvedInputs, result, substituted_formula, formula });
    });
    return executedSteps;
}

function resolveStepInputs(inputs, calculatedVariables) {
    const resolvedInputs = { ...inputs };
    for (const key in resolvedInputs) {
        const value = resolvedInputs[key];
        if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
            const varName = value.slice(2, -2);
            if (varName in calculatedVariables) {
                resolvedInputs[key] = calculatedVariables[varName];
            } else {
                throw new Error(`Variable '${varName}' not found in calculated variables.`);
            }
        }
    }
    return resolvedInputs;
}

// <-- CORRECCIÓN: Nueva función para escapar caracteres especiales de LaTeX.
function escapeLatex(text) {
    if (typeof text !== 'string') text = String(text);
    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/&/g, '\\&')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}');
}


function calculateStep(step, inputs) {
    const { formula_name } = step;

    // AÑADE ESTO: FUNCIÓN DE VALIDACIÓN PARA EVITAR ERRORES DE NaN
    const validateInputs = (params) => {
        for (const key in params) {
            const value = params[key];
            if (typeof value !== 'number' || !isFinite(value)) {
                // Genera un error claro y conciso con los detalles del problema
                throw new Error(`Invalid input for variable '${key}' in formula '${formula_name}'. Value is not a valid number: ${value}`);
            }
        }
    };

    // Aplica la validación a los inputs del paso
    validateInputs(inputs);

    // Se extraen TODAS las posibles variables para evitar ReferenceError.
    const { P, S, I, j, i, n, t, m, k, R, G, g, d, de, DB, pi, N, A1, DE_N, 
            n1, n2, valor1, valor2, // <--- Asegúrate de que n1 y n2 estén aquí
            fecha_final, fecha_inicial, n_dias, n_dias_deseado, n_dias_conocido, i_conocida } = inputs;
    
    let result, substituted_formula = '', formula = '';


    // Este switch está sincronizado con FORMULA_LATEX_TEMPLATES
    switch (formula_name) {
        case 'formula_util_multiplicacion':
            // Asigna el valor, sea que venga como 'valor1' o 'n1'
            const v1 = valor1 !== undefined ? valor1 : n1;
            const v2 = valor2 !== undefined ? valor2 : n2;

            // Valida que los valores finales sean números
            if (typeof v1 !== 'number' || typeof v2 !== 'number') {
                throw new Error(`Inputs para la multiplicación son inválidos. Se recibieron: v1=${v1}, v2=${v2}`);
            }

            result = v1 * v2;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `Resultado = ${v1} \\cdot ${v2} = ${result}`;
            break;

        // Repite una lógica similar para suma, resta y división
        case 'formula_util_suma':
            const sum1 = valor1 !== undefined ? valor1 : n1;
            const sum2 = valor2 !== undefined ? valor2 : n2;
            result = sum1 + sum2;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `Resultado = ${sum1} + ${sum2} = ${result}`;
            break;

        case 'formula_util_resta':
            const sub1 = valor1 !== undefined ? valor1 : n1;
            const sub2 = valor2 !== undefined ? valor2 : n2;
            result = sub1 - sub2;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `Resultado = ${sub1} - ${sub2} = ${result}`;
            break;
        // --- UTILIDADES ---
        case 'formula_util_dias_entre_fechas':
            // Esta lógica asume que las fechas vienen en un formato que Date puede parsear, ej: 'YYYY-MM-DD'
            result = (new Date(fecha_final) - new Date(fecha_inicial)) / (1000 * 60 * 60 * 24);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n_{dias} = \\text{DiasEntre}(${fecha_final}, ${fecha_inicial}) = ${result}`;
            break;
        case 'formula_util_fraccion_anio':
            result = n_dias / 360; // Usando año comercial
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n = \\frac{${n_dias}}{360} = ${result}`;
            break;
        case 'formula_util_suma':
            result = valor1 + valor2;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `Resultado = ${valor1} + ${valor2} = ${result}`;
            break;
        case 'formula_util_resta':
            result = valor1 - valor2;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `Resultado = ${valor1} - ${valor2} = ${result}`;
            break;
        case 'formula_util_multiplicacion':
            result = valor1 * valor2;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `Resultado = ${valor1} \\cdot ${valor2} = ${result}`;
            break;
        case 'formula_util_division':
            result = valor1 / valor2;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `Resultado = \\frac{${valor1}}{${valor2}} = ${result}`;
            break;

        // --- INTERÉS SIMPLE ---
        case 'formula_is_I_from_Pjn':
            result = P * j * n;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `I = ${P} \\cdot ${j} \\cdot ${n} = ${result}`;
            break;
        case 'formula_is_S_from_Pjn':
            result = P * (1 + j * n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `S = ${P}(1 + ${j} \\cdot ${n}) = ${result}`;
            break;
        case 'formula_is_P_from_Sjn':
            result = S / (1 + j * n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `P = \\frac{${S}}{1 + ${j} \\cdot ${n}} = ${result}`;
            break;
        case 'formula_is_P_from_Ijn':
            result = I / (j * n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `P = \\frac{${I}}{${j} \\cdot ${n}} = ${result}`;
            break;
        case 'formula_is_n_from_SPI': // Note: Changed from SPj to SPI to match template
            result = ((S / P) - 1) / j;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n = \\frac{\\frac{${S}}{${P}} - 1}{${j}} = ${result}`;
            break;
        case 'formula_is_n_from_IPj':
            result = I / (P * j);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n = \\frac{${I}}{${P} \\cdot ${j}} = ${result}`;
            break;
        case 'formula_is_j_from_SPn':
            result = ((S / P) - 1) / n;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `j = \\frac{\\frac{${S}}{${P}} - 1}{${n}} = ${result}`;
            break;
        case 'formula_is_j_from_IPn':
            result = I / (P * n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `j = \\frac{${I}}{${P} \\cdot ${n}} = ${result}`;
            break;

        // --- INTERÉS COMPUESTO ---
        case 'formula_ic_S_from_Pin':
            result = P * Math.pow(1 + i, n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `S = ${P}(1 + ${i})^{${n}} = ${result}`;
            break;
        case 'formula_monto_unico_P_from_S': // Nombre actualizado
    result = S * Math.pow(1 + i, -n);
    formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
    substituted_formula = `P = ${S}(1 + ${i})^{-${n}} = ${result}`;
    break;
        case 'formula_ic_I_from_Pin':
            result = P * (Math.pow(1 + i, n) - 1);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `I = ${P}[(1 + ${i})^{${n}} - 1] = ${result}`;
            break;
        case 'formula_ic_P_from_Iin':
            result = I / (Math.pow(1 + i, n) - 1);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `P = \\frac{${I}}{(1 + ${i})^{${n}} - 1} = ${result}`;
            break;
        case 'formula_ic_n_from_SPi':
            result = Math.log(S / P) / Math.log(1 + i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n = \\frac{\\log(\\frac{${S}}{${P}})}{\\log(1 + ${i})} = ${result}`;
            break;
        case 'formula_ic_i_from_SPn':
            result = Math.pow(S / P, 1 / n) - 1;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `i = \\left(\\frac{${S}}{${P}}\\right)^{\\frac{1}{${n}}} - 1 = ${result}`;
            break;
        case 'formula_ic_S_from_Pjm': // Assuming 'n' is total periods
            result = P * Math.pow(1 + j / m, n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `S = ${P}\\left(1 + \\frac{${j}}{${m}}\\right)^{${n}} = ${result}`;
            break;
        case 'formula_monto_unico_P_from_S_con_capitalizacion': // Nombre actualizado
    result = S * Math.pow(1 + j / m, -n);
    formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
    substituted_formula = `P = ${S}\\left(1 + \\frac{${j}}{${m}}\\right)^{-${n}} = ${result}`;
    break;
        case 'formula_ic_n_from_IPi':
            result = Math.log(I / P + 1) / Math.log(1 + i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n = \\frac{\\log(\\frac{${I}}{${P}} + 1)}{\\log(1 + ${i})} = ${result}`;
            break;
        case 'formula_ic_i_from_IPn':
            result = Math.pow(I / P + 1, 1 / n) - 1;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `i = \\left(\\frac{${I}}{${P}} + 1\\right)^{\\frac{1}{${n}}} - 1 = ${result}`;
            break;
        case 'formula_ic_j_from_SPnm':
             result = m * (Math.pow(S / P, 1 / n) - 1);
             formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
             substituted_formula = `j = ${m} \\left[ \\left(\\frac{${S}}{${P}}\\right)^{\\frac{1}{${n}}} - 1 \\right] = ${result}`;
             break;

        // --- TASAS ---
        case 'formula_tasa_proporcional':
            result = j * (n_dias_deseado / n_dias_conocido);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `i_{prop} = ${j} \\cdot \\frac{${n_dias_deseado}}{${n_dias_conocido}} = ${result}`;
            break;
        case 'formula_tasa_efectiva_from_nominal': // 't' is time in years
            result = Math.pow(1 + j / m, m * t) - 1;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `i = \\left(1 + \\frac{${j}}{${m}}\\right)^{${m} \\cdot ${t}} - 1 = ${result}`;
            break;
        case 'formula_tasa_equivalente':
            result = Math.pow(1 + i_conocida, n_dias_deseado / n_dias_conocido) - 1;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `i_{eq} = (1 + ${i_conocida})^{\\frac{${n_dias_deseado}}{${n_dias_conocido}}} - 1 = ${result}`;
            break;
        case 'formula_tasa_real':
            result = (i - pi) / (1 + pi);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `r = \\frac{${i} - ${pi}}{1 + ${pi}} = ${result}`;
            break;

        // --- DESCUENTO ---
        case 'formula_drs_D_from_Sjn':
            result = (S * j * n) / (1 + j * n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `D = \\frac{${S} \\cdot ${j} \\cdot ${n}}{1 + ${j} \\cdot ${n}} = ${result}`;
            break;
        case 'formula_dr_D_from_Sin':
            result = S * (1 - Math.pow(1 + i, -n));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `D = ${S}\\left[1 - (1 + ${i})^{-${n}}\\right] = ${result}`;
            break;
        case 'formula_dr_P_from_Sin':
            result = S * Math.pow(1 + i, -n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `P = ${S}(1 + ${i})^{-${n}} = ${result}`;
            break;
        case 'formula_dbs_DB_from_Sdn':
            result = S * d * n;
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `D_{B} = ${S} \\cdot ${d} \\cdot ${n} = ${result}`;
            break;
        case 'formula_dbs_P_from_Sdn':
            result = S * (1 - d * n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `P = ${S}(1 - ${d} \\cdot ${n}) = ${result}`;
            break;
        case 'formula_dbs_S_from_DBdn':
            result = DB / (d * n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `S = \\frac{${DB}}{${d} \\cdot ${n}} = ${result}`;
            break;
        case 'formula_dbs_d_from_DBSn':
            result = DB / (S * n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `d = \\frac{${DB}}{${S} \\cdot ${n}} = ${result}`;
            break;
        case 'formula_dbs_n_from_DBSd':
            result = DB / (S * d);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n = \\frac{${DB}}{${S} \\cdot ${d}} = ${result}`;
            break;
        case 'formula_db_DB_from_Sden':
            result = S * (1 - Math.pow(1 - de, n));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `D_{B} = ${S}\\left[1 - (1 - ${de})^{${n}}\\right] = ${result}`;
            break;
        case 'formula_db_P_from_Sden':
            result = S * Math.pow(1 - de, n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `P = ${S}(1 - ${de})^{${n}} = ${result}`;
            break;
        case 'formula_db_S_from_DBden':
            result = DB / (1 - Math.pow(1 - de, n));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `S = \\frac{${DB}}{1 - (1 - ${de})^{${n}}} = ${result}`;
            break;
        case 'formula_db_de_from_DBSn':
            result = 1 - Math.pow(1 - DB / S, 1 / n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `d_{e} = 1 - \\left(1 - \\frac{${DB}}{${S}}\\right)^{\\frac{1}{${n}}} = ${result}`;
            break;
        case 'formula_db_de_from_Psn':
            result = 1 - Math.pow(P / S, 1 / n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `d_{e} = 1 - \\left(\\frac{${P}}{${S}}\\right)^{\\frac{1}{${n}}} - 1 = ${result}`;
            break;
        case 'formula_db_n_from_DBSde':
            result = Math.log(1 - DB / S) / Math.log(1 - de);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n = \\frac{\\log(1 - \\frac{${DB}}{${S}})}{\\log(1 - ${de})} = ${result}`;
            break;
                        
        // --- ANUALIDADES VENCIDAS ---
        case 'formula_av_S_from_Rin':
            result = R * ((Math.pow(1 + i, n) - 1) / i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `S_{v} = ${R} \\left[ \\frac{(1 + ${i})^{${n}} - 1}{${i}} \\right] = ${result}`;
            break;
        case 'formula_anualidad_vencida_P_from_R': // Nombre actualizado
    // ¡Esta es la fórmula que se necesita para el problema de las cuotas!
    result = R * ((1 - Math.pow(1 + i, -n)) / i);
    formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
    substituted_formula = `P_{v} = ${R} \\left[ \\frac{1 - (1 + ${i})^{-${n}}}{${i}} \\right] = ${result}`;
    break;
        case 'formula_av_R_from_Sin':
            result = S * (i / (Math.pow(1 + i, n) - 1));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `R = ${S} \\left[ \\frac{${i}}{(1 + ${i})^{${n}} - 1} \\right] = ${result}`;
            break;
        case 'formula_av_R_from_Pin':
            result = P * (i / (1 - Math.pow(1 + i, -n)));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `R = ${P} \\left[ \\frac{i}{1 - (1 + ${i})^{-${n}}} \\right] = ${result}`;
            break;
        case 'formula_av_n_from_SRi':
            result = Math.log(S * i / R + 1) / Math.log(1 + i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n = \\frac{\\log(\\frac{${S} \\cdot ${i}}{${R}} + 1)}{\\log(1 + ${i})} = ${result}`;
            break;
        case 'formula_av_n_from_PRi':
            result = -Math.log(1 - P * i / R) / Math.log(1 + i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n = -\\frac{\\log(1 - \\frac{${P} \\cdot ${i}}{${R}})}{\\log(1 + ${i})} = ${result}`;
            break;

        // --- ANUALIDADES ANTICIPADAS ---
        case 'formula_aa_S_from_Rin':
            result = R * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `S_{a} = ${R} \\left[ \\frac{(1 + ${i})^{${n}} - 1}{${i}} \\right] (1+${i}) = ${result}`;
            break;
        case 'formula_aa_P_from_Rin':
            result = R * ((1 - Math.pow(1 + i, -n)) / i) * (1 + i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `P_{a} = ${R} \\left[ \\frac{1 - (1 + ${i})^{-${n}}}{${i}} \\right] (1+${i}) = ${result}`;
            break;
        case 'formula_aa_R_from_Sin':
            result = (S / (1 + i)) * (i / (Math.pow(1 + i, n) - 1));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `R = \\frac{${S}}{1+${i}} \\left[ \\frac{${i}}{(1 + ${i})^{${n}} - 1} \\right] = ${result}`;
            break;
        case 'formula_aa_R_from_Pin':
            result = (P / (1 + i)) * (i / (1 - Math.pow(1 + i, -n)));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `R = \\frac{${P}}{1+${i}} \\left[ \\frac{${i}}{1 - (1 + ${i})^{-${n}}} \\right] = ${result}`;
            break;
        case 'formula_aa_n_from_PRi':
            result = -Math.log(1 - (P * i) / (R * (1 + i))) / Math.log(1 + i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n = -\\frac{\\log(1 - \\frac{${P} \\cdot ${i}}{${R}(1+${i})})}{\\log(1 + ${i})} = ${result}`;
            break;
        case 'formula_aa_n_from_SRi':
            result = Math.log((S * i) / (R * (1 + i)) + 1) / Math.log(1 + i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n = \\frac{\\log(\\frac{${S} \\cdot ${i}}{${R}(1+${i})} + 1)}{\\log(1 + ${i})} = ${result}`;
            break;

        // --- ANUALIDADES DIFERIDAS ---
        case 'formula_adv_P_from_Rink': // Vencida
            result = R * ((1 - Math.pow(1 + i, -n)) / i) * Math.pow(1 + i, -k);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `P_{adv} = ${R} \\left[ \\frac{1 - (1 + ${i})^{-${n}}}{${i}} \\right] (1+${i})^{-${k}} = ${result}`;
            break;
        case 'formula_ada_P_from_Rink': // Anticipada
            result = R * ((1 - Math.pow(1 + i, -n)) / i) * (1 + i) * Math.pow(1 + i, -k);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `P_{ada} = ${R} \\left[ \\frac{1 - (1 + ${i})^{-${n}}}{${i}} \\right] (1+${i}) (1+${i})^{-${k}} = ${result}`;
            break;
        case 'formula_ada_n_from_PRik':
             result = -Math.log(1 - (P * i) / (R * Math.pow(1 + i, 1 - k))) / Math.log(1 + i);
             formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
             substituted_formula = `n = -\\frac{\\log(1 - \\frac{${P} \\cdot ${i}}{${R} (1+${i})^{1-${k}}})}{\\log(1+${i})} = ${result}`;
             break;
        case 'formula_ada_k_from_PRin':
             result = Math.log((R * (1 - Math.pow(1 + i, -n)) * (1 + i)) / (P * i)) / Math.log(1 + i);
             formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
             substituted_formula = `k = \\frac{\\log(\\frac{${R}(1-(1+${i})^{-${n}})(1+${i})}{${P} \\cdot ${i}})}{\\log(1+${i})} = ${result}`;
             break;
        case 'formula_adv_n_from_PRik':
            result = -Math.log(1 - (P * Math.pow(1 + i, k) * i) / R) / Math.log(1 + i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `n = -\\frac{\\log(1 - \\frac{${P}(1+${i})^{${k}} ${i}}{${R}})}{\\log(1 + ${i})} = ${result}`;
            break;
        case 'formula_adv_k_from_PRin':
            result = Math.log((R * (1 - Math.pow(1 + i, -n))) / (P * i)) / Math.log(1 + i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `k = \\frac{\\log(\\frac{${R}(1-(1+${i})^{-${n}})}{${P} ${i}})}{\\log(1+${i})} = ${result}`;
            break;

        // --- GRADIENTES ---
        case 'formula_ga_P_from_Gin':
            result = (G / i) * (((1 - Math.pow(1 + i, -n)) / i) - (n * Math.pow(1 + i, -n)));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `P = \\frac{${G}}{${i}} \\left[ \\frac{1 - (1+${i})^{-${n}}}{${i}} - ${n}(1+${i})^{-${n}} \\right] = ${result}`;
            break;
        case 'formula_ga_S_from_Gin':
            result = (G / i) * (((Math.pow(1 + i, n) - 1) / i) - n);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `S = \\frac{${G}}{${i}} \\left[ \\frac{(1+${i})^{${n}} - 1}{${i}} - ${n} \\right] = ${result}`;
            break;
        case 'formula_ga_R_from_Gin':
            result = G * (1/i - n / (Math.pow(1+i, n) - 1));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `R_{eq} = ${G} \\left[ \\frac{1}{${i}} - \\frac{${n}}{(1+${i})^{${n}} - 1} \\right] = ${result}`;
            break;
        case 'formula_gg_P_from_Rgin':
            result = (i === g) ? (R * n) / (1 + i) : R * ((1 - Math.pow((1 + g) / (1 + i), n)) / (i - g));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `P = ${R} \\left[ \\frac{1 - (\\frac{1+${g}}{1+${i}})^{${n}}}{${i}-${g}} \\right] = ${result}`;
            break;
        case 'formula_gg_S_from_Rgin':
            result = R * ((Math.pow(1 + i, n) - Math.pow(1 + g, n)) / (i - g));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `S = ${R} \\left[ \\frac{(1+${i})^{${n}} - (1+${g})^{${n}}}{${i}-${g}} \\right] = ${result}`;
            break;

        // --- PRÉSTAMOS ---
        case 'formula_prestamo_saldo_N':
            result = P * ((Math.pow(1 + i, n) - Math.pow(1 + i, N)) / (Math.pow(1 + i, n) - 1));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `Saldo_{${N}} = ${P} \\left[ \\frac{(1+${i})^{${n}} - (1+${i})^{${N}}}{(1+${i})^{${n}} - 1} \\right] = ${result}`;
            break;
        case 'formula_prestamo_amortizacion_N':
            {
                const R_calc = P * (i / (1 - Math.pow(1 + i, -n)));
                result = R_calc * Math.pow(1 + i, N - 1 - n);
            }
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `Amortizacion_{${N}} = \\frac{${P} \\cdot ${i}}{1-(1+${i})^{-${n}}} (1+${i})^{${N}-1-${n}} = ${result}`;
            break;
        case 'formula_prestamo_interes_N':
            {
                const R_calc = P * (i / (1 - Math.pow(1 + i, -n)));
                result = R_calc * (1 - Math.pow(1 + i, N - 1 - n));
            }
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `Interes_{${N}} = \\frac{${P} \\cdot ${i}}{1-(1+${i})^{-${n}}} (1 - (1+${i})^{${N}-1-${n}}) = ${result}`;
            break;
        case 'formula_prestamo_A1_from_Pin':
            {
                const R_calc = P * (i / (1 - Math.pow(1 + i, -n)));
                result = R_calc * Math.pow(1 + i, -n);
            }
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `A_1 = \\frac{${P} \\cdot ${i}}{1-(1+${i})^{-${n}}} (1+${i})^{-${n}} = ${result}`;
            break;
        case 'formula_prestamo_de_from_RinN':
            result = R * Math.pow(1 + i, -n) * ((Math.pow(1 + i, N) - 1) / i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `DE_{${N}} = ${R} (1+${i})^{-${n}} \\left[ \\frac{(1+${i})^{${N}}-1}{${i}} \\right] = ${result}`;
            break;
        case 'formula_prestamo_de_from_PinN':
            result = P * ((Math.pow(1 + i, N) - 1) / (Math.pow(1 + i, n) - 1));
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `DE_{${N}} = ${P} \\left[ \\frac{(1+${i})^{${N}}-1}{(1+${i})^{${n}}-1} \\right] = ${result}`;
            break;
        case 'formula_prestamo_de_from_A1iN':
            result = A1 * ((Math.pow(1 + i, N) - 1) / i);
            formula = config.FORMULA_LATEX_TEMPLATES[formula_name];
            substituted_formula = `DE_{${N}} = ${A1} \\left[ \\frac{(1+${i})^{${N}}-1}{${i}} \\right] = ${result}`;
            break;

        default:
            throw new Error(`Formula '${formula_name}' is not implemented in the calculation engine.`);
    }

    if (isNaN(result) || !isFinite(result)) {
        throw new Error(`Calculation for '${formula_name}' resulted in an invalid value (NaN or Infinity).`);
    }
    return { result, substituted_formula, formula };
}


/// =================================================================================================
// --- 4. GENERADOR DE IMÁGENES ---
// =================================================================================================

/**
 * Sube un buffer de imagen a Telegra.ph.
 * @param {Buffer} buffer El buffer de la imagen a subir.
 * @returns {Promise<string>} La URL de la imagen subida.
 */
async function uploadToTelegraph(buffer) {
    const form = new FormData();
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    form.append('file', stream, { filename: 'solucion.png', contentType: 'image/png' });

    const response = await fetch('https://telegra.ph/upload', {
        method: 'POST',
        body: form,
    });

    if (!response.ok) {
        throw new Error(`Error al subir a Telegra.ph: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
        throw new Error(`Error de Telegra.ph: ${data.error}`);
    }

    return `https://telegra.ph${data[0].src}`;
}

/**
 * Limpia una cadena de texto para que sea compatible con LaTeX, escapando caracteres especiales.
 * @param {string} text El texto de entrada.
 * @returns {string} El texto limpiado para LaTeX.
 */
function cleanTextForLatex(text) {
    if (typeof text !== 'string') return '';
    
    // Mapeo de caracteres comunes y especiales a sus comandos LaTeX
    const replacements = {
        'á': "a'", 'é': "e'", 'í': "i'", 'ó': "o'", 'ú': "u'",
        'Á': "A'", 'É': "E'", 'Í': "I'", 'Ó': "O'", 'Ú': "U'",
        'ñ': '\\~n', 'Ñ': '\\~N',
        'ü': '\\"u', 'Ü': '\\"U',
        '¿': '?`', '¡': '!`',
        '&': '\\&', '%': '\\%', '$': '\\$', '#': '\\#', '_': '\\_',
        '{': '\\{', '}': '\\}',
        '~': '\\textasciitilde{}',
        '^': '\\^{}',
        '\\': '\\textbackslash{}',
    };

    let cleanedText = '';
    for (const char of text) {
        cleanedText += replacements[char] || char;
    }
    
    return cleanedText;
}

/**
 * Genera una imagen PNG a partir de los pasos de la solución usando una API de LaTeX.
 * @param {Array<Object>} executedSteps Los pasos del cálculo ejecutados.
 * @returns {Promise<Buffer>} Un buffer con los datos de la imagen PNG.
 */
async function generateSolutionImage(executedSteps) {
    const latexSteps = executedSteps.map((step, index) => {
        const cleanedDescription = cleanTextForLatex(step.step_name);
        return `\\text{Paso ${index + 1}: ${cleanedDescription}} \\\\ ${step.substituted_formula}`;
    }).join(' \\\\ \\\\ '); // Doble salto de línea entre pasos

    const encodedLatex = encodeURIComponent(`{\\color{black} ${latexSteps}}`);
    const latexUrl = `https://latex.codecogs.com/png.image?\\dpi{150}&\\bg{white}&${encodedLatex}`;

    try {
        const response = await fetch(latexUrl);
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/png')) {
            const errorBody = await response.text();
            console.error(`[LaTeX API] Error: ${response.status}. Body: ${errorBody}`);
            throw new Error(`LaTeX API failed (Status: ${response.status}).`);
        }
        // El método para obtener el buffer puede variar: .buffer() en node-fetch, .arrayBuffer() en fetch nativo
        return response.buffer();
    } catch (error) {
        console.error('Error generating solution image:', error);
        throw error;
    }
}

// =================================================================================================
// --- 5. ORQUESTADOR PRINCIPAL ---
// =================================================================================================

/**
 * Resuelve un problema financiero orquestando la generación del plan, la ejecución y la presentación.
 * @param {Object} provider El proveedor de la IA.
 * @param {string} problem La descripción del problema a resolver.
 * @returns {Promise<Object>} Un objeto con el mensaje consolidado, los pasos y el buffer de la imagen.
 */
async function solveFinancialProblem(provider, problem) {
    // 1. Generar el plan de cálculo desde la IA (se asume que estas funciones existen)
    const plan = await generateCalculationPlan(provider, problem);

    // 2. Ejecutar el plan para obtener los resultados (se asume que esta función existe)
    const executedSteps = executePlan(plan);

    // 3. Construir el mensaje de texto consolidado
    let initialDataText = '*Datos Iniciales:*\n';
    for (const [key, value] of Object.entries(plan.initial_data)) {
        const description = config.VARIABLE_DESCRIPTIONS[key] || key;
        initialDataText += `- ${description} (${key}): ${value}\n`;
    }

    const uniqueFormulas = [...new Set(executedSteps.map(step => step.formula))];
    const formulasMessage = `*Fórmulas a Utilizar:*\n${uniqueFormulas.map(f => `- \`${f}\``).join('\n')}`;
    const consolidatedMessage = `*Interpretación del Problema:*\n${plan.interpretation}\n\n${initialDataText}\n${formulasMessage}`;

    // 4. Generar la imagen de la solución
    let imageBuffer = null;
    try {
        if (executedSteps.length > 0) {
            imageBuffer = await generateSolutionImage(executedSteps);
        }
    } catch (imageError) {
        console.error('FALLBACK: Could not generate image. Sending text solution instead.', imageError);
        // Si la generación de imagen falla, el buffer será null y se puede manejar en el plugin.
    }
    
    // 5. Devolver todos los artefactos para que el plugin los envíe
    return {
        consolidatedMessage,
        executedSteps,
        imageBuffer
    };
}

// <-- AÑADE LA FUNCIÓN simplifyLatexFormula AQUÍ -->
function simplifyLatexFormula(latexFormula) {
    if (typeof latexFormula !== 'string') {
        return '';
    }
    return latexFormula
        .replace(/\\cdot/g, ' * ')
        .replace(/\\frac{(.*?)}{(.*?)}/g, '($1) / ($2)')
        .replace(/\\left/g, '')
        .replace(/\\right/g, '')
        .replace(/\\text{(.*?)}/g, '$1')
        .replace(/^{/g, '^(')
        .replace(/}/g, ')')
        .replace(/_{/g, '_')
        .replace(/\\log/g, 'log')
        .replace(/\\ /g, ' ')
        .trim();
}

// <-- REEMPLAZA LA FUNCIÓN solveFinancialProblemTextOnly EXISTENTE CON ESTA VERSIÓN -->
async function solveFinancialProblemTextOnly(provider, problem) {
    const plan = await generateCalculationPlan(provider, problem);
    const executedSteps = executePlan(plan);

    let resultText = `*Interpretación del Problema:*\n${plan.interpretation}\n\n`;

    let initialDataText = '*Datos Iniciales:*\n';
    for (const [key, value] of Object.entries(plan.initial_data)) {
        const description = config.VARIABLE_DESCRIPTIONS[key] || key;
        initialDataText += `- ${description} (${key}): ${value}\n`;
    }
    resultText += initialDataText + '\n';

    const simplifiedUniqueFormulas = [...new Set(executedSteps.map(step => simplifyLatexFormula(step.formula)))];
    const formulasMessage = `*Fórmulas a Utilizar:*\n${simplifiedUniqueFormulas.map(f => `- \`${f}\``).join('\n')}\n\n`;
    resultText += formulasMessage;

    let solutionStepsText = '*Solución Paso a Paso (Texto):*\n';
    executedSteps.forEach((step, index) => {
        const simplifiedStepFormula = simplifyLatexFormula(step.formula);
        const simplifiedSubstitution = simplifyLatexFormula(step.substituted_formula);
        
        solutionStepsText += `\n*Paso ${index + 1}:* ${step.step_name}\n`;
        solutionStepsText += `*Fórmula:* \`${simplifiedStepFormula}\`\n`;
        solutionStepsText += `*Sustitución:* \`${simplifiedSubstitution}\`\n`;
        solutionStepsText += `*Resultado:* \`${step.target_variable}\` = ${step.result}\n`;
    });
    resultText += solutionStepsText;

    const finalStep = executedSteps.length > 0 ? executedSteps[executedSteps.length - 1] : null;
    if (finalStep) {
        const finalVariableDescription = config.VARIABLE_DESCRIPTIONS[plan.final_variable] || plan.final_variable;
        resultText += `\n\n*Respuesta Final:*\nEl valor de *${finalVariableDescription} (${plan.final_variable})* es **${finalStep.result.toFixed(2)}**\.`;
    }

    return resultText;
}

export { solveFinancialProblem, solveFinancialProblemTextOnly };