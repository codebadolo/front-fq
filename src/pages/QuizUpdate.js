import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  List,
  Popconfirm,
  Space,
  Spin,
  Typography,
  message,
  Row,
  Col,
} from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const { Title } = Typography;

function generateTempId() {
  return Math.random().toString(36).substr(2, 9);
}

const QuizUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8000/api/quizzes/${id}/`)
      .then(res => {
        setQuiz(res.data);
        form.setFieldsValue({ titre: res.data.titre, ordre: res.data.ordre });
        const loadedQuestions = res.data.questions.map(q => ({
          ...q,
          _isNew: false,
          _deleted: false,
          reponses: q.reponses.map(r => ({ ...r, _isNew: false, _deleted: false })),
        }));
        setQuestions(loadedQuestions);
      })
      .catch(() => message.error('Erreur chargement quiz'))
      .finally(() => setLoading(false));
  }, [id, form]);

  const ajouterQuestion = () => setQuestions([...questions, {
    id: generateTempId(),
    texte: '',
    _isNew: true,
    _deleted: false,
    reponses: [],
  }]);

  const supprimerQuestion = (qId) => setQuestions(questions.map(q =>
    q.id === qId ? { ...q, _deleted: true } : q
  ));

  const modifierTexteQuestion = (qId, texte) => setQuestions(questions.map(q =>
    q.id === qId ? { ...q, texte } : q
  ));

  const ajouterReponse = (qId) => {
    const newReponse = { id: generateTempId(), texte: '', est_correcte: false, _isNew: true, _deleted: false };
    setQuestions(questions.map(q =>
      q.id === qId ? { ...q, reponses: [...q.reponses, newReponse] } : q
    ));
  };

  const supprimerReponse = (qId, rId) => setQuestions(questions.map(q =>
    q.id === qId ? {
      ...q,
      reponses: q.reponses.map(r => r.id === rId ? { ...r, _deleted: true } : r)
    } : q
  ));

  const modifierTexteReponse = (qId, rId, texte) => setQuestions(questions.map(q =>
    q.id === qId ? {
      ...q,
      reponses: q.reponses.map(r => r.id === rId ? { ...r, texte } : r)
    } : q
  ));

  const toggleCorrecte = (qId, rId) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q,
        reponses: q.reponses.map(r => ({
          ...r,
          est_correcte: r.id === rId,
        })),
      };
    }));
  };

  // Validation personnalisée avant sauvegarde
  const validateQuestions = () => {
    if (!form.getFieldValue('titre').trim()) {
      message.error('Le titre du quiz est obligatoire.');
      return false;
    }
    if (!(form.getFieldValue('ordre') >= 1)) {
      message.error("L'ordre du quiz doit être un nombre supérieur ou égal à 1.");
      return false;
    }
    for (const q of questions) {
      if (q._deleted) continue;
      if (!q.texte.trim()) {
        message.error('Chaque question doit avoir un texte.');
        return false;
      }
      const validReponses = q.reponses.filter(r => !r._deleted);
      if (validReponses.length === 0) {
        message.error('Chaque question doit avoir au moins une réponse.');
        return false;
      }
      if (!validReponses.some(r => r.est_correcte)) {
        message.error('Chaque question doit avoir au moins une réponse correcte.');
        return false;
      }
      for (const r of validReponses) {
        if (!r.texte.trim()) {
          message.error('Chaque réponse doit avoir un texte.');
          return false;
        }
      }
    }
    return true;
  };

  const saveAll = async () => {
    if (!validateQuestions()) return;

    setLoading(true);
    message.loading({ content: 'Enregistrement...', key: 'saving' });
    try {
      await axios.patch(`http://localhost:8000/api/quizzes/${quiz.id}/`, {
        titre: form.getFieldValue('titre'),
        ordre: form.getFieldValue('ordre'),
      });

      await Promise.all(questions.filter(q => q._deleted && !q._isNew).map(q =>
        axios.delete(`http://localhost:8000/api/questions/${q.id}/`)
      ));

      for (const q of questions) {
        if (q._deleted) continue;

        let savedQuestion = q;
        if (q._isNew) {
          const resQ = await axios.post(`http://localhost:8000/api/questions/`, {
            texte: q.texte,
            quiz: quiz.id,
          });
          savedQuestion = { ...q, id: resQ.data.id, _isNew: false };
        } else {
          await axios.patch(`http://localhost:8000/api/questions/${q.id}/`, { texte: q.texte });
        }

        await Promise.all(savedQuestion.reponses.filter(r => r._deleted && !r._isNew).map(r =>
          axios.delete(`http://localhost:8000/api/reponses/${r.id}/`)
        ));

        for (const r of savedQuestion.reponses) {
          if (r._deleted) continue;
          if (r._isNew) {
            await axios.post(`http://localhost:8000/api/reponses/`, {
              texte: r.texte,
              est_correcte: r.est_correcte,
              question: savedQuestion.id,
            });
          } else {
            await axios.patch(`http://localhost:8000/api/reponses/${r.id}/`, {
              texte: r.texte,
              est_correcte: r.est_correcte,
            });
          }
        }
      }

      message.success({ content: 'Quiz enregistré avec succès', key: 'saving', duration: 2 });
      navigate('/quizzes');
    } catch (error) {
      console.error(error);
      message.error({ content: 'Erreur lors de l’enregistrement', key: 'saving', duration: 2 });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !quiz) return <Spin size="large" style={{ marginTop: 100, textAlign: 'center' }} />;

  return (
    <Card title={`Édition du Quiz : ${quiz.titre}`} style={{ maxWidth: '100%', margin: '40px auto', padding: 24 }}>
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <Link to="/">Accueil</Link>
        </Breadcrumb.Item>

        <Breadcrumb.Item>
          <Link to="/quizzes">Quiz</Link>
        </Breadcrumb.Item>

        <Breadcrumb.Item>Modification</Breadcrumb.Item>
      </Breadcrumb>

      <Form form={form} layout="vertical" style={{ marginBottom: 30 }}>
        <Form.Item
          label="Titre du quiz"
          name="titre"
          rules={[
            { required: true, message: 'Le titre du quiz est obligatoire' },
            { min: 3, message: 'Le titre doit contenir au moins 3 caractères' },
          ]}
        >
          <Input size="large" placeholder="Titre du quiz" />
        </Form.Item>
        <Form.Item
          label="Ordre"
          name="ordre"
          rules={[
            { required: true, message: "L'ordre est obligatoire" },
            {
              validator: (_, value) =>
                value >= 1 ? Promise.resolve() : Promise.reject(new Error("L'ordre doit être supérieur ou égal à 1")),
            },
          ]}
        >
          <Input type="number" size="large" placeholder="Ordre d'affichage" />
        </Form.Item>
      </Form>

      <Divider />

      <Button
        type="dashed"
        onClick={ajouterQuestion}
        icon={<PlusOutlined />}
        block
        style={{ marginBottom: 24, fontWeight: 'bold', fontSize: 16 }}
      >
        Ajouter une question
      </Button>

      <Row gutter={[24, 24]}>
        {questions.filter(q => !q._deleted).map(q => (
          <Col key={q.id} xs={24} sm={24} md={12}>
            <Card
              size="small"
              type="inner"
              style={{
                borderRadius: 10,
                boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                backgroundColor: '#fafafa',
                marginBottom: 0,
              }}
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
                rows={3}
                value={q.texte}
                onChange={e => modifierTexteQuestion(q.id, e.target.value)}
                placeholder="Texte de la question"
                style={{
                  marginBottom: 20,
                  fontSize: 16,
                  borderRadius: 6,
                  backgroundColor: 'white',
                }}
              />

              <Button
                type="dashed"
                onClick={() => ajouterReponse(q.id)}
                icon={<PlusOutlined />}
                size="small"
                style={{ marginBottom: 16, fontWeight: 'bold' }}
              >
                Ajouter une réponse
              </Button>

              <List
                dataSource={q.reponses.filter(r => !r._deleted)}
                renderItem={r => (
                  <List.Item
                    key={r.id}
                    actions={[
                      <Popconfirm
                        title="Supprimer cette réponse ?"
                        onConfirm={() => supprimerReponse(q.id, r.id)}
                        okText="Oui"
                        cancelText="Non"
                        key="popconfirm"
                      >
                        <Button danger icon={<DeleteOutlined />} size="small" />
                      </Popconfirm>,
                    ]}
                    style={{ padding: '8px 12px', borderRadius: 6, backgroundColor: 'white', marginBottom: 8 }}
                  >
                    <Checkbox
                      checked={r.est_correcte}
                      onChange={() => toggleCorrecte(q.id, r.id)}
                      style={{ marginRight: 12 }}
                    />
                    <Input
                      value={r.texte}
                      onChange={e => modifierTexteReponse(q.id, r.id, e.target.value)}
                      placeholder="Texte réponse"
                      style={{ fontSize: 15, borderRadius: 6 }}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />

      <Row justify="space-between">
        <Col>
          <Button type="primary" onClick={saveAll} loading={loading} size="large">
            Enregistrer toutes les modifications
          </Button>
        </Col>
        <Col>
          <Button onClick={() => navigate('/quizzes')} disabled={loading} size="large">
            Annuler
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default QuizUpdate;
