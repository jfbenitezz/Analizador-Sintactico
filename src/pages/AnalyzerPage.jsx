import React, { useState, useEffect } from 'react';
import FileUpload from '../components/fileUpload';
import PrimerosTable from '../components/PrimerosTable';
import SiguientesTable from '../components/SiguientesTable';
import MTable from '../components/MTable';
import ASDTable from '../components/ASDTable';
import { validarExp, eliminarRecursividadPorIzquierda, calcularPrimero, calcularSiguiente, construirTablaM, factorizarPorIzquierda } from '../logic/functions'; 
import classes from '../../public/css/AnalyzerPage.module.css';
import ASD from '../logic/ASD';

const AnalyzerPage = () => {
  const [fileContent, setFileContent] = useState('');
  const [grammarWithoutRecursion, setGrammarWithoutRecursion] = useState('');
  const [formattedGrammar, setFormattedGrammar] = useState(''); // Formatted grammar for display
  const [primeros, setPrimeros] = useState({});
  const [siguientes, setSiguientes] = useState({});
  const [mTable, setMTable] = useState({});
  const [terminalOrder, setTerminalOrder] = useState([]);  // Terminal order based on grammar appearance
  const [inputString, setInputString] = useState(''); // Entry string for ASD analysis
  const [parsingResults, setParsingResults] = useState([]);
  const [nonProductiveError, setNonProductiveError] = useState(false);
  const [aviso, setAviso] = useState(false);

  useEffect(() => {
     //Verificar si hay un archivo cargado
    if (fileContent) {
      setAviso(false);
    }else{
      setAviso(true);
    }
  }, [fileContent]);


  const formatGrammar = (grammar) => {
    return Object.entries(grammar)
      .map(([nonTerminal, productions]) => `${nonTerminal} -> ${productions.join(' | ')}`)
      .join('\n');
  };

  // Function to parse file content and update state
  const handleFileRead = (content) => {
    setFileContent(content);

    // 1. Parse each line and build the grammar dictionary
    const lines = content.split('\n');
    let dic = {};
    lines.forEach((line) => {
      dic = validarExp(line.trim(), dic);
    });

    // 2. Eliminate left recursion
    const gramatica_no_rec = eliminarRecursividadPorIzquierda(dic);

    // 3. Factorize the grammar
    const gramatica = factorizarPorIzquierda(gramatica_no_rec);

    // 4. Format the grammar for display purposes
    setFormattedGrammar(formatGrammar(gramatica));
    setGrammarWithoutRecursion(JSON.stringify(gramatica, null, 2)); // For display purposes only

    // 5. Identify non-terminals and terminals
    const nonTerminals = new Set();
    const terminals = new Set();
    const check = new Set(); // Check one by one for non-terminals in productions
    check.add(Object.keys(gramatica)[0]); //Always add the initial symbol since it might not be in the productions
    const regex = /[^A-Z&]/g;
    const regex2 = /[A-Z]/g;

    // Mostrar la gramática modificada
    for (const [no_terminal, producciones] of Object.entries(gramatica)) {
        nonTerminals.add(no_terminal);
        for (const produccion of producciones) {
            const terminalMatches = produccion.match(regex);
            if (terminalMatches) {
                terminalMatches.forEach(terminal => terminals.add(terminal));
            }
            
            const noTerminalMatches = produccion.match(regex2);
            if (noTerminalMatches) {
                noTerminalMatches.forEach(noTerm => check.add(noTerm));
            }
        }
        console.log(`${no_terminal} → ${producciones.join(" | ")}`);
    }
    
    console.log("Check (non-terminals in productions):", Array.from(check));
    console.log("Non-terminals:", Array.from(nonTerminals));
    console.log("Terminals:", Array.from(terminals));
    
    // Check if there are non-terminals that don't produce
    if (check.size !== nonTerminals.size || [...check].some(item => !nonTerminals.has(item))) {
      setNonProductiveError(true); // Set error state
      return;
    } else {
      setNonProductiveError(false); // Reset the error if everything is correct
    }
    

    // 6. Calulate `primeros`
    const primerosCalculated = {};
    for (const nt in gramatica) {
      primerosCalculated[nt] = calcularPrimero(gramatica, nt, {});
    }
    setPrimeros(primerosCalculated);

    // 7. Calculate `siguientes`
    const siguientesCalculated = calcularSiguiente(gramatica, Object.keys(gramatica)[0], Array.from(terminals));
    setSiguientes(siguientesCalculated);

    // 8. Construct `M Table`
    const terminalOrderCalculated = Array.from(terminals);
    terminalOrderCalculated.push(`$`); // Add the end symbol
    setTerminalOrder(terminalOrderCalculated);

    const mTableCalculated = construirTablaM(gramatica, primerosCalculated, siguientesCalculated, terminalOrderCalculated);
    setMTable(mTableCalculated);
  };

  const handleAnalyze = () => {
   //9. Analyze the input string with the `ASD` function
    const results = ASD(mTable, inputString, Object.keys(primeros)[0], terminalOrder);
    setParsingResults(results);
  };

  return (
    <div className={classes.container_principal}>
      {/* Top Row: File content and Formatted Grammar without Left Recursion */}
      <div className={classes.orden}>
    
        <div className={classes.contenedores_GIC}>
          <h2 className={classes.titulo_GIC}>GIC</h2>
          <FileUpload onFileRead={handleFileRead} />
        </div>
        <div  className={classes.contenedores_GIC}>
          <h2 className={classes.titulo_GIC}>GIC Forma Normal</h2>
          {aviso? <div className={classes.container_aviso}> <p className={classes.aviso}>
            
            ¡Cargue un archivo para ver la gramática en su forma normal!
            
            </p> </div> : <>
              {nonProductiveError?  <div className={classes.container_aviso}> <p className={classes.aviso}>

              ¡No se puede hacer la gramática en su forma normal con esa gramatica!
    
              </p> </div> :     <pre className={classes.content_GICF}>
            {formattedGrammar}
          </pre>
             }
             </>
        }

        
         
        </div>
        
      </div>

      {/*Non-productive error message */}
      {nonProductiveError && (
        <div className="w-full bg-red-100 text-red-700 p-4 rounded-md text-center mb-4">
          <p>¡Error! ¡Hay no terminales que no producen en tu gramatica!</p>
        </div>
      )}

      {/* Middle Row: Primeros and Siguientes Tables with fixed height */}
      <div className={classes.orden}>
      
        <div className={classes.contenedores_prim_sgte}>
           <h2 className={classes.titulo_GIC}>Primeros</h2>
           {aviso? <div className={classes.container_aviso}> <p className={classes.aviso}> 
            ¡Cargue un archivo para ver los primeros de tu gramatica!
            </p> </div> : <>
            {nonProductiveError?  <div className={classes.container_aviso}> <p className={classes.aviso}>

            ¡No se puede hacer la tabla de primeros con esas producciones!

            </p> </div> :  <PrimerosTable primeros={primeros} /> }
         </>}
           
        </div>
        <div className={classes.contenedores_prim_sgte}>
          <h2 className={classes.titulo}>Siguientes</h2>
          {aviso? <div className={classes.container_aviso}> <p className={classes.aviso}> 
            ¡Cargue un archivo para ver los siguientes de tu gramatica!
            </p> </div> : <>
            {nonProductiveError?  <div className={classes.container_aviso}> <p className={classes.aviso}>

          ¡No se puede hacer la tabla de siguientes con esas producciones!

          </p> </div> : <SiguientesTable siguientes={siguientes} />}
           </>}
        
        </div>
     
      </div>

      {/* Bottom Row: M Table */}
      <div className={classes.tabla_m}>
        <h2 className={classes.titulo_tabla_analisis}>Tabla M</h2>
       
        {aviso? <div className={classes.container_aviso}> <p className={classes.aviso}> 
            ¡Cargue un archivo para ver la tabla M en tu gramatica!
            </p> </div> : <>

            {nonProductiveError?  <div className={classes.container_aviso}> <p className={classes.aviso}>

            ¡No se puede hacer la tabla M con esas producciones!

            </p> </div> :  <MTable mData={mTable} terminalOrder={terminalOrder} />}
           </>}

            
      </div>
      
      {/* ASD Results */}
      <div className={classes.analizador}>
        <h2 className={classes.titulo_tabla_analisis}>Análisis Sintáctico</h2>
        {aviso? <div className={classes.container_aviso}> <p className={classes.aviso}> 
            ¡Cargue un archivo para analizar la cadena con tu gramatica!
            </p> </div> : <>
              {nonProductiveError?  <div className={classes.container_aviso}> <p className={classes.aviso}>

              ¡No se puede hacer el analisis con esa gramatica!
  
              </p> </div> :  <>
             <h2 className={classes.titulo_input}>Cadena a probar:</h2>
             <input
               type="text"
               placeholder="Ingrese una cadena"
               value={inputString}
               onChange={(e) => setInputString(e.target.value)}
               className={classes.input_analizador}
             />
             <button onClick={handleAnalyze} className={classes.boton_analizador}>
               Analizar
             </button>
             <ASDTable parsingResults={parsingResults} />
             </>}
             </>
            }
       
      </div>
    </div>
  );
};

export default AnalyzerPage;
