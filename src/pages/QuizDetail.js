import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Radio,
  Breadcrumb,
  message,
  Button,
  Row,
  Col,
  Input,
  Space,
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import api from '../api';
import QuestionUpdateModal from './QuestionUpdateModal';

const { Title, Paragraph } = Typography;

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);

  const loadQuiz = () => {
    setLoading(true);
    api.get(`/quizzes/${id}/`)
      .then(res => {
        setQuiz(res.data);
        setLoading(false);
      })
      .catch(() => {
        message.error("Erreur lors du chargement du quiz");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const openModal = (question) => {
    setQuestionToEdit(question);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setQuestionToEdit(null);
  };

  const filteredQuestions = useMemo(() => {
    if (!quiz) return [];
    return quiz.questions.filter(q =>
      q.texte.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [quiz, searchTerm]);

  const midIndex = Math.ceil(filteredQuestions.length / 2);
  const leftQuestions = filteredQuestions.slice(0, midIndex);
  const rightQuestions = filteredQuestions.slice(midIndex);

  const renderQuestion = (question) => (
    <Card
      key={question.id}
      type="inner"
      title={
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <span>{question.texte}</span>
          <Button size="small" onClick={() => openModal(question)}>
            Modifier
          </Button>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      {question.reponses.map(answer => (
        <Radio
          key={answer.id}
          checked={answer.est_correcte}
          disabled
          style={{
            display: 'block',
            marginBottom: 8,
            backgroundColor: answer.est_correcte ? '#d9f7be' : 'white', // vert clair pour bonne réponse
            borderRadius: 4,
            color: 'black',
            padding: '4px 8px',
          }}
        >
          {answer.texte}
        </Radio>
      ))}
    </Card>
  );

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Breadcrumb style={{ fontSize: 16 }}>
            <Breadcrumb.Item key="home" icon={<HomeOutlined />}>
              <Link to="/">Accueil</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item key="quiz-list">
              <Link to="/quizzes">Quiz</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item key="quiz-detail">{quiz?.titre}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col>
          <Input.Search
            placeholder="Rechercher une question"
            allowClear
            enterButton
            onSearch={value => setSearchTerm(value)}
            style={{ width: 280 }}
          />
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          {leftQuestions.map(renderQuestion)}
        </Col>
        <Col xs={24} md={12}>
          {rightQuestions.map(renderQuestion)}
        </Col>
      </Row>

      <Button type="primary" style={{ marginTop: 20 }} onClick={() => navigate('/quizzes')}>
        Retour à la liste des quiz
      </Button>

      <QuestionUpdateModal
        visible={modalVisible}
        question={questionToEdit}
        onClose={closeModal}
        onUpdate={loadQuiz}
      />
    </div>
  );
};

export default QuizDetail;
