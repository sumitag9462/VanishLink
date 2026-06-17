import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const WorkspaceSettings = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data);
    } catch {
      toast.error('Failed to load workspaces');
    }
  };

   
  useEffect(() => {
     
    fetchWorkspaces();
  }, []);

  
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workspaces', { name: newWorkspaceName });
      
      setNewWorkspaceName('');
      fetchWorkspaces();
      toast.success('Workspace created successfully');
    } catch {
      toast.error('Server error');
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!activeWorkspaceId) return;

    try {
      await api.post(`/workspaces/${activeWorkspaceId}/invite`, { email: inviteEmail, role: inviteRole });
      
      setInviteEmail('');
      fetchWorkspaces();
      toast.success('User invited successfully');
    } catch {
      toast.error('Server error');
    }
  };

  const activeWorkspace = workspaces.find(w => w._id === activeWorkspaceId);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-2">Team Workspaces</h1>
      <p className="text-slate-400 mb-8">Manage your shared links, team members, and custom domains.</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar - Workspace List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Your Workspaces</h3>
            <div className="space-y-2">
              {workspaces.map(ws => (
                <button
                  key={ws._id}
                  onClick={() => setActiveWorkspaceId(ws._id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeWorkspaceId === ws._id 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {ws.name}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <form onSubmit={handleCreateWorkspace}>
                <input
                  type="text"
                  required
                  placeholder="New workspace name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white mb-2 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  type="submit"
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  + Create Workspace
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Panel - Active Workspace Details */}
        <div className="lg:col-span-3">
          {activeWorkspace ? (
            <div className="space-y-6">
              
              {/* Members Section */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{activeWorkspace.name} - Team Members</h2>
                    <p className="text-sm text-slate-400 mt-1">Manage access control for this workspace.</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-900/50 border-b border-slate-700">
                  <form onSubmit={handleInviteUser} className="flex gap-4">
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Invite
                    </button>
                  </form>
                </div>

                <table className="w-full text-left">
                  <thead className="bg-slate-900 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-sm font-medium text-slate-400">User Email</th>
                      <th className="px-6 py-3 text-sm font-medium text-slate-400">Role</th>
                      <th className="px-6 py-3 text-sm font-medium text-slate-400">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {activeWorkspace.members.map((member, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50">
                        <td className="px-6 py-4 text-white">{member.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium uppercase
                            ${member.role === 'admin' ? 'bg-red-500/20 text-red-400' : 
                              member.role === 'editor' ? 'bg-blue-500/20 text-blue-400' : 
                              'bg-green-500/20 text-green-400'}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Custom Domains Section */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-2">Custom Branded Domains</h2>
                <p className="text-sm text-slate-400 mb-4">Point your CNAME record to our servers to use your own domain.</p>
                
                {activeWorkspace.customDomains && activeWorkspace.customDomains.length > 0 ? (
                  <ul className="space-y-2 mb-4">
                    {activeWorkspace.customDomains.map((domain, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-white bg-slate-900 p-3 rounded-lg border border-slate-700">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {domain}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-500 italic mb-4">No custom domains configured.</div>
                )}
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. link.yourcompany.com" 
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    disabled
                  />
                  <button disabled className="bg-slate-700 text-slate-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
                    Add Domain
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Domain management requires contacting support in this version.</p>
              </div>

            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
              <p className="text-slate-400">Select or create a workspace to manage settings.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default WorkspaceSettings;
