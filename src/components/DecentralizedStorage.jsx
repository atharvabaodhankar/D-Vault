import { useState, useEffect } from 'react';

const DecentralizedStorage = () => {
  const [pinataApiKey, setPinataApiKey] = useState('');
  const [pinataSecretKey, setPinataSecretKey] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedPinataKey = localStorage.getItem('pinataApiKey');
    const savedPinataSecret = localStorage.getItem('pinataSecretKey');
    
    if (savedPinataKey) setPinataApiKey(savedPinataKey);
    if (savedPinataSecret) setPinataSecretKey(savedPinataSecret);
    
    // Load saved files
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    }
  }, []);

  // Save API keys to localStorage
  const saveApiKeys = () => {
    localStorage.setItem('pinataApiKey', pinataApiKey);
    localStorage.setItem('pinataSecretKey', pinataSecretKey);
    alert('API keys saved successfully!');
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

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    if (!pinataApiKey || !pinataSecretKey) {
      alert('Please provide both Pinata API Key and Secret Key!');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(50);
      const pinataResult = await uploadToPinata(selectedFile);
      setUploadProgress(100);

      // Add to files list
      const newFileEntry = {
        id: Date.now(),
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        uploadDate: new Date().toISOString(),
        upload: pinataResult
      };

      const updatedFiles = [newFileEntry, ...files];
      setFiles(updatedFiles);
      localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));

      setSelectedFile(null);
      alert('File uploaded successfully to Pinata!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
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

  // Delete file from list
  const deleteFile = (fileId) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
  };

  // Copy link to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">D-Vault</h1>
          <p className="text-gray-600">Decentralized File Storage with Pinata</p>
        </div>

        {/* API Keys Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pinata Configuration</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pinata API Key
              </label>
              <input
                type="password"
                value={pinataApiKey}
                onChange={(e) => setPinataApiKey(e.target.value)}
                placeholder="Enter your Pinata API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret Key
              </label>
              <input
                type="password"
                value={pinataSecretKey}
                onChange={(e) => setPinataSecretKey(e.target.value)}
                placeholder="Enter your Pinata Secret key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={saveApiKeys}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save API Keys
          </button>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upload Files to Pinata</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {selectedFile && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
            <button
              onClick={handleFileUpload}
              disabled={uploading || !selectedFile}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading to Pinata...' : 'Upload to Pinata'}
            </button>
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Uploaded Files</h2>
          {files.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No files uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{file.name}</h3>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • 
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Pinata IPFS
                      </span>
                      <button
                        onClick={() => copyToClipboard(file.upload.url)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Copy Link
                      </button>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500">
                        <strong>Hash:</strong> {file.upload.hash}
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Gateway:</strong> {file.upload.gateway}
                      </p>
                      <a
                        href={file.upload.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 break-all"
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
    </div>
  );
};

export default DecentralizedStorage; 