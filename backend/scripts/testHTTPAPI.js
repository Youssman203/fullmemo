// Test de l'API HTTP pour la création de classes
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

const testAPI = async () => {
  try {
    // 1. Se connecter pour obtenir un token
    console.log('1. Connexion de l\'enseignant...');
    const loginResponse = await makeRequest('POST', '/users/login', {
      email: 'prof.martin@example.com',
      password: 'password123'
    });

    if (!loginResponse.ok) {
      console.error('Erreur de connexion:', loginResponse.text);
      return;
    }

    const loginData = loginResponse.data;
    console.log('Connexion réussie pour:', loginData.email);
    console.log('Rôle:', loginData.role);
    const token = loginData.token;

    // 2. Créer une classe
    console.log('\n2. Création d\'une classe...');
    const createResponse = await makeRequest('POST', '/classes', {
      name: 'Mathématiques 6ème',
      description: 'Classe de mathématiques pour les élèves de 6ème',
      maxStudents: 25,
      allowSelfEnrollment: true
    }, token);

    if (!createResponse.ok) {
      console.error('Erreur de création:', createResponse.text);
      return;
    }

    const classData = createResponse.data;
    console.log('Classe créée avec succès:');
    console.log('- Nom:', classData.data.name);
    console.log('- Code d\'invitation:', classData.data.inviteCode);
    console.log('- ID:', classData.data._id);

    // 3. Récupérer toutes les classes
    console.log('\n3. Récupération des classes...');
    const getResponse = await makeRequest('GET', '/classes', null, token);

    if (!getResponse.ok) {
      console.error('Erreur de récupération:', getResponse.text);
      return;
    }

    const classesData = getResponse.data;
    console.log('Classes récupérées:', classesData.count);
    classesData.data.forEach(cls => {
      console.log(`- ${cls.name} (${cls.inviteCode}) - ${cls.students.length} étudiants`);
    });

    // 4. Supprimer la classe de test
    console.log('\n4. Suppression de la classe de test...');
    const deleteResponse = await makeRequest('DELETE', `/classes/${classData.data._id}`, null, token);

    if (deleteResponse.ok) {
      console.log('Classe supprimée avec succès');
    } else {
      console.error('Erreur de suppression:', deleteResponse.text);
    }

  } catch (error) {
    console.error('Erreur:', error);
  }
};

testAPI();
