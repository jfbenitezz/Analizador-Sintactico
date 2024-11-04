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
      className={`w-full p-4 rounded-md ${isDragging ? 'bg-gray-300' : 'bg-gray-100'}`}
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
        className="hidden" 
      />

     
      <span className="text-sm text-gray-500 mt-2 block">Archivo: {fileName}</span>
      
      {isempty ? (
        <pre className="bg-white p-2 h-40 overflow-y-auto rounded-md text-gray-500">
          Selecciona un archivo de tipo txt
        </pre>
      ) : (
        <pre className="bg-white p-2 h-40 overflow-y-auto rounded-md">{fileContent}</pre>
      )}
    </div>
  );
};

export default FileUpload;
