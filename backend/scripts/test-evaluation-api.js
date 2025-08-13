// Test direct de l'API d'évaluation
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const jwt = require('jsonwebtoken');

// Import des modèles
const User = require('../models/userModel');
const Collection = require('../models/collectionModel');
const Session = require('../models/sessionModel');

async function testEvaluationAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('🧪 TEST DE L\'API D\'ÉVALUATION');
    console.log('='.repeat(50));

    // 1. Trouver l'enseignant
    const teacher = await User.findOne({ role: 'teacher' });
    if (!teacher) {
      console.log('❌ Aucun enseignant trouvé');
      process.exit(1);
    }
    console.log(`👨‍🏫 Enseignant trouvé: ${teacher.name} (${teacher._id})`);

    // 2. Simuler la logique du contrôleur d'évaluation
    console.log('\n📊 SIMULATION DE LA LOGIQUE D\'ÉVALUATION');
    console.log('-'.repeat(50));

    // Collections originales de l'enseignant
    const teacherCollections = await Collection.find({ user: teacher._id });
    console.log(`📚 Collections originales de l'enseignant: ${teacherCollections.length}`);
    teacherCollections.forEach(c => console.log(`   - ${c.name}`));

    // Collections importées référençant l'enseignant
    const importedCollections = await Collection.find({ originalTeacher: teacher._id });
    console.log(`📥 Collections importées référençant l'enseignant: ${importedCollections.length}`);
    importedCollections.forEach(c => console.log(`   - ${c.name} (propriétaire: ${c.user})`));

    // Toutes les collections
    const allCollectionIds = [
      ...teacherCollections.map(c => c._id),
      ...importedCollections.map(c => c._id)
    ];
    console.log(`📊 Total collections à analyser: ${allCollectionIds.length}`);

    // 3. Trouver les sessions
    console.log('\n🔍 RECHERCHE DES SESSIONS');
    console.log('-'.repeat(50));

    const sessions = await Session.find({
      $or: [
        { collection: { $in: allCollectionIds } },
        { teacher: teacher._id }
      ]
    })
    .populate('student', 'name email')
    .populate('collection', 'name')
    .populate('teacher', 'name role')
    .sort({ createdAt: -1 });

    console.log(`📊 Sessions trouvées: ${sessions.length}`);
    
    sessions.forEach((session, index) => {
      console.log(`   ${index + 1}. Session:`);
      console.log(`      - Étudiant: ${session.student ? session.student.name : 'Non défini'}`);
      console.log(`      - Collection: ${session.collection ? session.collection.name : 'Non définie'}`);
      console.log(`      - Teacher: ${session.teacher ? session.teacher.name + ' (' + session.teacher.role + ')' : 'Non défini'}`);
      console.log(`      - Score: ${session.results ? session.results.scorePercentage + '%' : 'Non défini'}`);
      console.log(`      - Date: ${session.createdAt}`);
    });

    // 4. Grouper par étudiant
    console.log('\n👥 GROUPEMENT PAR ÉTUDIANT');
    console.log('-'.repeat(50));

    const studentsMap = new Map();

    sessions.forEach(session => {
      if (!session.student) {
        console.log('⚠️  Session sans étudiant trouvée:', session._id);
        return;
      }

      const studentId = session.student._id.toString();
      
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          student: {
            _id: session.student._id,
            name: session.student.name,
            email: session.student.email
          },
          collections: new Map(),
          totalSessions: 0,
          lastActivity: session.createdAt,
          averageScore: 0,
          totalScores: 0
        });
      }

      const studentData = studentsMap.get(studentId);
      studentData.totalSessions++;
      if (session.results && session.results.scorePercentage !== undefined) {
        studentData.totalScores += session.results.scorePercentage;
      }
      
      if (session.createdAt > studentData.lastActivity) {
        studentData.lastActivity = session.createdAt;
      }

      // Ajouter collection
      if (session.collection) {
        const collectionId = session.collection._id.toString();
        if (!studentData.collections.has(collectionId)) {
          studentData.collections.set(collectionId, {
            _id: session.collection._id,
            name: session.collection.name,
            sessionsCount: 0
          });
        }
        studentData.collections.get(collectionId).sessionsCount++;
      }
    });

    // 5. Finaliser les données
    const studentsWithStats = Array.from(studentsMap.values()).map(studentData => {
      studentData.averageScore = studentData.totalSessions > 0 
        ? Math.round(studentData.totalScores / studentData.totalSessions)
        : 0;
      
      studentData.collections = Array.from(studentData.collections.values());
      return studentData;
    });

    console.log(`👥 Étudiants avec statistiques: ${studentsWithStats.length}`);
    studentsWithStats.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.student.name}:`);
      console.log(`      - Email: ${student.student.email}`);
      console.log(`      - Sessions: ${student.totalSessions}`);
      console.log(`      - Collections: ${student.collections.length}`);
      console.log(`      - Score moyen: ${student.averageScore}%`);
      console.log(`      - Dernière activité: ${student.lastActivity}`);
    });

    // 6. Générer un token JWT pour tester l'API
    console.log('\n🔑 GÉNÉRATION DE TOKEN JWT');
    console.log('-'.repeat(50));
    
    const token = jwt.sign(
      { _id: teacher._id, role: teacher.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    console.log(`Token généré: ${token.substring(0, 50)}...`);

    // 7. Format de réponse API
    console.log('\n📤 FORMAT DE RÉPONSE API');
    console.log('-'.repeat(50));
    const apiResponse = {
      success: true,
      count: studentsWithStats.length,
      data: studentsWithStats
    };
    console.log('Réponse API:', JSON.stringify(apiResponse, null, 2));

    await mongoose.connection.close();
    console.log('\n✅ Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testEvaluationAPI();
