import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const DeveloperPortal = () => {
  const [keys, setKeys] = useState([]);
  const [name, setName] = useState('');
  const [newKeyData, setNewKeyData] = useState(null);

  const fetchKeys = async () => {
    try {
      const res = await api.get('/keys');
      setKeys(res.data);
    } catch {
      toast.error('Failed to fetch API keys');
    }
  };

   
  useEffect(() => {
     
    fetchKeys();
  }, []);

  
  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/keys', { name });
      
      setNewKeyData(res.data);
      setName('');
      fetchKeys();
      toast.success('API Key generated successfully');
    } catch {
      toast.error('Server error');
    }
  };

  const handleRevoke = async (id) => {
    try {
      await api.delete(`/keys/${id}`);
      toast.success('API Key revoked');
      fetchKeys();
    } catch {
      toast.error('Failed to revoke key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-2">Developer Portal</h1>
      <p className="text-slate-400 mb-8">Manage your API keys for programmatic access to VanishLink.</p>

      {newKeyData && (
        <div className="bg-green-900/30 border border-green-500/50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-green-400 mb-2">Save Your New API Key</h2>
          <p className="text-green-200/70 mb-4 text-sm">
            Please copy this key and store it securely. For security reasons, it will never be shown again!
          </p>
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={newKeyData.key} 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
            />
            <button 
              onClick={() => copyToClipboard(newKeyData.key)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Copy
            </button>
          </div>
          <button 
            onClick={() => setNewKeyData(null)}
            className="mt-4 text-sm text-slate-400 hover:text-white"
          >
            I have saved it, close this message.
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Generate New Key</h2>
            <form onSubmit={handleGenerate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-1">Key Name / Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Environment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Generate API Key
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium text-slate-400">Name</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-400">Created</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-400">Last Used</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {keys.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                      No API keys generated yet.
                    </td>
                  </tr>
                ) : (
                  keys.map(key => (
                    <tr key={key._id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{key.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{key.scopes.join(', ')}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleRevoke(key._id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPortal;
