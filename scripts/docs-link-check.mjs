import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const docsRoot = path.join(root, 'docs');
const reportPath = path.join(docsRoot, 'reviews', 'analise-governanca-estrutura-2025-12-19', 'DOCS_LINK_CHECK.md');

const externalSchemeRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

const toPosix = (value) => value.split(path.sep).join('/');

const listMarkdownFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
};

const normalizeAnchor = (text) => {
  const normalized = text.trim().toLowerCase().normalize('NFKC');
  const cleaned = normalized
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned;
};

const extractAnchors = (content) => {
  const anchors = new Map();
  const lines = content.split(/\r?\n/);
  let inCodeFence = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;
    const match = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (!match) continue;
    const rawHeading = match[2].trim();
    const base = normalizeAnchor(rawHeading);
    if (!base) continue;
    const count = anchors.get(base) ?? 0;
    anchors.set(base, count + 1);
  }

  const anchorSet = new Set();
  for (const [base, count] of anchors.entries()) {
    anchorSet.add(base);
    for (let i = 1; i < count; i += 1) {
      anchorSet.add(`${base}-${i}`);
    }
  }
  return anchorSet;
};

const anchorCache = new Map();
const getAnchorsForFile = async (filePath) => {
  if (anchorCache.has(filePath)) return anchorCache.get(filePath);
  const content = await fs.readFile(filePath, 'utf8');
  const anchors = extractAnchors(content);
  anchorCache.set(filePath, anchors);
  return anchors;
};

const extractLinks = (content) => {
  const links = [];
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const fullMatchIndex = match.index;
    if (fullMatchIndex > 0 && content[fullMatchIndex - 1] === '!') {
      continue; // ignore images
    }
    links.push(match[2]);
  }
  return links;
};

const main = async () => {
  const mdFiles = await listMarkdownFiles(docsRoot);
  const results = [];
  const broken = [];

  for (const file of mdFiles) {
    const content = await fs.readFile(file, 'utf8');
    const links = extractLinks(content);
    for (const link of links) {
      if (!link) continue;
      if (link.startsWith('#')) {
        const anchor = link.slice(1);
        if (!anchor) continue;
        const anchors = await getAnchorsForFile(file);
        const exists = anchors.has(normalizeAnchor(anchor));
        const record = {
          file,
          link,
          resolved: `${file}#${anchor}`,
          exists,
          reason: exists ? null : 'missing-anchor'
        };
        results.push(record);
        if (!exists) broken.push(record);
        continue;
      }

      if (externalSchemeRegex.test(link) || link.startsWith('/') || link.startsWith('//')) {
        continue;
      }

      const [pathPart, hashPart] = link.split('#');
      if (!pathPart) continue;

      const resolvedPath = path.resolve(path.dirname(file), pathPart);
      let exists = false;
      let stat;
      try {
        stat = await fs.stat(resolvedPath);
        exists = true;
      } catch {
        exists = false;
      }

      let anchorOk = true;
      let reason = null;
      if (!exists) {
        anchorOk = false;
        reason = 'missing-target';
      } else if (hashPart) {
        if (!stat.isFile() || path.extname(resolvedPath).toLowerCase() !== '.md') {
          anchorOk = false;
          reason = 'anchor-on-non-md';
        } else {
          const anchors = await getAnchorsForFile(resolvedPath);
          const normalized = normalizeAnchor(hashPart);
          anchorOk = anchors.has(normalized);
          if (!anchorOk) reason = 'missing-anchor';
        }
      }

      const record = {
        file,
        link,
        resolved: resolvedPath,
        exists: exists && anchorOk,
        reason
      };
      results.push(record);
      if (!record.exists) broken.push(record);
    }
  }

  const lines = [];
  const now = new Date();
  lines.push('# Relatório de Verificação de Links da Documentação');
  lines.push('');
  lines.push(`Data: ${now.toISOString().slice(0, 19).replace('T', ' ')}`);
  lines.push('');
  lines.push(`Total de links verificados: ${results.length}`);
  lines.push(`Links quebrados: ${broken.length}`);
  lines.push('');

  if (broken.length === 0) {
    lines.push('**Nenhum link relativo quebrado encontrado.**');
  } else {
    lines.push('## Links Quebrados');
    lines.push('');
    for (const b of broken) {
      const relPath = toPosix(path.relative(root, b.file));
      const resolved = b.resolved ? toPosix(path.relative(root, b.resolved)) : '';
      lines.push(`- [${relPath}] link: "${b.link}" → resolved: "${resolved}" (${b.reason})`);
    }
  }

  lines.push('');
  lines.push('## Amostra de Links Verificados');
  lines.push('');
  const sample = results.slice(0, 200);
  for (const r of sample) {
    const relPath = toPosix(path.relative(root, r.file));
    lines.push(`- [${relPath}] → "${r.link}" → ${r.exists ? 'OK' : 'BROKEN'}`);
  }

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${lines.join('\n')}\n`, 'utf8');

  if (broken.length > 0) {
    console.error(`Link-check encontrou ${broken.length} link(s) quebrado(s).`);
    process.exit(1);
  }
  console.log(`OK: ${results.length} links verificados. Relatório em ${reportPath}`);
};

main().catch((error) => {
  console.error('Erro ao executar link-check:', error);
  process.exit(1);
});
