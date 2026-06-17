const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const { authenticate } = require('./authRoutes');

router.use(authenticate);

// GET /api/workspaces
router.get('/', workspaceController.getWorkspaces);

// POST /api/workspaces
router.post('/', workspaceController.createWorkspace);

// POST /api/workspaces/:workspaceId/invite
router.post('/:workspaceId/invite', workspaceController.inviteUser);

module.exports = router;
