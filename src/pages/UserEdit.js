import { Button, Form, Input, Select, Typography, message, Breadcrumb, Spin } from 'antd';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
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

const UserEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chargement de l'utilisateur à éditer
    api.get(`/auth/users/${id}/`)
      .then(res => {
        form.setFieldsValue({
          email: res.data.email,
          nom: res.data.nom,
          niveau_etude: res.data.niveau_etude,
          telephone: res.data.telephone,
          ville: res.data.ville,
        });
        setLoading(false);
      })
      .catch(() => {
        message.error("Erreur chargement utilisateur");
        setLoading(false);
      });
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      // Pour l'édition, on n'envoie pas le mot de passe ici (peut être modifié avec formulaire séparé)
      const payload = { ...values };
      delete payload.password;
      delete payload.password2;

      await api.put(`/auth/users/${id}/`, payload);
      message.success('Utilisateur mis à jour avec succès');
      navigate('/users');
    } catch {
      message.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return <Spin tip="Chargement..." style={{ display: 'block', marginTop: 100, textAlign: 'center' }} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/">Accueil</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/users">Gestion des utilisateurs</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Édition</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2}>Modifier l'utilisateur</Title>

      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 800 }}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Veuillez saisir un email" },
            { type: "email", message: "Veuillez saisir un email valide" }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nom"
          name="nom"
          rules={[{ required: true, message: "Veuillez saisir un nom" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Niveau d'étude"
          name="niveau_etude"
          rules={[{ required: true, message: "Veuillez sélectionner le niveau d'étude" }]}
        >
          <Select placeholder="Sélectionnez un niveau d'étude" allowClear>
            {NIVEAU_CHOICES.map(({ value, label }) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Ville"
          name="ville"
          rules={[{ required: false }]}
        >
          <Input placeholder="Ville" />
        </Form.Item>

        <Form.Item label="Téléphone" name="telephone">
          <Input />
        </Form.Item>

        {/* Suppression de champs mot de passe ici, créer une page séparée pour mot de passe */}

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            Enregistrer
          </Button>
          <Button onClick={() => navigate('/users')}>
            Annuler
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserEdit;
