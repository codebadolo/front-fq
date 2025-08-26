// src/components/Sidebar.js
import React from 'react';
import { Menu, Button, Tooltip } from 'antd';
import {
  HomeOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  PlusOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: 'Accueil' },
  { key: '/quizzes', icon: <UnorderedListOutlined />, label: 'Liste des Quiz' },
  { key: '/quizzes/create', icon: <PlusOutlined />, label: 'Créer Quiz' },
  { key: '/users', icon: <TeamOutlined />, label: 'Gestion des Utilisateurs' },
  { key: '/upload', icon: <UploadOutlined />, label: 'Importer Document' },
  { key: '/profile', icon: <UserOutlined />, label: 'Profil' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Paramètres' },
  // Le logout sera placé séparément en bas
];

const Sidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/quizzes/create')) return ['/quizzes/create'];
    if (path.startsWith('/quizzes')) return ['/quizzes'];
    if (path.startsWith('/users')) return ['/users'];
    if (path.startsWith('/upload')) return ['/upload'];
    if (path.startsWith('/profile')) return ['/profile'];
    if (path.startsWith('/settings')) return ['/settings'];
    return ['/'];
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between', 
      backgroundColor: '#004d40' /* vert foncé */ 
    }}>
      <div>
        <div style={{ 
          height: 64, 
          margin: 16, 
          textAlign: 'center', 
          color: 'white', 
          fontWeight: 'bold', 
          fontSize: collapsed ? 24 : 32, 
          lineHeight: '64px' 
        }}>
          {collapsed ? 'MQ' : 'MyQuiz'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={getSelectedKeys()}
          mode="inline"
          items={menuItems.map(item => ({
            ...item,
            label: collapsed ? (
              <Tooltip placement="right" title={item.label}>
                {item.label}
              </Tooltip>
            ) : (
              item.label
            ),
          }))}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, backgroundColor: '#004d40', borderRight: 'none' }}
        />
      </div>
      <div style={{
        padding: 16,
        borderTop: '1px solid rgba(255,255,255,0.2)',
      }}>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          style={{ color: 'white', width: '100%', textAlign: collapsed ? 'center' : 'left' }}
          onClick={() => {
            // Exemple : redirection logout ou appel à API logout
            navigate('/logout');
          }}
        >
          {!collapsed && 'Déconnexion'}
        </Button>

        <Button
          type="text"
          style={{
            color: 'white',
            width: '100%',
            marginTop: 12,
            textAlign: collapsed ? 'center' : 'left',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: 12,
          }}
          onClick={() => onCollapse(!collapsed)}
        >
          {collapsed ? 'Déplier' : 'Réduire'}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
