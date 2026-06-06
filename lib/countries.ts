export interface Country {
  code: string;
  flag: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: 'AR', flag: '🇦🇷', name: 'Argentina' },
  { code: 'BO', flag: '🇧🇴', name: 'Bolivia' },
  { code: 'BR', flag: '🇧🇷', name: 'Brasil' },
  { code: 'CL', flag: '🇨🇱', name: 'Chile' },
  { code: 'CO', flag: '🇨🇴', name: 'Colombia' },
  { code: 'CR', flag: '🇨🇷', name: 'Costa Rica' },
  { code: 'CU', flag: '🇨🇺', name: 'Cuba' },
  { code: 'DO', flag: '🇩🇴', name: 'Rep. Dominicana' },
  { code: 'EC', flag: '🇪🇨', name: 'Ecuador' },
  { code: 'SV', flag: '🇸🇻', name: 'El Salvador' },
  { code: 'GT', flag: '🇬🇹', name: 'Guatemala' },
  { code: 'HN', flag: '🇭🇳', name: 'Honduras' },
  { code: 'MX', flag: '🇲🇽', name: 'México' },
  { code: 'NI', flag: '🇳🇮', name: 'Nicaragua' },
  { code: 'PA', flag: '🇵🇦', name: 'Panamá' },
  { code: 'PY', flag: '🇵🇾', name: 'Paraguay' },
  { code: 'PE', flag: '🇵🇪', name: 'Perú' },
  { code: 'PR', flag: '🇵🇷', name: 'Puerto Rico' },
  { code: 'UY', flag: '🇺🇾', name: 'Uruguay' },
  { code: 'VE', flag: '🇻🇪', name: 'Venezuela' },
  { code: 'ES', flag: '🇪🇸', name: 'España' },
  { code: 'US', flag: '🇺🇸', name: 'Estados Unidos' },
];
