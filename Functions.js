const regexSimbolo = /[A-Z]'?|\(|\)|\+|\*|i|&/g;
function validarExp(exp, dic) {
    exp = exp.replace(/\s/g, "");  // Remove spaces
  
    if (exp.slice(1, 3) === "->" && exp.length > 3 && /^[A-Z]/.test(exp[0])) {
      const key = exp[0];
      const production = exp.slice(3);
  
      // If key exists, push the production; otherwise, initialize an array with production
      if (dic.hasOwnProperty(key)) {
        dic[key].push(production);
      } else {
        dic[key] = [production];
      }
    }
    return dic;
}

/*************************************************************/
function eliminarRecursividadPorIzquierda(gramatica) {
    const nuevaGramatica = {};
  
    for (const [noTerminal, producciones] of Object.entries(gramatica)) {
      const recursivas = [];
      const noRecursivas = [];
  
      // Separate recursive and non-recursive productions
      producciones.forEach(prod => {
        if (prod.startsWith(noTerminal)) {
          recursivas.push(prod.slice(noTerminal.length));  // α for A → Aα
        } else {
          noRecursivas.push(prod);  // β for A → β
        }
      });
  
      // If recursion exists, eliminate it
      if (recursivas.length > 0) {
        const nuevoNoTerminal = `${noTerminal}'`;
        nuevaGramatica[noTerminal] = noRecursivas.map(beta => beta + nuevoNoTerminal);
        nuevaGramatica[nuevoNoTerminal] = recursivas.map(alpha => alpha + nuevoNoTerminal).concat('&');
      } else {
        nuevaGramatica[noTerminal] = producciones;
      }
    }
  
    return nuevaGramatica;
}

/*************************************************************/
// Calculate the FIRST set
function calcularPrimero(gramatica, simbolo, primeros = {}) {
    if (primeros[simbolo]) return primeros[simbolo];
  
    primeros[simbolo] = [];
  
    if (!gramatica[simbolo]) {
      primeros[simbolo].push(simbolo);
      return primeros[simbolo];
    }
  
    for (const prod of gramatica[simbolo]) {
      if (prod === "&") {
        if (!primeros[simbolo].includes("&")) primeros[simbolo].push("&");
      } else {
        for (const char of prod) {
          const primeroChar = calcularPrimero(gramatica, char, primeros);
          primeroChar.forEach(sym => {
            if (!primeros[simbolo].includes(sym) && sym !== "&") primeros[simbolo].push(sym);
          });
          if (!primeroChar.includes("&")) break;
          if (char === prod[prod.length - 1] && !primeros[simbolo].includes("&")) {
            primeros[simbolo].push("&");
          }
        }
      }
    }
    return primeros[simbolo];
  }
  
  // Calculate the FOLLOW set
  function calcularSiguiente(gramatica, simboloInicial) {
    const siguientes = Object.keys(gramatica).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
    if (!siguientes[simboloInicial].includes("$")) siguientes[simboloInicial].push("$");
  
    let cambios = true;
    while (cambios) {
      cambios = false;
      for (const [noTerminal, producciones] of Object.entries(gramatica)) {
        for (const produccion of producciones) {
          const produccionSimbolos = produccion.match(regexSimbolo) || [];
          for (let i = 0; i < produccionSimbolos.length; i++) {
            const simbolo = produccionSimbolos[i];
            if (gramatica[simbolo]) {
              const siguienteTemporal = [];
  
              if (i + 1 < produccionSimbolos.length) {
                const siguientePrimero = calcularPrimero(gramatica, produccionSimbolos[i + 1], {});
                siguientePrimero.forEach(sym => {
                  if (sym !== "&" && !siguienteTemporal.includes(sym)) siguienteTemporal.push(sym);
                });
              }
  
              if (i + 1 === produccionSimbolos.length || calcularPrimero(gramatica, produccionSimbolos[i + 1], {}).includes("&")) {
                siguientes[noTerminal].forEach(sym => {
                  if (!siguienteTemporal.includes(sym)) siguienteTemporal.push(sym);
                });
              }
  
              siguienteTemporal.forEach(sym => {
                if (!siguientes[simbolo].includes(sym)) {
                  siguientes[simbolo].push(sym);
                  cambios = true;
                }
              });
            }
          }
        }
      }
    }
    return siguientes;
  }

 /*************************************************************/

