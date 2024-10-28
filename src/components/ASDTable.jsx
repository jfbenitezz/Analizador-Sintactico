import React from 'react';
import PropTypes from 'prop-types';

const ASDTable = ({ parsingResults }) => {
  if (!parsingResults || parsingResults.length === 0) {
    return <p>No se encontraron resultados.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <h2 className="text-lg font-semibold mb-2">Resultados del Análisis Sintáctico</h2>
      <div className="h-64 overflow-y-auto border border-gray-300 rounded-md">
        <table className="min-w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="border-b border-gray-300 px-4 py-2">Pila</th>
              <th className="border-b border-gray-300 px-4 py-2">Entrada</th>
              <th className="border-b border-gray-300 px-4 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {parsingResults.map((result, index) => (
              <tr key={index}>
                <td className="border-b border-gray-200 px-4 py-2">{result[0] || '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2">{result[1] || '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2">{result[2] || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ASDTable.propTypes = {
  parsingResults: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.string)
  )
};

export default ASDTable;