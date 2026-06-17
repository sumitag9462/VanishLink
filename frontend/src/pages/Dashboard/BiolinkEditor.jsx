import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const BiolinkEditor = () => {
  // Form state
    const [username, setUsername] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [profileName, setProfileName] = useState('');
  const [bio, setBio] = useState('');
  const [theme] = useState({
    backgroundColor: '#0f172a',
    textColor: '#ffffff',
    buttonColor: '#1e293b',
    buttonTextColor: '#ffffff'
  });
  const [links, setLinks] = useState([]);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces');
      if (res.data.length > 0) setWorkspaceId(res.data[0]._id);
    } catch {
      toast.error('Failed to load workspaces');
    }
  };

   
  useEffect(() => {
     
    fetchWorkspaces();
    // Assuming the user has one biolink, we'd normally fetch it.
    // For this implementation, we allow creating a new one.
  }, []);

  
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username,
        workspaceId,
        profileName,
        bio,
        theme,
        links
      };

      const res = await api.post('/biolinks', payload);
            toast.success('Biolink page published!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server error');
    }
  };

  const addLink = () => {
    setLinks([...links, { title: '', url: '', isActive: true }]);
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-2">Biolink Editor</h1>
      <p className="text-slate-400 mb-8">Create your customized Link-in-Bio landing page.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Editor Form */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Profile Identity</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Public Username</label>
                <div className="flex bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                  <span className="px-3 py-2 text-slate-500 bg-slate-800 border-r border-slate-700">vanish.link/bio/</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 bg-transparent px-3 py-2 text-white focus:outline-none"
                    placeholder="yourname"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Your Brand Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Bio Description</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Tell your audience about yourself..."
                  rows="3"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Links</h2>
                <button 
                  type="button" 
                  onClick={addLink}
                  className="text-indigo-400 text-sm hover:text-indigo-300 font-medium"
                >
                  + Add Link
                </button>
              </div>
              
              {links.map((link, index) => (
                <div key={index} className="p-4 bg-slate-900 border border-slate-700 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Link Title (e.g., My Portfolio)"
                    value={link.title}
                    onChange={(e) => updateLink(index, 'title', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
                  />
                  <input
                    type="url"
                    placeholder="https://"
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
                  />
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeLink(index)} className="text-red-400 text-xs hover:underline">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Publish Biolink
            </button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="flex justify-center">
          <div className="w-[350px] h-[700px] bg-black rounded-[3rem] border-8 border-slate-800 overflow-hidden relative shadow-2xl">
            <div 
              className="absolute inset-0 w-full h-full p-6"
              style={{ backgroundColor: theme.backgroundColor }}
            >
              <div className="text-center mt-12 space-y-4">
                <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto border-4 border-slate-800"></div>
                <h2 style={{ color: theme.textColor }} className="text-2xl font-bold">{profileName || 'Your Name'}</h2>
                <p style={{ color: theme.textColor }} className="text-sm opacity-80">{bio || 'Your bio goes here.'}</p>
              </div>

              <div className="mt-8 space-y-3">
                {links.map((link, i) => (
                  <div 
                    key={i}
                    style={{ backgroundColor: theme.buttonColor, color: theme.buttonTextColor }}
                    className="w-full py-3 px-4 rounded-xl text-center font-medium shadow-sm wrap-break-word"
                  >
                    {link.title || 'Link Title'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BiolinkEditor;
