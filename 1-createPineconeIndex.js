export const createPineconeIndex = async (
    client,
    indexName,
    vectorDimension
) => {

    /*
        1. Avvio il controllo dell'esistenza dell'indice
    */
    console.log(`Controllo l'esitenza dell'indice "${indexName}"...`);

    /*
        2. Ottengo l'elenco degli indici esistenti
    */
    const existingIndexes = await client.listIndexes();

    /*
        3. Se l'indice non esiste lo creo
    */
    if (!existingIndexes.includes(indexName)) 
    {
        /*
            4. Log dell'inzio della creazione dell'indice
        */
        console.log(`Controllo esistenza dellindice "${indexName}"...`);

        /*
            5. Creo l'indice
        */
        const createClient = await client.createIndex({
            createRequest: {
                name: indexName,
                dimension: vectorDimension,
                metric: "cosine",
            },
        });

        /*
            6. Log di creazione avvenuta
        */
        console.log(`Creato con il client:`, createClient);

        /*
            7. Attendo 60 secondi per l'inizializzazione dell'indice
        */
        await new Promise((resolve) => setTimeout(resolve, 60000));
    } 
    else 
    {
        /*
            8. Log se l'indice esiste
        */
        console.log(`"${indexName}" già esistente.`);
    }
};
