const Workspace = require('../models/Workspace');

exports.requireWorkspaceRole = (roles = ['admin', 'editor', 'viewer']) => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.body.workspaceId || req.query.workspaceId || req.params.workspaceId;
      if (!workspaceId) {
        // If no workspace is specified, assume personal namespace (legacy behavior)
        return next();
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const member = workspace.members.find(m => m.user.toString() === (req.user.sub || req.user._id).toString());
      if (!member) {
        return res.status(403).json({ message: 'Access denied: not a member of this workspace' });
      }

      if (!roles.includes(member.role)) {
        return res.status(403).json({ message: `Access denied: requires one of roles: ${roles.join(', ')}` });
      }

      // Attach workspace to request for downstream handlers
      req.workspace = workspace;
      next();
    } catch (err) {
      console.error('RBAC Error:', err);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
};
