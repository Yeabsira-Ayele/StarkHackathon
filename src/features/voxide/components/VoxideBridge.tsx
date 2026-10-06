import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { voxideClient } from '../api/voxide.client';
import { VoxideAssistant } from './VoxideAssistant';
import { campaignApi } from '../../../services/api/campaignApi.ts';
import { changeLanguage } from '../../../i18n/index.ts';
import type { Campaign } from '../../../types/index.ts';
import { searchCampaigns, resolveCampaign, summarize, detail, tokenize } from '../campaignSearch.ts';

/**
 * Mounted ONCE at the top of the app (inside BrowserRouter, outside <Routes>),
 * so the voice assistant and its actions stay alive on every page.
 * It uses the real router, so "go to X" really changes the page.
 */

const PAGES: Record<string, string> = {
  home: '/',
  explore: '/discover',
  discover: '/discover',
  causes: '/discover',
  campaigns: '/discover',
  impact: '/impact',
  donations: '/contributions',
  my_donations: '/contributions',
  vault: '/contributions',
  my_contributions: '/contributions',
  create: '/fundraise',
  fundraise: '/fundraise',
  my_fundraisers: '/fundraise',
  my_campaigns: '/fundraise',
  drafts: '/fundraise',
  start_fundraiser: '/fundraise',
  profile: '/profile',
  reports: '/reports',
  login: '/login',
  signup: '/signup',
  foundation: '/foundation',
  admin: '/admin',
  register_organization: '/organizations/register',
};

type CauseLite = { id: string; title: string; category?: string };

