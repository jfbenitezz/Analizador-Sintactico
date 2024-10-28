const dividirProduccion = (produccion, terminales) => {
  // Create a regex pattern that matches all terminals, sorted by length to prioritize multi-character terminals
  const regexTerminales = terminales
    .sort((a, b) => b.length - a.length)
    .map(terminal => terminal.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')) // Escape special regex characters
    .join('|');
  
  // Use the regex to split the production into terminals, non-terminals, and other symbols
  const simbolos = produccion.match(new RegExp(`${regexTerminales}|[A-Za-z]'|[A-Za-z]|\\S`, 'g')) || [];
  return simbolos;
};

// ASDChecker.js
function ASD(mTable, entrada, simboloInicial, terminales) {
  const pila = ['$']; // Initialize the stack with end symbol
  pila.push(simboloInicial); // Add the start symbol to the stack

  // Tokenize the input and append end symbol `$`
  const entradaTokens = [...entrada, '$'];
  let puntero = 0; // Pointer for entradaTokens
  const resultados = [];

  while (pila.length > 0) {
    const estadoPila = pila.join(''); // Stack state
    const estadoEntrada = entradaTokens.slice(puntero).join(''); // Remaining input

    const X = pila.pop(); // Symbol on top of the stack
    const a = entradaTokens[puntero]; // Current input symbol

    if (X === '$' && a === '$') {
      resultados.push([estadoPila, estadoEntrada, "Aceptado"]);
      break;
    } else if (terminales.includes(X)) { // X is a terminal
      if (X === a) { // Match
        resultados.push([estadoPila, estadoEntrada, `Match: ${X}`]);
        puntero++; // Advance the input pointer
      } else { // Mismatch
        resultados.push([estadoPila, estadoEntrada, "Rechazado: Terminal mismatch"]);
        break;
      }
    } else if (mTable[X] && mTable[X][a]) { // X is a non-terminal, and there's a production
      const produccion = mTable[X][a];
      resultados.push([estadoPila, estadoEntrada, `${X} -> ${produccion}`]);

      if (produccion !== '&') { // If not epsilon, push symbols onto the stack
        const produccionSimbolos = dividirProduccion(produccion, terminales).reverse();
        for (const simbolo of produccionSimbolos) {
          pila.push(simbolo);
        }
      }
    } else { // No production found
      resultados.push([estadoPila, estadoEntrada, "Rechazado: No se encontro una producción"]);
      break;
    }
  }

  return resultados;
}

export default ASD;
