import { useState, useEffect } from 'react';
import Modal from './Modal';

const DecentralizedStorage = () => {
  const [pinataApiKey, setPinataApiKey] = useState('');
  const [pinataSecretKey, setPinataSecretKey] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingFile, setDeletingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Show modal helper function
  const showModal = (title, message, type = 'info') => {
    setModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  // Close modal helper function
  const closeModal = () => {
    setModal({
      isOpen: false,
      title: '',
      message: '',
      type: 'info'
    });
  };

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedPinataKey = localStorage.getItem('pinataApiKey');
    const savedPinataSecret = localStorage.getItem('pinataSecretKey');
    
    if (savedPinataKey) setPinataApiKey(savedPinataKey);
    if (savedPinataSecret) setPinataSecretKey(savedPinataSecret);
  }, []);

  // Fetch all files from Pinata
  const fetchFilesFromPinata = async () => {
    if (!pinataApiKey || !pinataSecretKey) {
      setFiles([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned', {
        method: 'GET',
        headers: {
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform Pinata response to our file format
      const transformedFiles = result.rows.map((item, index) => ({
        id: Date.now() + index, // Generate unique ID
        name: item.metadata?.name || `File ${index + 1}`,
        size: item.size || 0,
        type: item.metadata?.keyvalues?.type || 'unknown',
        uploadDate: item.date_pinned,
        upload: {
          provider: 'Pinata',
          hash: item.ipfs_pin_hash,
          url: `https://gateway.pinata.cloud/ipfs/${item.ipfs_pin_hash}`,
          gateway: `https://gateway.pinata.cloud/ipfs/${item.ipfs_pin_hash}`
        }
      }));

      setFiles(transformedFiles);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch files when API keys are available
  useEffect(() => {
    if (pinataApiKey && pinataSecretKey) {
      fetchFilesFromPinata();
    }
  }, [pinataApiKey, pinataSecretKey]);

  // Save API keys to localStorage
  const saveApiKeys = () => {
    localStorage.setItem('pinataApiKey', pinataApiKey);
    localStorage.setItem('pinataSecretKey', pinataSecretKey);
    showModal('Keys Saved!', 'Your API keys have been saved successfully. Your files will now load automatically.', 'success');
    // Fetch files after saving keys
    fetchFilesFromPinata();
  };

  // Upload to Pinata
  const uploadToPinata = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata API Error:', response.status, errorText);
      throw new Error(`Failed to upload to Pinata: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return {
      provider: 'Pinata',
      hash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      gateway: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    };
  };

  // Delete from Pinata
  const deleteFromPinata = async (hash) => {
    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
      method: 'DELETE',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata Delete API Error:', response.status, errorText);
      throw new Error(`Failed to delete from Pinata: ${response.status} - ${errorText}`);
    }

    return true;
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      showModal('No File Selected', 'Please select a file first before uploading.', 'warning');
      return;
    }

    if (!pinataApiKey || !pinataSecretKey) {
      showModal('API Keys Required', 'Please provide both Pinata API Key and Secret Key to upload files.', 'warning');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(50);
      await uploadToPinata(selectedFile);
      setUploadProgress(100);

      setSelectedFile(null);
      showModal('Upload Successful!', 'Your file has been uploaded to IPFS successfully! You can now share the public link with anyone.', 'success');
      
      // Refresh the file list from Pinata
      await fetchFilesFromPinata();
    } catch (error) {
      console.error('Upload failed:', error);
      showModal('Upload Failed', `Upload failed: ${error.message}. Please check your API keys and try again.`, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Delete file from Pinata
  const deleteFile = async (fileId) => {
    const fileToDelete = files.find(file => file.id === fileId);
    if (!fileToDelete) return;

    if (!pinataApiKey || !pinataSecretKey) {
      showModal('API Keys Required', 'Please provide both Pinata API Key and Secret Key to delete files.', 'warning');
      return;
    }

    setDeletingFile(fileId);

    try {
      // Delete from Pinata
      await deleteFromPinata(fileToDelete.upload.hash);
      
      showModal('File Deleted!', 'The file has been successfully removed from IPFS.', 'success');
      
      // Refresh the file list from Pinata
      await fetchFilesFromPinata();
    } catch (error) {
      console.error('Delete failed:', error);
      showModal('Delete Failed', `Failed to delete file: ${error.message}. Please try again.`, 'error');
    } finally {
      setDeletingFile(null);
    }
  };

  // Copy link to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showModal('Link Copied!', 'The file link has been copied to your clipboard. You can now paste it anywhere!', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 sm:mb-6 shadow-2xl">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            D-Vault
          </h1>
          <p className="text-lg sm:text-xl text-purple-200 mb-6 sm:mb-8 px-4">Your Gateway to Decentralized Storage</p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{files.length}</div>
              <div className="text-purple-200 text-xs sm:text-sm">Files Stored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">∞</div>
              <div className="text-purple-200 text-xs sm:text-sm">Storage Limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">🔗</div>
              <div className="text-purple-200 text-xs sm:text-sm">IPFS Network</div>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/20 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">🔑 API Configuration</h2>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              {showInstructions ? 'Hide' : 'Show'} Setup Guide
            </button>
          </div>

          {showInstructions && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">📋 How to Get Your Pinata API Keys</h3>
              <div className="space-y-3 sm:space-y-4 text-purple-100 text-sm sm:text-base">
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="font-semibold">Create Pinata Account</p>
                    <p className="text-xs sm:text-sm opacity-80">Go to <a href="https://app.pinata.cloud/" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 underline">app.pinata.cloud</a> and sign up for a free account</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="font-semibold">Navigate to API Keys</p>
                    <p className="text-xs sm:text-sm opacity-80">In your dashboard, click on "API Keys" in the sidebar</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="font-semibold">Create New API Key</p>
                    <p className="text-xs sm:text-sm opacity-80">Click "Create New Key" and give it a name (e.g., "D-Vault")</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">4</div>
                  <div>
                    <p className="font-semibold">Copy Both Keys</p>
                    <p className="text-xs sm:text-sm opacity-80">You'll see both an <strong>API Key</strong> and a <strong>Secret Key</strong> - copy both!</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">5</div>
                  <div>
                    <p className="font-semibold">Paste Below</p>
                    <p className="text-xs sm:text-sm opacity-80">Paste your keys in the fields below and click "Save API Keys"</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2 sm:mb-3">
                🔑 Pinata API Key
              </label>
              <input
                type="password"
                value={pinataApiKey}
                onChange={(e) => setPinataApiKey(e.target.value)}
                placeholder="Paste your Pinata API key here"
                className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2 sm:mb-3">
                🔐 API Secret Key
              </label>
              <input
                type="password"
                value={pinataSecretKey}
                onChange={(e) => setPinataSecretKey(e.target.value)}
                placeholder="Paste your Pinata Secret key here"
                className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              />
            </div>
          </div>
          <button
            onClick={saveApiKeys}
            className="mt-4 sm:mt-6 w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            💾 Save API Keys
          </button>
        </div>

        {/* File Upload Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">📤 Upload Files to IPFS</h2>
          <div className="space-y-4 sm:space-y-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-purple-200 mb-2 sm:mb-3">
                📁 Select Your File
              </label>
              <div className="border-2 border-dashed border-purple-300/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center hover:border-purple-400 transition-all duration-300">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-4xl sm:text-6xl">📁</div>
                  <p className="text-purple-200 font-semibold text-sm sm:text-base">Click to select a file</p>
                  <p className="text-purple-300 text-xs sm:text-sm">or drag and drop here</p>
                </div>
              </div>
            </div>
            
            {selectedFile && (
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-300/30">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="text-3xl sm:text-4xl">📄</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold text-sm sm:text-base truncate">{selectedFile.name}</p>
                    <p className="text-purple-200 text-xs sm:text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleFileUpload}
              disabled={uploading || !selectedFile}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              {uploading ? '🚀 Uploading to IPFS...' : '🚀 Upload to IPFS'}
            </button>
            
            {uploading && (
              <div className="w-full bg-white/10 rounded-full h-2 sm:h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">📂 Your Files on IPFS</h2>
            <button
              onClick={fetchFilesFromPinata}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              {loading ? '🔄 Refreshing...' : '🔄 Refresh Files'}
            </button>
          </div>
          
          {!pinataApiKey || !pinataSecretKey ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔑</div>
              <p className="text-purple-200 text-lg sm:text-xl">Please save your API keys to view files</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-spin">🔄</div>
              <p className="text-purple-200 text-lg sm:text-xl">Loading files from IPFS...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📭</div>
              <p className="text-purple-200 text-lg sm:text-xl">No files found on IPFS</p>
              <p className="text-purple-300 text-sm sm:text-base">Upload your first file to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {files.map((file) => (
                <div key={file.id} className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="text-3xl sm:text-4xl flex-shrink-0">📄</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white text-base sm:text-lg truncate">{file.name}</h3>
                        <p className="text-purple-200 text-xs sm:text-sm">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • 
                          {new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteFile(file.id)}
                      disabled={deletingFile === file.id}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm w-full sm:w-auto"
                    >
                      {deletingFile === file.id ? '🗑️ Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                      <span className="text-xs sm:text-sm font-semibold text-purple-200">
                        🌐 IPFS Gateway
                      </span>
                      <button
                        onClick={() => copyToClipboard(file.upload.url)}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        📋 Copy Link
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-purple-300 break-all">
                        <strong>🔗 Hash:</strong> <span className="font-mono">{file.upload.hash}</span>
                      </p>
                      <a
                        href={file.upload.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-300 hover:text-purple-200 break-all underline block"
                      >
                        {file.upload.url}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default DecentralizedStorage; 