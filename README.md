# D-Vault: Decentralized File Storage System

A modern web application for decentralized file storage using Pinata. Upload files to IPFS and manage them with beautiful public links.

## Features

- 🔐 **Secure API Key Management**: Store your Pinata API Key and Secret Key securely
- 📁 **IPFS Storage**: Upload files directly to Pinata's IPFS network
- 🔗 **Public Links**: Get shareable public links for all uploaded files
- 📊 **File Management**: View, copy links, and delete uploaded files
- 🎨 **Modern UI**: Beautiful interface built with Tailwind CSS
- 💾 **Local Storage**: Files and API keys are saved locally for convenience

## Getting Started

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

## API Keys Setup

### Pinata API Keys
1. Go to [Pinata](https://app.pinata.cloud/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy both the **API Key** and **Secret Key**

**Important**: You need both the API Key and Secret Key for authentication.

## Usage

1. **Configure API Keys**: Enter your Pinata API Key and Secret Key in the configuration section
2. **Save Keys**: Click "Save API Keys" to store them locally
3. **Upload Files**: Select a file and click "Upload to Pinata"
4. **Manage Files**: View uploaded files, copy public links, or delete files from the list

## File Storage Details

### Pinata
- Files are uploaded to Pinata's IPFS gateway
- Public links: `https://gateway.pinata.cloud/ipfs/{hash}`
- Reliable and fast access
- Decentralized storage on IPFS network

## Features in Detail

### Upload Process
- Files are uploaded directly to Pinata's IPFS network
- Progress bar shows upload status
- Error handling for failed uploads
- File metadata is stored locally

### File Management
- View file size, upload date, and IPFS hash
- Copy public links to clipboard
- Delete files from local storage
- Persistent storage using localStorage

### Security
- API keys are stored locally in the browser
- Passwords are masked in the UI
- No server-side storage of sensitive data

## Technical Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Storage**: Pinata IPFS
- **State Management**: React Hooks
- **Local Storage**: Browser localStorage

## Development

### Project Structure
```
src/
├── components/
│   └── DecentralizedStorage.jsx  # Main storage component
├── App.jsx                       # Main app component
├── main.jsx                      # Entry point
└── index.css                     # Global styles
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
