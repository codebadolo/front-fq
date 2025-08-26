import { Layout } from 'antd';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const { Content } = Layout;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider collapsible collapsed={collapsed} trigger={null} width={240}>
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      </Layout.Sider>

      <Layout>
        <Topbar collapsed={collapsed} onToggle={handleToggle} />
        <Content
          style={{
            marginTop: 64,
            marginLeft: collapsed ? 2 : 20,
            padding: 24,
            minHeight: 'calc(100vh - 64px)',
            transition: 'margin-left 0.3s',
            background: '#fff',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
