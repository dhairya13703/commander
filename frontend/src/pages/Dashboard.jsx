// frontend/src/pages/Dashboard.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Plus } from 'lucide-react';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: commands = [], isLoading, error } = useQuery({
    queryKey: ['commands', searchQuery],
    queryFn: async () => {
      const url = searchQuery
        ? `/api/commands/search?q=${encodeURIComponent(searchQuery)}`
        : '/api/commands';
      const { data } = await axios.get(url);
      return data;
    }
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this command?')) {
      try {
        await axios.delete(`/api/commands/${id}`);
        // Refresh the commands list
        window.location.reload();
      } catch (error) {
        console.error('Error deleting command:', error);
        alert('Failed to delete command');
      }
    }
  };

  if (error) {
    return (
      <div className="text-red-500 text-center mt-4">
        Error loading commands: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Commands</h1>
        <button
          onClick={() => navigate('/commands/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Command
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">Loading commands...</div>
      ) : commands.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-xl">No commands found</p>
          <p className="mt-2">Start by adding your first command!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {commands.map((command) => (
            <div
              key={command._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {command.title}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                    {command.platform}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{command.description}</p>
                <div className="bg-gray-50 rounded p-3 mb-4">
                  <code className="text-sm text-gray-800 break-all">
                    {command.command}
                  </code>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {command.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => navigate(`/commands/${command._id}`)}
                    className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(command._id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;