export const formKeys = {
  phone: {
    label: 'auth.phoneLabel',
    placeholder: 'auth.phonePlaceholder',
    hint: 'auth.phoneHint',
  },
  email: {
    label: 'auth.emailLabel',
    placeholder: 'auth.emailPlaceholder',
  },
  otp: {
    label: 'auth.otpLabel',
    placeholder: 'auth.otpPlaceholder',
    instructions: 'auth.otpInstructions',
  },
  title: 'fundraiser.projectTitle',
  category: 'fundraiser.category',
  location: 'fundraiser.location',
  story: 'fundraiser.story',
  goalAmount: 'fundraiser.targetGoal',
  beneficiaries: 'fundraiser.beneficiaries',
  impactMetric: 'fundraiser.impactMetric',
} as const;
