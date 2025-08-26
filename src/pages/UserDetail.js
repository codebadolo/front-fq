import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Button, Modal, Form, Input, message, Breadcrumb, Spin } from 'antd';
import api from '../api';

const { Title, Paragraph } = Typography;

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    api.get(`/auth/users/${id}/`)
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        message.error('Erreur lors du chargement utilisateur');
        setLoading(false);
      });
  }, [id]);

  const openPasswordModal = () => {
    form.resetFields();
    setPasswordModalVisible(true);
  };

  const handlePasswordCancel = () => {
    setPasswordModalVisible(false);
  };

  const onPasswordFinish = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      await api.post(`/auth/users/${id}/change-password/`, { password: values.new_password });
      message.success("Mot de passe modifié avec succès");
      setPasswordModalVisible(false);
    } catch {
      message.error("Erreur lors de la modification du mot de passe");
    }
  };

  if (loading) {
    return <Spin tip="Chargement..." style={{ display: 'block', marginTop: 100, textAlign: 'center' }} />;
  }

  if (!user) {
    return <div>Utilisateur non trouvé</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><Link to="/">Accueil</Link></Breadcrumb.Item>
        <Breadcrumb.Item><Link to="/users">Gestion des utilisateurs</Link></Breadcrumb.Item>
        <Breadcrumb.Item>Détails Utilisateur</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2}>Détails de l'utilisateur</Title>
      <Card style={{ maxWidth: 600, marginBottom: 24 }}>
        <Paragraph><b>Email:</b> {user.email}</Paragraph>
        <Paragraph><b>Nom:</b> {user.nom}</Paragraph>
        <Paragraph><b>Niveau d'étude:</b> {user.niveau_etude || '-'}</Paragraph>
        <Paragraph><b>Ville:</b> {user.ville || '-'}</Paragraph>
        <Paragraph><b>Téléphone:</b> {user.telephone || '-'}</Paragraph>
        <Paragraph><b>Actif:</b> {user.is_active ? 'Oui' : 'Non'}</Paragraph>
      </Card>

      <Button type="primary" onClick={openPasswordModal}>
        Changer le mot de passe
      </Button>
      <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>
        Retour
      </Button>

      <Modal
        title="Changer le mot de passe"
        visible={passwordModalVisible}
        onCancel={handlePasswordCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onPasswordFinish}>
          <Form.Item
            name="new_password"
            label="Nouveau mot de passe"
            rules={[{ required: true, message: 'Veuillez saisir un nouveau mot de passe' }]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Confirmer mot de passe"
            dependencies={['new_password']}
            hasFeedback
            rules={[
              { required: true, message: 'Veuillez confirmer le mot de passe' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Modifier
            </Button>
            <Button onClick={handlePasswordCancel}>Annuler</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDetail;
