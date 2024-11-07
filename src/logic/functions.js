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
    else {
      console.log(`Error: ${exp} is not a valid production`)
     return false 
    }
    return dic;
}

function RemoveUsedLetters(gramatica) {
  let letrasDisponibles = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
  for (const [noTerminal, producciones] of Object.entries(gramatica)) {
    letrasDisponibles.delete(noTerminal);  // Remove Keys from available letters
    producciones.forEach(prod => {
        // Remove any uppercase letter in productions from available letters
        for (const char of prod) {
            console.log("letra", char);
            if (/[A-Z]/.test(char)) {
                letrasDisponibles.delete(char);
            }
        }
    });
  }
  return letrasDisponibles;
}
/*************************************************************/
function eliminarRecursividadPorIzquierda(gramatica) {
    const nuevaGramatica = {};
    const letrasDisponibles = RemoveUsedLetters(gramatica);

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
            // Select a letter from available ones for the new non-terminal
            const nuevoNoTerminal = letrasDisponibles.values().next().value;
            letrasDisponibles.delete(nuevoNoTerminal);  // Remove it from available letters

            nuevaGramatica[noTerminal] = noRecursivas.map(beta => beta + nuevoNoTerminal);
            nuevaGramatica[nuevoNoTerminal] = recursivas.map(alpha => alpha + nuevoNoTerminal).concat('&');
        } else {
            nuevaGramatica[noTerminal] = producciones;
        }
    }

    return nuevaGramatica;
}


/*************************************************************/
// Left Factorize the grammar
function obtenerPrefijoComun(producciones) {
  if (!producciones || producciones.length <= 1) return "";

  let prefijoComun = producciones[0];
  for (let produccion of producciones.slice(1)) {
      let i = 0;
      while (i < prefijoComun.length && i < produccion.length && prefijoComun[i] === produccion[i]) {
          i++;
      }
      prefijoComun = prefijoComun.slice(0, i);
      if (!prefijoComun) break;
  }

  return prefijoComun;
}

