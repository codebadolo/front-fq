// src/components/Topbar.js
import React, { useEffect, useState } from 'react';
import { Layout, Button, Input, Badge, Dropdown, Menu, Typography } from 'antd';
import { MenuOutlined, SearchOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const { Header } = Layout;
const { Text } = Typography;

const Topbar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    // Charger info utilisateur connecté
    api.get('/auth/user/')
      .then(res => {
        setUserEmail(res.data.email);
      })
      .catch(() => {
        setUserEmail(null);
      });
  }, []);

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
      localStorage.removeItem('token'); // ou gérer votre token de session
      navigate('/login');
    } catch {
      // gestion erreurs logout
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        Profil
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        Déconnexion
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        position: 'fixed',
        width: '90%',
        height: 64,
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px #f0f1f2',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onToggle}
          style={{
            fontSize: 20,
            width: 48,
            height: 48,
            marginRight: 16,
            transition: 'margin 0.3s',
            marginLeft: collapsed ? 0 : 0,
          }}
        />

        <Input
          placeholder="Rechercher..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          allowClear
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Text style={{ marginRight: 16 }}>{userEmail}</Text>
        <Badge count={5}>
          <IoIosNotificationsOutline style={{ fontSize: 24, cursor: 'pointer' }} onClick={() => navigate('/notifications')} />
        </Badge>
        <Dropdown overlay={menu} placement="bottomRight" trigger={['click']} arrow>
          <img
            src="https://t.ly/18Nvk"
            alt="avatar"
            style={{ width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}
          />
        </Dropdown>
      </div>
    </Header>
  );
};

export default Topbar;
