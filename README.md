# CLUS25 Preferred Architecture Lab Demo

This project demonstrates an application used in the CLUS25 lab to showcase the integration of the **Webex AI Agent**.

## Features

- Embedded Webex AI Agent (configured during the lab, not included in this repo)
- AI Agent accessible via widget, voice, and SMS channels
- "Get Help" feature with two options:
  - **Text Me** — triggers a webhook to send an SMS
  - **Call Me** — triggers a webhook to initiate a voice callback
- Airtable integration to fetch user details by user ID
- Session handling with Express and secure API token management via `.env`

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Create a .env file with the following:

```env
AIRTABLE_TOKEN=your_airtable_token
AIRTABLE_READ_API=https://api.airtable.com/v0/your-base-id/Users?filterByFormula=user_id=
WEBEX_HOOK=your_webex_hook_url
WEBEX_HOOK_KEY=your_webex_secret_key
```

3. Start the app:

```bash
npm start
```

4. Visit `http://localhost:3000`

## License

This project is licensed under the MIT License.