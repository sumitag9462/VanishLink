const Workspace = require('../models/Workspace');
const User = require('../models/User');

exports.createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.sub || req.user._id;
    const email = req.user.email;

    const workspace = new Workspace({
      name,
      owner: userId,
      members: [{ user: userId, email, role: 'admin' }]
    });

    await workspace.save();
    res.status(201).json(workspace);
  } catch (err) {
    console.error('Error creating workspace:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.inviteUser = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    // Check if inviter is admin
    const inviter = workspace.members.find(m => m.user.toString() === (req.user.sub || req.user._id).toString());
    if (!inviter || inviter.role !== 'admin') {
      return res.status(403).json({ message: 'Must be workspace admin to invite users' });
    }

    // Find user to invite
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'User with that email not found on platform' });
    }

    if (workspace.members.some(m => m.email === email)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    workspace.members.push({ user: userToInvite._id, email, role: role || 'viewer' });
    await workspace.save();

    res.json(workspace);
  } catch (err) {
    console.error('Error inviting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ 'members.user': req.user.sub || req.user._id });
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
