
const API_KEY = import.meta.env.VITE_GOOGLE_MAP || '';

export interface AddressValidationResponse {
  result: {
    verdict: {
      inputGranularity: string;
      validationGranularity: string;
      geocodeGranularity: string;
      addressComplete: boolean;
      hasUnconfirmedComponents: boolean;
    };
    address: {
      formattedAddress: string;
      postalAddress: {
        regionCode: string;
        languageCode: string;
        postalCode: string;
        administrativeArea: string;
        locality: string;
        sublocality: string;
        addressLines: string[];
      };
    };
  };
}

export async function validateAddress(addressLines: string[]): Promise<AddressValidationResponse> {
  const response = await fetch(`https://addressvalidation.googleapis.com/v1:validateAddress?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address: {
        addressLines: addressLines,
        regionCode: 'BR',
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Falha na validação do endereço');
  }

  return response.json();
}
