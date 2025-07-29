// Script pour tester l'API des classes
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Class = require('../models/classModel');
require('dotenv').config();

const testClassAPI = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB');

    // Trouver l'utilisateur enseignant
    const teacher = await User.findOne({ email: 'prof.martin@example.com' });
    
    if (!teacher) {
      console.log('Enseignant non trouvé!');
      return;
    }

    console.log('Enseignant trouvé:', teacher.email, '- Rôle:', teacher.role);

    // Créer une classe de test
    const testClass = new Class({
      name: 'Classe Test API',
      description: 'Classe de test pour vérifier l\'API',
      teacherId: teacher._id,
      settings: {
        maxStudents: 30,
        allowSelfEnrollment: true
      }
    });

    await testClass.save();
    console.log('Classe de test créée:', testClass.name);
    console.log('Code d\'invitation:', testClass.inviteCode);

    // Lister toutes les classes de cet enseignant
    const classes = await Class.find({ teacherId: teacher._id });
    console.log(`\nNombre de classes pour ${teacher.email}:`, classes.length);
    
    classes.forEach(cls => {
      console.log(`- ${cls.name} (Code: ${cls.inviteCode}) - Actif: ${cls.isActive}`);
    });

    // Nettoyer - supprimer la classe de test
    await Class.deleteOne({ _id: testClass._id });
    console.log('\nClasse de test supprimée');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
};

testClassAPI();
