const express = require('express');
const router = express.Router();
const { protect, requireTeacher } = require('../middleware/authMiddleware');
const { previewSimpleBulkImport, simpleBulkImportToCollection } = require('../controllers/simpleBulkImportController');

// Route pour prévisualiser l'import simple (sans sauvegarder)
// POST /api/simple-bulk-import/preview
router.post('/preview', protect, requireTeacher, previewSimpleBulkImport);

// Route pour import effectif dans une collection
// POST /api/simple-bulk-import/import
router.post('/import', protect, requireTeacher, simpleBulkImportToCollection);

module.exports = router;
