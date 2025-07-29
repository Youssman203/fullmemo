// Script pour déboguer l'utilisateur enseignant
const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

const debugUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB'.green);

    // Chercher l'utilisateur enseignant
    const teacher = await User.findOne({ email: 'prof.martin@example.com' });
    
    if (teacher) {
      console.log('Utilisateur enseignant trouvé:');
      console.log('ID:', teacher._id);
      console.log('Email:', teacher.email);
      console.log('Nom:', teacher.name);
      console.log('Rôle:', teacher.role);
      console.log('Date de création:', teacher.createdAt);
    } else {
      console.log('Aucun utilisateur enseignant trouvé avec l\'email prof.martin@example.com');
      
      // Lister tous les utilisateurs avec leur rôle
      const allUsers = await User.find({}, 'email name role');
      console.log('\nTous les utilisateurs:');
      allUsers.forEach(user => {
        console.log(`- ${user.email} (${user.name}) - Rôle: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
};

debugUser();