export function VoxideBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const causesRef = useRef<CauseLite[]>([]);
  const campaignsRef = useRef<Campaign[]>([]);
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  // Load the list of causes so the voice agent can find them by name.
  useEffect(() => {
    let alive = true;
    campaignApi
      .getCampaigns()
      .then((list) => {
        if (alive) {
          campaignsRef.current = list;
          causesRef.current = list.map((c: any) => ({
            id: String(c.id),
            title: String(c.title || ''),
            category: c.category,
          }));
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const findCause = (query?: string): CauseLite | undefined => {
      const list = causesRef.current;
      if (query) {
        const q = query.trim().toLowerCase();
        // Smarter match first ("the cardiac one", serial code, partial words)
        const smart = resolveCampaign(campaignsRef.current, { id: query, title: query });
        if (smart.kind === 'found') {
          return { id: smart.campaign.id, title: smart.campaign.title, category: smart.campaign.category };
        }
        const exact = list.find((c) => c.id === query || c.title.toLowerCase() === q);
        if (exact) return exact;
        const partial = list.find((c) => c.title.toLowerCase().includes(q) || q.includes(c.title.toLowerCase()));
        if (partial) return partial;
        const words = q.split(/\s+/).filter((w) => w.length > 2);
        return list.find((c) => words.some((w) => c.title.toLowerCase().includes(w)));
      }
      // No name given: use the cause the user is already looking at
      const m = pathRef.current.match(/^\/(?:causes|campaigns|donations)\/([^/]+)/);
      if (m) return list.find((c) => c.id === m[1]) || { id: m[1], title: 'this cause' };
      return undefined;
    };

    voxideClient.register({
      goToPage: {
        description:
          'Open a page of the app. Use for: home, explore (browse causes), impact, my donations, start a fundraiser, my fundraisers / drafts, profile, reports, login, signup, foundation, admin, register organization.',
        params: {
          page: {
            type: 'string',
            required: true,
            enum: Object.keys(PAGES),
            description: 'Which page to open',
          },
        },
        handler: async ({ page }: { page?: string }) => {
          const key = (page || 'home').trim().toLowerCase().replace(/\s+/g, '_');
          const path = PAGES[key];
          if (!path) return { status: 'error', message: 'I do not know that page.' };
          navigate(path);
          return { status: 'ok', page: key };
        },
      },
      filterCauses: {
        description: 'Show causes of one category: medical, education, emergency or community.',
        params: {
          category: {
            type: 'string',
            required: true,
            enum: ['medical', 'education', 'emergency', 'community'],
            description: 'Category to show',
          },
        },
        handler: async ({ category }: { category?: string }) => {
          const cat = (category || '').toLowerCase();
          if (!['medical', 'education', 'emergency', 'community'].includes(cat)) {
            return { status: 'error', message: 'Choose medical, education, emergency or community.' };
          }
          navigate(`/discover?category=${cat}`);
          return { status: 'ok', category: cat };
        },
      },
      searchCauses: {
        description:
          'Find or browse causes by words, topic, place or need (for example "surgery", "schools", "Hawassa", "someone who needs heart treatment"). Returns the matching causes so you can read them out and offer to open one.',
        params: {
          query: { type: 'string', description: 'Words the user said' },
          category: {
            type: 'string',
            enum: ['medical', 'education', 'emergency', 'community'],
            description: 'Only if the user clearly named a category',
          },
        },
        handler: async ({ query, category }: { query?: string; category?: string }) => {
          const q = (query || '').trim();
          const cat = ['medical', 'education', 'emergency', 'community'].includes((category || '').toLowerCase())
            ? (category as string).toLowerCase()
            : undefined;
          if (!q && !cat) return { status: 'error', message: 'What should I search for?' };

          const results = searchCampaigns(campaignsRef.current, { query: q, category: cat });
          // The page search box matches plain words, so give it one word that really appears in a title.
          const top = results[0];
          const word = top ? tokenize(q).find((w) => top.title.toLowerCase().includes(w)) : undefined;
          const params = new URLSearchParams();
          if (cat) params.set('category', cat);
          params.set('q', word || '');
          navigate(`/discover?${params.toString()}`);

          return {
            status: 'ok',
            total: results.length,
            results: results.slice(0, 5).map(summarize),
            message:
              results.length === 0
                ? 'Nothing matched. Offer to show all causes or try other words.'
                : 'Read the top few results and ask which one to open.',
          };
        },
      },
      getCauseInfo: {
        description:
          'Read facts to ANSWER questions about a cause: goal, amount raised, how much is left, who runs it, where, story, updates, donors. If no cause is named, uses the one the user is viewing. With none at all, returns an overview of the platform. Answer only from the returned data.',
        params: {
          cause: { type: 'string', description: 'Name, id or serial code of the cause. Leave empty for the one on screen.' },
        },
        handler: async ({ cause }: { cause?: string }) => {
          const list = campaignsRef.current;
          if (!cause) {
            const here = findCause();
            const c = here && list.find((x) => x.id === here.id);
            if (c) return { status: 'ok', cause: detail(c) };
            const byCategory: Record<string, number> = {};
            list.forEach((x) => {
              byCategory[String(x.category)] = (byCategory[String(x.category)] || 0) + 1;
            });
            return {
              status: 'ok',
              overview: {
                activeCauses: list.length,
                totalRaisedETB: list.reduce((s, x) => s + (Number(x.raisedAmount) || 0), 0),
                byCategory,
                examples: list.slice(0, 3).map(summarize),
              },
            };
          }
          const r = resolveCampaign(list, { id: cause, title: cause });
          if (r.kind === 'found') return { status: 'ok', cause: detail(r.campaign) };
          if (r.kind === 'ambiguous') {
            return { status: 'ambiguous', message: 'More than one fits. Ask which one.', candidates: r.candidates.map(summarize) };
          }
          return { status: 'error', message: 'I could not find that cause.', availableCauses: list.slice(0, 8).map((x) => x.title) };
        },
      },
      startFundraiser: {
        description:
          'Start a new fundraiser. Opens the fundraising page (the user may need to sign in). If the user already said a title, goal or category, pass them so you can read them back.',
        params: {
          title: { type: 'string', description: 'Fundraiser title, if said' },
          goalAmount: { type: 'number', description: 'Goal in Ethiopian birr, if said' },
          category: { type: 'string', description: 'Category, if said' },
        },
        handler: async ({ title, goalAmount, category }: { title?: string; goalAmount?: number; category?: string }) => {
          navigate('/fundraise');
          return {
            status: 'ok',
            heardDetails: { title, goalAmount, category },
            message: 'The fundraising page is open. The form is not filled automatically, so read the details back and ask the user to enter them.',
          };
        },
      },
      showMyFundraisers: {
        description: 'Open the user\'s fundraising area: their fundraisers and drafts. Use for "my fundraisers", "my campaigns", "my drafts".',
        params: {},
        handler: async () => {
          navigate('/fundraise');
          return { status: 'ok', message: 'The fundraising area is open. The user may need to sign in first.' };
        },
      },
      openCause: {
        description: 'Open one cause (fundraiser) to read its story, by its name.',
        params: {
          cause: { type: 'string', required: true, description: 'Name or id of the cause' },
        },
        handler: async ({ cause }: { cause?: string }) => {
          const found = findCause(cause);
          if (!found) {
            return {
              status: 'error',
              message: 'I could not find that cause.',
              availableCauses: causesRef.current.slice(0, 8).map((c) => c.title),
            };
          }
          navigate(`/causes/${found.id}`);
          return { status: 'ok', opened: found.title };
        },
      },
      startDonation: {
        description:
          'Open the donation page for a cause with an amount in birr already filled in. The user still reviews and completes the payment themselves.',
        params: {
          amount: { type: 'number', description: 'Donation amount in Ethiopian birr' },
          cause: {
            type: 'string',
            description: 'Name of the cause. If the user is already viewing a cause, leave empty.',
          },
        },
        handler: async ({ amount, cause }: { amount?: number; cause?: string }) => {
          const found = findCause(cause);
          if (!found) {
            return {
              status: 'error',
              message: 'Which cause do you want to donate to? Please tell me its name.',
              availableCauses: causesRef.current.slice(0, 8).map((c) => c.title),
            };
          }
          const amt = Number(amount);
          const qs = Number.isFinite(amt) && amt > 0 ? `?amount=${amt}` : '';
          navigate(`/donations/${found.id}${qs}`);
          return {
            status: 'ok',
            cause: found.title,
            amount: qs ? amt : null,
            message: 'Donation page is open. Please review it and complete the payment.',
          };
        },
      },
      changeLanguage: {
        description: 'Change the app language between Amharic (am) and English (en).',
        params: {
          language: { type: 'string', required: true, enum: ['am', 'en'], description: 'am or en' },
        },
        handler: async ({ language }: { language?: string }) => {
          const lang = (language || '').toLowerCase();
          if (lang !== 'am' && lang !== 'en') return { status: 'error', message: 'Choose am or en.' };
          await changeLanguage(lang);
          window.dispatchEvent(new CustomEvent('voxide:language', { detail: { language: lang } }));
          return { status: 'ok', language: lang };
        },
      },
    });

    // Tell the voice agent where the user is and which causes exist.
    (voxideClient as any).bindState?.(() => ({
      currentPath: pathRef.current,
      causes: campaignsRef.current.slice(0, 30).map(summarize),
    }));

    return () => {
      ['goToPage', 'filterCauses', 'searchCauses', 'getCauseInfo', 'startFundraiser', 'showMyFundraisers', 'openCause', 'startDonation', 'changeLanguage'].forEach((n) =>
        voxideClient.unregister(n)
      );
    };
  }, [navigate]);

  return <VoxideAssistant />;
}