// Helper function to calculate `PRIMERO` for a specific production
function calcularPrimeroProduccion(gramatica, produccion, primeros) {
  const conjuntoPrimero = new Set();

  // Ensure `produccion` is treated as an array
  const produccionArray = Array.isArray(produccion) ? produccion : [...produccion];

  for (const simbolo of produccionArray) {
    // Check if the symbol is a terminal (not found in `primeros`)
    if (!primeros.hasOwnProperty(simbolo)) {
      conjuntoPrimero.add(simbolo);
      break;  // Stop if it's a terminal
    }

    // Get PRIMERO(simbolo) and ensure it’s a Set
    const simboloPrimero = primeros[simbolo] instanceof Set ? primeros[simbolo] : new Set(primeros[simbolo]);

    // Add all items from `simboloPrimero` to `conjuntoPrimero`, excluding epsilon (`&`)
    for (const item of simboloPrimero) {
      if (item !== '&') conjuntoPrimero.add(item);
    }

    // Stop if `simboloPrimero` does not contain epsilon (`&`)
    if (!simboloPrimero.has('&')) break;
  }

  // If all symbols in `produccionArray` can lead to epsilon, add epsilon (`&`) to `conjuntoPrimero`
  const allLeadToEpsilon = produccionArray.every((simbolo) => 
    primeros[simbolo] && primeros[simbolo] instanceof Set && primeros[simbolo].has('&')
  );
  if (allLeadToEpsilon) conjuntoPrimero.add('&');

  return conjuntoPrimero;
}


// Function to build the parsing table `M`
function construirTablaM(gramatica, primero, siguiente) {
  const tablaM = {};

  for (const noTerminal in gramatica) {
    // Initialize `tablaM` entry for each non-terminal
    tablaM[noTerminal] = {};

    // Process each production for the non-terminal
    gramatica[noTerminal].forEach((produccion) => {
      // Calculate `PRIMERO` for the production
      const conjuntoPrimero = calcularPrimeroProduccion(gramatica, produccion, primero);

      // Add production to `M[noTerminal, terminal]` for each terminal in `PRIMERO`
      conjuntoPrimero.forEach((terminal) => {
        if (terminal !== '&') {  // Ignore epsilon
          // Only add if the entry does not already exist
          if (!tablaM[noTerminal][terminal]) {
            tablaM[noTerminal][terminal] = produccion;
          } else {
            console.log(`Conflicto en M[${noTerminal}, ${terminal}]`);
          }
        }
      });

      // If epsilon (`&`) is in `PRIMERO`, use `SIGUIENTE` to add the production
      if (conjuntoPrimero.has('&')) {
        siguiente[noTerminal].forEach((terminal) => {
          if (!tablaM[noTerminal][terminal]) {
            tablaM[noTerminal][terminal] = produccion;
          } else {
            console.log(`Conflicto en M[${noTerminal}, ${terminal}]`);
          }
        });
      }
    });
  }

  return tablaM;
}



 /*************************************************************/
 const fs = require('fs');

function leerArchivoM(filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  const lines = data.split('\n');
  let dic = {};

  lines.forEach((line) => {
    line = line.trim();
    dic = validarExp(line, dic);  // Assuming `validarExp` is defined elsewhere
  });

  const gramatica = eliminarRecursividadPorIzquierda(dic);  // Assuming this function is defined
  console.log(gramatica);

  // Display modified grammar
  for (const [noTerminal, producciones] of Object.entries(gramatica)) {
    console.log(`${noTerminal} → ${producciones.join(' | ')}`);
  }

  // Calculate FIRST and FOLLOW sets
  const primero = {};
  for (const nt in gramatica) {
    primero[nt] = calcularPrimero(gramatica, nt, {});  // Assuming `calcularPrimero` is defined
  }
  console.log(gramatica);

  const siguiente = calcularSiguiente(gramatica, Object.keys(gramatica)[0]);  // Assuming `calcularSiguiente` is defined
  console.log();

  // Display results
  for (const nt in primero) {
    console.log(`PRIMERO(${nt}) = ${primero[nt]}`);
  }
  console.log();
  for (const nt in siguiente) {
    console.log(`SIGUIENTE(${nt}) = ${siguiente[nt]}`);
  }

  // Construct and display M table
  const tablaM = construirTablaM(gramatica, primero, siguiente);
  for (const [noTerminal, terminalMap] of Object.entries(tablaM)) {
    for (const [terminal, produccion] of Object.entries(terminalMap)) {
      console.log(`M[${noTerminal}, ${terminal}] = ${produccion}`);
    }
  }
}

// Example usage
const archivo = './archivo.txt';
leerArchivoM(archivo);




  


