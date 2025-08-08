// Script pour vérifier les sessions dans la base de données
const mongoose = require('mongoose');
const Session = require('../models/sessionModel');
const Collection = require('../models/collectionModel');
const User = require('../models/userModel');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaced-revision';

async function checkSessions() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // 1. Compter toutes les sessions
    const totalSessions = await Session.countDocuments();
    console.log(`\n📊 Total des sessions: ${totalSessions}`);

    // 2. Récupérer quelques sessions pour voir leur structure
    const sessions = await Session.find()
      .limit(5)
      .populate('student', 'name email role')
      .populate('teacher', 'name email role')
      .populate('collection', 'name user');

    console.log('\n📋 Premières sessions:');
    sessions.forEach((session, index) => {
      console.log(`\nSession ${index + 1}:`);
      console.log(`  - ID: ${session._id}`);
      console.log(`  - Student: ${session.student ? session.student.name : 'NON DÉFINI'}`);
      console.log(`  - Teacher: ${session.teacher ? session.teacher.name : 'NON DÉFINI'}`);
      console.log(`  - Collection: ${session.collection ? session.collection.name : 'NON DÉFINI'}`);
      console.log(`  - Score: ${session.results.scorePercentage}%`);
      console.log(`  - Date: ${session.createdAt}`);
    });

    // 3. Vérifier les enseignants
    const teachers = await User.find({ role: 'teacher' }).select('name email');
    console.log(`\n👨‍🏫 Enseignants (${teachers.length}):`);
    
    for (const teacher of teachers) {
      console.log(`\n  ${teacher.name} (${teacher._id}):`);
      
      // Collections de cet enseignant
      const collections = await Collection.find({ user: teacher._id });
      console.log(`    - Collections: ${collections.length}`);
      
      if (collections.length > 0) {
        const collectionIds = collections.map(c => c._id);
        
        // Sessions sur ces collections
        const sessionsOnTeacherCollections = await Session.find({
          collection: { $in: collectionIds }
        }).countDocuments();
        
        console.log(`    - Sessions sur ses collections: ${sessionsOnTeacherCollections}`);
        
        // Sessions avec teacher field
        const sessionsWithTeacher = await Session.find({
          teacher: teacher._id
        }).countDocuments();
        
        console.log(`    - Sessions avec teacher field: ${sessionsWithTeacher}`);
      }
    }

    // 4. Vérifier les apprenants
    const students = await User.find({ role: 'student' }).select('name email');
    console.log(`\n🎓 Apprenants (${students.length}):`);
    
    for (const student of students.slice(0, 3)) { // Limiter à 3 pour ne pas surcharger
      const studentSessions = await Session.find({ student: student._id }).countDocuments();
      console.log(`  - ${student.name}: ${studentSessions} sessions`);
    }

    // 5. Vérifier les sessions sans teacher
    const sessionsWithoutTeacher = await Session.find({ teacher: { $exists: false } }).countDocuments();
    console.log(`\n⚠️ Sessions sans teacher: ${sessionsWithoutTeacher}`);

    // 6. Vérifier les sessions avec teacher null
    const sessionsWithNullTeacher = await Session.find({ teacher: null }).countDocuments();
    console.log(`⚠️ Sessions avec teacher null: ${sessionsWithNullTeacher}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connexion fermée');
  }
}

checkSessions();
