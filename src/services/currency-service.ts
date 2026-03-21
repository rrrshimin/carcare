export type CurrencyOption = {
  code: string;
  symbol: string;
  name: string;
};

export const CURRENCIES: CurrencyOption[] = [
  // Americas
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
  { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso' },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón' },
  { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' },
  { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar' },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad & Tobago Dollar' },

  // Europe — Western
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna' },

  // Europe — Central & Eastern
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  { code: 'RSD', symbol: 'din', name: 'Serbian Dinar' },
  { code: 'BAM', symbol: 'KM', name: 'Bosnia & Herzegovina Mark' },
  { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar' },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek' },
  { code: 'MDL', symbol: 'L', name: 'Moldovan Leu' },

  // Europe — Baltics & Nordics (non-EUR)
  // (Estonia, Latvia, Lithuania use EUR)

  // CIS & former Soviet
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble' },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
  { code: 'UZS', symbol: 'сўм', name: 'Uzbekistani Som' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari' },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' },
  { code: 'KGS', symbol: 'сом', name: 'Kyrgyzstani Som' },
  { code: 'TJS', symbol: 'SM', name: 'Tajikistani Somoni' },
  { code: 'TMT', symbol: 'T', name: 'Turkmenistani Manat' },

  // Turkey
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },

  // Middle East
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
  { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar' },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound' },

  // South Asia
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee' },

  // East Asia
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  { code: 'MNT', symbol: '₮', name: 'Mongolian Tugrik' },

  // Southeast Asia
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'LAK', symbol: '₭', name: 'Lao Kip' },
  { code: 'BND', symbol: 'B$', name: 'Brunei Dollar' },

  // Oceania
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar' },

  // Hong Kong & Macau
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'MOP', symbol: 'MOP$', name: 'Macanese Pataca' },

  // Africa — North
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
  { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },

  // Africa — Sub-Saharan
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'Ksh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'RWF', symbol: 'RF', name: 'Rwandan Franc' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula' },
  { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee' },
  { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' },
  { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' },
  { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza' },
  { code: 'CDF', symbol: 'FC', name: 'Congolese Franc' },

  // Caribbean
  { code: 'CUP', symbol: '$', name: 'Cuban Peso' },
  { code: 'HTG', symbol: 'G', name: 'Haitian Gourde' },
  { code: 'BSD', symbol: 'B$', name: 'Bahamian Dollar' },
  { code: 'BBD', symbol: 'Bds$', name: 'Barbadian Dollar' },

  // Iran & Afghanistan
  { code: 'IRR', symbol: '﷼', name: 'Iranian Rial' },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
];

export const DEFAULT_CURRENCY_CODE = 'USD';

const symbolMap: Record<string, string> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.symbol]),
);

export function getCurrencySymbol(code: string): string {
  return symbolMap[code] ?? code;
}
