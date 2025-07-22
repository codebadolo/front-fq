import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Checkbox,
    Divider,
    Form,
    Input,
    List,
    Popconfirm,
    Space,
    Typography,
    message,
} from 'antd';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

function generateTempId() {
  return Math.random().toString(36).substr(2, 9);
}

const letter = (index) => String.fromCharCode(97 + index);

const QuizCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // questions et réponses (structure identique à QuizUpdate pour faciliter le suivi)
  const [questions, setQuestions] = useState([]);

  const ajouterQuestion = () => {
    const newQuestion = {
      id: generateTempId(),
      texte: '',
      reponses: [],
      _isNew: true,
      _deleted: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const supprimerQuestion = (qId) => {
    setQuestions(questions.map(q => (q.id === qId ? { ...q, _deleted: true } : q)));
  };

  const modifierTexteQuestion = (qId, texte) => {
    setQuestions(questions.map(q => (q.id === qId ? { ...q, texte } : q)));
  };

  const ajouterReponse = (qId) => {
    const newReponse = {
      id: generateTempId(),
      texte: '',
      est_correcte: false,
      _isNew: true,
      _deleted: false,
    };
    setQuestions(questions.map(q => 
      q.id === qId ? {...q, reponses: [...q.reponses, newReponse]} : q
    ));
  };

  const supprimerReponse = (qId, rId) => {
    setQuestions(questions.map(q =>
      q.id === qId ? {
        ...q,
        reponses: q.reponses.map(r => (r.id === rId ? { ...r, _deleted: true } : r))
      } : q
    ));
  };

  const modifierTexteReponse = (qId, rId, texte) => {
    setQuestions(questions.map(q =>
      q.id === qId ? {
        ...q,
        reponses: q.reponses.map(r => (r.id === rId ? { ...r, texte } : r))
      } : q
    ));
  };

  const toggleCorrecte = (qId, rId) => {
    setQuestions(questions.map(q =>
      q.id === qId ? {
        ...q,
        reponses: q.reponses.map(r =>
          r.id === rId ? { ...r, est_correcte: !r.est_correcte } : r
        ),
      } : q
    ));
  };

  const saveAll = async () => {
    try {
      const values = await form.validateFields();
      if (questions.length === 0 || questions.filter(q => !q._deleted).length === 0) {
        message.error("Veuillez ajouter au moins une question.");
        return;
      }
      setLoading(true);
      message.loading({ content: 'Création en cours...', key: 'creation' });

      // 1. Créer le quiz
      const resQuiz = await axios.post('http://localhost:8000/api/quizzes/', {
        titre: values.titre,
        ordre: values.ordre,
        // vous pouvez ajouter 'document' si besoin selon votre modèle
      });

      const quizId = resQuiz.data.id;

      // 2. Créer questions & réponses
      for (const q of questions) {
        if (q._deleted) continue;
        const resQ = await axios.post('http://localhost:8000/api/questions/', {
          texte: q.texte,
          quiz: quizId,
        });
        const questionId = resQ.data.id;

        for (const r of q.reponses) {
          if (r._deleted) continue;
          await axios.post('http://localhost:8000/api/reponses/', {
            texte: r.texte,
            est_correcte: r.est_correcte,
            question: questionId,
          });
        }
      }

      message.success({ content: 'Quiz créé avec succès', key: 'creation', duration: 2 });
      navigate('/quizzes');
    } catch (error) {
      console.error(error);
      message.error('Erreur lors de la création du quiz');
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);

  return (
    <Card title="Créer un nouveau quiz" style={{ maxWidth: 900, margin: 'auto' }}>
      <Form form={form} layout="vertical" style={{ marginBottom: 20 }}>
        <Form.Item name="titre" label="Titre du quiz" rules={[{ required: true, message: 'Veuillez saisir un titre' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="ordre" label="Ordre" rules={[{ required: true, message: 'Veuillez saisir un ordre' }]}>
          <Input type="number" />
        </Form.Item>
      </Form>

      <Divider />

      <Button type="dashed" onClick={ajouterQuestion} icon={<PlusOutlined />} block style={{ marginBottom: 16 }}>
        Ajouter une question
      </Button>

      <List
        dataSource={questions.filter(q => !q._deleted)}
        itemLayout="vertical"
        renderItem={q => (
          <Card
            size="small"
            key={q.id}
            style={{ marginBottom: 16 }}
            extra={
              <Popconfirm
                title="Supprimer cette question ?"
                onConfirm={() => supprimerQuestion(q.id)}
                okText="Oui"
                cancelText="Non"
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            }
          >
            <Input.TextArea
              rows={2}
              placeholder="Texte de la question"
              value={q.texte}
              onChange={e => modifierTexteQuestion(q.id, e.target.value)}
              style={{ marginBottom: 12 }}
            />

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => ajouterReponse(q.id)}
              style={{ marginBottom: 8 }}
            >
              Ajouter une réponse
            </Button>

            <List
              dataSource={q.reponses.filter(r => !r._deleted)}
              renderItem={(r, rIdx) => (
                <List.Item
                  key={r.id}
                  actions={[
                    <Popconfirm
                      title="Supprimer cette réponse ?"
                      onConfirm={() => supprimerReponse(q.id, r.id)}
                      okText="Oui"
                      cancelText="Non"
                    >
                      <Button danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>,
                  ]}
                >
                  <Checkbox
                    checked={r.est_correcte}
                    onChange={() => toggleCorrecte(q.id, r.id)}
                    style={{ marginRight: 10, color: r.est_correcte ? 'green' : undefined }}
                  />
                  <span style={{ fontWeight: 'bold', width: 20 }}>{letter(rIdx) + ')'}</span>
                  <Input
                    value={r.texte}
                    onChange={e => modifierTexteReponse(q.id, r.id, e.target.value)}
                    placeholder="Texte réponse"
                  />
                </List.Item>
              )}
            />
          </Card>
        )}
      />

      <Divider />

      <Space>
        <Button type="primary" onClick={saveAll} loading={loading}>
          Créer le quiz
        </Button>
        <Button onClick={() => navigate('/quizzes')} disabled={loading}>
          Annuler
        </Button>
      </Space>
    </Card>
  );
};

export default QuizCreate;
