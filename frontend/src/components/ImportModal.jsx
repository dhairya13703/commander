import { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import api from '../utils/api';

const ImportModal = ({ isOpen, onClose, mainFolderId, subFolderId, onImportComplete }) => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);
  const [file, setFile] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      setError('Please upload a CSV file');
      return;
    }

    setFile(file);
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validData = results.data.filter(item => 
          item.title && item.command && item.description
        );
        setPreview(validData.slice(0, 5));
        setError(results.errors.length > 0 ? 'Some rows contain errors' : '');
      },
      error: (error) => {
        setError('Error parsing CSV file: ' + error.message);
      }
    });
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      setError('');

      // Parse the entire file
      const results = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          complete: resolve,
          error: reject,
        });
      });

      // Filter valid data
      const validData = results.data.filter(item => 
        item.title && item.command && item.description
      ).map(item => ({
        ...item,
        mainFolder: mainFolderId,
        subFolder: subFolderId || undefined,
        platform: item.platform || 'universal',
        tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : []
      }));

      if (validData.length === 0) {
        setError('No valid commands found in the CSV file');
        return;
      }

      // Import commands in batches
      const batchSize = 50;
      for (let i = 0; i < validData.length; i += batchSize) {
        const batch = validData.slice(i, i + batchSize);
        await api.post('/commands/batch', { commands: batch });
      }

      onImportComplete();
      onClose();
    } catch (error) {
      setError('Failed to import commands: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Commands</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Click to upload CSV file or drag and drop
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Required columns: title, command, description
              </span>
            </label>
          </div>
          
          {file && (
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              {file.name}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}
        </div>

        {preview.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview (first 5 entries):</h3>
            <div className="bg-gray-50 rounded-md p-4 space-y-3">
              {preview.map((item, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-gray-600 text-xs mt-1">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <a
            href="/template.csv"
            download
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Download CSV Template
          </a>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import Commands'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;