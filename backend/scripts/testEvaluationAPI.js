// Script pour tester l'API d'évaluation
const mongoose = require('mongoose');
const Session = require('../models/sessionModel');
const Collection = require('../models/collectionModel');
const User = require('../models/userModel');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaced-revision';

async function testEvaluationAPI() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver un enseignant avec des collections
    const teacher = await User.findOne({ 
      role: 'teacher',
      name: 'Prof. Martin Dupont'
    });

    if (!teacher) {
      console.log('❌ Aucun enseignant trouvé');
      return;
    }

    console.log(`👨‍🏫 Test pour l'enseignant: ${teacher.name} (${teacher._id})\n`);

    // Simuler la logique du contrôleur
    const teacherId = teacher._id;

    // 1. Récupérer les collections de l'enseignant
    const teacherCollections = await Collection.find({ user: teacherId });
    const collectionIds = teacherCollections.map(c => c._id);
    
    console.log(`📚 Collections de l'enseignant: ${teacherCollections.length}`);
    teacherCollections.forEach(col => {
      console.log(`   - ${col.name} (${col._id})`);
    });

    // 2. Récupérer les sessions sur ces collections
    const sessions = await Session.find({
      collection: { $in: collectionIds }
    })
    .populate('student', 'name email')
    .populate('collection', 'name description')
    .sort({ createdAt: -1 });

    console.log(`\n📊 Sessions trouvées: ${sessions.length}`);
    
    if (sessions.length > 0) {
      console.log('\n📋 Détails des sessions:');
      sessions.forEach((session, index) => {
        console.log(`\nSession ${index + 1}:`);
        console.log(`  - Apprenant: ${session.student ? session.student.name : 'INCONNU'}`);
        console.log(`  - Collection: ${session.collection ? session.collection.name : 'INCONNUE'}`);
        console.log(`  - Score: ${session.results.scorePercentage}%`);
        console.log(`  - Date: ${session.createdAt.toLocaleString()}`);
      });

      // 3. Grouper par apprenant (comme dans le contrôleur)
      const studentsMap = new Map();

      sessions.forEach(session => {
        if (!session.student) return;
        
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
        studentData.totalScores += session.results.scorePercentage;
        
        if (session.createdAt > studentData.lastActivity) {
          studentData.lastActivity = session.createdAt;
        }

        const collectionId = session.collection._id.toString();
        if (!studentData.collections.has(collectionId)) {
          studentData.collections.set(collectionId, {
            _id: session.collection._id,
            name: session.collection.name,
            sessionsCount: 0,
            averageScore: 0,
            lastSession: session.createdAt
          });
        }

        const collectionData = studentData.collections.get(collectionId);
        collectionData.sessionsCount++;
        collectionData.lastSession = session.createdAt;
      });

      // 4. Convertir en tableau
      const studentsWithStats = Array.from(studentsMap.values()).map(studentData => {
        studentData.averageScore = studentData.totalSessions > 0 
          ? Math.round(studentData.totalScores / studentData.totalSessions)
          : 0;
        
        studentData.collections = Array.from(studentData.collections.values());
        
        return studentData;
      });

      console.log(`\n✅ Apprenants avec statistiques: ${studentsWithStats.length}`);
      studentsWithStats.forEach(student => {
        console.log(`\n  👤 ${student.student.name}:`);
        console.log(`     - Sessions: ${student.totalSessions}`);
        console.log(`     - Score moyen: ${student.averageScore}%`);
        console.log(`     - Collections: ${student.collections.map(c => c.name).join(', ')}`);
      });

      // Retour simulé de l'API
      const apiResponse = {
        success: true,
        count: studentsWithStats.length,
        data: studentsWithStats
      };

      console.log('\n📤 Réponse API simulée:');
      console.log(JSON.stringify(apiResponse, null, 2));
    } else {
      console.log('\n⚠️ Aucune session trouvée pour cet enseignant');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connexion fermée');
  }
}

testEvaluationAPI();
