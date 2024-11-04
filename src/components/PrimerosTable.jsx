// PrimerosTable.js
import React, { useEffect } from 'react';
import classes from '../../public/css/PrimerosTable.module.css';


const PrimerosTable = ({ primeros }) => (


  <div className="h-full">
    
    <table className={classes.tabla}>
      <tbody>
        {Object.entries(primeros).map(([key, values]) => (
          <tr key={key}>
            <td className={classes.no_terminales}>{key}</td>
            <td className={classes.terminales}>{values.join(', ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  
);

export default PrimerosTable;
