import { Table, Space, Typography, Button, message, Modal, Breadcrumb, Row, Col, Input, Card, Statistic } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  UserAddOutlined,
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
  UserDeleteOutlined,
  LineChartOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const { Title } = Typography;
const { confirm } = Modal;
const { Search } = Input;

const routeNameMap = {
  '/': 'Accueil',
  '/users': 'Gestion des utilisateurs',
  '/users/create': 'Ajouter utilisateur'
};

const StatsCards = ({ stats, statsByNiveau, statsByVille }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
    <Col xs={24} sm={12} md={8} lg={4}>
      <Card>
        <Statistic
          title="Utilisateurs Totaux"
          value={stats.total}
          prefix={<UserOutlined />}
          valueStyle={{ color: '#3f8600' }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={8} lg={4}>
      <Card>
        <Statistic
          title="Utilisateurs Actifs"
          value={stats.active}
          prefix={<UserAddOutlined />}
          valueStyle={{ color: '#1890ff' }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={8} lg={4}>
      <Card>
        <Statistic
          title="Utilisateurs Inactifs"
          value={stats.inactive}
          prefix={<UserDeleteOutlined />}
          valueStyle={{ color: '#cf1322' }}
        />
      </Card>
    </Col>
    {Object.entries(statsByNiveau).slice(0, 2).map(([niveau, count]) => (
      <Col xs={24} sm={12} md={8} lg={4} key={niveau}>
        <Card>
          <Statistic
            title={`Niveau: ${niveau.charAt(0).toUpperCase() + niveau.slice(1)}`}
            value={count}
            prefix={<LineChartOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    ))}
    {Object.entries(statsByVille).slice(0, 1).map(([ville, count]) => (
      <Col xs={24} sm={12} md={8} lg={4} key={ville}>
        <Card>
          <Statistic
            title={`Ville: ${ville}`}
            value={count}
            prefix={<EnvironmentOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
    ))}
  </Row>
);

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [statsByNiveau, setStatsByNiveau] = useState({});
  const [statsByVille, setStatsByVille] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users/');
      setUsers(res.data);
      setFilteredUsers(res.data);

      const activeCount = res.data.filter(u => u.is_active).length;
      const inactiveCount = res.data.length - activeCount;

      const niveauCounts = {};
      const villeCounts = {};

      res.data.forEach(u => {
        const niveau = u.niveau_etude || 'Non renseigné';
        niveauCounts[niveau] = (niveauCounts[niveau] || 0) + 1;

        const ville = u.ville || 'Inconnue';
        villeCounts[ville] = (villeCounts[ville] || 0) + 1;
      });

      setStats({ total: res.data.length, active: activeCount, inactive: inactiveCount });
      setStatsByNiveau(niveauCounts);
      setStatsByVille(villeCounts);
    } catch (error) {
      message.error("Erreur chargement utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSearch = (value) => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(value.toLowerCase()) ||
      user.nom.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const showDeleteConfirm = (userId, email) => {
    confirm({
      title: `Supprimer l'utilisateur ${email} ?`,
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        deleteUser(userId);
      }
    });
  };

  const deleteUser = async (userId) => {
    setLoading(true);
    try {
      await api.delete(`/auth/users/${userId}/`);
      message.success('Utilisateur supprimé');
      fetchUsers();
    } catch {
      message.error('Erreur suppression');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      const dataToExport = filteredUsers.map(u => ({
        Email: u.email,
        Nom: u.nom,
        NiveauEtude: u.niveau_etude,
        Telephone: u.telephone,
        Ville: u.ville || 'Non renseignée',
        Actif: u.is_active ? 'Oui' : 'Non'
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Utilisateurs");

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'utilisateurs.xlsx');
    } catch (err) {
      message.error("Erreur export Excel");
    }
  };

  const pathSnippets = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSnippets.map((_, index, arr) => {
    const url = '/' + arr.slice(0, index + 1).join('/');
    return (
      <Breadcrumb.Item key={url}>
        <Link to={url}>{routeNameMap[url] || url}</Link>
      </Breadcrumb.Item>
    );
  });

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email)
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom.localeCompare(b.nom)
    },
    {
      title: 'Niveau d\'étude',
      dataIndex: 'niveau_etude',
      key: 'niveau_etude',
      filters: Object.keys(statsByNiveau).map(n => ({ text: n, value: n })),
      onFilter: (value, record) => record.niveau_etude === value,
      sorter: (a, b) => a.niveau_etude.localeCompare(b.niveau_etude || '')
    },
    {
      title: 'Téléphone',
      dataIndex: 'telephone',
      key: 'telephone'
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
      filters: Object.keys(statsByVille).map(v => ({ text: v, value: v })),
      onFilter: (value, record) => (record.ville || 'Inconnue') === value,
      sorter: (a, b) => (a.ville || '').localeCompare(b.ville || '')
    },
    {
      title: 'Actif',
      dataIndex: 'is_active',
      key: 'is_active',
      filters: [
        { text: 'Oui', value: true },
        { text: 'Non', value: false }
      ],
      onFilter: (value, record) => record.is_active === value,
      render: active => (active ? 'Oui' : 'Non')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <EyeOutlined
            title="Voir détails"
            style={{ color: '#1890ff', cursor: 'pointer' }}
            onClick={() => navigate(`/users/${record.id}`)}
          />
          <EditOutlined
            title="Modifier"
            style={{ color: '#52c41a', cursor: 'pointer' }}
            onClick={() => navigate(`/users/${record.id}/edit`)}
          />
          <DeleteOutlined
            title="Supprimer"
            style={{ color: 'red', cursor: 'pointer' }}
            onClick={() => showDeleteConfirm(record.id, record.email)}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item key="home">
              <Link to="/"><UserOutlined /> Accueil</Link>
            </Breadcrumb.Item>
            {breadcrumbItems}
          </Breadcrumb>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Rechercher utilisateur"
              allowClear
              onSearch={onSearch}
              style={{ width: 250 }}
              enterButton={<SearchOutlined />}
            />
            <Button
              icon={<UserAddOutlined />}
              type="primary"
              onClick={() => navigate('/users/create')}
            >
              Ajouter
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={exportToExcel}
            >
              Export Excel
            </Button>
          </Space>
        </Col>
      </Row>

      <StatsCards
        stats={stats}
        statsByNiveau={statsByNiveau}
        statsByVille={statsByVille}
      />

      <Table
        rowKey="id"
        dataSource={filteredUsers}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 16 }}
        size="small"
      />
    </div>
  );
};

export default UsersManagement;
