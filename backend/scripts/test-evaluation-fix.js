// Script de test pour vérifier les corrections d'évaluation
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import des modèles
const User = require('../models/userModel');
const Collection = require('../models/collectionModel');
const Session = require('../models/sessionModel');

// Fonction principale de test
async function testEvaluationFix() {
  try {
    // Vérifier que MONGO_URI est défini
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI non défini. Vérifiez le fichier .env');
      process.exit(1);
    }
    
    console.log('📡 Connexion à MongoDB:', process.env.MONGO_URI);
    
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    // 1. Trouver un enseignant de test
    const teacher = await User.findOne({ role: 'teacher' });
    if (!teacher) {
      console.log('❌ Aucun enseignant trouvé');
      process.exit(1);
    }
    console.log(`\n👨‍🏫 Enseignant trouvé: ${teacher.name} (${teacher.email})`);

    // 2. Collections originales de l'enseignant
    const originalCollections = await Collection.find({ user: teacher._id });
    console.log(`📚 Collections originales de l'enseignant: ${originalCollections.length}`);
    
    // 3. Collections importées référençant cet enseignant
    const importedCollections = await Collection.find({ originalTeacher: teacher._id });
    console.log(`📥 Collections importées référençant l'enseignant: ${importedCollections.length}`);

    // 4. Sessions où l'enseignant est impliqué
    const sessionsAsTeacher = await Session.find({ teacher: teacher._id })
      .populate('student', 'name email')
      .populate('collection', 'name');
    
    console.log(`\n📊 Sessions où l'enseignant est le teacher: ${sessionsAsTeacher.length}`);
    
    if (sessionsAsTeacher.length > 0) {
      console.log('\nPremières sessions:');
      sessionsAsTeacher.slice(0, 3).forEach(session => {
        console.log(`  - Étudiant: ${session.student.name}, Collection: ${session.collection?.name || 'N/A'}`);
      });
    }

    // 5. Vérifier s'il y a des collections importées sans originalTeacher
    const importedWithoutTeacher = await Collection.find({
      tags: { $in: ['importé'] },
      originalTeacher: { $exists: false }
    });
    
    if (importedWithoutTeacher.length > 0) {
      console.log(`\n⚠️  Collections importées sans originalTeacher: ${importedWithoutTeacher.length}`);
      console.log('Ces collections nécessitent une migration.');
    }

    // 6. Sessions problématiques (où le teacher est un étudiant)
    const allSessions = await Session.find({})
      .populate('teacher', 'name role')
      .populate('student', 'name')
      .populate('collection', 'name');
    
    const problematicSessions = allSessions.filter(s => s.teacher && s.teacher.role === 'student');
    
    if (problematicSessions.length > 0) {
      console.log(`\n❌ Sessions problématiques (teacher est un étudiant): ${problematicSessions.length}`);
      console.log('Exemples:');
      problematicSessions.slice(0, 3).forEach(session => {
        console.log(`  - Collection: ${session.collection?.name}, Teacher: ${session.teacher.name} (${session.teacher.role})`);
      });
    } else {
      console.log('\n✅ Aucune session problématique détectée');
    }

    // 7. Test de la requête d'évaluation
    console.log('\n=== TEST DE LA REQUÊTE D\'ÉVALUATION ===');
    
    const allCollectionIds = [
      ...originalCollections.map(c => c._id),
      ...importedCollections.map(c => c._id)
    ];
    
    const evaluationSessions = await Session.find({
      $or: [
        { collection: { $in: allCollectionIds } },
        { teacher: teacher._id }
      ]
    }).populate('student', 'name email');
    
    console.log(`✅ Sessions trouvées pour l'évaluation: ${evaluationSessions.length}`);
    
    // Grouper par étudiant
    const studentsMap = new Map();
    evaluationSessions.forEach(session => {
      const studentId = session.student._id.toString();
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          name: session.student.name,
          sessions: 0
        });
      }
      studentsMap.get(studentId).sessions++;
    });
    
    console.log(`👥 Étudiants uniques: ${studentsMap.size}`);
    if (studentsMap.size > 0) {
      console.log('Détails:');
      for (const [id, data] of studentsMap) {
        console.log(`  - ${data.name}: ${data.sessions} sessions`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Test terminé');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter le test
testEvaluationFix();
