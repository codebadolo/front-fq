import { Button, Form, Input, Select, Typography, message, Breadcrumb, Row, Col } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const { Title } = Typography;
const { Option } = Select;

const NIVEAU_CHOICES = [
  { value: 'bac', label: 'Baccalauréat' },
  { value: 'licence', label: 'Licence' },
  { value: 'master', label: 'Master' },
  { value: 'doctorat', label: 'Doctorat' },
  { value: 'autre', label: 'Autre' },
];

const UserCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const { email, nom, niveau_etude, telephone, ville, password } = values;
      await api.post('/auth/users/', { email, nom, niveau_etude, telephone, ville, password });
      message.success('Utilisateur créé avec succès');
      navigate('/users');
    } catch (error) {
      message.error('Erreur lors de la création');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/">Accueil</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/users">Gestion des utilisateurs</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Création</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2}>Créer un utilisateur</Title>

      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 800 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Veuillez saisir un email' },
                { type: 'email', message: 'Veuillez saisir un email valide' },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Nom"
              name="nom"
              rules={[{ required: true, message: 'Veuillez saisir un nom' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Niveau d'étude"
              name="niveau_etude"
              rules={[{ required: true, message: 'Veuillez sélectionner le niveau d\'étude' }]}
            >
              <Select placeholder="Sélectionnez un niveau d'étude" allowClear>
                {NIVEAU_CHOICES.map(({ value, label }) => (
                  <Option key={value} value={value}>{label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Ville"
              name="ville"
              rules={[{ required: true, message: 'Veuillez saisir une ville' }]}
            >
              <Input placeholder="Ville" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Téléphone" name="telephone">
              <Input />
            </Form.Item>
          </Col>
         
          <Col span={12}>
            <Form.Item
              label="Mot de passe"
              name="password"
              rules={[{ required: true, message: 'Veuillez saisir un mot de passe' }]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Confirmer mot de passe"
              name="password2"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Veuillez confirmer le mot de passe' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                Créer
              </Button>
              <Button onClick={() => navigate('/users')}>
                Annuler
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default UserCreate;
