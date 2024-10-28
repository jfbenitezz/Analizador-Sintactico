import React from 'react';

const ASDTable = ({ parsingResults }) => {
  if (!parsingResults || parsingResults.length === 0) {
    return <p>No parsing results available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="text-lg font-semibold mb-2">Resultados del Análisis Sintáctico</h2>
      <table border="1" cellPadding="5" cellSpacing="0" className="min-w-full text-center">
        <thead>
          <tr>
            <th>Pila</th>
            <th>Entrada</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {parsingResults.map((result, index) => (
            <tr key={index}>
              <td>{result[0]}</td>
              <td>{result[1]}</td>
              <td>{result[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ASDTable;
