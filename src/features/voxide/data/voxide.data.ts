import { VoicePromptPreset } from '../types/voxide.types';

export const VOXIDE_PRESET_PROMPTS: VoicePromptPreset[] = [
  {
    id: 'p1',
    intent: 'donate',
    text: {
      am: 'ለህጻን ቤተልሔም የልብ ህክምና 1000 ብር በቴሌብር መለገስ እፈልጋለሁ',
      en: 'I want to donate 1,000 Birr to Bethlehem cardiac surgery via Telebirr',
      om: 'Yaala onnee intala Beetaliheemitiif 1000 Birrii Telebirr dhaan gumaachuu barbaada',
    },
  },
  {
    id: 'p2',
    intent: 'create_campaign',
    text: {
      am: 'ለገጠር ትምህርት ቤቶች የኮምፒውተር ቤተ-ሙከራ ማደራጃ አዲስ የልገሳ ምክንያት መክፈት እፈልጋለሁ',
      en: 'I want to create a fundraiser for a rural school STEM computer lab',
      om: 'Manni barumsaa baadiyyaa laabii kompiitaraa akka argatu gumaacha haaraa banuu barbaada',
    },
  },
  {
    id: 'p3',
    intent: 'search_campaigns',
    text: {
      am: 'በአዲስ አበባ ያሉ የጤና እና የህክምና ድጋፍ ምክንያቶችን አሳየኝ',
      en: 'Show me urgent healthcare and surgery campaigns in Addis Ababa',
      om: 'Pirojektota yaala fayyaa Finfinnee jiran na agarsiisi',
    },
  },
];
