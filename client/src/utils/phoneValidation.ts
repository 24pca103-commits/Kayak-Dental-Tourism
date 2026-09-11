export interface CountryPhoneConfig {
  id: string;
  code: string;
  country: string;
  flag: string;
  digitLengths: number[];
  placeholder: string;
  example: string;
  hint: string;
  validate: (digits: string) => { isValid: boolean; error?: string };
}

export const COUNTRY_PHONE_LIST: CountryPhoneConfig[] = [
  {
    id: 'India',
    code: '+91',
    country: 'India',
    flag: '🇮🇳',
    digitLengths: [10],
    placeholder: '98765 43210',
    example: '98765 43210',
    hint: '10 digits (starts with 6, 7, 8, or 9)',
    validate: (digits: string) => {
      if (digits.length !== 10) {
        return { isValid: false, error: 'India phone number must be exactly 10 digits.' };
      }
      if (!/^[6-9]\d{9}$/.test(digits)) {
        return { isValid: false, error: 'India mobile numbers must start with 6, 7, 8, or 9.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'USA',
    code: '+1',
    country: 'USA',
    flag: '🇺🇸',
    digitLengths: [10],
    placeholder: '202 555 0143',
    example: '202 555 0143',
    hint: '10 digits (3-digit Area Code + 7-digit Number)',
    validate: (digits: string) => {
      if (digits.length !== 10) {
        return { isValid: false, error: 'USA phone number must be exactly 10 digits (Area Code + 7-digit Number).' };
      }
      if (digits.startsWith('0') || digits.startsWith('1')) {
        return { isValid: false, error: 'USA area code cannot start with 0 or 1.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Canada',
    code: '+1',
    country: 'Canada',
    flag: '🇨🇦',
    digitLengths: [10],
    placeholder: '416 555 0199',
    example: '416 555 0199',
    hint: '10 digits (3-digit Area Code + 7-digit Number)',
    validate: (digits: string) => {
      if (digits.length !== 10) {
        return { isValid: false, error: 'Canada phone number must be exactly 10 digits.' };
      }
      if (digits.startsWith('0') || digits.startsWith('1')) {
        return { isValid: false, error: 'Canada area code cannot start with 0 or 1.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'UK',
    code: '+44',
    country: 'UK',
    flag: '🇬🇧',
    digitLengths: [10, 11],
    placeholder: '7911 123456',
    example: '7911 123456',
    hint: '10 or 11 digits (e.g. 7911 123456)',
    validate: (digits: string) => {
      if (digits.length < 10 || digits.length > 11) {
        return { isValid: false, error: 'UK phone number must be 10 or 11 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Australia',
    code: '+61',
    country: 'Australia',
    flag: '🇦🇺',
    digitLengths: [9],
    placeholder: '412 345 678',
    example: '412 345 678',
    hint: '9 digits (omit leading 0, e.g. 412 345 678)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'Australia phone number must be exactly 9 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'UAE',
    code: '+971',
    country: 'UAE',
    flag: '🇦🇪',
    digitLengths: [9],
    placeholder: '50 123 4567',
    example: '50 123 4567',
    hint: '9 digits (omit leading 0, mobile starts with 5)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'UAE phone number must be exactly 9 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Singapore',
    code: '+65',
    country: 'Singapore',
    flag: '🇸🇬',
    digitLengths: [8],
    placeholder: '8123 4567',
    example: '8123 4567',
    hint: '8 digits (starts with 8, 9, 6, or 3)',
    validate: (digits: string) => {
      if (digits.length !== 8) {
        return { isValid: false, error: 'Singapore phone number must be exactly 8 digits.' };
      }
      if (!/^[3689]\d{7}$/.test(digits)) {
        return { isValid: false, error: 'Singapore phone number must start with 3, 6, 8, or 9.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Malaysia',
    code: '+60',
    country: 'Malaysia',
    flag: '🇲🇾',
    digitLengths: [9, 10],
    placeholder: '12 345 6789',
    example: '12 345 6789',
    hint: '9 or 10 digits (omit leading 0)',
    validate: (digits: string) => {
      if (digits.length < 9 || digits.length > 10) {
        return { isValid: false, error: 'Malaysia phone number must be 9 or 10 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Saudi Arabia',
    code: '+966',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    digitLengths: [9],
    placeholder: '50 123 4567',
    example: '50 123 4567',
    hint: '9 digits (starts with 5)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'Saudi Arabia phone number must be exactly 9 digits.' };
      }
      if (!digits.startsWith('5')) {
        return { isValid: false, error: 'Saudi Arabia mobile numbers must start with 5.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Qatar',
    code: '+974',
    country: 'Qatar',
    flag: '🇶🇦',
    digitLengths: [8],
    placeholder: '3312 3456',
    example: '3312 3456',
    hint: '8 digits (starts with 3, 5, 6, 7)',
    validate: (digits: string) => {
      if (digits.length !== 8) {
        return { isValid: false, error: 'Qatar phone number must be exactly 8 digits.' };
      }
      if (!/^[3-7]\d{7}$/.test(digits)) {
        return { isValid: false, error: 'Qatar phone numbers typically start with 3, 4, 5, 6, or 7.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Oman',
    code: '+968',
    country: 'Oman',
    flag: '🇴🇲',
    digitLengths: [8],
    placeholder: '9123 4567',
    example: '9123 4567',
    hint: '8 digits (starts with 7, 9, or 2)',
    validate: (digits: string) => {
      if (digits.length !== 8) {
        return { isValid: false, error: 'Oman phone number must be exactly 8 digits.' };
      }
      if (!/^[279]\d{7}$/.test(digits)) {
        return { isValid: false, error: 'Oman phone numbers typically start with 7, 9, or 2.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Kuwait',
    code: '+965',
    country: 'Kuwait',
    flag: '🇰🇼',
    digitLengths: [8],
    placeholder: '9123 4567',
    example: '9123 4567',
    hint: '8 digits (starts with 2, 5, 6, 9)',
    validate: (digits: string) => {
      if (digits.length !== 8) {
        return { isValid: false, error: 'Kuwait phone number must be exactly 8 digits.' };
      }
      if (!/^[2569]\d{7}$/.test(digits)) {
        return { isValid: false, error: 'Kuwait phone numbers typically start with 2, 5, 6, or 9.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Bahrain',
    code: '+973',
    country: 'Bahrain',
    flag: '🇧🇭',
    digitLengths: [8],
    placeholder: '3612 3456',
    example: '3612 3456',
    hint: '8 digits (starts with 3, 6, or 1)',
    validate: (digits: string) => {
      if (digits.length !== 8) {
        return { isValid: false, error: 'Bahrain phone number must be exactly 8 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Germany',
    code: '+49',
    country: 'Germany',
    flag: '🇩🇪',
    digitLengths: [10, 11],
    placeholder: '151 23456789',
    example: '151 23456789',
    hint: '10 to 11 digits (omit leading 0)',
    validate: (digits: string) => {
      if (digits.length < 10 || digits.length > 11) {
        return { isValid: false, error: 'Germany phone number must be 10 or 11 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'France',
    code: '+33',
    country: 'France',
    flag: '🇫🇷',
    digitLengths: [9],
    placeholder: '6 12 34 56 78',
    example: '6 12 34 56 78',
    hint: '9 digits (omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'France phone number must be exactly 9 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'New Zealand',
    code: '+64',
    country: 'New Zealand',
    flag: '🇳🇿',
    digitLengths: [8, 9, 10],
    placeholder: '21 123 4567',
    example: '21 123 4567',
    hint: '8 to 10 digits (omit leading 0)',
    validate: (digits: string) => {
      if (digits.length < 8 || digits.length > 10) {
        return { isValid: false, error: 'New Zealand phone number must be 8 to 10 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Sri Lanka',
    code: '+94',
    country: 'Sri Lanka',
    flag: '🇱🇰',
    digitLengths: [9],
    placeholder: '71 234 5678',
    example: '71 234 5678',
    hint: '9 digits (starts with 7)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'Sri Lanka phone number must be 9 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Maldives',
    code: '+960',
    country: 'Maldives',
    flag: '🇲🇻',
    digitLengths: [7],
    placeholder: '771 2345',
    example: '771 2345',
    hint: '7 digits (starts with 7 or 9)',
    validate: (digits: string) => {
      if (digits.length !== 7) {
        return { isValid: false, error: 'Maldives phone number must be exactly 7 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Bangladesh',
    code: '+880',
    country: 'Bangladesh',
    flag: '🇧🇩',
    digitLengths: [10],
    placeholder: '1712 345678',
    example: '1712 345678',
    hint: '10 digits (starts with 1, omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 10) {
        return { isValid: false, error: 'Bangladesh phone number must be 10 digits (omit leading 0).' };
      }
      if (!digits.startsWith('1')) {
        return { isValid: false, error: 'Bangladesh mobile number must start with 1.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Philippines',
    code: '+63',
    country: 'Philippines',
    flag: '🇵🇭',
    digitLengths: [10],
    placeholder: '917 123 4567',
    example: '917 123 4567',
    hint: '10 digits (starts with 9, omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 10) {
        return { isValid: false, error: 'Philippines phone number must be exactly 10 digits (omit leading 0).' };
      }
      if (!digits.startsWith('9')) {
        return { isValid: false, error: 'Philippines mobile numbers must start with 9.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Indonesia',
    code: '+62',
    country: 'Indonesia',
    flag: '🇮🇩',
    digitLengths: [9, 10, 11, 12],
    placeholder: '812 3456 7890',
    example: '812 3456 7890',
    hint: '9 to 12 digits (starts with 8, omit leading 0)',
    validate: (digits: string) => {
      if (digits.length < 9 || digits.length > 12) {
        return { isValid: false, error: 'Indonesia phone number must be 9 to 12 digits.' };
      }
      if (!digits.startsWith('8')) {
        return { isValid: false, error: 'Indonesia mobile numbers must start with 8.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Thailand',
    code: '+66',
    country: 'Thailand',
    flag: '🇹🇭',
    digitLengths: [9],
    placeholder: '81 234 5678',
    example: '81 234 5678',
    hint: '9 digits (omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'Thailand phone number must be 9 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'South Africa',
    code: '+27',
    country: 'South Africa',
    flag: '🇿🇦',
    digitLengths: [9],
    placeholder: '71 234 5678',
    example: '71 234 5678',
    hint: '9 digits (omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'South Africa phone number must be 9 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Switzerland',
    code: '+41',
    country: 'Switzerland',
    flag: '🇨🇭',
    digitLengths: [9],
    placeholder: '79 123 4567',
    example: '79 123 4567',
    hint: '9 digits (starts with 7)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'Switzerland phone number must be exactly 9 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Netherlands',
    code: '+31',
    country: 'Netherlands',
    flag: '🇳🇱',
    digitLengths: [9],
    placeholder: '6 12345678',
    example: '6 12345678',
    hint: '9 digits (omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'Netherlands phone number must be 9 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Ireland',
    code: '+353',
    country: 'Ireland',
    flag: '🇮🇪',
    digitLengths: [9],
    placeholder: '85 123 4567',
    example: '85 123 4567',
    hint: '9 digits (starts with 8)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'Ireland phone number must be 9 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Italy',
    code: '+39',
    country: 'Italy',
    flag: '🇮🇹',
    digitLengths: [9, 10, 11],
    placeholder: '312 345 6789',
    example: '312 345 6789',
    hint: '9 to 11 digits (starts with 3 for mobile)',
    validate: (digits: string) => {
      if (digits.length < 9 || digits.length > 11) {
        return { isValid: false, error: 'Italy phone number must be 9 to 11 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Spain',
    code: '+34',
    country: 'Spain',
    flag: '🇪🇸',
    digitLengths: [9],
    placeholder: '612 345 678',
    example: '612 345 678',
    hint: '9 digits (starts with 6, 7, 8, or 9)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'Spain phone number must be exactly 9 digits.' };
      }
      if (!/^[6-9]\d{8}$/.test(digits)) {
        return { isValid: false, error: 'Spain phone numbers must start with 6, 7, 8, or 9.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Sweden',
    code: '+46',
    country: 'Sweden',
    flag: '🇸🇪',
    digitLengths: [9],
    placeholder: '70 123 4567',
    example: '70 123 4567',
    hint: '9 digits (omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'Sweden phone number must be 9 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Norway',
    code: '+47',
    country: 'Norway',
    flag: '🇳🇴',
    digitLengths: [8],
    placeholder: '412 34 567',
    example: '412 34 567',
    hint: '8 digits (starts with 4 or 9)',
    validate: (digits: string) => {
      if (digits.length !== 8) {
        return { isValid: false, error: 'Norway phone number must be exactly 8 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Denmark',
    code: '+45',
    country: 'Denmark',
    flag: '🇩🇰',
    digitLengths: [8],
    placeholder: '21 23 45 67',
    example: '21 23 45 67',
    hint: '8 digits',
    validate: (digits: string) => {
      if (digits.length !== 8) {
        return { isValid: false, error: 'Denmark phone number must be exactly 8 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Belgium',
    code: '+32',
    country: 'Belgium',
    flag: '🇧🇪',
    digitLengths: [9],
    placeholder: '470 12 34 56',
    example: '470 12 34 56',
    hint: '9 digits (omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'Belgium phone number must be 9 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Austria',
    code: '+43',
    country: 'Austria',
    flag: '🇦🇹',
    digitLengths: [10, 11],
    placeholder: '664 1234567',
    example: '664 1234567',
    hint: '10 or 11 digits (omit leading 0)',
    validate: (digits: string) => {
      if (digits.length < 10 || digits.length > 11) {
        return { isValid: false, error: 'Austria phone number must be 10 or 11 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Japan',
    code: '+81',
    country: 'Japan',
    flag: '🇯🇵',
    digitLengths: [10],
    placeholder: '90 1234 5678',
    example: '90 1234 5678',
    hint: '10 digits (starts with 70, 80, or 90, omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 10) {
        return { isValid: false, error: 'Japan phone number must be 10 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'South Korea',
    code: '+82',
    country: 'South Korea',
    flag: '🇰🇷',
    digitLengths: [9, 10],
    placeholder: '10 1234 5678',
    example: '10 1234 5678',
    hint: '9 or 10 digits (starts with 10 for mobile)',
    validate: (digits: string) => {
      if (digits.length < 9 || digits.length > 10) {
        return { isValid: false, error: 'South Korea phone number must be 9 or 10 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'China',
    code: '+86',
    country: 'China',
    flag: '🇨🇳',
    digitLengths: [11],
    placeholder: '138 1234 5678',
    example: '138 1234 5678',
    hint: '11 digits (starts with 1)',
    validate: (digits: string) => {
      if (digits.length !== 11) {
        return { isValid: false, error: 'China phone number must be exactly 11 digits.' };
      }
      if (!digits.startsWith('1')) {
        return { isValid: false, error: 'China mobile numbers must start with 1.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Hong Kong',
    code: '+852',
    country: 'Hong Kong',
    flag: '🇭🇰',
    digitLengths: [8],
    placeholder: '9123 4567',
    example: '9123 4567',
    hint: '8 digits (starts with 5, 6, 9)',
    validate: (digits: string) => {
      if (digits.length !== 8) {
        return { isValid: false, error: 'Hong Kong phone number must be exactly 8 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Russia',
    code: '+7',
    country: 'Russia',
    flag: '🇷🇺',
    digitLengths: [10],
    placeholder: '912 345 6789',
    example: '912 345 6789',
    hint: '10 digits (starts with 9)',
    validate: (digits: string) => {
      if (digits.length !== 10) {
        return { isValid: false, error: 'Russia phone number must be 10 digits (omit country code +7).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Brazil',
    code: '+55',
    country: 'Brazil',
    flag: '🇧🇷',
    digitLengths: [10, 11],
    placeholder: '11 91234 5678',
    example: '11 91234 5678',
    hint: '10 or 11 digits (2-digit area code + number)',
    validate: (digits: string) => {
      if (digits.length < 10 || digits.length > 11) {
        return { isValid: false, error: 'Brazil phone number must be 10 or 11 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Mexico',
    code: '+52',
    country: 'Mexico',
    flag: '🇲🇽',
    digitLengths: [10],
    placeholder: '55 1234 5678',
    example: '55 1234 5678',
    hint: '10 digits (area code + number)',
    validate: (digits: string) => {
      if (digits.length !== 10) {
        return { isValid: false, error: 'Mexico phone number must be exactly 10 digits.' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Kenya',
    code: '+254',
    country: 'Kenya',
    flag: '🇰🇪',
    digitLengths: [9],
    placeholder: '712 345678',
    example: '712 345678',
    hint: '9 digits (starts with 7 or 1, omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'Kenya phone number must be 9 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Nigeria',
    code: '+234',
    country: 'Nigeria',
    flag: '🇳🇬',
    digitLengths: [10],
    placeholder: '803 123 4567',
    example: '803 123 4567',
    hint: '10 digits (starts with 7, 8, 9, omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 10) {
        return { isValid: false, error: 'Nigeria phone number must be 10 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Egypt',
    code: '+20',
    country: 'Egypt',
    flag: '🇪🇬',
    digitLengths: [10],
    placeholder: '10 1234 5678',
    example: '10 1234 5678',
    hint: '10 digits (starts with 10, 11, 12, or 15)',
    validate: (digits: string) => {
      if (digits.length !== 10) {
        return { isValid: false, error: 'Egypt phone number must be 10 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Turkey',
    code: '+90',
    country: 'Turkey',
    flag: '🇹🇷',
    digitLengths: [10],
    placeholder: '532 123 4567',
    example: '532 123 4567',
    hint: '10 digits (starts with 5, omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 10) {
        return { isValid: false, error: 'Turkey phone number must be 10 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Vietnam',
    code: '+84',
    country: 'Vietnam',
    flag: '🇻🇳',
    digitLengths: [9],
    placeholder: '91 234 5678',
    example: '91 234 5678',
    hint: '9 digits (omit leading 0)',
    validate: (digits: string) => {
      if (digits.length !== 9) {
        return { isValid: false, error: 'Vietnam phone number must be 9 digits (omit leading 0).' };
      }
      return { isValid: true };
    },
  },
  {
    id: 'Other',
    code: '+',
    country: 'Other / International',
    flag: '🌐',
    digitLengths: [7, 8, 9, 10, 11, 12, 13, 14, 15],
    placeholder: '1234567890',
    example: '1234567890',
    hint: '7 to 15 digits (standard international format)',
    validate: (digits: string) => {
      if (digits.length < 7 || digits.length > 15) {
        return { isValid: false, error: 'International phone number must be between 7 and 15 digits.' };
      }
      return { isValid: true };
    },
  },
];

/**
 * Strips non-digits, strips redundant dialing prefix if user pasted full number,
 * and removes any single redundant leading 0 (trunk prefix) if needed.
 */
export function sanitizePhoneDigits(raw: string, countryCode?: string, expectedLengths?: number[]): string {
  let digits = raw.replace(/\D/g, '');

  // If user pasted with country dialing code prefix (e.g. pasted 12025550143 when +1 is selected)
  if (countryCode) {
    const rawCode = countryCode.replace(/\D/g, '');
    if (rawCode && digits.startsWith(rawCode) && digits.length > rawCode.length + 5) {
      const stripped = digits.substring(rawCode.length);
      if (expectedLengths && expectedLengths.some((len) => stripped.length === len || Math.abs(stripped.length - len) < Math.abs(digits.length - len))) {
        digits = stripped;
      }
    }
  }

  // If user included a trunk '0' prefix (e.g. 0412345678 for Australia)
  if (expectedLengths && digits.startsWith('0')) {
    const withoutZero = digits.substring(1);
    if (expectedLengths.includes(withoutZero.length)) {
      digits = withoutZero;
    }
  }

  return digits;
}

export function getCountryConfig(countryIdOrCode: string): CountryPhoneConfig {
  const found = COUNTRY_PHONE_LIST.find(
    (c) => c.id.toLowerCase() === countryIdOrCode.toLowerCase() || c.country.toLowerCase() === countryIdOrCode.toLowerCase() || c.code === countryIdOrCode
  );
  return found || COUNTRY_PHONE_LIST[0]; // fallback to India
}

export function validatePhoneNumber(rawPhone: string, countryIdOrCode: string): { isValid: boolean; error?: string; cleanDigits: string; formatted: string } {
  if (!rawPhone || !rawPhone.trim()) {
    return { isValid: false, error: 'Phone number is required.', cleanDigits: '', formatted: '' };
  }

  const config = getCountryConfig(countryIdOrCode);
  const cleanDigits = sanitizePhoneDigits(rawPhone, config.code, config.digitLengths);

  if (!cleanDigits) {
    return { isValid: false, error: 'Please enter a valid phone number containing digits.', cleanDigits: '', formatted: '' };
  }

  const result = config.validate(cleanDigits);
  const dialPrefix = config.code === '+' ? '+' : `${config.code} `;

  return {
    isValid: result.isValid,
    error: result.error,
    cleanDigits,
    formatted: `${dialPrefix}${cleanDigits}`,
  };
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
  }
  return { isValid: true };
}

export function validateFullName(name: string): { isValid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Full name is required.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters.' };
  }
  if (trimmed.length > 60) {
    return { isValid: false, error: 'Full name cannot exceed 60 characters.' };
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Name should only contain letters, spaces, dots or hyphens.' };
  }
  return { isValid: true };
}

export function validateDentalConcern(issue: string): { isValid: boolean; error?: string } {
  if (!issue || !issue.trim()) {
    return { isValid: false, error: 'Please describe your dental concern.' };
  }
  const trimmed = issue.trim();
  if (trimmed.length < 10) {
    return { isValid: false, error: 'Please provide more details about your dental concern (at least 10 characters).' };
  }
  if (trimmed.length > 3000) {
    return { isValid: false, error: 'Dental concern description cannot exceed 3000 characters.' };
  }
  return { isValid: true };
}

export function validateFiles(files: File[]): { isValid: boolean; error?: string } {
  if (files.length > 5) {
    return { isValid: false, error: 'Maximum 5 files allowed.' };
  }
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB
  for (const file of files) {
    if (file.size > maxSizeBytes) {
      return { isValid: false, error: `File "${file.name}" exceeds the 5MB size limit.` };
    }
  }
  return { isValid: true };
}

