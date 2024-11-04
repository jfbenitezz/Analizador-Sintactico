// SiguientesTable.js
import React from 'react';
import classes from '../../public/css/SiguientesTable.module.css';

const SiguientesTable = ({ siguientes }) => (
  <div className="h-full">
    
    <table className={classes.tabla}>
      <tbody>
        {Object.entries(siguientes).map(([key, values]) => (
          <tr key={key}>
            <td className={classes.no_terminales}>{key}</td>
            <td className={classes.terminales}>{values.join(', ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SiguientesTable;
