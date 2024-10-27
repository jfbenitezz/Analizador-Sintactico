import React, { useState } from 'react';

const FileUpload = ({ onFileRead }) => {
  const [fileContent, setFileContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file) => {
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
      className={`w-full p-4 rounded-md ${isDragging ? 'bg-blue-200' : 'bg-gray-100'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input type="file" onChange={handleFileSelect} className="mb-2" />
      <p className="text-center text-gray-500">Drag and drop a file here</p>
      <pre className="bg-white p-2 h-40 overflow-y-auto rounded-md">{fileContent}</pre>
    </div>
  );
};

export default FileUpload;
