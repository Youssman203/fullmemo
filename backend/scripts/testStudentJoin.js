// Test de l'adhésion d'un étudiant à une classe
const http = require('http');

// Fonction helper pour faire des requêtes HTTP
const makeRequest = (method, path, data, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ ok: res.statusCode < 400, status: res.statusCode, data: parsed, text: responseData });
        } catch (e) {
          resolve({ ok: res.statusCode < 400, status: res.statusCode, text: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

const testStudentJoin = async () => {
  try {
    console.log('=== TEST ADHÉSION ÉTUDIANT À UNE CLASSE ===\n');

    // 1. Connexion enseignant pour créer une classe
    console.log('1. Connexion enseignant...');
    const teacherLogin = await makeRequest('POST', '/users/login', {
      email: 'prof.martin@example.com',
      password: 'password123'
    });

    if (!teacherLogin.ok) {
      console.error('Erreur connexion enseignant:', teacherLogin.text);
      return;
    }

    const teacherToken = teacherLogin.data.token;
    console.log('✅ Enseignant connecté');

    // 2. Créer une classe de test
    console.log('\n2. Création d\'une classe de test...');
    const createResponse = await makeRequest('POST', '/classes', {
      name: 'Classe Test Adhésion',
      description: 'Classe pour tester l\'adhésion des étudiants',
      maxStudents: 30,
      allowSelfEnrollment: true
    }, teacherToken);

    if (!createResponse.ok) {
      console.error('Erreur création classe:', createResponse.text);
      return;
    }

    const classData = createResponse.data.data;
    const inviteCode = classData.inviteCode;
    console.log('✅ Classe créée:');
    console.log('   - Nom:', classData.name);
    console.log('   - Code d\'invitation:', inviteCode);
    console.log('   - ID:', classData._id);

    // 3. Connexion étudiant (utilisons un étudiant existant)
    console.log('\n3. Connexion étudiant...');
    
    // D'abord, trouvons un étudiant existant
    const mongoose = require('mongoose');
    const User = require('../models/userModel');
    require('dotenv').config();
    
    await mongoose.connect(process.env.MONGO_URI);
    const student = await User.findOne({ role: 'student' });
    
    if (!student) {
      console.log('❌ Aucun étudiant trouvé dans la base de données');
      return;
    }

    console.log('Étudiant trouvé:', student.email);

    // Supposons que le mot de passe est 'password123' pour tous les utilisateurs de test
    const studentLogin = await makeRequest('POST', '/users/login', {
      email: student.email,
      password: 'password123'
    });

    if (!studentLogin.ok) {
      console.log('❌ Impossible de se connecter avec cet étudiant');
      console.log('Erreur:', studentLogin.text);
      return;
    }

    const studentToken = studentLogin.data.token;
    console.log('✅ Étudiant connecté:', studentLogin.data.email);

    // 4. Étudiant rejoint la classe
    console.log('\n4. Adhésion à la classe avec le code:', inviteCode);
    const joinResponse = await makeRequest('POST', `/classes/join/${inviteCode}`, null, studentToken);

    if (!joinResponse.ok) {
      console.error('❌ Erreur adhésion:', joinResponse.text);
    } else {
      console.log('✅ Adhésion réussie !');
      console.log('Message:', joinResponse.data.message);
      console.log('Classe rejointe:', joinResponse.data.data.class.name);
    }

    // 5. Vérifier que l'étudiant est bien dans la classe
    console.log('\n5. Vérification - Classes de l\'enseignant...');
    const checkResponse = await makeRequest('GET', '/classes', null, teacherToken);
    
    if (checkResponse.ok) {
      const classes = checkResponse.data.data;
      const testClass = classes.find(c => c._id === classData._id);
      if (testClass) {
        console.log('✅ Nombre d\'étudiants dans la classe:', testClass.students.length);
        testClass.students.forEach(s => {
          console.log('   - Étudiant:', s.name, '(' + s.email + ')');
        });
      }
    }

    // 6. Nettoyage - supprimer la classe de test
    console.log('\n6. Nettoyage...');
    await makeRequest('DELETE', `/classes/${classData._id}`, null, teacherToken);
    console.log('✅ Classe de test supprimée');

    mongoose.connection.close();

  } catch (error) {
    console.error('Erreur:', error);
  }
};

testStudentJoin();
