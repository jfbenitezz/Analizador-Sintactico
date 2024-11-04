import React from 'react';
import classes from '../../public/css/MTable.module.css';
const MTable = ({ mData, terminalOrder }) => {
  // Get the unique list of non-terminals (rows)
  const nonTerminals = Object.keys(mData);

  // Use the terminalOrder prop directly
  const terminals = terminalOrder.filter(term =>
    nonTerminals.some(nt => term in mData[nt])
  );
  
  // Show with the structure `${nonTerminal}->${mData[nonTerminal][terminal]}`
  // else show an empty string
  const showData = (nonTerminal, terminal) => {
    if (mData[nonTerminal][terminal]) {
      return `${nonTerminal}->${mData[nonTerminal][terminal]}`;
    } else {
      return '';
    }
  };

  return (
    <div className='overflow-x-auto'>
      <table className={classes.Mtable}>
        <thead>
          <tr>
            <th className={classes.no_terminales}></th>
            {terminals.map(terminal => (
              <th key={terminal} className={classes.terminales}>
                {terminal}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nonTerminals.map(nonTerminal => (
            <tr key={nonTerminal}>
              <td className={classes.no_terminales_row}>{nonTerminal}</td>
              {terminals.map(terminal => (
                <td
                  key={terminal}
                  className="p-2 border border-gray-300 text-center"
                >
                  {showData(nonTerminal, terminal)}
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
