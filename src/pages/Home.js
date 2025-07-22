import { Card, Col, Row, Spin, Statistic, Typography, message } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const { Title, Paragraph } = Typography;

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Appeler l'API dashboard_stats au chargement du composant
    setLoading(true);
    axios.get('http://localhost:8000/api/dashboard_stats/')  // adapter URL selon votre backend
      .then(res => {
        setStats(res.data);
      })
      .catch(() => {
        message.error('Erreur lors du chargement des statistiques');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return <Spin size="large" style={{ marginTop: 100 }} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 24 }}>
        <Title level={2}>Bienvenue sur votre Dashboard QCM</Title>
        <Paragraph>
          Utilisez le menu pour parcourir les quiz ou importer des documents PDF.
        </Paragraph>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Quiz totaux" value={stats.total_quizzes} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Questions totales" value={stats.total_questions} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Documents importés" value={stats.total_documents} />
          </Card>
        </Col>
      </Row>

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
    </div>
  );
};

export default Home;
