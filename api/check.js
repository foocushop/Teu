export default async function handler(req, res) {
    const API_SOURCE = "https://api.cdnlivetv.tv/api/v1/channels/?user=cdnlivetv&plan=free";
    
    try {
        const response = await fetch(API_SOURCE);
        const data = await response.json();
        
        // On récupère toutes les chaînes retournées par l'API
        const allChannels = data.channels || [];
        
        // On effectue un filtrage asynchrone sur tout le tableau
        const activeChannels = [];
        for (const channel of allChannels) {
            try {
                // On vérifie rapidement chaque flux
                const check = await fetch(channel.url, { method: 'HEAD', signal: AbortSignal.timeout(1000) });
                if (check.ok) activeChannels.push(channel);
            } catch (e) {
                continue; // On ignore les liens morts silencieusement
            }
        }
        
        res.status(200).json(activeChannels);
    } catch (e) {
        res.status(500).json({ error: "Erreur lors du filtrage" });
    }
}
