/*
    1. Importo moduli richiesti
*/
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

/*
    2. Esporto la funzione updatePinecone
*/
export const updatePinecone = async (client, indexName, docs) => {

    // console.log("Recupera l'indice Pinecone...");

    /*
        3. Recupera l'indice Pinecone
    */
    const index = client.Index(indexName);

    /*
        4. Registro il nome dell'indice recuperato
    */
    // console.log(`Registro l'index Pinecone: ${indexName}`);

    /*
        5. Elaboro ogni documento nell'array docs
    */
    for (const doc of docs) 
    {
        // console.log(`Lavoro il documento: ${doc.metadata.source}`);

        const txtPath = doc.metadata.source;
        const text = doc.pageContent;

        /*
            6. Creo l'instanza RecursiveCharacterTextSplitter
        */
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
        });

        // console.log("Divido il testo in chunks...");
    
        /*
            7. Divido il testo in chunks (documenti)
        */
        const chunks = await textSplitter.createDocuments([text]);

        // console.log(`Testo diviso in ${chunks.length} chunks`);
        // console.log(`Chiamare i documenti dell'endpoint Embedding di OpenAI con ${chunks.length} blocchi di testo...`);

    
        /*
            8. Crea incorporamenti OpenAI per i documenti
        */
        const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
            chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
        );

        // console.log("Finito l'incorporamento dei documenti");
        // console.log(`Creati ${chunks.length} array di vettori con id, valori e metadati...`);
    
        /*
            9. Creo e aggiorno i vettori in lotti di 100
        */
        const batchSize = 100;
        let batch = [];
        for (let idx = 0; idx < chunks.length; idx++) 
        {
            const chunk = chunks[idx];
            const vector = {
                id: `${txtPath}_${idx}`,
                values: embeddingsArrays[idx],
                metadata: {
                    ...chunk.metadata,
                    loc: JSON.stringify(chunk.metadata.loc),
                    pageContent: chunk.pageContent,
                    txtPath: txtPath,
                },
            };
            batch.push(vector);
        
            /* Quando il batch è pieno o è l'ultimo elemento, invertire i vettori */
            if (batch.length === batchSize || idx === chunks.length - 1) {
                await index.upsert({
                    upsertRequest: {
                        vectors: batch,
                    },
                });

                /* Svuotare il lotto */
                batch = [];
            }
        }
    
        /*
            10. Log the number of vectors updated
        */
        // console.log(`Indice Pinecone aggiornato con ${chunks.length} vettori`);
    }
};