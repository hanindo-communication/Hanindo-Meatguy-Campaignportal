const fs = require('fs');
const path = require('path');

/** Top-level folder names like 202604 (YYYYMM) */
const CAMPAIGN_MONTH_DIR = /^\d{6}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function yyyymmLabel(yyyymm) {
  const y = parseInt(yyyymm.slice(0, 4), 10);
  const m = parseInt(yyyymm.slice(4, 6), 10);
  if (
    Number.isNaN(y) ||
    Number.isNaN(m) ||
    m < 1 ||
    m > 12 ||
    yyyymm.length !== 6
  ) {
    return yyyymm;
  }
  return `${MONTHS[m - 1]} ${y}`;
}

function titleCaseSlug(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function readDisplayName(landingDir) {
  const metaPath = path.join(landingDir, 'meta.json');
  try {
    const raw = fs.readFileSync(metaPath, 'utf8');
    const meta = JSON.parse(raw);
    if (meta && typeof meta.displayName === 'string' && meta.displayName.trim())
      return meta.displayName.trim();
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * @param {string} publicDir absolute path to public/
 * @returns {{ groups: Array<{ yyyymm: string, label: string, pages: Array<{ slug: string, path: string, displayName: string }> }> }}
 */
function discoverLandings(publicDir) {
  /** @type {Map<string, Array<{ slug: string, path: string, displayName: string }>>} */
  const byMonth = new Map();

  let entries;
  try {
    entries = fs.readdirSync(publicDir, { withFileTypes: true });
  } catch {
    return { groups: [] };
  }

  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const yyyymm = ent.name;
    if (!CAMPAIGN_MONTH_DIR.test(yyyymm)) continue;

    const monthPath = path.join(publicDir, yyyymm);
    let slugs;
    try {
      slugs = fs.readdirSync(monthPath, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const slugEnt of slugs) {
      if (!slugEnt.isDirectory()) continue;
      const slug = slugEnt.name;
      if (!SLUG.test(slug)) continue;

      const landingDir = path.join(monthPath, slug);
      const indexHtml = path.join(landingDir, 'index.html');
      if (!fs.existsSync(indexHtml)) continue;

      const displayName =
        readDisplayName(landingDir) || titleCaseSlug(slug);
      const page = {
        slug,
        path: `/${yyyymm}/${slug}`,
        displayName,
      };

      if (!byMonth.has(yyyymm)) byMonth.set(yyyymm, []);
      byMonth.get(yyyymm).push(page);
    }
  }

  const sortedMonths = [...byMonth.keys()].sort((a, b) => b.localeCompare(a));

  const groups = sortedMonths.map((yyyymm) => {
    const pages = (byMonth.get(yyyymm) || []).sort((p, q) =>
      p.slug.localeCompare(q.slug)
    );
    return {
      yyyymm,
      label: yyyymmLabel(yyyymm),
      pages,
    };
  });

  return { groups };
}

module.exports = { discoverLandings, yyyymmLabel };
