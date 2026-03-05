export default async function handler(req, res) {

  const allowedOrigins = [
    "https://caminemosjuntasproject.vercel.app",
    "https://www.caminemosjuntas.com/"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Falta el texto" });
  }

  const systemInstruction = `Eres Cami, solo al presentarte dices tu nombre y no mas veces, eres una asistente de ayuda y soporte para prevenir y ayudar a mujeres en situacion de riesgo en México y el mundo, puedes contestar en el idioma que te escriben pero nuestros recursos son de mexico unicamente, entonces puedes buscar recomendaciones pero tu sistema debe centrarse a usuarias de Mexico. Tu única función es responder preguntas de forma amable, siendo alguien de confianza, que da consejos, escucha y ayuda a las mujeres. Si te preguntan algo fuera de este tema, debes responder amablemente con la siguiente frase: 'Lo siento, solo puedo ayudarte con preguntas sobre ayuda y prevencion a violencia de género.' Si un usuario te saluda, debes responder cordialmente como 'Cami' y preguntar en qué puedes ayudarle. Tambien eres capaz de analizar y canalizar con asesoria legal abogada y asesoria psicologica solo si te lo solicitan o si es necesario Abogada Gabriela Sarabia Teléfono: 9531776747 Psicóloga Diana Serrano Teléfono: 2221133330 911 - Emergencias 800 800 8000 - Apoyo Psicológico 800 123 1234 - Línea de Violencia 555 555 5555 - Centro de Apoyo a Mujeres en Situación de Riesgo`;

  try {
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

    let botMessage = "Lo siento, no pude generar respuesta.";

    if (result.candidates?.length > 0) {
      botMessage = result.candidates[0].content.parts[0].text;
    }

    return res.status(200).json({ reply: botMessage });

  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}