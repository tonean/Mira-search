# Security Configuration

## Environment Variables Setup

This application requires several API keys and configuration values. For security reasons, these should never be hardcoded in the source code.

### Required Environment Variables

Create a `.env` file in the `mira-ui/` directory with the following variables:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini AI API Configuration
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

### How to Get These Values

1. **Supabase Configuration:**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings > API
   - Copy the Project URL and anon/public key

2. **Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the generated key

### Security Best Practices

- ✅ **DO:** Use environment variables for all sensitive data
- ✅ **DO:** Add `.env` to your `.gitignore` file
- ✅ **DO:** Use different keys for development and production
- ❌ **DON'T:** Commit API keys to version control
- ❌ **DON'T:** Share API keys in screenshots or documentation
- ❌ **DON'T:** Use production keys in development

### Environment File Template

Copy this template to create your `.env` file:

```bash
# Copy this template and replace with your actual values
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_GEMINI_API_KEY=AIzaSyD...
```

### Troubleshooting

If you see errors about missing environment variables:

1. Ensure your `.env` file is in the `mira-ui/` directory (same level as `package.json`)
2. Restart your development server after creating/modifying the `.env` file
3. Check that variable names start with `REACT_APP_` (required for React apps)
4. Verify there are no extra spaces around the `=` sign in your `.env` file

### Production Deployment

For production deployments, set these environment variables in your hosting platform:

- **Vercel:** Project Settings > Environment Variables
- **Netlify:** Site Settings > Environment Variables
- **Heroku:** Settings > Config Vars
- **AWS/GCP/Azure:** Use their respective environment variable systems 