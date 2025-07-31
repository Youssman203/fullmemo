const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const FlashcardModel = require('../models/flashcardModel');
const CollectionModel = require('../models/collectionModel');

// Configuration multer pour upload fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/bulk');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,  
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Utilisez CSV, XLS ou XLSX.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
}).single('bulkFile');

// Parse CSV file - FORMAT SIMPLE: Question,Réponse
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({
        headers: ['question', 'answer'], // Seulement 2 colonnes
        skipEmptyLines: true
      }))
      .on('data', (data) => {
        // Validation simple: seulement question et réponse
        if (data.question && data.answer) {
          results.push({
            question: data.question.trim(),
            answer: data.answer.trim(),
            difficulty: 'medium', // Difficulté par défaut
            tags: ['import'] // Tag par défaut
          });
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Parse Excel file - FORMAT SIMPLE: Colonne A=Question, B=Réponse
const parseExcel = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const results = [];
    // Skip header row if exists (Question, Réponse)
    const startRow = jsonData[0] && (jsonData[0][0] === 'Question' || jsonData[0][0] === 'question') ? 1 : 0;
    
    for (let i = startRow; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row[0] && row[1]) { // Question et réponse obligatoires
        results.push({
          question: String(row[0]).trim(),
          answer: String(row[1]).trim(),
          difficulty: 'medium', // Difficulté par défaut
          tags: ['import'] // Tag par défaut
        });
      }
    }
    
    return results;
  } catch (error) {
    throw new Error('Erreur lors de la lecture du fichier Excel');
  }
};

// Validation simple des données
const validateCardData = (cardData) => {
  const errors = [];
  
  if (!cardData.question || cardData.question.length < 3) {
    errors.push("Question trop courte (minimum 3 caractères)");
  }
  
  if (!cardData.answer || cardData.answer.length < 1) {
    errors.push("Réponse obligatoire");
  }
  
  return { errors, data: cardData };
};

// Preview import (sans sauvegarde)
const previewSimpleBulkImport = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier uploadé'
      });
    }
    
    try {
      const filePath = req.file.path;
      let parsedData = [];
      
      console.log('📄 Fichier reçu:', req.file.originalname);
      
      // Parser selon le type de fichier  
      if (req.file.originalname.endsWith('.csv')) {
        parsedData = await parseCSV(filePath);
      } else {
        parsedData = parseExcel(filePath);
      }
      
      console.log('📊 Données parsées:', parsedData.length, 'cartes potentielles');
      
      // Validation des données
      const validationResults = parsedData.map((card, index) => ({
        index: index + 1,
        ...validateCardData(card)
      }));
      
      const validCards = validationResults.filter(result => result.errors.length === 0);
      const invalidCards = validationResults.filter(result => result.errors.length > 0);
      
      console.log('✅ Cartes valides:', validCards.length);
      console.log('❌ Cartes invalides:', invalidCards.length);
      
      // Nettoyage du fichier temporaire
      fs.unlinkSync(filePath);
      
      // Préparer les données de preview (5 premières cartes valides)
      const previewData = validCards.slice(0, 5).map(result => result.data);
      
      res.json({
        success: true,
        data: {
          totalRows: parsedData.length,
          validCards: validCards.length,
          invalidCards: invalidCards.length,
          previewData: previewData,
          errors: invalidCards.map(invalid => ({
            row: invalid.index,
            errors: invalid.errors
          }))
        },
        message: `Analyse terminée: ${validCards.length} cartes valides sur ${parsedData.length}`
      });
      
    } catch (error) {
      console.error('❌ Erreur preview:', error);
      
      // Nettoyage en cas d'erreur
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
};

// Import effectif dans une collection
const simpleBulkImportToCollection = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier uploadé'
      });
    }
    
    const { collectionId, createNewCollection, newCollectionName } = req.body;
    console.log('📥 Import demandé:', { collectionId, createNewCollection, newCollectionName });
    
    try {
      let targetCollection;
      
      // Créer nouvelle collection ou utiliser existante
      if (createNewCollection === 'true') {
        if (!newCollectionName) {
          return res.status(400).json({
            success: false,
            message: 'Nom de collection requis'
          });
        }
        
        targetCollection = new CollectionModel({
          name: newCollectionName.trim(),
          user: req.user._id,
          description: `Collection créée par import CSV - ${new Date().toLocaleDateString('fr-FR')}`,
          tags: ['import', 'csv']
        });
        
        await targetCollection.save();
        console.log('✅ Nouvelle collection créée:', targetCollection.name);
      } else {
        targetCollection = await CollectionModel.findOne({
          _id: collectionId,
          user: req.user._id
        });
        
        if (!targetCollection) {
          return res.status(404).json({
            success: false,
            message: 'Collection non trouvée'
          });
        }
        console.log('✅ Collection existante trouvée:', targetCollection.name);
      }
      
      const filePath = req.file.path;
      let parsedData = [];
      
      // Parser selon le type de fichier
      if (req.file.originalname.endsWith('.csv')) {
        parsedData = await parseCSV(filePath);
      } else {
        parsedData = parseExcel(filePath);
      }
      
      console.log('📊 Données parsées:', parsedData.length, 'cartes');
      
      // Validation et création des cartes
      const createdCards = [];
      const errors = [];
      
      for (let i = 0; i < parsedData.length; i++) {
        const validation = validateCardData(parsedData[i]);
        
        if (validation.errors.length === 0) {
          try {
            const newCard = new FlashcardModel({
              question: validation.data.question,
              answer: validation.data.answer,
              difficulty: validation.data.difficulty,
              tags: validation.data.tags,
              collection: targetCollection._id,
              user: req.user._id
            });
            
            await newCard.save();
            createdCards.push(newCard);
          } catch (saveError) {
            console.error('❌ Erreur sauvegarde carte:', saveError.message);
            errors.push({
              row: i + 1,
              errors: [`Erreur sauvegarde: ${saveError.message}`]
            });
          }
        } else {
          errors.push({
            row: i + 1,
            errors: validation.errors
          });
        }
      }
      
      console.log('✅ Cartes créées:', createdCards.length);
      console.log('❌ Erreurs:', errors.length);
      
      // Nettoyage du fichier temporaire
      fs.unlinkSync(filePath);
      
      res.json({
        success: true,
        data: {
          collectionId: targetCollection._id,
          collectionName: targetCollection.name,
          totalProcessed: parsedData.length,
          cardsCreated: createdCards.length,
          errorsCount: errors.length,
          errors: errors,
          fileName: req.file.originalname
        },
        message: `Import terminé: ${createdCards.length} cartes créées dans "${targetCollection.name}"`
      });
      
    } catch (error) {
      console.error('❌ Erreur globale import:', error);
      
      // Nettoyage en cas d'erreur
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
};

// Export des fonctions
module.exports = {
  previewSimpleBulkImport,
  simpleBulkImportToCollection
};
