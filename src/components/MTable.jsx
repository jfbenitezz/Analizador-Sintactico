import React from 'react';

const MTable = ({ mData, terminalOrder }) => {
  // Get the unique list of non-terminals (rows)
  const nonTerminals = Object.keys(mData);

  // Use the terminalOrder prop directly
  const terminals = terminalOrder.filter(term =>
    nonTerminals.some(nt => term in mData[nt])
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="p-2 border border-gray-300 bg-blue-200">No Term</th>
            {terminals.map(terminal => (
              <th key={terminal} className="p-2 border border-gray-300 bg-blue-200">
                {terminal}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nonTerminals.map(nonTerminal => (
            <tr key={nonTerminal}>
              <td className="p-2 w-20 pl-9 border border-gray-300 bg-blue-100">{nonTerminal}</td>
              {terminals.map(terminal => (
                <td
                  key={terminal}
                  className="p-2 border border-gray-300 text-center"
                >
                  {mData[nonTerminal][terminal] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MTable;
