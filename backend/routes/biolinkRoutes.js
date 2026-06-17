const express = require('express');
const router = express.Router();
const biolinkController = require('../controllers/biolinkController');
const { requireAuthOrApiKey } = require('../middleware/multiAuthMiddleware');
const { requireWorkspaceRole: rbac } = require('../middleware/rbacMiddleware');

// Public route to view biolink
router.get('/view/:username', biolinkController.getBiolinkByUsername);

// Protected routes to manage biolinks
router.post('/', requireAuthOrApiKey('links:write'), rbac(['admin', 'editor']), biolinkController.createBiolink);
router.put('/:id', requireAuthOrApiKey('links:write'), rbac(['admin', 'editor']), biolinkController.updateBiolink);

module.exports = router;
