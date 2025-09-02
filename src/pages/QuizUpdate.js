import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Space,
  message,
  Typography,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../api';

import QuestionUpdateModal from './QuestionUpdateModal';
import ResponseUpdateModal from './ResponseUpdateModal';

const { Title } = Typography;

const QuizUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State for modals
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [responseToEdit, setResponseToEdit] = useState(null);

  // Load quiz data
  useEffect(() => {
    setLoading(true);
    api.get(`/quizzes/${id}/`)
      .then(res => {
        const quiz = res.data;
        form.setFieldsValue({
          titre: quiz.titre,
          ordre: quiz.ordre,
          questions: quiz.questions.map(q => ({
            id: q.id,
            texte: q.texte,
            reponses: q.reponses.map(r => ({
              id: r.id,
              texte: r.texte,
              est_correcte: r.est_correcte,
            })),
          })),
        });
      })
      .catch(() => {
        message.error("Erreur lors du chargement du quiz");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, form]);

  // Submit updated quiz
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await api.put(`/quizzes/${id}/`, values);
      message.success("Quiz mis à jour avec succès");
      navigate(`/quizzes/${id}`);
    } catch (error) {
      message.error("Erreur lors de la mise à jour du quiz");
    } finally {
      setSubmitting(false);
    }
  };

  // Modal open/close handlers
  const openQuestionModal = (question) => {
    setQuestionToEdit(question);
    setQuestionModalVisible(true);
  };
  const closeQuestionModal = () => {
    setQuestionModalVisible(false);
    setQuestionToEdit(null);
  };
  const openResponseModal = (response) => {
    setResponseToEdit(response);
    setResponseModalVisible(true);
  };
  const closeResponseModal = () => {
    setResponseModalVisible(false);
    setResponseToEdit(null);
  };

  // Render each question card with a button to open question modal
  const renderQuestion = (field, index) => (
    <Card
      key={field.key}
      type="inner"
      title={`Question ${index + 1}`}
      style={{ marginBottom: 24 }}
      extra={<Button size="small" onClick={() => openQuestionModal(form.getFieldValue(['questions', index]))}>Modifier Question</Button>}
    >
      <Form.Item
        {...field}
        label="Texte de la question"
        name={[field.name, 'texte']}
        fieldKey={[field.fieldKey, 'texte']}
        rules={[{ required: true, message: "Veuillez saisir le texte de la question" }]}
      >
        <Input />
      </Form.Item>

      <Form.List name={[field.name, "reponses"]}>
        {(answerFields, { add: addAnswer, remove: removeAnswer }) => (
          <>
            {answerFields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }}
                align="center"
                size="middle"
                direction="horizontal"
              >
                <Form.Item
                  {...restField}
                  name={[name, "texte"]}
                  fieldKey={[restField.fieldKey, 'texte']}
                  rules={[{ required: true, message: "Veuillez saisir la réponse" }]}
                  style={{ marginBottom: 0, minWidth: 200 }}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, "est_correcte"]}
                  valuePropName="checked"
                  fieldKey={[restField.fieldKey, 'est_correcte']}
                  style={{ marginBottom: 0, width: 100 }}
                >
                  <Input type="checkbox" aria-label="Réponse correcte" />
                </Form.Item>

                <Button size="small" onClick={() => openResponseModal(form.getFieldValue(['questions', index, 'reponses', name]))}>
                  Modifier Réponse
                </Button>

                <MinusCircleOutlined
                  onClick={() => removeAnswer(name)}
                  style={{ color: 'red', fontSize: 20 }}
                />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => addAnswer()}
                block
                icon={<PlusOutlined />}
              >
                Ajouter une réponse
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Card>
  );

  return (
    <>
      <Card title={<Title level={2}>Modifier le quiz</Title>}>
        <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading} autoComplete="off">
          <Form.Item
            label="Titre"
            name="titre"
            rules={[{ required: true, message: "Veuillez saisir le titre du quiz" }]}
          >
            <Input placeholder="Titre du quiz" />
          </Form.Item>

          <Form.Item
            label="Ordre"
            name="ordre"
            rules={[{ type: 'number', min: 1, message: "L'ordre doit être supérieur ou égal à 1" }]}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => renderQuestion(field, index))}

                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Ajouter une question
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Enregistrer
              </Button>
              <Button onClick={() => navigate(`/quizzes/${id}`)}>
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Modals separately rendered */}
      <QuestionUpdateModal
        visible={questionModalVisible}
        question={questionToEdit}
        onClose={closeQuestionModal}
        onUpdate={() => { closeQuestionModal(); form.submit(); }}
      />
      <ResponseUpdateModal
        visible={responseModalVisible}
        response={responseToEdit}
        onClose={closeResponseModal}
        onUpdate={() => { closeResponseModal(); form.submit(); }}
      />
    </>
  );
};

export default QuizUpdate;
