# Google Calendar Integration

A Google Calendar app with file-based authentication storage (auth.json).

## Features

✅ OAuth 2.0 Authentication  
✅ File-based credential storage (auth.json)  
✅ Display user information  
✅ View upcoming calendar events  
✅ Create new calendar events  
✅ Auto-reconnect on app restart

## Setup Instructions

### 1. Install Dependencies

```powershell
npm install
```

### 2. Configure Google Cloud Platform

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins: `http://localhost:3000`
6. Add authorized redirect URIs: `http://localhost:3000`
7. Add yourself as a test user in OAuth consent screen

### 3. Update Configuration

Open `config.js` and update:

```javascript
CLIENT_ID: "your-client-id.apps.googleusercontent.com";
```

### 4. Run the Server

```powershell
npm start
```

Open: `http://localhost:3000`

## How It Works

### Authentication Flow

1. **First Time:**

   - App checks `auth.json` for credentials
   - If empty, shows "Connect to Google Calendar" button
   - User clicks Connect → OAuth flow → Credentials saved to `auth.json`

2. **Next Time:**

   - App reads credentials from `auth.json`
   - Auto-connects if token is valid
   - Loads events automatically

3. **Disconnect:**
   - User clicks "Disconnect" button
   - Credentials are deleted from `auth.json`
   - Next time requires re-authentication

### File Structure

```
├── index.html          # Main UI
├── styles.css          # Styling
├── config.js           # Google OAuth config
├── app.js              # Frontend logic
├── server.js           # Node.js backend
├── auth.json           # Credential storage
└── package.json        # Dependencies
```

## API Endpoints

- `GET /api/auth` - Read auth.json
- `POST /api/auth` - Save credentials
- `DELETE /api/auth` - Clear credentials

## Technologies

- Node.js + Express
- Google Calendar API v3
- Google Identity Services
- File-based storage

## Security Note

- `auth.json` stores OAuth tokens locally
- For production, use encrypted storage or database
- Never commit real tokens to version control
