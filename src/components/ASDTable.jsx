import PropTypes from 'prop-types';
import classes from '../../public/css/ASDTable.module.css';

const ASDTable = ({ parsingResults }) => {
  if (!parsingResults || parsingResults.length === 0) {
    return <div className={classes.container_aviso}> <p className={classes.aviso}>

    ¡No se encontraron resultados!

    </p> </div>;
  }
  return (
    <div className="overflow-x-auto">
      <h2 className={classes.titulo}>Resultados del Análisis Sintáctico</h2>
      <div className={classes.contenedor_tabla}>
        <table className={classes.tabla}>
          <thead>
            <tr>
              <th className={classes.nombres}>Pila</th>
              <th  className={classes.nombres}>Entrada</th>
              <th className={classes.nombres}>Salida</th>
            </tr>
          </thead>
          <tbody>
            {parsingResults.map((result, index) => (
              <tr key={index}>
                <td className={classes.result}>{result[0] || '-'}</td>
                <td className={classes.result}>{result[1] || '-'}</td>
                <td className={classes.result}>{result[2] || '-'}</td>
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