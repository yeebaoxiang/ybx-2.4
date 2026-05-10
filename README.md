# ELEOS AI - Background Mobility Assistant

ELEOS is a high-contrast Next.js application designed as a visual assistant for the visually impaired. It utilizes Genkit and Google Gemini 2.5 Flash to provide real-time spatial obstacle detection.

## 🚀 Deployment Guide

### 1. Get your API Key
ELEOS uses Gemini 2.5 Flash for its high-speed vision capabilities.

- **Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate your key.

### 2. Configure Environment Variables
In your deployment dashboard or local `.env` file, add the following key:

| Key | Value | Purpose |
| :--- | :--- | :--- |
| `GOOGLE_GENAI_API_KEY` | *Your Gemini API Key* | Primary Vision & Logic Engine |

### 3. Deploy
Push this code to GitHub and connect it to your hosting provider (e.g., Vercel or Firebase App Hosting).
**Important**: Ensure you are using HTTPS, as the Camera, Speech, and Vibration APIs require a secure origin.

## 🛠 Features for Accessibility

- **Blind-First Design**: Massive 64px+ touch targets and a 50/50 split layout.
- **High Contrast Theme**: Pure black and high-visibility yellow.
- **Smart Voice Selection**: Automatically chooses gendered system voices or adjusts pitch as a fallback.
- **Spatial Clock Orientation**: Objects are announced relative to a 12-hour clock (e.g., "Wall at 12 o'clock").
- **Priority Thresholds (1-5)**:
  - **Level 1**: Life-threatening alerts only.
  - **Level 3**: Standard navigation.
  - **Level 5**: Hyper-aware mode (announces all surroundings).
- **Haptic Aggression**: Customizable vibration intensity for alerts.
- **Always-On Journey**: Background logic and Wake Lock API keep the assistant active during travel.

## 📱 Usage
- **Start Journey**: Tap the large primary button to activate the camera and AI scanning.
- **Scan Interval**: During an active journey, the app scans every 2 seconds to optimize for safety and quota.
