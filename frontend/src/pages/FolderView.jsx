import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ChevronLeft, Folder, X, Trash, Command, Copy, Check } from 'lucide-react';
import api from '../utils/api';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Subfolder Modal Component
const CreateSubFolderModal = ({ mainFolderId, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/folders/sub', {
        ...data,
        mainFolder: mainFolderId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subFolders', mainFolderId]);
      onClose();
    },
    onError: (error) => {
      console.error('Error creating subfolder:', error);
      alert('Failed to create subfolder');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Subfolder</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="3"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// CommandsList Component
const CommandsList = ({ mainFolderId, subFolderId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commandToDelete, setCommandToDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

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

  const deleteMutation = useMutation({
    mutationFn: async (commandId) => {
      await api.delete(`/commands/${commandId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['commands', mainFolderId, subFolderId]);
      setDeleteModalOpen(false);
      setCommandToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting command:', error);
      alert('Failed to delete command. Please try again.');
    }
  });

  const handleDeleteClick = (command) => {
    setCommandToDelete(command);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (commandToDelete) {
      try {
        await deleteMutation.mutateAsync(commandToDelete._id);
      } catch (error) {
        console.error('Error in delete confirmation:', error);
      }
    }
  };

  const handleCopy = async (command) => {
    try {
      await navigator.clipboard.writeText(command.command);
      setCopiedId(command._id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) return <div>Loading commands...</div>;

  return (
    <>
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
              <div className="bg-gray-50 rounded p-3 mb-4 relative group">
                <code className="text-sm text-gray-800 break-all">{command.command}</code>
                <button
                  onClick={() => handleCopy(command)}
                  className="absolute right-2 top-2 p-1.5 rounded-md bg-white shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Copy command"
                >
                  {copiedId === command._id ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
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
                <div className="space-x-3">
                  <button
                    onClick={() => navigate(`/commands/${command._id}/edit`)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(command)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Command"
        message="Are you sure you want to delete this command? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCommandToDelete(null);
        }}
      />
    </>
  );
};

// Main FolderView Component
const FolderView = () => {
  const { folderId, subFolderId } = useParams();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();
  const location = useLocation();

  const { data: mainFolder, isLoading: isLoadingFolder } = useQuery({
    queryKey: ['mainFolder', folderId],
    queryFn: async () => {
      const { data } = await api.get(`/folders/main/${folderId}`);
      return data;
    }
  });

  const { data: currentSubFolder } = useQuery({
    queryKey: ['subFolder', subFolderId],
    queryFn: async () => {
      if (!subFolderId) return null;
      const { data } = await api.get(`/folders/sub/single/${subFolderId}`);
      return data;
    },
    enabled: !!subFolderId
  });

  const { data: subFolders = [], isLoading: isLoadingSubFolders } = useQuery({
    queryKey: ['subFolders', folderId],
    queryFn: async () => {
      const { data } = await api.get(`/folders/sub/${folderId}`);
      return data;
    },
    enabled: !subFolderId
  });

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

      {subFolderId ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">{currentSubFolder?.name} Commands</h2>
          <CommandsList mainFolderId={folderId} subFolderId={subFolderId} />
        </div>
      ) : (
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
          
          <h2 className="text-xl font-semibold mb-4">Main Folder Commands</h2>
          <CommandsList mainFolderId={folderId} />
        </>
      )}

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