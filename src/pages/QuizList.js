import { Button, Space, Spin, Table, Typography } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/quizzes/')
      .then(res => setQuizzes(res.data))
      .catch(() => alert('Erreur lors du chargement des quiz'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      title: 'Titre',
      dataIndex: 'titre',
      key: 'titre',
    },
    {
      title: 'Ordre',
      dataIndex: 'ordre',
      key: 'ordre',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => navigate(`/quizzes/${record.id}`)}>
            Voir détail
          </Button>
          <Button type="link" onClick={() => navigate(`/quizzes/${record.id}/edit`)}>
            Modifier
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
        <Title level={2}>Liste des Quiz</Title>
        <Button type="primary" onClick={() => navigate('/quizzes/create')}>
          Créer un quiz
        </Button>
      </Space>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          rowKey="id"
          dataSource={quizzes}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      )}
    </>
  );
};

export default QuizList;
