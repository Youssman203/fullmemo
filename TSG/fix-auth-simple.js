/**
 * 🔧 CORRECTION SIMPLE PROBLÈME AUTORISATION IMPORT
 */

console.log('🔧 CORRECTION AUTORISATION IMPORT - SIMPLE');

// Solutions directes sans modification de fichiers
console.log(`
🎯 PROBLÈME IDENTIFIÉ: "Token non autorisé" lors import

🔍 CAUSES POSSIBLES:
1. Token expiré dans localStorage
2. Token invalide ou corrompu
3. Backend qui rejette le token
4. Headers Authorization malformés

✅ SOLUTIONS IMMÉDIATES:

1. 🧹 NETTOYER LE STORAGE COMPLET
   localStorage.clear();
   sessionStorage.clear();
   window.location.reload();

2. 🔄 SE RECONNECTER COMPLÈTEMENT
   - Aller sur /login
   - Se reconnecter avec identifiants
   - Tester import immédiatement après

3. 🔍 UTILISER DIAGNOSTIC AVANCÉ
   - Charger: diagnostic-auth-import.js
   - Exécuter: await diagAuth.runFullDiagnostic()
   - Suivre les recommandations

4. 🛠️ VÉRIFICATION BACKEND
   - Serveur backend démarré (port 5000)
   - Routes /api/share configurées
   - Base de données accessible

📋 PROCÉDURE DE TEST:
1. Ouvrir console navigateur (F12)
2. Exécuter: localStorage.clear(); sessionStorage.clear();
3. Aller sur /login et se reconnecter
4. Tester import immédiatement
5. Si erreur, charger diagnostic-auth-import.js

🚨 SOLUTIONS D'URGENCE SI PROBLÈME PERSISTE:

// Dans console navigateur:
localStorage.clear();
sessionStorage.clear();
window.location.href = '/login';

// Puis après reconnexion, tester avec:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
`);

console.log('✅ Guide de correction affiché - Suivez les étapes ci-dessus');
