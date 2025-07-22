// src/pages/DocumentUpload.js
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Typography, Upload } from 'antd';
import { useState } from 'react';
import { uploadDocument } from '../api';

const { Title } = Typography;

const DocumentUpload = () => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const props = {
    beforeUpload: file => {
      setFileList([file]);
      return false; // empêche upload automatique
    },
    fileList,
    onRemove: () => setFileList([]),
  };

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.error('Veuillez sélectionner un fichier.');
      return;
    }
    const formData = new FormData();
    formData.append('fichier', fileList[0]);
    setLoading(true);
    uploadDocument(formData)
      .then(() => {
        message.success('Document importé avec succès');
        setFileList([]);
      })
      .catch(() => message.error('Erreur lors de l’import'))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Title level={2}>Importer un document PDF</Title>
      <Upload {...props} accept=".pdf" maxCount={1}>
        <Button icon={<UploadOutlined />}>Sélectionner un PDF</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0 || loading}
        loading={loading}
        style={{ marginTop: 16 }}
      >
        Importer
      </Button>
    </>
  );
};

export default DocumentUpload;
