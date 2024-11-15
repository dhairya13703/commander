// frontend/src/pages/CommandEditor.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import { ChevronLeft } from 'lucide-react';
import api from '../utils/api';

const CommandEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);

  // Initialize formData with location state if available
  const [formData, setFormData] = useState({
    title: '',
    command: '',
    description: '',
    platform: 'universal',
    tags: '',
    mainFolder: location.state?.mainFolder || '',
    subFolder: location.state?.subFolder || ''
  });

  const [error, setError] = useState('');

  // Fetch all main folders
  const { data: mainFolders = [] } = useQuery({
    queryKey: ['mainFolders'],
    queryFn: async () => {
      const { data } = await api.get('/folders/main');
      return data;
    }
  });

  // Fetch subfolders based on selected main folder
  const { data: subFolders = [] } = useQuery({
    queryKey: ['subFolders', formData.mainFolder],
    queryFn: async () => {
      if (!formData.mainFolder) return [];
      const { data } = await api.get(`/folders/sub/${formData.mainFolder}`);
      return data;
    },
    enabled: !!formData.mainFolder
  });

  // Fetch command details if editing
  const { data: commandData } = useQuery({
    queryKey: ['command', id],
    queryFn: async () => {
      const { data } = await api.get(`/commands/${id}`);
      return data;
    },
    enabled: isEditing
  });

  // Update form when editing existing command
  useEffect(() => {
    if (commandData) {
      setFormData({
        title: commandData.title,
        command: commandData.command,
        description: commandData.description,
        platform: commandData.platform,
        tags: commandData.tags.join(', '),
        mainFolder: commandData.mainFolder,
        subFolder: commandData.subFolder || ''
      });
    }
  }, [commandData]);

  // Create/Update command mutation
  const commandMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return api.put(`/commands/${id}`, data);
      }
      return api.post('/commands', data);
    },
    onSuccess: () => {
      // Navigate back to the appropriate folder view
      if (formData.subFolder) {
        navigate(`/folder/${formData.mainFolder}/subfolder/${formData.subFolder}`);
      } else {
        navigate(`/folder/${formData.mainFolder}`);
      }
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to save command');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.mainFolder) {
        setError('Please select a main folder');
        return;
      }

      const commandData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        mainFolder: formData.mainFolder,
        subFolder: formData.subFolder || undefined
      };

      await commandMutation.mutateAsync(commandData);
    } catch (err) {
      console.error('Error saving command:', err);
    }
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Command' : 'New Command'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* Folder Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Folder *
            </label>
            <select
              value={formData.mainFolder}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  mainFolder: e.target.value,
                  subFolder: '' // Reset subfolder when main folder changes
                }));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Main Folder</option>
              {mainFolders.map((folder) => (
                <option key={folder._id} value={folder._id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub Folder (Optional)
            </label>
            <select
              value={formData.subFolder}
              onChange={(e) => setFormData({ ...formData, subFolder: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={!formData.mainFolder}
            >
              <option value="">No Subfolder</option>
              {subFolders.map((folder) => (
                <option key={folder._id} value={folder._id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Command Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Command Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Command */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Command *
          </label>
          <div className="mt-1 border rounded-md overflow-hidden">
            <Editor
              height="200px"
              language="shell"
              value={formData.command}
              onChange={(value) => setFormData({ ...formData, command: value })}
              options={{
                minimap: { enabled: false },
                lineNumbers: 'off',
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Platform */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platform *
          </label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="universal">Universal</option>
            <option value="linux">Linux</option>
            <option value="macos">macOS</option>
            <option value="windows">Windows</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="git, docker, networking"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={commandMutation.isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {commandMutation.isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommandEditor;