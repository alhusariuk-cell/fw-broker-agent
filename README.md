# FW Broker Performance Agent

AI-powered broker performance dashboard for Flambard Williams.

## Deploy to Netlify

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fw-broker-agent.git
git push -u origin main
```

### 2. Connect to Netlify
- Go to app.netlify.com
- Click "Add new site" → "Import an existing project"
- Connect your GitHub repo
- Build settings are auto-detected from netlify.toml

### 3. Add Environment Variable
In Netlify dashboard → Site settings → Environment variables:
```
ANTHROPIC_API_KEY = your_api_key_here
```

### 4. Deploy
Netlify will build and deploy automatically.
Your site will be live at: `https://fw-broker-agent.netlify.app`

## Local Development
```bash
npm install
npm run dev
```

Note: For local dev, create a `.env` file:
```
ANTHROPIC_API_KEY=your_key_here
```
