import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Form,
  InputGroup,
  Badge,
  Pagination,
  Alert,
  Modal,
  Row,
  Col,
  Card,
  Spinner,
  Dropdown
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaKey, 
  FaEye,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserCog,
  FaFilter
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import '../styles/AdminUserManagement.css';

const AdminUserManagement = ({ onStatsUpdate }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination et filtres
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [limit] = useState(10);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await adminService.getAllUsers({
        page: currentPage,
        limit,
        search: searchTerm,
        role: roleFilter
      });

      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
      setTotalUsers(response.data.pagination.totalUsers);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError('Impossible de charger la liste des utilisateurs');
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleCreateUser = async (userData) => {
    try {
      await adminService.createUser(userData);
      toast.success('Utilisateur créé avec succès');
      setShowCreateModal(false);
      loadUsers();
      if (onStatsUpdate) onStatsUpdate();
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      toast.error(err.message || 'Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleEditUser = async (userData) => {
    try {
      await adminService.updateUser(selectedUser._id, userData);
      toast.success('Utilisateur mis à jour avec succès');
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
      if (onStatsUpdate) onStatsUpdate();
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      toast.error(err.message || 'Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await adminService.deleteUser(selectedUser._id);
      toast.success('Utilisateur supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
      if (onStatsUpdate) onStatsUpdate();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      toast.error(err.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    
    try {
      await adminService.resetUserPassword(selectedUser._id, newPassword);
      toast.success('Mot de passe réinitialisé avec succès');
      setShowResetPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (err) {
      console.error('Erreur lors de la réinitialisation:', err);
      toast.error(err.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'teacher': return <FaChalkboardTeacher />;
      case 'student': return <FaUserGraduate />;
      case 'admin': return <FaUserCog />;
      default: return <FaUserGraduate />;
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      teacher: 'primary',
      student: 'success',
      admin: 'danger'
    };
    
    const labels = {
      teacher: 'Enseignant',
      student: 'Étudiant',
      admin: 'Admin'
    };

    return (
      <Badge bg={variants[role]} className="d-flex align-items-center">
        {getRoleIcon(role)}
        <span className="ms-1">{labels[role]}</span>
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <div className="admin-user-management">
      {/* Outils de gestion */}
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        
        <Col md={3}>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" className="w-100">
              <FaFilter className="me-2" />
              {roleFilter ? (
                roleFilter === 'teacher' ? 'Enseignants' :
                roleFilter === 'student' ? 'Étudiants' : 'Admins'
              ) : 'Tous les rôles'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleRoleFilter('')}>
                Tous les rôles
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleRoleFilter('teacher')}>
                Enseignants
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleRoleFilter('student')}>
                Étudiants
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleRoleFilter('admin')}>
                Administrateurs
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>

        <Col md={3}>
          <Button 
            variant="success" 
            className="w-100"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus className="me-2" />
            Nouvel utilisateur
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {/* Statistiques rapides */}
      <Card className="mb-3">
        <Card.Body className="py-2">
          <Row className="text-center">
            <Col>
              <small className="text-muted">
                Total: <strong>{totalUsers}</strong> utilisateur{totalUsers !== 1 ? 's' : ''}
              </small>
            </Col>
            <Col>
              <small className="text-muted">
                Page: <strong>{currentPage}</strong> sur <strong>{totalPages}</strong>
              </small>
            </Col>
            <Col>
              <small className="text-muted">
                Filtre: <strong>{roleFilter || 'Aucun'}</strong>
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card>
        <Table responsive striped hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Date d'inscription</th>
              <th>Statistiques</th>
              <th width="150">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  <div className="text-muted">
                    <FaEye size={48} className="mb-2" />
                    <p>Aucun utilisateur trouvé</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="user-avatar me-2">
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <div className="fw-bold">{user.name}</div>
                        <small className="text-muted">ID: {user._id.slice(-8)}</small>
                      </div>
                    </div>
                  </td>
                  
                  <td>{user.email}</td>
                  
                  <td>{getRoleBadge(user.role)}</td>
                  
                  <td>{formatDate(user.joinDate)}</td>
                  
                  <td>
                    {user.stats && (
                      <div>
                        <small className="d-block">
                          Collections: <strong>{user.stats.collections}</strong>
                        </small>
                        <small className="d-block">
                          Classes: <strong>{user.stats.classes}</strong>
                        </small>
                      </div>
                    )}
                  </td>
                  
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        title="Modifier"
                      >
                        <FaEdit />
                      </Button>
                      
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowResetPasswordModal(true);
                        }}
                        title="Réinitialiser mot de passe"
                      >
                        <FaKey />
                      </Button>
                      
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        title="Supprimer"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.First 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            />
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              );
            })}
            
            <Pagination.Next 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* Modales */}
      <CreateUserModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={handleEditUser}
      />

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <Alert variant="danger">
                <strong>Attention !</strong> Cette action est irréversible.
              </Alert>
              <p>
                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser.name}</strong> ?
              </p>
              <p className="text-muted">
                Toutes les données associées (collections, cartes, classes) seront également supprimées.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            <FaTrash className="me-2" />
            Supprimer définitivement
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de réinitialisation de mot de passe */}
      <Modal show={showResetPasswordModal} onHide={() => setShowResetPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Réinitialiser le mot de passe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p>
                Réinitialiser le mot de passe pour <strong>{selectedUser.name}</strong> ?
              </p>
              <Form.Group>
                <Form.Label>Nouveau mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Au moins 6 caractères"
                  minLength={6}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetPasswordModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="warning" 
            onClick={handleResetPassword}
            disabled={!newPassword || newPassword.length < 6}
          >
            <FaKey className="me-2" />
            Réinitialiser
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminUserManagement;
