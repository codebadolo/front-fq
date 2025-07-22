import { Button, Card, Checkbox, List, message, Spin, Typography } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

const QuizDetail = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({}); // {questionId: [idRéponses cochées]}

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8000/api/quizzes/${id}/`)
      .then(res => {
        setQuiz(res.data);
        // Initialiser l’état des réponses cochées selon ce qui est correct
        const initial = {};
        res.data.questions.forEach(q => {
          initial[q.id] = q.reponses.filter(r => r.est_correcte).map(r => r.id);
        });
        setAnswers(initial);
      })
      .catch(() => message.error('Erreur chargement quiz'))
      .finally(() => setLoading(false));
  }, [id]);

  const onChange = (questionId, checkedValues) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: checkedValues
    }));
  };

  const saveAnswers = () => {
    setLoading(true);
    // Pour chaque réponse, envoyer un patch sur backend pour mettre à jour est_correcte
    const patches = [];
    quiz.questions.forEach(q => {
      q.reponses.forEach(r => {
        const isCorrect = answers[q.id]?.includes(r.id) || false;
        if (r.est_correcte !== isCorrect) {
          patches.push(
            axios.patch(`http://localhost:8000/api/reponses/${r.id}/`, { est_correcte: isCorrect })
          );
        }
      });
    });

    Promise.all(patches)
      .then(() => message.success('Réponses sauvegardées'))
      .catch(() => message.error('Erreur de sauvegarde'))
      .finally(() => setLoading(false));
  };

  if (loading || !quiz) return <Spin size="large" />;

  return (
    <Card style={{ maxWidth: 800, margin: 'auto' }}>
      <Title level={3}>{quiz.titre}</Title>
      <List
        itemLayout="vertical"
        dataSource={quiz.questions}
        renderItem={question => (
          <List.Item key={question.id}>
            <Title level={5}>{question.texte}</Title>
            <Checkbox.Group
              value={answers[question.id]}
              onChange={(checkedValues) => onChange(question.id, checkedValues)}
            >
              <List
                dataSource={question.reponses}
                renderItem={rep => (
                  <List.Item key={rep.id}>
                    <Checkbox value={rep.id}>{rep.texte}</Checkbox>
                  </List.Item>
                )}
              />
            </Checkbox.Group>
          </List.Item>
        )}
      />
      <Button type="primary" onClick={saveAnswers} disabled={loading} style={{ marginTop: 20 }}>
        Enregistrer les réponses correctes
      </Button>
    </Card>
  );
};

export default QuizDetail;
