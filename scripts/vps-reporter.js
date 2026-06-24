const os = require('os');
const { execSync } = require('child_process');

const PAINEL_INGEST_URL = process.env.PAINEL_INGEST_URL || 'http://localhost:9100/api/telemetry-ingest';
const ADMIN_KEY = process.env.CENTRALDARK_ADMIN_KEY || 'segredo_obraFullAdmin';
const INTERVALO_MS = 5000;

console.log('===================================================');
console.log('🚀 Agente de Telemetria CentralDark Iniciado');
console.log('📡 Alvo: ' + PAINEL_INGEST_URL);
console.log('===================================================');

function getCpuLoad() {
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;
    for(let i = 0, len = cpus.length; i < len; i++) {
        let cpu = cpus[i];
        for(let type in cpu.times) { totalTick += cpu.times[type]; }     
        totalIdle += cpu.times.idle;
    }
    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

let startMeasure = getCpuLoad();

async function coletarEEnviar() {
    try {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const ramPercent = ((usedMem / totalMem) * 100).toFixed(1);

        const endMeasure = getCpuLoad();
        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;
        const cpuPercent = (100 - ~~(100 * idleDifference / totalDifference)).toFixed(1);
        startMeasure = endMeasure;

        let diskPercent = "0.0";
        try {
            const df = execSync("df -h / | tail -1 | awk '{print $5}'").toString().trim();
            diskPercent = df.replace('%', '');
        } catch (e) {
            diskPercent = "N/A";
        }

        const loadAvg = os.loadavg().map(n => n.toFixed(2)).join(' / ');
        const brtTime = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'medium' }).format(new Date());

        const payload = {
            cpu: `${cpuPercent}%`,
            ram: `${(usedMem / 1024 / 1024 / 1024).toFixed(1)}GB / ${(totalMem / 1024 / 1024 / 1024).toFixed(1)}GB`,
            ramPercent: ramPercent,
            disco: `${diskPercent}%`,
            load: loadAvg,
            timestamp: new Date().toISOString(),
            brtTimestamp: brtTime
        };

        let response;
        try {
            response = await fetch(PAINEL_INGEST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ADMIN_KEY}` },
                body: JSON.stringify(payload)
            });
        } catch (fetchError) {
            response = { ok: false, status: 'Backend Indisponível' };
        }

        if (!response.ok) {
            console.log(`[${brtTime}] ⏳ A aguardar Painel (Codex a codificar endpoint) -> CPU: ${payload.cpu} | RAM: ${payload.ramPercent}%`);
        } else {
            console.log(`[${brtTime}] ✅ Sucesso! Telemetria injetada no Mega Painel -> CPU: ${payload.cpu}`);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Erro interno:`, error.message);
    }
}

setInterval(coletarEEnviar, INTERVALO_MS);
coletarEEnviar();
