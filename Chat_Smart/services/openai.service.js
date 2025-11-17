const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generarEmbedding(texto) {
    const emb = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: texto
    });
    return emb.data[0].embedding;
}

async function chatOpenAI(messages) {
    const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages
    });

    return completion.choices[0].message.content;
}

module.exports = {
    generarEmbedding,
    chatOpenAI
};
