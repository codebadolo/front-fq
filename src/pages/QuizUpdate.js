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
    Spin,
    Typography,
    message,
} from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Paragraph } = Typography;

function generateTempId() {
  return Math.random().toString(36).substr(2, 9);
}

const QuizUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Structure locale complète modifiable :
  // questions: [{ id, texte, _isNew, _deleted, reponses: [{ id, texte, est_correcte, _isNew, _deleted }] }]
  const [questions, setQuestions] = useState([]);

  // Titre et ordre du quiz dans un formulaire AntD indépendant
  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8000/api/quizzes/${id}/`)
      .then(res => {
        setQuiz(res.data);
        form.setFieldsValue({ titre: res.data.titre, ordre: res.data.ordre });
        // copier les questions avec marquage no suppression ni new pour gestion locale
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

  // ---- Questions management ----

  const ajouterQuestion = () => {
    const newQuestion = {
      id: generateTempId(),
      texte: '',
      _isNew: true,
      _deleted: false,
      reponses: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const supprimerQuestion = (qId) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, _deleted: true } : q));
  };

  const modifierTexteQuestion = (qId, texte) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, texte } : q));
  };

  // ---- Réponses management ----

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
        reponses: q.reponses.map(r => r.id === rId ? {...r, _deleted: true} : r)
      } : q
    ));
  };

  const modifierTexteReponse = (qId, rId, texte) => {
    setQuestions(questions.map(q => 
      q.id === qId ? {
        ...q,
        reponses: q.reponses.map(r => r.id === rId ? {...r, texte} : r)
      } : q
    ));
  };

  const toggleCorrecte = (qId, rId) => {
    // On autorise une ou plusieurs réponses correctes — modif checkbox
    setQuestions(questions.map(q =>
      q.id === qId ? {
        ...q,
        reponses: q.reponses.map(r => 
          r.id === rId ? {...r, est_correcte: !r.est_correcte} : r
        )
      } : q
    ));
  };

  // ---- Sauvegarde globale ----

  const saveAll = async () => {
    setLoading(true);
    message.loading({ content: 'Enregistrement...', key: 'saving' });
    try {
      // 1. Modifier quiz titre et ordre
      await axios.patch(`http://localhost:8000/api/quizzes/${quiz.id}/`, {
        titre: form.getFieldValue('titre'),
        ordre: form.getFieldValue('ordre'),
      });

      // 2. Supprimer les questions marquées supprimées côté serveur
      await Promise.all(
        questions.filter(q => q._deleted && !q._isNew).map(q =>
          axios.delete(`http://localhost:8000/api/questions/${q.id}/`)
        )
      );

      // 3. Traiter ajout/modification/suppression des questions et réponses
      for (const q of questions) {
        if (q._deleted) continue; // déjà supprimé ou à ignorer

        let savedQuestion = q;
        if (q._isNew) {
          // Création question liée au quiz
          const resQ = await axios.post(`http://localhost:8000/api/questions/`, {
            texte: q.texte,
            quiz: quiz.id,
          });
          savedQuestion = { ...q, id: resQ.data.id, _isNew: false };
        } else {
          // Mise à jour texte question
          await axios.patch(`http://localhost:8000/api/questions/${q.id}/`, {
            texte: q.texte,
          });
        }

        // Réponses associées à chaque question
        // Suppression des réponses marquées supprimées
        await Promise.all(
          q.reponses.filter(r => r._deleted && !r._isNew).map(r =>
            axios.delete(`http://localhost:8000/api/reponses/${r.id}/`)
          )
        );

        for (const r of q.reponses) {
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

  if (loading || !quiz) return <Spin size="large" style={{ marginTop: 100 }} />;

  return (
    <Card title={`Édition du Quiz : ${quiz.titre}`} style={{ maxWidth: 900, margin: 'auto' }}>
      <Form form={form} layout="vertical" style={{ marginBottom: 20 }}>
        <Form.Item label="Titre du quiz" name="titre" rules={[{ required: true, message: 'Entrez un titre' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Ordre" name="ordre" rules={[{ required: true, message: 'Entrez un ordre' }]}>
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
              value={q.texte}
              onChange={e => modifierTexteQuestion(q.id, e.target.value)}
              placeholder="Texte de la question"
              style={{ marginBottom: 12 }}
            />

            <Button
              type="dashed"
              onClick={() => ajouterReponse(q.id)}
              icon={<PlusOutlined />}
              size="small"
              style={{ marginBottom: 8 }}
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
                    >
                      <Button danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>,
                  ]}
                >
                  <Checkbox
                    checked={r.est_correcte}
                    onChange={() => toggleCorrecte(q.id, r.id)}
                    style={{ marginRight: 10 }}
                  />
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
          Enregistrer toutes les modifications
        </Button>
        <Button onClick={() => navigate('/quizzes')} disabled={loading}>
          Annuler
        </Button>
      </Space>
    </Card>
  );
};

export default QuizUpdate;
