# NexChat - Modern Web Messenger

![NexChat Banner](https://via.placeholder.com/1200x600?text=NexChat+Banner)

## Overview

NexChat is a modern, responsive, and feature-rich web messenger template built with **React 19**, **TypeScript**, and **Tailwind CSS**. It offers a premium user interface with dark mode support, smooth animations, and a modular component architecture.

## ✨ Key Features

NexChat comes packed with everything you need for a modern messaging experience:

### 💬 Messaging & Communication

- **One-to-One & Many Chat**: Seamless private and broadcast messaging.
- **Group Chat**: Create communities and chat with multiple friends at once.
- **Channels**: Broadcast updates to a large audience.
- **Audio & Video Calls**: Crystal clear voice and video calling with screen sharing capabilities.
- **Rich Media Support**: Send emojis, upload files, and share images.
- **Reply System**: Threaded replies to keep conversations organized.

### 🛠️ Personalization & Control

- **Custom Chat Backgrounds**: Personalize your chat experience with custom wallpapers.
- **Status Updates**: Share your moments with ephemeral status updates.
- **Profile Management**: extensive profile customization options.
- **Template Settings**: Comprehensive settings to tweak the app to your liking.

### 🛡️ Privacy & Management

- **Block/Unblock**: Complete control over who can contact you.
- **Mute/Unmute**: Silence noisy conversations when you need focus.
- **Notifications**: Real-time alerts for new messages and calls.
- **Storage Management**: Manage your data and media usage efficiently.

## 📸 Screenshots

<div align="center">
  <img src="public/screenshots/channel-view.png" alt="Channels" width="800" />
</div>

<div align="center" style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
  <img src="public/screenshots/video-call.png" alt="Video Call" width="48%" />
  <img src="public/screenshots/settings-page.png" alt="Settings" width="48%" />
</div>

<div align="center" style="display: flex; gap: 10px; justify: center; margin-top: 20px;">
  <img src="public/screenshots/status-screen.png" alt="Status" width="32%" />
  <img src="public/screenshots/profile-modal.png" alt="Profile" width="60%" />
</div>
- **Mock Data Included**: Comes with mock data for chats, calls, and user profiles.

## Project Structure

```
src/
├── assets/         # Static assets (images, icons)
├── components/     # Reusable UI components
├── App.tsx         # Main application component
├── constants.tsx   # configuration and mock data
├── index.css       # Global styles and Tailwind directives
├── index.tsx       # Application entry point
└── types.ts        # TypeScript definitions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  Clone the repository or extract the downloaded zip file.
2.  Navigate to the project directory:
    ```bash
    cd nexchat-messenger
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running Development Server

To start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) to view the app.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Linting

To check for code quality issues:

```bash
npm run lint
```

## Customization

### Colors & Branding

You can customize the color scheme in `tailwind.config.js`. specifically the `colors` section under `theme.extend`.

### Fonts

The project uses 'Plus Jakarta Sans' from Google Fonts. You can change this in `src/index.css` and `tailwind.config.js`.

## License

This project is available for use under the license terms purchased from ThemeForest.
