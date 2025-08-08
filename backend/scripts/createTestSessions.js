// Script pour créer des sessions de test pour l'évaluation
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Collection = require('../models/collectionModel');
const Session = require('../models/sessionModel');

// Configuration MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/spaced-revision');
    console.log(`MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const createTestSessions = async () => {
  try {
    await connectDB();

    // Trouver un enseignant (prof.martin@example.com)
    const teacher = await User.findOne({ email: 'prof.martin@example.com' });
    if (!teacher) {
      console.log('❌ Enseignant prof.martin@example.com non trouvé');
      return;
    }
    console.log('✅ Enseignant trouvé:', teacher.name);

    // Trouver un apprenant (etudiant.test@example.com)
    const student = await User.findOne({ email: 'etudiant.test@example.com' });
    if (!student) {
      console.log('❌ Apprenant etudiant.test@example.com non trouvé');
      return;
    }
    console.log('✅ Apprenant trouvé:', student.name);

    // Trouver une collection de l'enseignant
    const collection = await Collection.findOne({ user: teacher._id });
    if (!collection) {
      console.log('❌ Aucune collection trouvée pour cet enseignant');
      return;
    }
    console.log('✅ Collection trouvée:', collection.name);

    // Supprimer les anciennes sessions de test
    await Session.deleteMany({ 
      teacher: teacher._id, 
      student: student._id 
    });
    console.log('🗑️ Anciennes sessions supprimées');

    // Créer des sessions de test
    const testSessions = [
      {
        student: student._id,
        teacher: teacher._id,
        collection: collection._id,
        sessionType: 'revision',
        results: {
          totalCards: 10,
          correctAnswers: 8,
          incorrectAnswers: 2,
          scorePercentage: 80
        },
        cardResults: [],
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hier
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000), // +15min
        duration: 15 * 60, // 15 minutes en secondes
        deviceInfo: {
          userAgent: 'Test Browser',
          platform: 'Test'
        },
        status: 'completed'
      },
      {
        student: student._id,
        teacher: teacher._id,
        collection: collection._id,
        sessionType: 'quiz',
        results: {
          totalCards: 15,
          correctAnswers: 12,
          incorrectAnswers: 3,
          scorePercentage: 87
        },
        cardResults: [],
        startTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // Il y a 12h
        endTime: new Date(Date.now() - 12 * 60 * 60 * 1000 + 20 * 60 * 1000), // +20min
        duration: 20 * 60, // 20 minutes en secondes
        deviceInfo: {
          userAgent: 'Test Browser',
          platform: 'Test'
        },
        status: 'completed'
      },
      {
        student: student._id,
        teacher: teacher._id,
        collection: collection._id,
        sessionType: 'test',
        results: {
          totalCards: 20,
          correctAnswers: 14,
          incorrectAnswers: 6,
          scorePercentage: 70
        },
        cardResults: [],
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 60 * 1000), // +30min
        duration: 30 * 60, // 30 minutes en secondes
        deviceInfo: {
          userAgent: 'Test Browser',
          platform: 'Test'
        },
        status: 'completed'
      }
    ];

    // Créer les sessions
    for (const sessionData of testSessions) {
      const session = await Session.create(sessionData);
      console.log(`✅ Session créée: ${session.sessionType} - Score: ${session.results.scorePercentage}%`);
    }

    console.log('\n🎉 Sessions de test créées avec succès !');
    console.log('📊 Vous pouvez maintenant voir les données dans la page Évaluation');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestSessions();
