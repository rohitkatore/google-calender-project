# Google Calendar Integration Project

A simple web application that integrates with Google Calendar API to display user events.

## Features

✅ OAuth 2.0 Authentication with Google  
✅ Display connected user information  
✅ Show all data received from OAuth connection  
✅ List upcoming calendar events from Google Calendar  
✅ Responsive and modern UI  
✅ Refresh events functionality

## Setup Instructions

### 1. Set up Google Cloud Platform (GCP)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Click on the project name to open it

### 2. Enable Google Calendar API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**
4. Also enable "Google People API" (for user profile data)

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in required fields (App name, user support email, developer contact)
   - Add scopes: `calendar.readonly`, `userinfo.profile`, `userinfo.email`
   - Add test users (your email) if in testing mode
4. Select **Application type**: **Web application**
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost
   http://localhost:8000
   http://127.0.0.1
   http://127.0.0.1:8000
   ```
6. Add **Authorized redirect URIs**:
   ```
   http://localhost
   http://localhost:8000
   http://127.0.0.1
   http://127.0.0.1:8000
   ```
7. Click **Create**
8. Copy your **Client ID**

### 4. Get API Key (Optional but Recommended)

1. In **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. (Recommended) Click **Restrict Key** and limit to:
   - HTTP referrers
   - Google Calendar API

### 5. Configure the Application

1. Open `config.js` in your project
2. Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID
3. Replace `YOUR_API_KEY_HERE` with your actual API Key (if you created one)

```javascript
const CONFIG = {
  CLIENT_ID: "your-actual-client-id.apps.googleusercontent.com",
  API_KEY: "your-actual-api-key",
  // ... rest of the config
};
```

### 6. Run the Application

Since this uses OAuth 2.0, you need to serve the files over HTTP (not file://)

**Option 1: Using Python**

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option 2: Using Node.js (http-server)**

```bash
npx http-server -p 8000
```

**Option 3: Using PHP**

```bash
php -S localhost:8000
```

**Option 4: Using VS Code Live Server Extension**

- Install "Live Server" extension in VS Code
- Right-click on `index.html`
- Select "Open with Live Server"

### 7. Access the Application

Open your browser and navigate to:

```
http://localhost:8000
```

### 8. Test the Application

1. Click the **"Connect to Google Calendar"** button
2. Sign in with your Google account
3. Grant the requested permissions
4. View your user data and calendar events!

## Project Structure

```
google-calender-project/
│
├── index.html          # Main HTML file with UI structure
├── styles.css          # Styling for the application
├── config.js           # Configuration file (add your credentials here)
├── app.js              # Main JavaScript logic for OAuth and API calls
└── README.md           # This file
```

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Google Calendar API v3
- Google Identity Services (OAuth 2.0)
- Google People API

## What the App Does

1. **Connect Button**: Opens Google OAuth window for authentication
2. **User Data Display**: Shows all data received from OAuth connection:
   - User name
   - Email
   - Profile picture
   - User ID
   - Token information
3. **Calendar Events**: Displays upcoming events with:
   - Event title
   - Date and time
   - Description
   - Location
   - Attendees count
   - Link to event in Google Calendar

## Troubleshooting

### "Access blocked" error

- Make sure you've added your email as a test user in the OAuth consent screen
- Verify the app is in "Testing" mode in the consent screen settings

### "Redirect URI mismatch" error

- Ensure the URL you're accessing matches one of the authorized redirect URIs
- Check that you're using the correct port (e.g., 8000)

### "API key not valid" error

- Make sure you've enabled the Google Calendar API
- Check that your API key is correctly copied in `config.js`

### Events not loading

- Verify you have events in your Google Calendar
- Check browser console for errors
- Ensure proper scopes are requested

## Security Notes

- Never commit your `config.js` with real credentials to public repositories
- Consider using environment variables for production
- API keys and Client IDs shown in browser are normal for client-side apps
- For production, implement proper security measures and use a backend server

## License

This project is for educational/internship purposes.

## Author

Created as part of an internship task for NexaBridge

---

**Need Help?** Check the browser console (F12) for error messages!
