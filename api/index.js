import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import { Pool } from "pg";
// import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

const systemInstruction = `
Eres Cami, solo di tu nombre si es el primer mensaje y no saben tu nombre, no repitas tu nombre en la misma conversacion, eres una asistente de ayuda y soporte para prevenir y ayudar a mujeres en situacion de riesgo en México y el mundo, puedes contestar en el idioma que te escriben pero nuestros recursos son de mexico unicamente, entonces puedes buscar recomendaciones pero tu sistema debe centrarse a usuarias de Mexico. Tu única función es responder preguntas de forma amable, siendo alguien de confianza, que da consejos, escucha y ayuda a las mujeres. Si te preguntan algo fuera de este tema, debes responder amablemente con la siguiente frase: 'Lo siento, solo puedo ayudarte con preguntas sobre ayuda y prevencion a violencia de género.' Si un usuario te saluda, debes responder cordialmente como 'Cami' y preguntar en qué puedes ayudarle. Tambien eres capaz de analizar y canalizar con asesoria legal abogada y asesoria psicologica solo si te lo solicitan o si es necesario Abogada Gabriela Sarabia Teléfono: 9531776747 Psicóloga Diana Serrano Teléfono: 2221133330 911 - Emergencias 800 800 8000 - Apoyo Psicológico 800 123 1234 - Línea de Violencia 555 555 5555 - Centro de Apoyo a Mujeres en Situación de Riesgo
`;

// async function guardarMensaje(sessionId, texto, autor, intencion = null) {
//   const query = `
//     INSERT INTO conversaciones(session_id, mensaje, autor, intencion_detectada)
//     VALUES($1, $2, $3, $4)
//   `;
//   const values = [sessionId, texto, autor, intencion];

//   try {
//     await pool.query(query, values);
//   } catch (error) {
//     console.error("Error al guardar en la BD:", error);
//   }
// }

app.post("/api/chat", async (req, res) => {
  const { text } = req.body;
  // const sessionId = uuidv4();

  try {
    // await guardarMensaje(sessionId, text, "usuaria");

    const payload = {
      contents: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "user", parts: [{ text }] }
      ]
    };

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemInstruction + "\n\nUsuario: " + text }]
            }
          ]
        })
      }
    );

    const result = await response.json();

    console.log("STATUS:", response.status);
    console.log("HEADERS:", response.headers.get("content-type"));
    console.log("RESULTADO COMPLETO GEMINI:");
    console.log(JSON.stringify(result, null, 2));
    let botMessage = "Lo siento, no pude generar respuesta.";

    if (result.candidates && result.candidates.length > 0) {
      const parts = result.candidates[0].content?.parts;
      if (parts && parts.length > 0 && parts[0].text) {
        botMessage = parts[0].text;
      }
    }
    // await guardarMensaje(sessionId, botMessage, "bot", "respuesta_gemini");
    res.json({ reply: botMessage });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default app;