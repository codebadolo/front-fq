import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    const { email, password } = values;
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <Form
      name="login"
      onFinish={onFinish}
      layout="vertical"
      style={{ maxWidth: 320, margin: 'auto', marginTop: 100 }}
    >
      {error && <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} />}
      <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Veuillez saisir votre email' }]}>
        <Input type="email" />
      </Form.Item>
      <Form.Item name="password" label="Mot de passe" rules={[{ required: true, message: 'Veuillez saisir votre mot de passe' }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Connexion
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Login;
