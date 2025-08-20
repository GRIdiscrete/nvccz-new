export const API_BASE_URL = "https://31358b749b00.ngrok-free.app";

export const sampleExchangeData = {
   "status": "success",
   "date": "08 Aug 2025",
    "date_iso": "2025-08-08",
    "source": "Infrastructure Development Bank of Zimbabwe(IDBZ)" as const,
    "url": "https://sample-url.com",
    "exchange_rates": [
        {
            "currency": "Zimbabwe Gold",
            "mid_rate": 26.7605,
            "pair": "1USD-ZiG",
            "we_buy": 25.9577,
            "we_sell": 28.6337
        }
    ]
};