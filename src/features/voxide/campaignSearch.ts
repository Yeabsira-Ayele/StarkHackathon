import type { Campaign } from '../../types/index.ts';

/**
 * Small, dependency-free helpers the voice capabilities use to understand
 * what the user means ("the cardiac surgery one", "something for schools").
 */

const STOPWORDS = new Set([
  'the', 'a', 'an', 'for', 'to', 'of', 'in', 'on', 'at', 'and', 'or', 'me', 'my', 'i',
  'is', 'are', 'any', 'some', 'show', 'find', 'search', 'look', 'want', 'help', 'campaign',
  'campaigns', 'cause', 'causes', 'fundraiser', 'fundraisers', 'please', 'about', 'with',
  'that', 'this', 'one', 'can', 'you', 'give', 'open', 'tell', 'need',
]);

// Words people say that point to a category even when the title never says it.
const CATEGORY_HINTS: Record<string, string[]> = {
  medical: ['health', 'hospital', 'surgery', 'cancer', 'heart', 'cardiac', 'treatment', 'medicine', 'patient', 'doctor', 'clinic', 'ሕክምና', 'ጤና'],
  education: ['school', 'student', 'scholarship', 'book', 'learning', 'teacher', 'stem', 'university', 'ትምህርት'],
  emergency: ['flood', 'fire', 'drought', 'disaster', 'relief', 'refugee', 'famine', 'urgent', 'ድንገተኛ'],
  community: ['water', 'village', 'road', 'church', 'mosque', 'neighborhood', 'neighbourhood', 'ማህበረሰብ'],
};

function stem(word: string): string {
  return word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word;
}

export function tokenize(text?: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

export function scoreCampaign(c: Campaign, tokens: string[]): number {
  const title = (c.title || '').toLowerCase();
  const story = (c.story || '').toLowerCase();
  const location = (c.location || '').toLowerCase();
  const org = (c.organizationName || c.creatorName || '').toLowerCase();
  const category = String(c.category || '').toLowerCase();

  let score = 0;
  for (const t of tokens) {
    if (title.includes(t)) score += 3;
    if (category === t) score += 2;
    if (location.includes(t)) score += 2;
    if (org.includes(t)) score += 1;
    if (story.includes(t)) score += 1;
    const hinted = CATEGORY_HINTS[category];
    if (hinted && hinted.some((h) => stem(h) === t)) score += 2;
  }
  return score;
}

export interface SearchOptions {
  query?: string;
  category?: string;
  location?: string;
}

export function searchCampaigns(campaigns: Campaign[], opts: SearchOptions): Campaign[] {
  let list = campaigns;

  if (opts.category) {
    const cat = opts.category.toLowerCase();
    list = list.filter((c) => String(c.category).toLowerCase() === cat);
  }
  if (opts.location) {
    const loc = opts.location.toLowerCase();
    list = list.filter((c) => (c.location || '').toLowerCase().includes(loc));
  }

  const tokens = tokenize(opts.query);
  if (tokens.length === 0) return list;

  return list
    .map((c) => ({ c, s: scoreCampaign(c, tokens) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c);
}

export type ResolveResult =
  | { kind: 'found'; campaign: Campaign }
  | { kind: 'ambiguous'; candidates: Campaign[] }
  | { kind: 'none' };

/** Turn "id or a spoken title" into one campaign, or tell the caller it is unclear. */
export function resolveCampaign(
  campaigns: Campaign[],
  ref: { id?: string; title?: string }
): ResolveResult {
  if (ref.id) {
    const byId = campaigns.find((c) => c.id === ref.id);
    if (byId) return { kind: 'found', campaign: byId };
  }
  const spoken = (ref.title || ref.id || '').trim();
  if (!spoken) return { kind: 'none' };

  const lower = spoken.toLowerCase();
  const serial = campaigns.find((c) => (c.serialCode || '').toLowerCase() === lower);
  if (serial) return { kind: 'found', campaign: serial };

  const exact = campaigns.find((c) => (c.title || '').toLowerCase() === lower);
  if (exact) return { kind: 'found', campaign: exact };

  const tokens = tokenize(spoken);
  if (tokens.length === 0) return { kind: 'none' };

  const ranked = campaigns
    .map((c) => ({ c, s: scoreCampaign(c, tokens) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  if (ranked.length === 0) return { kind: 'none' };
  if (ranked.length === 1 || ranked[0].s >= ranked[1].s * 1.5) {
    return { kind: 'found', campaign: ranked[0].c };
  }
  return { kind: 'ambiguous', candidates: ranked.slice(0, 3).map((x) => x.c) };
}

export function summarize(c: Campaign) {
  const goal = Number(c.goalAmount) || 0;
  const raised = Number(c.raisedAmount) || 0;
  return {
    id: c.id,
    title: c.title,
    category: c.category,
    location: c.location,
    organization: c.organizationName || c.creatorName,
    status: c.status,
    goalETB: goal,
    raisedETB: raised,
    remainingETB: Math.max(goal - raised, 0),
    percentFunded: goal > 0 ? Math.round((raised / goal) * 100) : 0,
    donorsCount: c.donationsCount ?? (c.donations ? c.donations.length : 0),
  };
}

export function detail(c: Campaign) {
  return {
    ...summarize(c),
    serialCode: c.serialCode,
    verifiedOrganization: !!c.verifiedOrganization,
    impact: c.impactMetric,
    story: (c.story || '').slice(0, 700),
    latestUpdates: (c.updates || []).slice(0, 3).map((u) => ({
      title: u.title,
      content: (u.content || '').slice(0, 200),
      date: u.createdAt,
    })),
  };
}
