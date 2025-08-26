import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Avatar, Typography, Button, Modal, Form, Input, message, Row, Col, Spin, Breadcrumb } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import api from '../api';

const { Title, Paragraph } = Typography;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    // Ici vous remplaceriez par fetch du user connecté, ex: /auth/user/profile
    api.get('/auth/user/')
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        message.error('Erreur chargement profil');
        setLoading(false);
      });
  }, []);

  const openModal = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const onPasswordChangeFinish = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      // Adapter endpoint au backend
      await api.post('/auth/password-reset/', { password: values.new_password });
      message.success("Mot de passe changé avec succès");
      closeModal();
    } catch {
      message.error("Erreur lors du changement de mot de passe");
    }
  };

  if (loading) {
    return <Spin tip="Chargement..." style={{ marginTop: 100, display: 'block', textAlign: 'center' }} />;
  }

  if (!user) {
    return <div>Utilisateur non trouvé</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><Link to="/">Accueil</Link></Breadcrumb.Item>
        <Breadcrumb.Item>Profil</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={24} justify="center">
        <Col xs={24} sm={12} md={8}>
          <Card style={{ textAlign: 'center' }}>
            <Avatar size={120} icon={<UserOutlined />} />
            <Title level={3} style={{ marginTop: 16 }}>{user.nom}</Title>
            <Paragraph><b>Email :</b> {user.email}</Paragraph>
            <Paragraph><b>Niveau d'étude :</b> {user.niveau_etude || '-'}</Paragraph>
            <Paragraph><b>Ville :</b> {user.ville || '-'}</Paragraph>
            <Paragraph><b>Téléphone :</b> {user.telephone || '-'}</Paragraph>
            <Button type="primary" onClick={openModal}>
              Changer mot de passe
            </Button>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Changer le mot de passe"
        visible={modalVisible}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onPasswordChangeFinish}>
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
            <Button onClick={closeModal}>
              Annuler
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;
