#!/usr/bin/env node
// Valida e empacota cada skill de skill/<nome>/ em skill/<nome>.zip (formato do Agensi:
// uma pasta no topo com SKILL.md na raiz). Os zips são git-ignorados.
// Uso: node scripts/empacotar-skills.mjs [nome ...]   (sem argumentos: todas)
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "skill");
const nomes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(dir).filter((n) => statSync(path.join(dir, n)).isDirectory());

const arquivos = (d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? arquivos(path.join(d, e.name)) : [path.join(d, e.name)],
  );

let falhas = 0;
for (const nome of nomes.sort()) {
  const pasta = path.join(dir, nome);
  const problemas = [];
  const skillMd = path.join(pasta, "SKILL.md");
  if (!existsSync(skillMd)) problemas.push("sem SKILL.md");
  else {
    const texto = readFileSync(skillMd, "utf8");
    const fm = texto.match(/^---\n([\s\S]*?)\n---\n/);
    if (!fm) problemas.push("frontmatter YAML ausente");
    else {
      const nomeFm = fm[1].match(/^name:\s*(.+)$/m)?.[1].trim();
      const desc = fm[1].match(/^description:\s*(.+)$/m)?.[1].trim() ?? "";
      if (nomeFm !== nome) problemas.push(`name "${nomeFm}" diferente da pasta`);
      if (desc.length < 50 || desc.length > 1024) problemas.push(`description com ${desc.length} caracteres`);
      if (texto.slice(fm[0].length).trim().length < 500) problemas.push("instruções curtas demais");
    }
  }
  // Itens que a verificação de segurança do Agensi sinaliza.
  for (const f of arquivos(pasta)) {
    if (path.basename(f) === ".DS_Store") continue;
    const conteudo = readFileSync(f, "utf8");
    if (/https?:\/\/|localhost/.test(conteudo)) problemas.push(`${path.relative(pasta, f)}: contém URL`);
    if (/[A-Za-z0-9+/]{120,}={0,2}/.test(conteudo)) problemas.push(`${path.relative(pasta, f)}: bloco parecido com base64`);
  }
  if (problemas.length) {
    falhas++;
    console.log(`FALHA ${nome}: ${problemas.join("; ")}`);
    continue;
  }
  const zip = path.join(dir, `${nome}.zip`);
  rmSync(zip, { force: true });
  execFileSync("zip", ["-rqX", `${nome}.zip`, nome, "-x", "*.DS_Store"], { cwd: dir });
  console.log(`ok    ${nome}.zip (${(statSync(zip).size / 1024).toFixed(0)} KB)`);
}
if (falhas) process.exit(1);
