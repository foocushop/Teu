export default async function handler(req, res) {
    const API_SOURCE = "https://api.cdnlivetv.tv/api/v1/channels/?user=cdnlivetv&plan=free";
    
    try {
        const response = await fetch(API_SOURCE);
        const data = await response.json();
        
        // On vérifie les 20 premiers pour ne pas saturer le serveur
        const tests = await Promise.all(data.channels.slice(0, 20).map(async (c) => {
            try {
                const check = await fetch(c.url, { method: 'HEAD' });
                return check.ok ? c : null;
            } catch { return null; }
        }));
        
        res.status(200).json(tests.filter(c => c !== null));
    } catch {
        res.status(500).json({ error: "API indisponible" });
    }
}
