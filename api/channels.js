// api/channels.js
let cachedData = null;
let lastFetch = 0;

export default async function handler(req, res) {
    // Mise en cache pendant 1 heure pour ne pas surcharger l'API source
    if (cachedData && (Date.now() - lastFetch < 3600000)) {
        return res.status(200).json(cachedData);
    }

    try {
        const response = await fetch("https://api.cdnlivetv.tv/api/v1/channels/?user=cdnlivetv&plan=free");
        const data = await response.json();
        
        // Filtrage côté serveur : on ne garde que les flux qui répondent
        const all = data.channels || [];
        const validated = [];
        
        // On traite en parallèle pour aller vite
        await Promise.all(all.map(async (c) => {
            try {
                const check = await fetch(c.url, { method: 'HEAD', signal: AbortSignal.timeout(1500) });
                if (check.ok) validated.push(c);
            } catch {}
        }));

        cachedData = validated;
        lastFetch = Date.now();
        res.status(200).json(validated);
    } catch (e) {
        res.status(500).json({ error: "Serveur occupé" });
    }
}
