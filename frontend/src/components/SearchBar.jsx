import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommand, setSelectedCommand] = useState(null);
  const searchRef = useRef(null);
  
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

  // const handleCommandClick = (command) => {
  //   // Ensure mainFolder._id is used instead of the whole object
  //   const mainFolderId = command.mainFolder._id || command.mainFolder;
    
  //   if (command.subFolder) {
  //     const subFolderId = command.subFolder._id || command.subFolder;
  //     navigate(`/folder/${mainFolderId}/subfolder/${subFolderId}`);
  //   } else {
  //     navigate(`/folder/${mainFolderId}`);
  //   }
  //   setIsOpen(false);
  //   setSearchTerm('');
  // };

  const handleCommandClick = (command) => {
    setSelectedCommand(command);
    setIsOpen(false);
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