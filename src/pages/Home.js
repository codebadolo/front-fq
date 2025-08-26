import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Spin, Statistic, Typography, message, Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from 'recharts';
import api from '../api';

const { Title, Paragraph } = Typography;

const routeNameMap = {
  '/': 'Accueil',
  '/quizzes': 'Quiz',
  '/upload': 'Import PDF'
};

const AppBreadcrumb = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return (
      <Breadcrumb.Item key={url}>
        <Link to={url}>{routeNameMap[url] || url}</Link>
      </Breadcrumb.Item>
    );
  });

  return (
    <Breadcrumb style={{ marginBottom: 16 }}>
      <Breadcrumb.Item key="home">
        <Link to="/">Accueil</Link>
      </Breadcrumb.Item>
      {breadcrumbItems}
    </Breadcrumb>
  );
};

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/dashboard_stats/')
      .then(res => {
        setStats(res.data);
      })
      .catch(() => {
        message.error('Erreur lors du chargement des statistiques');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <Spin size="large" style={{ marginTop: 100 }} />;

  return (
    <div style={{ padding: 24 }}>
      <AppBreadcrumb />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Quiz totaux" value={stats.total_quizzes} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Questions totales" value={stats.total_questions} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Documents importés" value={stats.total_documents} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Utilisateurs inscrits" value={stats.total_users || 'N/A'} />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Card title="Quiz créés la dernière semaine" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.quizzes_per_day}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="quizzes"
                  stroke="#1890ff"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Exemple de graphique à barres" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.quizzes_per_day}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="quizzes" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
