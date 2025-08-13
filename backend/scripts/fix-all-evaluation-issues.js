// Script complet pour corriger tous les problèmes d'évaluation
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import des modèles
const User = require('../models/userModel');
const Collection = require('../models/collectionModel');
const Session = require('../models/sessionModel');

async function fixAllEvaluationIssues() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI non défini');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('🔧 CORRECTION COMPLÈTE DES DONNÉES D\'ÉVALUATION');
    console.log('='.repeat(60));

    // 1. Trouver l'enseignant principal
    const teacher = await User.findOne({ role: 'teacher' });
    if (!teacher) {
      console.log('❌ Aucun enseignant trouvé');
      process.exit(1);
    }
    console.log(`👨‍🏫 Enseignant principal: ${teacher.name} (${teacher._id})`);

    let totalFixed = {
      collections: 0,
      sessions: 0
    };

    // 2. Corriger toutes les collections importées
    console.log('\n📚 Correction des collections importées...');
    
    // Trouver toutes les collections avec le tag 'importé'
    const importedCollections = await Collection.find({
      tags: { $in: ['importé'] }
    });
    
    console.log(`   Collections importées trouvées: ${importedCollections.length}`);

    for (const imported of importedCollections) {
      let needsUpdate = false;
      
      // Si pas d'originalTeacher, essayer de le trouver
      if (!imported.originalTeacher) {
        // Chercher dans les tags pour trouver la source
        const sourceTag = imported.tags.find(tag => tag.startsWith('source_'));
        
        if (sourceTag) {
          const sourceId = sourceTag.split('_')[1];
          if (sourceId && mongoose.Types.ObjectId.isValid(sourceId)) {
            const sourceCollection = await Collection.findById(sourceId);
            
            if (sourceCollection) {
              imported.originalTeacher = sourceCollection.user;
              imported.sourceCollectionId = sourceCollection._id;
              needsUpdate = true;
              console.log(`   ✅ Collection "${imported.name}" liée à l'enseignant`);
            }
          }
        }
        
        // Si toujours pas trouvé, utiliser l'enseignant par défaut
        if (!imported.originalTeacher) {
          imported.originalTeacher = teacher._id;
          needsUpdate = true;
          console.log(`   ⚠️  Collection "${imported.name}" assignée à l'enseignant par défaut`);
        }
      }
      
      if (needsUpdate) {
        await imported.save();
        totalFixed.collections++;
      }
    }

    // 3. Corriger TOUTES les sessions problématiques
    console.log('\n📊 Correction des sessions...');
    
    // Trouver toutes les sessions
    const allSessions = await Session.find({})
      .populate('teacher', 'role')
      .populate('collection');
    
    console.log(`   Total de sessions: ${allSessions.length}`);
    
    for (const session of allSessions) {
      let needsUpdate = false;
      let newTeacherId = null;
      
      // Si le teacher actuel est un étudiant, le corriger
      if (session.teacher && session.teacher.role === 'student') {
        // Essayer de trouver le bon enseignant via la collection
        if (session.collection) {
          // Recharger la collection pour avoir les dernières données
          const collection = await Collection.findById(session.collection._id);
          
          if (collection) {
            // Utiliser originalTeacher si disponible, sinon le propriétaire si c'est un enseignant
            if (collection.originalTeacher) {
              newTeacherId = collection.originalTeacher;
            } else {
              const owner = await User.findById(collection.user);
              if (owner && owner.role === 'teacher') {
                newTeacherId = owner._id;
              } else {
                // Si le propriétaire est un étudiant, utiliser l'enseignant par défaut
                newTeacherId = teacher._id;
              }
            }
          }
        }
        
        // Si on n'a toujours pas trouvé, utiliser l'enseignant par défaut
        if (!newTeacherId) {
          newTeacherId = teacher._id;
        }
        
        needsUpdate = true;
      }
      
      // Mettre à jour si nécessaire
      if (needsUpdate && newTeacherId) {
        session.teacher = newTeacherId;
        await session.save();
        totalFixed.sessions++;
      }
    }

    // 4. Vérification finale
    console.log('\n📋 VÉRIFICATION FINALE');
    console.log('='.repeat(60));
    
    // Recompter les sessions problématiques
    const remainingProblematic = await Session.find({})
      .populate('teacher', 'role');
    
    const stillWrong = remainingProblematic.filter(
      s => s.teacher && s.teacher.role === 'student'
    );
    
    console.log(`Sessions avec teacher incorrect restantes: ${stillWrong.length}`);
    
    // Collections sans originalTeacher
    const orphaned = await Collection.find({
      tags: { $in: ['importé'] },
      originalTeacher: { $exists: false }
    });
    
    console.log(`Collections importées sans originalTeacher: ${orphaned.length}`);

    // 5. Test de la requête d'évaluation
    console.log('\n🧪 TEST DE L\'ÉVALUATION');
    console.log('='.repeat(60));
    
    // Collections de l'enseignant (originales et où il est originalTeacher)
    const teacherCollections = await Collection.find({
      $or: [
        { user: teacher._id },
        { originalTeacher: teacher._id }
      ]
    });
    
    console.log(`Collections liées à l'enseignant: ${teacherCollections.length}`);
    
    // Sessions pour l'évaluation
    const evaluationSessions = await Session.find({
      $or: [
        { teacher: teacher._id },
        { collection: { $in: teacherCollections.map(c => c._id) } }
      ]
    }).populate('student', 'name');
    
    console.log(`Sessions pour l'évaluation: ${evaluationSessions.length}`);
    
    // Étudiants uniques
    const uniqueStudents = new Set();
    evaluationSessions.forEach(s => {
      if (s.student) {
        uniqueStudents.add(s.student._id.toString());
      }
    });
    
    console.log(`Étudiants uniques: ${uniqueStudents.size}`);

    // 6. Résumé
    console.log('\n✨ RÉSUMÉ DES CORRECTIONS');
    console.log('='.repeat(60));
    console.log(`✅ Collections corrigées: ${totalFixed.collections}`);
    console.log(`✅ Sessions corrigées: ${totalFixed.sessions}`);
    console.log(`✅ Sessions problématiques restantes: ${stillWrong.length}`);
    console.log(`✅ Collections orphelines restantes: ${orphaned.length}`);

    await mongoose.connection.close();
    console.log('\n🎉 Correction terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Exécuter la correction
fixAllEvaluationIssues();
