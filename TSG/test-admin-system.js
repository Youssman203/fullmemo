const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config({ path: './backend/.env' });

const User = require('./backend/models/userModel');

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connecté: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error('Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const testAdminSystem = async () => {
  console.log('🧪 Test du Système d\'Administration\n'.bold.yellow);
  
  try {
    await connectDB();
    
    // 1. Vérifier l'existence de l'admin
    console.log('1. Vérification du compte administrateur...'.blue);
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('❌ Aucun administrateur trouvé'.red);
      console.log('💡 Exécutez: node backend/scripts/createAdminUser.js'.yellow);
      process.exit(1);
    }
    
    console.log('✅ Administrateur trouvé:'.green);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Nom: ${admin.name}`);
    console.log(`   ID: ${admin._id}`);
    
    // 2. Statistiques du système
    console.log('\n2. Statistiques système...'.blue);
    
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    console.log('✅ Utilisateurs:'.green);
    console.log(`   Total: ${totalUsers}`);
    console.log(`   Étudiants: ${totalStudents}`);
    console.log(`   Enseignants: ${totalTeachers}`);
    console.log(`   Administrateurs: ${totalAdmins}`);
    
    // 3. Test de validation du modèle
    console.log('\n3. Test du modèle utilisateur...'.blue);
    
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123',
      role: 'student'
    });
    
    const validationError = testUser.validateSync();
    if (validationError) {
      console.log('❌ Erreur de validation du modèle:', validationError.message.red);
    } else {
      console.log('✅ Modèle utilisateur valide'.green);
    }
    
    // 4. Vérifier les rôles supportés
    console.log('\n4. Vérification des rôles...'.blue);
    
    const userSchema = User.schema.paths.role;
    const supportedRoles = userSchema.enumValues;
    
    console.log('✅ Rôles supportés:'.green);
    supportedRoles.forEach(role => {
      const count = role === 'student' ? totalStudents : 
                   role === 'teacher' ? totalTeachers : 
                   role === 'admin' ? totalAdmins : 0;
      console.log(`   ${role}: ${count} utilisateur(s)`);
    });
    
    // 5. Test de connexion admin (simulation)
    console.log('\n5. Test d\'authentification admin...'.blue);
    
    const isPasswordValid = await admin.matchPassword('admin123');
    if (isPasswordValid) {
      console.log('✅ Mot de passe admin correct'.green);
    } else {
      console.log('❌ Mot de passe admin incorrect'.red);
    }
    
    // 6. Génération token JWT
    console.log('\n6. Test génération token JWT...'.blue);
    
    try {
      const token = admin.getSignedJwtToken();
      if (token && token.split('.').length === 3) {
        console.log('✅ Token JWT généré avec succès'.green);
        console.log(`   Token (tronqué): ${token.substring(0, 30)}...`);
      } else {
        console.log('❌ Erreur génération token JWT'.red);
      }
    } catch (error) {
      console.log('❌ Erreur génération token:', error.message.red);
    }
    
    console.log('\n🎉 Tests du système d\'administration terminés !'.bold.green);
    console.log('\n📋 Prochaines étapes:'.bold.blue);
    console.log('1. Démarrer le serveur backend: cd backend && npm start');
    console.log('2. Démarrer le serveur frontend: cd spaced-revision && npm start');
    console.log('3. Se connecter avec: admin@spaced-revision.com / admin123');
    console.log('4. Aller sur: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:'.red, error.message);
  } finally {
    mongoose.disconnect();
  }
};

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testAdminSystem();
}

module.exports = testAdminSystem;
