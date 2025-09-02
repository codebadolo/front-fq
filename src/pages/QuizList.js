import { Button, Space, Spin, Table, Typography, Input, message } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, EyeOutlined, EditOutlined, FileExcelOutlined } from '@ant-design/icons';
import api from '../api';

const { Title } = Typography;

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const navigate = useNavigate();
  const searchTimeout = useRef(null);

  useEffect(() => {
    setLoading(true);
    api.get('/quizzes/')
      .then(res => {
        setQuizzes(res.data);
        setFilteredQuizzes(res.data);
      })
      .catch(() => message.error('Erreur lors du chargement des quiz'))
      .finally(() => setLoading(false));
  }, []);

  const onSearch = (value) => {
    setSearchText(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      const filtered = quizzes.filter(q => q.titre.toLowerCase().includes(value.toLowerCase()));
      setFilteredQuizzes(filtered);
    }, 300);
  };

  const exportCSV = () => {
    let csv = 'Titre,Ordre,Créé par,Date création,Dernière mise à jour,Modifié par\n';
    filteredQuizzes.forEach(q => {
      const titre = `"${q.titre.replace(/"/g, '""')}"`;
      const createdBy = q.created_by?.email || '';
      const createdAt = q.created_at || '';
      const updatedAt = q.updated_at || '';
      const updatedBy = q.updated_by?.email || '';
      csv += `${titre},${q.ordre},${createdBy},${createdAt},${updatedAt},${updatedBy}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quizzes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: 'Titre',
      dataIndex: 'titre',
      key: 'titre',
      sorter: (a, b) => a.titre.localeCompare(b.titre),
      sortDirections: ['ascend', 'descend'],
      ellipsis: true,
      width: 180,
    },
    {
      title: 'Ordre',
      dataIndex: 'ordre',
      key: 'ordre',
      sorter: (a, b) => a.ordre - b.ordre,
      width: 80,
    },
    {
      title: 'Créé par',
      dataIndex: ['created_by', 'email'],
      key: 'created_by',
      width: 180,
      sorter: (a, b) => (a.created_by?.email || '').localeCompare(b.created_by?.email || ''),
      render: (email) => email || '-',
    },
    {
      title: 'Date création',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (date) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Dernière mise à jour',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 140,
      sorter: (a, b) => new Date(a.updated_at) - new Date(b.updated_at),
      render: (date) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Modifié par',
      dataIndex: ['updated_by', 'email'],
      key: 'updated_by',
      width: 180,
      sorter: (a, b) => (a.updated_by?.email || '').localeCompare(b.updated_by?.email || ''),
      render: (email) => email || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/quizzes/${record.id}`)}
            size="small"
            aria-label={`Voir détails ${record.titre}`}
          />
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => navigate(`/quizzes/${record.id}/edit`)}
            size="small"
            aria-label={`Modifier ${record.titre}`}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          Liste des Quiz
        </Title>
        <Space>
          <Input
            placeholder="Rechercher un quiz"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => onSearch(e.target.value)}
            allowClear
            style={{ width: 240 }}
            aria-label="Rechercher un quiz"
          />
          <Button
            icon={<FileExcelOutlined />}
            onClick={exportCSV}
            aria-label="Exporter la liste des quiz au format CSV"
          >
            Export CSV
          </Button>
          <Button
            type="primary"
            onClick={() => navigate('/quizzes/create')}
            aria-label="Créer un nouveau quiz"
          >
            Créer un quiz
          </Button>
        </Space>
      </Space>

      {loading ? (
        <Spin size="large" tip="Chargement des quiz..." />
      ) : (
        <Table
          rowKey="id"
          dataSource={filteredQuizzes}
          columns={columns}
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          scroll={{ x: 1200 }}
          bordered
          size='small'
          locale={{ emptyText: 'Aucun quiz trouvé' }}
          sticky
        />
      )}
    </>
  );
};

export default QuizList;
