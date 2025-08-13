// Script de migration pour corriger les collections importées et les sessions
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Importer les modèles après la configuration
const Collection = require('../models/collectionModel');
const Session = require('../models/sessionModel');
const CollectionShareCode = require('../models/collectionShareCodeModel');

const migrateImportedCollections = async () => {
  try {
    // Vérifier que MONGO_URI est défini
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI non défini. Vérifiez le fichier .env');
      process.exit(1);
    }
    
    console.log('📡 Connexion à MongoDB:', process.env.MONGO_URI);
    
    // Connexion à MongoDB (sans options dépréciées)
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // 1. Trouver toutes les collections importées (qui ont le tag 'importé')
    const importedCollections = await Collection.find({
      tags: { $in: ['importé'] }
    });

    console.log(`📚 Collections importées trouvées: ${importedCollections.length}`);

    let migratedCount = 0;
    let sessionsCorrected = 0;

    for (const collection of importedCollections) {
      // Extraire l'ID de la collection source depuis les tags
      const sourceTag = collection.tags.find(tag => tag.startsWith('source_'));
      
      if (sourceTag) {
        // Format: source_{collectionId}_code_{code}
        const matches = sourceTag.match(/source_([a-f0-9]+)_code_([A-Z0-9]+)/);
        
        if (matches) {
          const sourceCollectionId = matches[1];
          const shareCode = matches[2];
          
          // Trouver la collection source
          const sourceCollection = await Collection.findById(sourceCollectionId);
          
          if (sourceCollection) {
            // Mettre à jour la collection importée avec l'enseignant original
            collection.originalTeacher = sourceCollection.user;
            collection.sourceCollectionId = sourceCollection._id;
            await collection.save();
            
            console.log(`✅ Collection "${collection.name}" mise à jour avec enseignant original`);
            migratedCount++;
            
            // 2. Corriger les sessions existantes pour cette collection
            const sessionsToFix = await Session.find({
              collection: collection._id,
              teacher: collection.user._id  // Sessions où le teacher est l'étudiant
            });
            
            if (sessionsToFix.length > 0) {
              // Mettre à jour le teacher de ces sessions
              await Session.updateMany(
                {
                  collection: collection._id,
                  teacher: collection.user._id
                },
                {
                  $set: { teacher: sourceCollection.user }
                }
              );
              
              sessionsCorrected += sessionsToFix.length;
              console.log(`  📊 ${sessionsToFix.length} sessions corrigées pour cette collection`);
            }
          } else {
            console.log(`⚠️  Collection source ${sourceCollectionId} non trouvée pour "${collection.name}"`);
          }
        }
      } else {
        // Essayer de trouver via les codes de partage
        const shareCodeRecord = await CollectionShareCode.findOne({
          'imports.user': collection.user._id
        }).populate('collection').populate('createdBy');
        
        if (shareCodeRecord && shareCodeRecord.collection && shareCodeRecord.createdBy) {
          // Vérifier si c'est bien la bonne collection
          const collectionName = shareCodeRecord.collection.name + ' (Importé)';
          if (collection.name === collectionName) {
            collection.originalTeacher = shareCodeRecord.createdBy._id;
            collection.sourceCollectionId = shareCodeRecord.collection._id;
            await collection.save();
            
            console.log(`✅ Collection "${collection.name}" mise à jour via shareCode avec enseignant: ${shareCodeRecord.createdBy.name}`);
            migratedCount++;
            
            // Corriger les sessions
            const sessionsToFix = await Session.find({
              collection: collection._id,
              teacher: collection.user._id
            });
            
            if (sessionsToFix.length > 0) {
              await Session.updateMany(
                {
                  collection: collection._id,
                  teacher: collection.user._id
                },
                {
                  $set: { teacher: shareCodeRecord.createdBy._id }
                }
              );
              
              sessionsCorrected += sessionsToFix.length;
              console.log(`  📊 ${sessionsToFix.length} sessions corrigées pour cette collection`);
            }
          }
        }
      }
    }

    console.log('\n=== RÉSUMÉ DE LA MIGRATION ===');
    console.log(`✅ Collections migrées: ${migratedCount}/${importedCollections.length}`);
    console.log(`📊 Sessions corrigées: ${sessionsCorrected}`);

    // 3. Vérifier les résultats
    const stillProblematic = await Session.find({
      teacher: { $exists: true }
    }).populate('teacher').populate('student').populate('collection');

    const problematicSessions = stillProblematic.filter(session => {
      // Vérifier si le teacher est un étudiant (pas un enseignant)
      return session.teacher && session.teacher.role === 'student';
    });

    if (problematicSessions.length > 0) {
      console.log(`\n⚠️  Sessions problématiques restantes: ${problematicSessions.length}`);
      console.log('Ces sessions ont encore un étudiant comme teacher:');
      problematicSessions.slice(0, 5).forEach(session => {
        console.log(`  - Session ${session._id}: Collection "${session.collection?.name}", Teacher: ${session.teacher.name} (${session.teacher.role})`);
      });
    } else {
      console.log('\n✅ Toutes les sessions ont été corrigées avec succès!');
    }

    await mongoose.connection.close();
    console.log('\n✅ Migration terminée');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
};

// Exécuter la migration
migrateImportedCollections();
