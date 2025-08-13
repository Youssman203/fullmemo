// Script de diagnostic détaillé pour l'évaluation
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import des modèles
const User = require('../models/userModel');
const Collection = require('../models/collectionModel');
const Session = require('../models/sessionModel');

async function diagnosticDetailed() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI non défini');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 1. Analyse des utilisateurs
    console.log('=== ANALYSE DES UTILISATEURS ===');
    const teachers = await User.find({ role: 'teacher' });
    const students = await User.find({ role: 'student' });
    
    console.log(`👨‍🏫 Enseignants: ${teachers.length}`);
    teachers.forEach(t => console.log(`   - ${t.name} (${t.email})`));
    
    console.log(`👨‍🎓 Étudiants: ${students.length}`);
    students.forEach(s => console.log(`   - ${s.name} (${s.email})`));

    // 2. Pour chaque enseignant, analyser les données
    for (const teacher of teachers) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`ANALYSE POUR L'ENSEIGNANT: ${teacher.name}`);
      console.log('='.repeat(60));

      // Collections originales
      const originalColls = await Collection.find({ user: teacher._id });
      console.log(`\n📚 Collections originales: ${originalColls.length}`);
      originalColls.forEach(c => {
        console.log(`   - "${c.name}" (ID: ${c._id})`);
      });

      // Collections importées avec originalTeacher
      const importedWithTeacher = await Collection.find({ 
        originalTeacher: teacher._id 
      });
      console.log(`\n📥 Collections importées avec originalTeacher: ${importedWithTeacher.length}`);
      
      for (const imported of importedWithTeacher) {
        const owner = await User.findById(imported.user);
        console.log(`   - "${imported.name}"`);
        console.log(`     Propriétaire: ${owner ? owner.name : 'INCONNU'}`);
        console.log(`     Source: ${imported.sourceCollectionId || 'NON DÉFINI'}`);
      }

      // Sessions où cet enseignant est le teacher
      const sessionsAsTeacher = await Session.find({ teacher: teacher._id })
        .populate('student', 'name')
        .populate('collection', 'name');
      
      console.log(`\n📊 Sessions où ${teacher.name} est le teacher: ${sessionsAsTeacher.length}`);
      
      // Grouper par étudiant
      const studentSessions = {};
      sessionsAsTeacher.forEach(session => {
        const studentName = session.student?.name || 'INCONNU';
        if (!studentSessions[studentName]) {
          studentSessions[studentName] = [];
        }
        studentSessions[studentName].push(session.collection?.name || 'Collection supprimée');
      });
      
      Object.entries(studentSessions).forEach(([student, collections]) => {
        console.log(`   - ${student}: ${collections.length} sessions`);
        collections.slice(0, 2).forEach(coll => {
          console.log(`     • ${coll}`);
        });
      });
    }

    // 3. Identifier les problèmes
    console.log(`\n${'='.repeat(60)}`);
    console.log('PROBLÈMES IDENTIFIÉS');
    console.log('='.repeat(60));

    // Sessions où le teacher est un étudiant
    const problematicSessions = await Session.find({})
      .populate('teacher', 'name role')
      .populate('student', 'name')
      .populate('collection', 'name');
    
    const wrongTeacherSessions = problematicSessions.filter(
      s => s.teacher && s.teacher.role === 'student'
    );
    
    if (wrongTeacherSessions.length > 0) {
      console.log(`\n❌ Sessions avec teacher étudiant: ${wrongTeacherSessions.length}`);
      
      // Grouper par collection pour mieux comprendre
      const byCollection = {};
      wrongTeacherSessions.forEach(session => {
        const collName = session.collection?.name || 'INCONNUE';
        if (!byCollection[collName]) {
          byCollection[collName] = {
            count: 0,
            teacher: session.teacher.name,
            students: new Set()
          };
        }
        byCollection[collName].count++;
        byCollection[collName].students.add(session.student?.name || 'INCONNU');
      });
      
      Object.entries(byCollection).forEach(([collName, data]) => {
        console.log(`\n   Collection: "${collName}"`);
        console.log(`   - Teacher incorrect: ${data.teacher} (étudiant)`);
        console.log(`   - ${data.count} sessions affectées`);
        console.log(`   - Étudiants: ${Array.from(data.students).join(', ')}`);
      });
    } else {
      console.log('\n✅ Aucune session avec teacher incorrect');
    }

    // Collections importées sans originalTeacher
    const orphanedCollections = await Collection.find({
      tags: { $in: ['importé'] },
      originalTeacher: { $exists: false }
    });
    
    if (orphanedCollections.length > 0) {
      console.log(`\n⚠️  Collections importées sans originalTeacher: ${orphanedCollections.length}`);
      orphanedCollections.forEach(c => {
        console.log(`   - "${c.name}" (propriétaire: ${c.user})`);
      });
    }

    // 4. Recommandations
    console.log(`\n${'='.repeat(60)}`);
    console.log('RECOMMANDATIONS');
    console.log('='.repeat(60));
    
    if (wrongTeacherSessions.length > 0) {
      console.log('\n🔧 Actions nécessaires:');
      console.log('1. Identifier l\'enseignant correct pour chaque collection');
      console.log('2. Mettre à jour les sessions avec le bon teacher');
      console.log('3. Vérifier que les collections importées ont originalTeacher défini');
    }
    
    if (orphanedCollections.length > 0) {
      console.log('\n🔧 Pour les collections orphelines:');
      console.log('1. Identifier la collection source originale');
      console.log('2. Définir originalTeacher et sourceCollectionId');
    }

    await mongoose.connection.close();
    console.log('\n✅ Diagnostic terminé');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

diagnosticDetailed();
