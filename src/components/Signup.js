import React, { useState } from 'react';
import { Form, Input, Button, Alert, Select } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const Signup = () => {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    if (values.password !== values.password2) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    const result = await signup(values);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <Form
      name="signup"
      onFinish={onFinish}
      layout="vertical"
      style={{ maxWidth: 400, margin: 'auto', marginTop: 50 }}
    >
      {error && <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} />}
      <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Veuillez saisir votre email' }]}>
        <Input type="email" />
      </Form.Item>
      <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Veuillez saisir votre nom' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="niveau_etude" label="Niveau d'étude" rules={[{ required: true, message: 'Veuillez sélectionner votre niveau d\'étude' }]}>
        <Select placeholder="Sélectionnez votre niveau d'étude">
          <Option value="bac">Baccalauréat</Option>
          <Option value="licence">Licence</Option>
          <Option value="master">Master</Option>
          <Option value="doctorat">Doctorat</Option>
          <Option value="autre">Autre</Option>
        </Select>
      </Form.Item>
      <Form.Item name="telephone" label="Téléphone">
        <Input />
      </Form.Item>
      <Form.Item name="password" label="Mot de passe" rules={[{ required: true, message: 'Veuillez saisir un mot de passe' }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item name="password2" label="Confirmer mot de passe" rules={[{ required: true, message: 'Veuillez confirmer votre mot de passe' }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Créer un compte
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Signup;
