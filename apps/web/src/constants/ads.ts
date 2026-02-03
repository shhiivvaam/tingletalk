/**
 * Centralized Ad Configuration for TingleTalk
 * Management of all Adstersa and Google AdSense slots.
 */

export const AD_CONFIG = {
    ADSENSE_CLIENT: 'ca-pub-9299390652489427',

    // Adsterra Hashes/IDs
    ADSTERRA: {
        NATIVE_DEFAULT: 'f1ecdc5056db3521ecee075d39c94dca',
        SOCIAL_BAR: '2fbcd035290b7d3b8ce9a6a656d7edc6',
        POPUNDER: 'f6ec2f262184e8f9a191cb7befad4db0',
    },

    // AdSense Slots (Example placeholders - replace with real ones if needed)
    SLOTS: {
        HOMEPAGE_TOP: 'adsense_slot_id_1',
        HOMEPAGE_MID: 'adsense_slot_id_2',
        HOMEPAGE_BOTTOM: 'adsense_slot_id_3',
        CHAT_TOP: 'f1ecdc5056db3521ecee075d39c94dca', // Using adsterra for now
    }
};

export type AdProvider = 'adsense' | 'adsterra-native' | 'adsterra-direct';
export type AdFormat = 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'skyscraper';

export interface AdDimensions {
    minHeight: string;
    width: string;
}

export const AD_DIMENSIONS: Record<AdFormat, AdDimensions> = {
    auto: { minHeight: '250px', width: '100%' },
    rectangle: { minHeight: '280px', width: '100%' },
    horizontal: { minHeight: '90px', width: '100%' },
    vertical: { minHeight: '600px', width: '160px' },
    skyscraper: { minHeight: '600px', width: '300px' },
};
