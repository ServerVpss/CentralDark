const fs = require("fs");
const { execSync } = require("child_process");

const top30 = JSON.parse(fs.readFileSync("top30.json"));
const token = process.env.GH_TOKEN;
const repo = "ServerVpss/CentralDark1VPS";

const results = [];

for (const file of top30) {
    try {
        const url = `https://api.github.com/repos/${repo}/contents/${file.path}`;
        const cmd = `curl -s -H "Authorization: token ${token}" -H "Accept: application/vnd.github.v3.raw" "${url}" | head -n 1`;
        const firstLine = execSync(cmd).toString().trim();
        
        results.push({
            path: file.path,
            size: (file.size / 1024).toFixed(2) + " KB",
            description: firstLine || "(Vazio ou binário)"
        });
    } catch (e) {
        results.push({
            path: file.path,
            size: (file.size / 1024).toFixed(2) + " KB",
            description: "Erro ao buscar"
        });
    }
}

console.log(JSON.stringify(results, null, 2));
