// Utilitaires pour générer des couleurs cohérentes pour les collections
export const getCollectionColor = (collectionName) => {
  // Liste de couleurs inspirées de YouTube
  const colors = [
    '#FF0000', // Rouge YouTube
    '#065FD4', // Bleu YouTube
    '#FF6C00', // Orange YouTube
    '#1ED760', // Vert (Spotify)
    '#8F00FF', // Violet
    '#00A4EF', // Bleu ciel
    '#FF8D85', // Rose corail
    '#FF4500', // Orange-rouge (Reddit)
    '#0099E5', // Bleu cyan
    '#6441A4'  // Violet (Twitch)
  ];
  
  // Générer un index basé sur le nom de la collection pour avoir une couleur cohérente
  let hash = 0;
  for (let i = 0; i < collectionName.length; i++) {
    hash = collectionName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convertir en index dans le tableau de couleurs
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
