import { youtubeSearchRequest } from "./【 UTILS 】/youtube-fetch.js";

// Troque por qualquer termo que você quiser testar
const termo = "gatinhos";

youtubeSearchRequest(termo)
  .then(data => {
    console.log("🔍 Keys de `contents`:", Object.keys(data.contents || {}));
    console.log("\n🧩 Primeiras linhas do JSON:");
    console.log(JSON.stringify(data, null, 2).slice(0, 5000)); // só pra não explodir o terminal

    // Salvar arquivo pra analisar depois
    import("node:fs").then(fs => {
      fs.writeFileSync(`debug-${termo}.json`, JSON.stringify(data, null, 2));
      console.log(`\n📂 Arquivo salvo: debug-${termo}.json`);
    });

  })
  .catch(err => {
    console.error("❌ Erro na busca:", err.message);
  });