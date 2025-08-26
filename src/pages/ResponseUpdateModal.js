import { Modal, Form, Input, Radio, Button, message } from 'antd';
import { useEffect, useState } from 'react';
import api from '../api';

const ResponseUpdateModal = ({ visible, response, onClose, onUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (response) {
      form.setFieldsValue({
        texte: response.texte,
        est_correcte: response.est_correcte,
      });
    } else {
      form.resetFields();
    }
  }, [response, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.put(`/reponses/${response.id}/`, {
        texte: values.texte,
        est_correcte: values.est_correcte,
        question: response.question, // Toujours envoyer la FK question pour cohérence
      });
      message.success("Réponse mise à jour avec succès");
      onUpdate();
      onClose();
    } catch (error) {
      message.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Modifier la réponse"
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="texte"
          label="Texte de la réponse"
          rules={[{ required: true, message: 'Le texte est obligatoire' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="est_correcte" label="Est correcte ?" valuePropName="checked">
          <Radio.Group>
            <Radio value={true}>Oui</Radio>
            <Radio value={false}>Non</Radio>
          </Radio.Group>
        </Form.Item>

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

export default ResponseUpdateModal;
