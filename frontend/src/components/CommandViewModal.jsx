import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const CommandViewModal = ({ command, onClose }) => {
  const [copied, setCopied] = useState(false);

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
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          <div className="relative p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
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

            {/* Command and Copy Button */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 relative group">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {command.command}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50"
                title="Copy command"
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
            <div className="space-y-2">
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
                <span className="text-sm">
                  {command.mainFolder?.name}
                  {command.subFolder?.name && ` → ${command.subFolder.name}`}
                </span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandViewModal;