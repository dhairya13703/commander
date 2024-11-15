// frontend/src/pages/CommandEditor.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Editor from '@monaco-editor/react';

// Predefined categories with their tags
const categories = {
  git: {
    name: 'Git',
    tags: ['git', 'github', 'gitlab', 'version-control']
  },
  aws: {
    name: 'AWS',
    tags: ['aws', 'amazon', 'cloud', 'ec2', 's3', 'lambda']
  },
  azure: {
    name: 'Azure',
    tags: ['azure', 'microsoft', 'cloud']
  },
  linux: {
    name: 'Linux',
    tags: ['linux', 'ubuntu', 'debian', 'centos', 'fedora', 'shell']
  },
  docker: {
    name: 'Docker',
    tags: ['docker', 'container', 'dockerfile']
  },
  kubernetes: {
    name: 'Kubernetes',
    tags: ['kubernetes', 'k8s', 'container-orchestration']
  },
  terraform: {
    name: 'Terraform',
    tags: ['terraform', 'infrastructure', 'iac']
  },
  networking: {
    name: 'Networking',
    tags: ['networking', 'ssh', 'ssl', 'dns', 'tcp/ip']
  }
};

const CommandEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    command: '',
    description: '',
    platform: 'universal',
    tags: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customTag, setCustomTag] = useState('');

  const { data: existingCommand } = useQuery({
    queryKey: ['command', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await axios.get(`/api/commands/${id}`);
      return data;
    },
    enabled: isEditing
  });

  useEffect(() => {
    if (existingCommand) {
      setFormData({
        title: existingCommand.title,
        command: existingCommand.command,
        description: existingCommand.description,
        platform: existingCommand.platform,
        tags: existingCommand.tags
      });
    }
  }, [existingCommand]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);

      const commandData = {
        ...formData,
        tags: [...formData.tags]
      };

      if (isEditing) {
        await axios.put(`/api/commands/${id}`, commandData);
      } else {
        await axios.post('/api/commands', commandData);
      }

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save command');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const addTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      addTag(customTag.trim());
      setCustomTag('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Command' : 'New Command'}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="e.g., Git Clone Repository"
          />
        </div>

        <div>
          <label htmlFor="command" className="block text-sm font-medium text-gray-700">
            Command
          </label>
          <div className="mt-1 border rounded-md overflow-hidden">
            <Editor
              height="200px"
              language="shell"
              value={formData.command}
              onChange={(value) => setFormData(prev => ({ ...prev, command: value }))}
              options={{
                minimap: { enabled: false },
                lineNumbers: 'off',
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Explain what this command does..."
          />
        </div>

        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
            Platform
          </label>
          <select
            id="platform"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="universal">Universal</option>
            <option value="linux">Linux</option>
            <option value="macos">macOS</option>
            <option value="windows">Windows</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          
          <div className="flex gap-2 mb-4">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Category</option>
              {Object.entries(categories).map(([key, category]) => (
                <option key={key} value={key}>{category.name}</option>
              ))}
            </select>
            
            {selectedCategory && (
              <select
                onChange={(e) => addTag(e.target.value)}
                value=""
                className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Tag</option>
                {categories[selectedCategory].tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
              placeholder="Add custom tag..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Command'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommandEditor;