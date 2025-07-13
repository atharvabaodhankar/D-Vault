# D-Vault: Decentralized File Storage System

A stunning, modern web application for decentralized file storage using Pinata. Upload files to IPFS with a beautiful, animated interface and manage them with style.

## ✨ Features

- 🎨 **Super Modern UI**: Beautiful gradient design with animated backgrounds
- 🔐 **Secure API Key Management**: Store your Pinata API Key and Secret Key securely
- 📁 **IPFS Storage**: Upload files directly to Pinata's IPFS network
- 🔗 **Public Links**: Get shareable public links for all uploaded files
- 📊 **Real-time File Management**: View, copy links, and delete uploaded files
- 💾 **No Local Storage**: Files are always fetched fresh from Pinata
- 🚀 **Animated Interactions**: Smooth hover effects and transitions
- 📱 **Responsive Design**: Works perfectly on all devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd D-Vault
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔑 Pinata API Setup Guide

### Step-by-Step Instructions

#### 1. Create Pinata Account
- Go to [app.pinata.cloud](https://app.pinata.cloud/)
- Click "Sign Up" and create a free account
- Verify your email address

#### 2. Navigate to API Keys
- After logging in, click on **"API Keys"** in the left sidebar
- This will take you to the API Keys management page

#### 3. Create New API Key
- Click the **"Create New Key"** button
- Give your key a name (e.g., "D-Vault")
- Select the appropriate permissions (read/write access)
- Click **"Create Key"**

#### 4. Copy Your Keys
- You'll see two important keys:
  - **API Key**: A long string starting with letters/numbers
  - **Secret Key**: Another long string (keep this secret!)
- Copy both keys to a safe place temporarily

#### 5. Configure D-Vault
- In D-Vault, paste your **API Key** in the first field
- Paste your **Secret Key** in the second field
- Click **"Save API Keys"**

### ⚠️ Important Security Notes

- **Never share your Secret Key** - it's like a password
- **Keep your keys safe** - they give access to your Pinata account
- **Use different keys** for different applications
- **Rotate keys regularly** for better security

## 🎯 Usage

### Upload Files
1. **Configure API Keys**: Enter your Pinata API Key and Secret Key
2. **Save Keys**: Click "Save API Keys" to store them locally
3. **Select File**: Click the upload area or drag & drop a file
4. **Upload**: Click "Upload to IPFS" and watch the magic happen!

### Manage Files
- **View All**: See all your files from Pinata in real-time
- **Copy Links**: Click "Copy Link" to get shareable IPFS URLs
- **Delete Files**: Remove files from IPFS with the delete button
- **Refresh**: Click "Refresh Files" to get the latest data

## 🌐 File Storage Details

### IPFS Network
- Files are uploaded to the **InterPlanetary File System (IPFS)**
- **Decentralized storage** - no single point of failure
- **Immutable content** - files can't be changed once uploaded
- **Global distribution** - accessible from anywhere in the world

### Pinata Gateway
- **Public links**: `https://gateway.pinata.cloud/ipfs/{hash}`
- **Fast access** through Pinata's optimized gateway
- **Reliable hosting** with 99.9% uptime
- **Free tier** available for personal use

## 🎨 Design Features

### Visual Elements
- **Animated Background**: Floating gradient blobs with smooth animations
- **Glass Morphism**: Translucent cards with backdrop blur effects
- **Gradient Buttons**: Beautiful color transitions on all interactions
- **Emoji Icons**: Fun and intuitive visual indicators
- **Hover Effects**: Smooth scale and color transitions

### User Experience
- **Intuitive Layout**: Clear sections for configuration, upload, and file management
- **Real-time Feedback**: Loading states and progress indicators
- **Error Handling**: Clear error messages with helpful guidance
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🛠️ Technical Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS with custom animations
- **Storage**: Pinata IPFS API
- **State Management**: React Hooks
- **Local Storage**: Browser localStorage (API keys only)

## 📁 Project Structure

```
src/
├── components/
│   └── DecentralizedStorage.jsx  # Main storage component
├── App.jsx                       # Main app component
├── main.jsx                      # Entry point
└── index.css                     # Global styles
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README for setup instructions
- **Pinata Support**: Visit [Pinata's documentation](https://docs.pinata.cloud/)
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🌟 Why D-Vault?

- **Beautiful Design**: Modern, animated interface that's a joy to use
- **Decentralized**: Your files are stored on IPFS, not centralized servers
- **Secure**: API keys stored locally, no server-side storage
- **Fast**: Direct integration with Pinata's optimized infrastructure
- **Free**: No hidden costs, works with Pinata's free tier
- **Open Source**: Transparent code you can trust and modify

---

**Made with ❤️ for the decentralized web**
