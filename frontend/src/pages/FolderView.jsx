// frontend/src/pages/FolderView.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ChevronLeft, Folder, X, Trash } from 'lucide-react';
import api from '../utils/api';

const CreateSubFolderModal = ({ mainFolderId, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return api.post('/folders/sub', {
        ...data,
        mainFolder: mainFolderId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subFolders', mainFolderId]);
      onClose();
    },
    onError: (error) => {
      console.error('Error creating subfolder:', error);
      alert(error.response?.data?.message || 'Failed to create subfolder');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Create New Subfolder</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows="3"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create Subfolder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FolderView = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch main folder details
  const { data: mainFolder, isLoading: isLoadingFolder } = useQuery({
    queryKey: ['mainFolder', folderId],
    queryFn: async () => {
      const { data } = await api.get(`/folders/main/${folderId}`);
      return data;
    }
  });

  // Fetch subfolders
  const { data: subFolders = [], isLoading: isLoadingSubFolders } = useQuery({
    queryKey: ['subFolders', folderId],
    queryFn: async () => {
      const { data } = await api.get(`/folders/sub/${folderId}`);
      return data;
    }
  });

  // Delete subfolder mutation
  const deleteMutation = useMutation({
    mutationFn: async (subFolderId) => {
      await api.delete(`/folders/sub/${subFolderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subFolders', folderId]);
    }
  });

  const handleDeleteSubFolder = (subFolderId) => {
    if (window.confirm('Are you sure you want to delete this subfolder?')) {
      deleteMutation.mutate(subFolderId);
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
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{mainFolder?.name}</h1>
          <p className="text-gray-600">{mainFolder?.description}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Subfolder
        </button>
      </div>

      {/* Subfolders Grid */}
      {isLoadingSubFolders ? (
        <div className="text-center py-4">Loading subfolders...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subFolders.map((subfolder) => (
            <div
              key={subfolder._id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Folder className="w-5 h-5 text-indigo-500 mr-3" />
                  <div>
                    <h3 className="font-medium">{subfolder.name}</h3>
                    <p className="text-sm text-gray-500">{subfolder.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSubFolder(subfolder._id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
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