import { Campaign, CampaignCategory } from '../../types/index.ts';

export interface VoxideExtraction {
  intent: 'create_campaign' | 'donate' | 'search' | 'unknown';
  campaignData?: {
    title: string;
    story: string;
    goalAmount: number;
    category: CampaignCategory;
    creatorName?: string;
  };
  donationData?: {
    matchedCampaignId?: string;
    matchedCampaignTitle?: string;
    amount: number;
    donorName?: string;
    message?: string;
  };
  confidence: number;
  spokenText: string;
  statusMessage: string;
}

// Helper to extract numbers from spoken phrases (e.g., "500", "5 thousand", "150,000 birr")
export function extractBirrAmount(text: string): number | null {
  const clean = text.toLowerCase().replace(/,/g, '');
  
  // Match "X thousand"
  const thousandMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k)/i);
  if (thousandMatch) {
    return Math.round(parseFloat(thousandMatch[1]) * 1000);
  }

  // Match numbers followed by birr or etb
  const birrMatch = clean.match(/(\d+)\s*(?:birr|etb|dollars|\$)?/i);
  if (birrMatch) {
    const val = parseInt(birrMatch[1], 10);
    if (!isNaN(val) && val > 0) return val;
  }

  // Match any standalone positive number >= 10
  const anyNumber = clean.match(/\b(\d{2,8})\b/);
  if (anyNumber) {
    return parseInt(anyNumber[1], 10);
  }

  return null;
}

// Helper to detect category from text
export function detectCategory(text: string): CampaignCategory {
  const lower = text.toLowerCase();
  if (lower.includes('medic') || lower.includes('surger') || lower.includes('health') || lower.includes('clinic') || lower.includes('hospital') || lower.includes('doctor') || lower.includes('oxygen')) {
    return 'medical';
  }
  if (lower.includes('school') || lower.includes('educat') || lower.includes('student') || lower.includes('book') || lower.includes('teacher') || lower.includes('lab') || lower.includes('stem')) {
    return 'education';
  }
  if (lower.includes('emergenc') || lower.includes('flood') || lower.includes('fire') || lower.includes('water') || lower.includes('disaster') || lower.includes('urgent')) {
    return 'emergency';
  }
  if (lower.includes('business') || lower.includes('craft') || lower.includes('shop') || lower.includes('weaver') || lower.includes('artisan') || lower.includes('market') || lower.includes('coop')) {
    return 'business';
  }
  return 'other';
}

export const voxideService = {
  // Parse spoken command into structured VoxideExtraction
  parseSpokenIntent(spokenText: string, availableCampaigns: Campaign[] = []): VoxideExtraction {
    const text = spokenText.trim();
    const lower = text.toLowerCase();

    // Intent 1: Create Campaign
    if (
      lower.startsWith('create') ||
      lower.startsWith('start') ||
      lower.startsWith('new campaign') ||
      lower.includes('create a campaign') ||
      lower.includes('start a fundraiser')
    ) {
      const category = detectCategory(lower);
      const goal = extractBirrAmount(lower) || 50000;

      // Extract a meaningful title from the speech
      let extractedTitle = text
        .replace(/^(please\s+)?(create|start|launch)(\s+a)?(\s+campaign|\s+fundraiser)?(\s+for)?/i, '')
        .trim();
      
      // Clean up trailing clauses like "with goal of 50000 birr"
      extractedTitle = extractedTitle.replace(/(with\s+a?\s*goal\s*(of)?|goal\s*(is)?|in\s+category).*$/i, '').trim();
      if (!extractedTitle || extractedTitle.length < 5) {
        extractedTitle = 'Urgent Community Support Initiative';
      }

      // Capitalize title
      const title = extractedTitle.charAt(0).toUpperCase() + extractedTitle.slice(1);
      const story = `Community-led initiative organized to provide essential assistance. ${text}`;

      return {
        intent: 'create_campaign',
        campaignData: {
          title,
          story,
          goalAmount: goal,
          category,
          creatorName: 'Community Organizer',
        },
        confidence: 0.94,
        spokenText: text,
        statusMessage: `Voxide parsed campaign creation: "${title}" with goal of ${goal.toLocaleString()} ETB.`,
      };
    }

    // Intent 2: Donate
    if (
      lower.startsWith('donate') ||
      lower.startsWith('give') ||
      lower.startsWith('send') ||
      lower.startsWith('contribute') ||
      lower.includes('donate') ||
      lower.includes('birr to')
    ) {
      const amount = extractBirrAmount(lower) || 500;
      
      // Match against available campaigns
      let matchedCampaign: Campaign | undefined;
      for (const camp of availableCampaigns) {
        const titleWords = camp.title.toLowerCase().split(/\s+/);
        const nameKeywords = [
          'bethlehem',
          'surgery',
          'hawassa',
          'school',
          'water',
          'shewa',
          'weavers',
          'gulele',
          'woliso',
          'clinic',
          'oxygen',
        ];

        // Check if user mentioned specific campaign keywords
        for (const kw of nameKeywords) {
          if (lower.includes(kw) && camp.title.toLowerCase().includes(kw)) {
            matchedCampaign = camp;
            break;
          }
        }
        if (matchedCampaign) break;

        // Check general title word matches
        const matches = titleWords.filter((w) => w.length > 3 && lower.includes(w));
        if (matches.length >= 2) {
          matchedCampaign = camp;
          break;
        }
      }

      // If no campaign matched, pick the first approved campaign as default candidate
      if (!matchedCampaign && availableCampaigns.length > 0) {
        matchedCampaign = availableCampaigns[0];
      }

      // Extract donor name if provided: e.g. "from Dawit" or "by Selam"
      let donorName = 'Anonymous';
      const fromMatch = text.match(/(?:from|by|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (fromMatch) {
        donorName = fromMatch[1].trim();
      }

      // Extract message if provided: e.g. "with message May God heal her"
      let message = 'Sent via Voxide Voice';
      const msgMatch = text.match(/(?:with\s+message|saying|note)\s+['"]?([^'"]+)['"]?/i);
      if (msgMatch) {
        message = msgMatch[1].trim();
      }

      return {
        intent: 'donate',
        donationData: {
          matchedCampaignId: matchedCampaign?.id,
          matchedCampaignTitle: matchedCampaign?.title || 'Community Campaign',
          amount,
          donorName,
          message,
        },
        confidence: matchedCampaign ? 0.96 : 0.75,
        spokenText: text,
        statusMessage: matchedCampaign
          ? `Prepared donation of ${amount.toLocaleString()} ETB for "${matchedCampaign.title}". Confirmation required.`
          : `Amount: ${amount.toLocaleString()} ETB. Please choose target campaign.`,
      };
    }

    // Default intent
    return {
      intent: 'unknown',
      confidence: 0.4,
      spokenText: text,
      statusMessage: 'Could not automatically identify campaign action. Try: "Donate 500 birr to surgery" or "Create a campaign for..."',
    };
  },

  // Voice synthesis feedback
  speakFeedback(message: string): void {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Graceful fallback if speech synthesis is disabled or blocked
    }
  },
};
