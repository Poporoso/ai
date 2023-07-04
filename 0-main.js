/**
    1. Inizializza un nuovo progetto con: npm init -y e crea un file .env di 4 file js
    2. npm i "@pinecone-database/pinecone@^0.0.10" dotenv@^16.0.3 langchain@^0.0.73
    3. Ottieni la chiave API da OpenAI (https://platform.openai.com/account/api-keys)
    4. Ottieni la chiave API da Pinecone (https://app.pinecone.io/)
    5. Immettere le chiavi API nel file .env
    Opzionale: se si desidera utilizzare altri caricatori di file (https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/)
*/
import { PineconeClient } from "@pinecone-database/pinecone";


import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import * as dotenv from "dotenv";

import { createPineconeIndex } from "./1-createPineconeIndex.js";
import { updatePinecone } from "./2-updatePinecone.js";
import { queryPineconeVectorStoreAndQueryLLM } from "./3-queryPineconeAndQueryGPT.js";
 
/* 
    6. Carico le variabili .env 
*/
dotenv.config();


/** 
    7. Configurare DirectoryLoader per caricare i documenti dalla directory ./documents 
*/
const loader = new DirectoryLoader("./documents", {
    ".txt": (path) => new TextLoader(path),
    ".pdf": (path) => new PDFLoader(path),
});

const docs = await loader.load();

/**
    8. Configurare le variabili per il
       nome file
       domanda
       impostazioni dell'indice
*/
// const question = "che cosa è Zero Digitle?";
    // const question = "Quali servizi offre Zero Digitale?";
    const indexName = "zero-digitale-20230629";
    const vectorDimension = 1536;

/*
    9. Inizializza il client Pinecone con la chiave API e l'ambiente
*/
const client = new PineconeClient();
await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
});


/*
    10. Eseguire la funzione asincrona principale

    (async () => {
        // 11. Verifica se l'indice di Pinecone esiste e, se necessario, crealo.
        await createPineconeIndex(client, indexName, vectorDimension);

        // 12. Aggiorna lostore vettoriale di Pinecone con le rappresentazioni dei documenti.
        await updatePinecone(client, indexName, docs);

        // 13. Interroga lo store vettoriale di Pinecone e il modello GPT per ottenere una risposta.
        await queryPineconeVectorStoreAndQueryLLM(client, indexName, question);
    })();
*/

export default callApiBot = async(question) => {

    // const question = "Quali servizi offre Zero Digitale?";
    await createPineconeIndex(client, indexName, vectorDimension);
    await updatePinecone(client, indexName, docs);
    await queryPineconeVectorStoreAndQueryLLM(client, indexName, question);
}