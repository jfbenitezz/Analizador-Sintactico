// SiguientesTable.js
import React from 'react';

const SiguientesTable = ({ siguientes }) => (
  <div className="h-full">
    <h2 className="text-lg font-semibold mb-2">Siguientes</h2>
    <table className="w-full table-auto">
      <tbody>
        {Object.entries(siguientes).map(([key, values]) => (
          <tr key={key}>
            <td className="border px-4 py-2 font-medium">{key}</td>
            <td className="border px-4 py-2">{values.join(', ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SiguientesTable;
