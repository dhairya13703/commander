// frontend/src/pages/FolderView.jsx
import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ChevronLeft, Folder, X, Trash, Command } from 'lucide-react';
import api from '../utils/api';

// ... (keep CreateSubFolderModal component the same) ...

const CommandsList = ({ mainFolderId, subFolderId }) => {
  const navigate = useNavigate();
  const { data: commands = [], isLoading } = useQuery({
    queryKey: ['commands', mainFolderId, subFolderId],
    queryFn: async () => {
      const params = { mainFolder: mainFolderId };
      if (subFolderId) {
        params.subFolder = subFolderId;
      }
      const { data } = await api.get('/commands', { params });
      return data;
    }
  });

  if (isLoading) return <div>Loading commands...</div>;

  return (
    <div className="space-y-4">
      {commands.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No commands found. Create one using the New Command button.
        </div>
      ) : (
        commands.map((command) => (
          <div
            key={command._id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">{command.title}</h3>
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                {command.platform}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{command.description}</p>
            <div className="bg-gray-50 rounded p-3 mb-4">
              <code className="text-sm text-gray-800 break-all">{command.command}</code>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {command.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate(`/commands/${command._id}/edit`)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const FolderView = () => {
  const { folderId, subFolderId } = useParams();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();
  const location = useLocation();

  // Fetch main folder details
  const { data: mainFolder, isLoading: isLoadingFolder } = useQuery({
    queryKey: ['mainFolder', folderId],
    queryFn: async () => {
      const { data } = await api.get(`/folders/main/${folderId}`);
      return data;
    }
  });

  // Fetch current subfolder if we're in one
  const { data: currentSubFolder } = useQuery({
    queryKey: ['subFolder', subFolderId],
    queryFn: async () => {
      if (!subFolderId) return null;
      const { data } = await api.get(`/folders/sub/single/${subFolderId}`);
      return data;
    },
    enabled: !!subFolderId
  });

  // Fetch subfolders
  const { data: subFolders = [], isLoading: isLoadingSubFolders } = useQuery({
    queryKey: ['subFolders', folderId],
    queryFn: async () => {
      const { data } = await api.get(`/folders/sub/${folderId}`);
      return data;
    },
    enabled: !subFolderId // Only fetch subfolders list when not in a subfolder
  });

  // Delete subfolder mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/folders/sub/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subFolders', folderId]);
    }
  });

  const handleNewCommand = () => {
    navigate('/commands/new', {
      state: {
        mainFolder: folderId,
        subFolder: subFolderId || null
      }
    });
  };

  const handleDeleteSubFolder = (id) => {
    if (window.confirm('Are you sure you want to delete this subfolder?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoadingFolder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/folder/${folderId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            {mainFolder?.name}
          </button>
          {currentSubFolder && (
            <>
              <ChevronLeft className="w-5 h-5 mx-2" />
              <span className="font-medium">{currentSubFolder.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 mb-6">
        {!subFolderId && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Subfolder
          </button>
        )}
        <button
          onClick={handleNewCommand}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Command className="w-4 h-4 mr-2" />
          New Command
        </button>
      </div>

      {/* Content */}
      {subFolderId ? (
        // Show commands for the current subfolder
        <div>
          <h2 className="text-xl font-semibold mb-4">{currentSubFolder?.name} Commands</h2>
          <CommandsList mainFolderId={folderId} subFolderId={subFolderId} />
        </div>
      ) : (
        // Show subfolders grid
        <>
          <h2 className="text-xl font-semibold mb-4">Subfolders</h2>
          {isLoadingSubFolders ? (
            <div className="text-center py-4">Loading subfolders...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {subFolders.map((subfolder) => (
                <div
                  key={subfolder._id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center cursor-pointer flex-1"
                      onClick={() => navigate(`/folder/${folderId}/subfolder/${subfolder._id}`)}
                    >
                      <Folder className="w-5 h-5 text-indigo-500 mr-3" />
                      <div>
                        <h3 className="font-medium">{subfolder.name}</h3>
                        <p className="text-sm text-gray-500">{subfolder.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubFolder(subfolder._id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Main folder commands */}
          <h2 className="text-xl font-semibold mb-4">Main Folder Commands</h2>
          <CommandsList mainFolderId={folderId} />
        </>
      )}

      {/* Create Subfolder Modal */}
      {showCreateModal && (
        <CreateSubFolderModal
          mainFolderId={folderId}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default FolderView;