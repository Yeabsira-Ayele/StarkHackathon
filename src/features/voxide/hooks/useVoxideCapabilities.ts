import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { voxideClient } from '../api/voxide.client';
import { useCampaignStore } from '../../campaigns/store/campaign.store';
import { changeLanguage } from '../../../i18n/index.ts';

/**
 * Registers application-specific voice capabilities into VoxideClient:
 * 1. goToPage: Navigate to routes/views
 * 2. filterCampaigns: Filter causes by category (medical, education, emergency, community)
 * 3. changeLanguage: Switch language between Amharic and English
 * 4. startDonation: Initiate pledge flow with dangerous: true (requires user confirmation)
 */
export function useVoxideCapabilities() {
  const { t, i18n } = useTranslation();
  const setSelectedCategory = useCampaignStore((state) => state.setSelectedCategory);

  useEffect(() => {
    voxideClient.register({
      goToPage: {
        description: t(
          'voxide.capabilities.goToPage.description'
        ),
        params: {
          page: {
            type: 'string',
            required: true,
            description:
              'Destination page or route (e.g. campaigns, explore, detail, create, admin, donor_dashboard, foundation_dashboard)',
          },
        },
        handler: async ({ page }: { page?: string }) => {
          const target = (page || 'campaigns').trim().toLowerCase();
          window.dispatchEvent(
            new CustomEvent('voxide:navigate', { detail: { page: target } })
          );
          return {
            status: 'ok',
            page: target,
            message: t('voxide.messages.navigated', { page: target }),
          };
        },
      },
      filterCampaigns: {
        description: t(
          'voxide.capabilities.filterCampaigns.description'
        ),
        params: {
          category: {
            type: 'string',
            required: true,
            enum: ['medical', 'education', 'emergency', 'community'],
            description:
              'Sector category identifier (medical, education, emergency, community)',
          },
        },
        handler: async ({ category }: { category?: string }) => {
          const cat = category?.toLowerCase();
          if (
            cat === 'medical' ||
            cat === 'education' ||
            cat === 'emergency' ||
            cat === 'community'
          ) {
            setSelectedCategory(cat);
            window.dispatchEvent(
              new CustomEvent('voxide:navigate', { detail: { page: 'campaigns' } })
            );
            return {
              status: 'ok',
              category: cat,
              message: t('voxide.messages.filtered', { category: cat }),
            };
          }
          return {
            status: 'error',
            message: t(
              'voxide.messages.invalidCategory'
            ),
          };
        },
      },
      changeLanguage: {
        description: t(
          'voxide.capabilities.changeLanguage.description'
        ),
        params: {
          language: {
            type: 'string',
            required: true,
            enum: ['am', 'en'],
            description: 'Language code: am for Amharic or en for English',
          },
        },
        handler: async ({ language }: { language?: string }) => {
          const lang = language?.toLowerCase();
          if (lang === 'am' || lang === 'en') {
            await changeLanguage(lang);
            window.dispatchEvent(
              new CustomEvent('voxide:language', { detail: { language: lang } })
            );
            return {
              status: 'ok',
              language: lang,
              message: t('voxide.messages.languageChanged', { language: lang }),
            };
          }
          return {
            status: 'error',
            message: t(
              'voxide.messages.invalidLanguage'
            ),
          };
        },
      },
      startDonation: {
        description: t(
          'voxide.capabilities.startDonation.description'
        ),
        dangerous: true,
        params: {
          amount: {
            type: 'number',
            required: true,
            description: 'Donation amount in Ethiopian Birr (ETB)',
          },
          campaignId: {
            type: 'string',
            description: 'Campaign identifier to support',
          },
          donorName: {
            type: 'string',
            description: 'Donor name or patron alias',
          },
          paymentRail: {
            type: 'string',
            enum: ['telebirr', 'cbe_birr', 'bank_card', 'chapa'],
            description: 'Payment clearing rail (telebirr, cbe_birr, bank_card, chapa)',
          },
        },
        handler: async ({
          amount,
          campaignId,
          donorName,
          paymentRail = 'telebirr',
        }: {
          amount?: number;
          campaignId?: string;
          donorName?: string;
          paymentRail?: string;
        }) => {
          const amt = Number(amount) || 100;
          window.dispatchEvent(
            new CustomEvent('voxide:start_donation', {
              detail: {
                amount: amt,
                campaignId,
                donorName: donorName || 'Anonymous Patron',
                paymentRail,
              },
            })
          );
          return {
            status: 'ok',
            amount: amt,
            campaignId,
            message: t('voxide.messages.donationInitiated', { amount: amt }),
          };
        },
      },
    });

    return () => {
      voxideClient.unregister('goToPage');
      voxideClient.unregister('filterCampaigns');
      voxideClient.unregister('changeLanguage');
      voxideClient.unregister('startDonation');
    };
  }, [i18n, i18n.language, setSelectedCategory, t]);
}
