import React, { useEffect, useState } from 'react';
import classes from '../../public/css/FileUpload.module.css';

const FileUpload = ({ onFileRead }) => {
  const [fileContent, setFileContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isempty, setIsempty] = useState(false);
  const [fileName, setFileName] = useState('No se ha seleccionado ningún archivo');

  useEffect(() => {
    if (fileContent === '') {
      setIsempty(true);
    } else {
      setIsempty(false);
    }
  }, [fileContent]);

  const handleFileUpload = (file) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setFileContent(content);
      onFileRead(content);
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div
      className={`${isDragging ? classes.principal : classes.principal2}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p className={classes.titulo_aviso}>Arrastra o selecciona un archivo .txt con tu gramatica aquí.</p>
      
   
      <label htmlFor="file-upload" className={classes.input_boton}>
            Selecciona un archivo
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".txt"
        onChange={handleFileSelect}
        className={classes.oculto} 
      />

     
      <span className={classes.seleccion_archivo}>Archivo: {fileName}</span>
      
      {isempty ? (
        <pre className={classes.content}>
          Selecciona un archivo de tipo txt
        </pre>
      ) : (
        <pre className={classes.content}>{fileContent}</pre>
      )}
    </div>
  );
};

export default FileUpload;