function factorizarPorIzquierda(gramatica) {
  const nuevaGramatica = {};
  const letrasDisponibles = Array.from( RemoveUsedLetters(gramatica))
  const ordenNoTerminales = [...Object.keys(gramatica)]; // Copy the initial order

  for (let i = 0; i < ordenNoTerminales.length; i++) {
      const noTerminal = ordenNoTerminales[i];
      const producciones = gramatica[noTerminal];
      if (!producciones) continue; // Skip if producciones is undefined

      let prefijos = {};

      // Group productions by their initial symbol
      for (let produccion of producciones) {
          let prefijo = produccion[0] || "";
          if (prefijos[prefijo]) {
              prefijos[prefijo].push(produccion);
          } else {
              prefijos[prefijo] = [produccion];
          }
      }

      let nuevaProducciones = [];

      // Analyze each prefix group
      for (let prefijo in prefijos) {
          let grupo = prefijos[prefijo];
          if (grupo.length > 1) { // Factor out if there's more than one production with the same prefix
              let prefijoComun = obtenerPrefijoComun(grupo);
              let nuevoNoTerminal = letrasDisponibles.shift();
              
              if (!nuevoNoTerminal) {
                  throw new Error("Ran out of non-terminal letters to use.");
              }

              nuevaGramatica[nuevoNoTerminal] = grupo.map(prod => prod.slice(prefijoComun.length) || '&');
              nuevaProducciones.push(prefijoComun + nuevoNoTerminal);
              
              // Insert new non-terminal directly after the current one in order
              ordenNoTerminales.splice(i + 1, 0, nuevoNoTerminal);
              i++; // Adjust the index to account for the inserted non-terminal
          } else {
              nuevaProducciones.push(grupo[0]);
          }
      }

      nuevaGramatica[noTerminal] = nuevaProducciones;
  }

  // Rebuild grammar in intended order
  let nuevaGramaticaOrdenada = {};
  for (let nt of ordenNoTerminales) {
      if (nuevaGramatica[nt]) {
          nuevaGramaticaOrdenada[nt] = nuevaGramatica[nt];
      }
  }

  return nuevaGramaticaOrdenada;
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
function calcularSiguiente(gramatica, simboloInicial, terminales) {
  const siguientes = Object.keys(gramatica).reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {});
  siguientes[simboloInicial].push("$");

  let cambios = true;
  while (cambios) {
    cambios = false;
    for (const [noTerminal, producciones] of Object.entries(gramatica)) {
      for (const produccion of producciones) {
        const produccionSimbolos = [];
        // Manual symbol extraction based on terminals provided
        for (let i = 0; i < produccion.length; i++) {
          const simbolo = produccion[i];
          if (simbolo.toUpperCase() === simbolo) {  // Uppercase symbols are non-terminals
            produccionSimbolos.push(simbolo);
          } else if (terminales.includes(simbolo)) { // Check against terminal list
            produccionSimbolos.push(simbolo);
          }
        }

        // Calculate FOLLOW set for each non-terminal in the production
        for (let i = 0; i < produccionSimbolos.length; i++) {
          const simbolo = produccionSimbolos[i];
          if (gramatica[simbolo]) { // Only process if it's a non-terminal
            const siguienteTemporal = [];

            // If there is a next symbol, add its FIRST set to FOLLOW
            if (i + 1 < produccionSimbolos.length) {
              const siguienteSimbolo = produccionSimbolos[i + 1];
              const primeroSiguiente = calcularPrimero(gramatica, siguienteSimbolo, {});
              primeroSiguiente.forEach(sym => {
                if (sym !== "&" && !siguienteTemporal.includes(sym)) siguienteTemporal.push(sym);
              });
            }

            // If it's the last symbol or the next symbol's FIRST contains epsilon
            if (i + 1 === produccionSimbolos.length || calcularPrimero(gramatica, produccionSimbolos[i + 1], {}).includes("&")) {
              siguientes[noTerminal].forEach(sym => {
                if (!siguienteTemporal.includes(sym)) siguienteTemporal.push(sym);
              });
            }

            // Update FOLLOW set if there are new elements
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

function construirTablaM(gramatica, primero, siguiente, terminales) {
  const tablaM = {};
  const errores = [];

  // Initialize `tablaM` with all terminals and end symbol `$`
  console.log("Initializing tablaM...");
  for (const noTerminal in gramatica) {
    tablaM[noTerminal] = {};
    terminales.forEach((terminal) => {
      tablaM[noTerminal][terminal] = ''; // Initialize each terminal as an empty string
      console.log(`tablaM[${noTerminal}][${terminal}] initialized to ''`);
    });
    tablaM[noTerminal]['$'] = ''; // End-of-input symbol
    console.log(`tablaM[${noTerminal}]['$'] initialized to ''`);
  }

  // Process each production for the non-terminal
  for (const noTerminal in gramatica) {
    console.log(`Processing non-terminal: ${noTerminal}`);
    gramatica[noTerminal].forEach((produccion) => {
      console.log(`  Evaluating production: ${produccion}`);
      
      // Calculate `PRIMERO` for the production
      const conjuntoPrimero = calcularPrimeroProduccion(gramatica, produccion, primero);
      console.log(`  Calculated PRIMERO for ${produccion}:`, conjuntoPrimero);

      // Add production to `M[noTerminal, terminal]` for each terminal in `PRIMERO`
      conjuntoPrimero.forEach((terminal) => {
        if (terminal !== '&') { // Ignore epsilon
          console.log(`    Processing terminal: ${terminal}`);
          if (tablaM[noTerminal][terminal] === '') {
            tablaM[noTerminal][terminal] = produccion;
            console.log(`    Added production ${produccion} to tablaM[${noTerminal}][${terminal}]`);
          } else {
            console.error(`    Conflicto en M[${noTerminal}, ${terminal}] - ya existe ${tablaM[noTerminal][terminal]}`);

            errores.push(`Conflicto en M[${noTerminal}, ${terminal}] - ya existe ${tablaM[noTerminal][terminal]}`);
          

            // Conflict handling logic here
            
           
          }
        }
      });

      // If epsilon (`&`) is in `PRIMERO`, use `SIGUIENTE` to add the empty production
      if (conjuntoPrimero.has('&')) {
        console.log(`    Epsilon detected in PRIMERO for ${produccion}, checking SIGUIENTE...`);
        siguiente[noTerminal].forEach((terminal) => {
          if (tablaM[noTerminal][terminal] === '') {
            tablaM[noTerminal][terminal] = '&'; // Explicit empty production for epsilon
            console.log(`    Added epsilon production to tablaM[${noTerminal}][${terminal}]`);
          } else {
            console.error(`    Conflicto en M[${noTerminal}, ${terminal}] - ya existe ${tablaM[noTerminal][terminal]}`);
            //vaciar todo tablaM y retornar
            errores.push(`Conflicto en M[${noTerminal}, ${terminal}] - ya existe ${tablaM[noTerminal][terminal]}`);
           
             

            
          }
        });
      }
    });
  }

  console.log("Final tablaM:", JSON.stringify(tablaM, null, 2));
  console.log(tablaM);
  if (errores.length > 0) {
    return {}
  }else{
    return tablaM;
  }

}

 /*************************************************************/
//Se que lo podria agrupar en diferentes archivos por grupos pero pa q
export { validarExp, eliminarRecursividadPorIzquierda, calcularPrimero, calcularSiguiente, calcularPrimeroProduccion, construirTablaM, factorizarPorIzquierda };



  


