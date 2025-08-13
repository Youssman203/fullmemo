// Script simplifié pour corriger les données d'évaluation
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import des modèles
const User = require('../models/userModel');
const Collection = require('../models/collectionModel');
const Session = require('../models/sessionModel');

async function fixEvaluationData() {
  try {
    // Vérifier que MONGO_URI est défini
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI non défini. Vérifiez le fichier .env');
      process.exit(1);
    }
    
    console.log('📡 Connexion à MongoDB...');
    
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // 1. Trouver l'enseignant principal (prof.martin)
    const teacher = await User.findOne({ email: 'prof.martin@example.com' });
    if (!teacher) {
      console.log('❌ Enseignant prof.martin@example.com non trouvé');
      process.exit(1);
    }
    console.log(`👨‍🏫 Enseignant trouvé: ${teacher.name} (${teacher._id})`);

    // 2. Trouver toutes les collections originales de l'enseignant
    const originalCollections = await Collection.find({ 
      user: teacher._id 
    });
    console.log(`\n📚 Collections originales de l'enseignant: ${originalCollections.length}`);

    // 3. Pour chaque collection originale, trouver les collections importées correspondantes
    let totalImported = 0;
    let totalSessionsFixed = 0;

    for (const original of originalCollections) {
      // Chercher les collections importées qui référencent cette collection source
      const imported = await Collection.find({
        tags: { $regex: `source_${original._id}` }
      });

      if (imported.length > 0) {
        console.log(`\n📦 Collection "${original.name}":`);
        console.log(`   - ${imported.length} copies importées trouvées`);

        for (const importedColl of imported) {
          // Mettre à jour la collection importée si nécessaire
          let updated = false;
          
          if (!importedColl.originalTeacher) {
            importedColl.originalTeacher = teacher._id;
            updated = true;
          }
          
          if (!importedColl.sourceCollectionId) {
            importedColl.sourceCollectionId = original._id;
            updated = true;
          }

          if (updated) {
            await importedColl.save();
            console.log(`   ✅ Collection importée mise à jour: "${importedColl.name}"`);
            totalImported++;
          }

          // 4. Corriger les sessions pour cette collection importée
          // Trouver les sessions où le teacher est l'étudiant (incorrect)
          const incorrectSessions = await Session.find({
            collection: importedColl._id,
            teacher: importedColl.user  // L'étudiant est incorrectement marqué comme teacher
          });

          if (incorrectSessions.length > 0) {
            // Corriger ces sessions pour utiliser le vrai enseignant
            const result = await Session.updateMany(
              {
                collection: importedColl._id,
                teacher: importedColl.user
              },
              {
                $set: { teacher: teacher._id }
              }
            );

            console.log(`   📊 ${result.modifiedCount} sessions corrigées`);
            totalSessionsFixed += result.modifiedCount;
          }
        }
      }
    }

    // 5. Vérifier s'il reste des collections importées sans originalTeacher
    const orphanedImported = await Collection.find({
      tags: { $in: ['importé'] },
      originalTeacher: { $exists: false }
    });

    if (orphanedImported.length > 0) {
      console.log(`\n⚠️  ${orphanedImported.length} collections importées n'ont pas pu être liées à un enseignant`);
      console.log('Ces collections nécessitent une intervention manuelle:');
      orphanedImported.forEach(coll => {
        console.log(`   - "${coll.name}" (propriétaire: ${coll.user})`);
      });
    }

    // 6. Statistiques finales
    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ DE LA MIGRATION:');
    console.log('='.repeat(50));
    console.log(`✅ Collections importées mises à jour: ${totalImported}`);
    console.log(`✅ Sessions corrigées: ${totalSessionsFixed}`);
    
    // 7. Test final - vérifier que l'évaluation fonctionne
    console.log('\n🧪 Test de la requête d\'évaluation...');
    
    // Requête similaire à celle du controller d'évaluation
    const evaluationSessions = await Session.find({
      $or: [
        { teacher: teacher._id },
        { collection: { $in: originalCollections.map(c => c._id) } }
      ]
    }).distinct('student');

    console.log(`👥 Étudiants trouvés pour l'évaluation: ${evaluationSessions.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Migration terminée avec succès');

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Exécuter la migration
fixEvaluationData();
