import React, { useState } from 'react';
import { Button, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { FiShare2, FiCopy, FiDownload } from 'react-icons/fi';

const QuickShareButton = ({ 
  collection, 
  variant = "outline-secondary", 
  size = "sm", 
  showText = true,
  onlyIcon = false 
}) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleQuickShare = () => {
    if (!collection) {
      showToastMessage('Aucune collection sélectionnée', 'error');
      return;
    }

    // Créer un texte de partage avec les informations de la collection
    const shareText = `📚 Collection: ${collection.name}\n` +
                     `📖 Description: ${collection.description || 'Aucune description'}\n` +
                     `🃏 Nombre de cartes: ${collection.cardCount || 0}\n` +
                     `👨‍🏫 Créé par: ${collection.user?.name || collection.teacherName || 'Enseignant'}\n` +
                     `📅 Créé le: ${formatDate(collection.createdAt)}\n` +
                     `🔗 Accès via: Collections partagées dans votre classe`;

    // Copier dans le presse-papiers
    navigator.clipboard.writeText(shareText).then(() => {
      showToastMessage('Informations de la collection copiées !');
    }).catch(() => {
      showToastMessage('Erreur lors de la copie', 'error');
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (onlyIcon) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          onClick={handleQuickShare}
          className="d-flex align-items-center justify-content-center"
          title="Copier les informations de la collection"
        >
          <FiShare2 />
        </Button>

        <ToastContainer position="top-end" className="p-3">
          <Toast 
            show={showToast} 
            onClose={() => setShowToast(false)}
            delay={3000}
            autohide
            bg={toastType === 'success' ? 'success' : 'danger'}
          >
            <Toast.Header>
              <strong className="me-auto">
                {toastType === 'success' ? '✅ Succès' : '❌ Erreur'}
              </strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              {toastMessage}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleQuickShare}
        className="d-flex align-items-center justify-content-center"
      >
        <FiShare2 className={showText ? "me-2" : ""} />
        {showText && "Partager infos"}
      </Button>

      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastType === 'success' ? 'success' : 'danger'}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastType === 'success' ? '✅ Succès' : '❌ Erreur'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default QuickShareButton;
