// frontend/src/components/ConfirmationModal.jsx
import { X } from 'lucide-react';

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

// Update the CommandsList component in FolderView
const CommandsList = ({ mainFolderId, subFolderId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commandToDelete, setCommandToDelete] = useState(null);

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
      await deleteMutation.mutateAsync(commandToDelete._id);
      setDeleteModalOpen(false);
      setCommandToDelete(null);
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
                <div className="flex space-x-3">
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
