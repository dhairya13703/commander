// frontend/src/components/SearchBar.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, Copy, Check, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const CommandViewModal = ({ command, onClose }) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Function to navigate to location
  const handleGoToLocation = () => {
    const mainFolderId = command.mainFolder?._id || command.mainFolder;
    if (command.subFolder) {
      const subFolderId = command.subFolder?._id || command.subFolder;
      navigate(`/folder/${mainFolderId}/subfolder/${subFolderId}`);
    } else {
      navigate(`/folder/${mainFolderId}`);
    }
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
          onClick={onClose}
        />

        <div className="relative inline-block w-full max-w-2xl p-6 my-8 text-left bg-white rounded-lg shadow-xl transform transition-all">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {command.title}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Command Box */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 relative group">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto">
              {command.command}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>

          {/* Description */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-gray-600">{command.description}</p>
          </div>

          {/* Metadata */}
          <div className="space-y-2 mb-6">
            {/* Platform */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Platform:</span>
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                {command.platform}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Location:</span>
              <button
                onClick={handleGoToLocation}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {command.mainFolder?.name}
                {command.subFolder?.name && ` → ${command.subFolder.name}`}
              </button>
            </div>

            {/* Tags */}
            {command.tags?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Tags:</span>
                {command.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {copied ? 'Copied!' : 'Copy Command'}
            </button>
            <button
              onClick={() => {
                onClose();
                navigate(`/commands/${command._id}/edit`);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Edit Command
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommand, setSelectedCommand] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const { data } = await api.get(`/commands/search?q=${encodeURIComponent(searchTerm)}`);
      return data;
    },
    enabled: searchTerm.length > 2
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        searchRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommandClick = (command) => {
    setSelectedCommand(command);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-72 px-4 py-2 flex items-center gap-2 text-gray-400 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Search commands...</span>
        <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded">⌘K</span>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 text-center">
            <div 
              className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            <div className="inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
              <div className="relative">
                <div className="flex items-center px-4 py-3 border-b">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search commands..."
                    className="w-full px-3 py-1 text-base text-gray-900 placeholder-gray-500 focus:outline-none"
                    autoFocus
                  />
                  <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border rounded-md">
                    ESC
                  </kbd>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 && searchTerm.length > 2 ? (
                    <div className="p-4 text-center text-gray-500">
                      No commands found
                    </div>
                  ) : (
                    <div className="py-2">
                      {searchResults.map((command) => (
                        <button
                          key={command._id}
                          onClick={() => handleCommandClick(command)}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-100 transition-colors"
                        >
                          <Command className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900">
                              {command.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {command.command}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {command.platform}
                              </span>
                              {command.mainFolder?.name && (
                                <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                                  {command.mainFolder.name}
                                </span>
                              )}
                              {command.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="text-xs text-gray-500"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Command View Modal */}
      {selectedCommand && (
        <CommandViewModal
          command={selectedCommand}
          onClose={() => setSelectedCommand(null)}
        />
      )}
    </>
  );
};

export default SearchBar;