const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

/**
 * Script de migration pour ajouter le champ 'role' aux utilisateurs existants
 * Tous les utilisateurs existants deviennent des apprenants par défaut
 */
const migrateUserRoles = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connexion à MongoDB réussie');

    // Compter les utilisateurs sans rôle
    const usersWithoutRole = await User.countDocuments({
      $or: [
        { role: { $exists: false } },
        { role: null },
        { role: '' }
      ]
    });

    console.log(`📊 Utilisateurs à migrer : ${usersWithoutRole}`);

    if (usersWithoutRole === 0) {
      console.log('✅ Aucune migration nécessaire - tous les utilisateurs ont déjà un rôle');
      process.exit(0);
    }

    // Mettre à jour tous les utilisateurs sans rôle
    const result = await User.updateMany(
      {
        $or: [
          { role: { $exists: false } },
          { role: null },
          { role: '' }
        ]
      },
      { 
        $set: { role: 'student' } 
      }
    );

    console.log(`✅ Migration terminée avec succès !`);
    console.log(`📈 ${result.modifiedCount} utilisateurs mis à jour`);
    console.log(`👨‍🎓 Tous les utilisateurs existants sont maintenant des apprenants`);

    // Vérification finale
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const teachersCount = await User.countDocuments({ role: 'teacher' });

    console.log('\n📊 Statistiques finales :');
    console.log(`   Total utilisateurs : ${totalUsers}`);
    console.log(`   Apprenants : ${studentsCount}`);
    console.log(`   Enseignants : ${teachersCount}`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔒 Connexion fermée');
    process.exit(0);
  }
};

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  console.log('🚀 Démarrage de la migration des rôles utilisateur...\n');
  migrateUserRoles();
}

module.exports = migrateUserRoles;
