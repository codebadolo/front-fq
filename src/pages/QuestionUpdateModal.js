import { Modal, Form, Input, Button, Radio, Space, message } from 'antd';
import { useState, useEffect } from 'react';
import api from '../api';

const QuestionUpdateModal = ({ visible, question, onClose, onUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (question) {
      form.setFieldsValue({
        texte: question.texte,
        reponses: question.reponses.map(r => ({
          id: r.id,
          texte: r.texte,
          est_correcte: r.est_correcte,
        })),
      });
    } else {
      form.resetFields();
    }
  }, [question, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.put(`/questions/${question.id}/`, {
        texte: values.texte,
        reponses: values.reponses,
      });
      message.success('Question mise à jour avec succès');
      onUpdate();
      onClose();
    } catch (err) {
      message.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Modifier la question"
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ reponses: [] }}>
        <Form.Item
          name="texte"
          label="Texte de la question"
          rules={[{ required: true, message: 'Le texte de la question est requis' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.List name="reponses">
          {(fields, { add, remove }) => (
            <>
              <label>Réponses</label>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} align="start" style={{ display: 'flex', marginBottom: 8 }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'texte']}
                    rules={[{ required: true, message: 'Le texte est requis' }]}
                  >
                    <Input placeholder="Texte de la réponse" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'est_correcte']}
                    valuePropName="checked"
                  >
                    <Radio />
                  </Form.Item>
                  <Button danger onClick={() => remove(name)}>
                    Supprimer
                  </Button>
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block>
                  Ajouter une réponse
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Enregistrer
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={onClose}>
            Annuler
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuestionUpdateModal;
