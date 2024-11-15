// frontend/src/pages/Dashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Settings } from 'lucide-react';
import { FolderList } from '../components/FolderManagement';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const { data: mainFolders = [], isLoading, error } = useQuery({
    queryKey: ['mainFolders'],
    queryFn: async () => {
      try {
        console.log('Fetching folders with auth:', isAuthenticated);
        const { data } = await api.get('/folders/main');
        return data;
      } catch (err) {
        console.error('Error fetching folders:', err);
        throw err;
      }
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: 1, // Limit retries
  });

  const handleCreateFolder = async () => {
    try {
      await api.post('/folders/main', {
        name: 'New Folder',
        description: 'A new folder'
      });
      // Invalidate and refetch
      queryClient.invalidateQueries(['mainFolders']);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Please log in to view your dashboard</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Command Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Settings className="h-5 w-5 mr-2" />
              Manage Folders
            </button>
            <button
              onClick={() => navigate('/commands/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Command
            </button>
          </div>
        </div>

        {error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-red-600">
              Error loading folders. Please try again.
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-indigo-600">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading folders...
            </div>
          </div>
        ) : mainFolders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium">No folders found</h3>
              <p className="mt-1">Click "Manage Folders" to create your first folder</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mainFolders.map((folder) => (
              <div
                key={folder._id}
                onClick={() => navigate(`/folder/${folder._id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer p-4"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{folder.icon || '📁'}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{folder.name}</h3>
                    <p className="text-sm text-gray-500">{folder.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <FolderList isMain={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;