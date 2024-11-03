import React, { useState, useEffect } from 'react';
import FileUpload from '../components/fileUpload';
import PrimerosTable from '../components/PrimerosTable';
import SiguientesTable from '../components/SiguientesTable';
import MTable from '../components/MTable';
import ASDTable from '../components/ASDTable';
import { validarExp, eliminarRecursividadPorIzquierda, calcularPrimero, calcularSiguiente, construirTablaM } from '../logic/functions'; 
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
    const gramatica = eliminarRecursividadPorIzquierda(dic);

    // 3. Factorize the grammar
    // gramatica = factorizar(gramatica);

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
    <div className="container mx-auto p-8 space-y-8">
      {/* Top Row: File content and Formatted Grammar without Left Recursion */}
      <div className="flex space-x-4">
        <div className="w-1/2 p-4 bg-gray-100 rounded-md">
          <h2 className="text-lg font-semibold mb-2">GIC</h2>
          <FileUpload onFileRead={handleFileRead} />
        </div>
        <div className="w-1/2 p-4 bg-gray-100 rounded-md">
          <h2 className="text-lg font-semibold mb-2">GIC Forma Normal</h2>
          <pre className="bg-white p-2 h-40 overflow-y-auto rounded-md whitespace-pre-wrap">
            {formattedGrammar}
          </pre>
        </div>
      </div>

      {/*Non-productive error message */}
      {nonProductiveError && (
        <div className="w-full bg-red-100 text-red-700 p-4 rounded-md text-center mb-4">
          Error: There are non-terminals that do not produce. Please check your grammar.
        </div>
      )}

      {/* Middle Row: Primeros and Siguientes Tables with fixed height */}
      <div className="flex space-x-4">
        <div className="w-1/2 p-4 bg-gray-100 rounded-md overflow-y-auto max-h-80">
          <PrimerosTable primeros={primeros} />
        </div>
        <div className="w-1/2 p-4 bg-gray-100 rounded-md overflow-y-auto max-h-80">
          <SiguientesTable siguientes={siguientes} />
        </div>
      </div>

      {/* Bottom Row: M Table */}
      <div className="w-full p-4 bg-gray-100 rounded-md overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Tabla M</h2>
        <MTable mData={mTable} terminalOrder={terminalOrder} />
      </div>
      
      {/* ASD Results */}
      <div className="w-full p-4 bg-gray-100 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Análisis Sintáctico</h2>
        <input
          type="text"
          placeholder="Ingrese una cadena"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          className="border p-2 rounded-md mb-4"
        />
        <button onClick={handleAnalyze} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Analizar
        </button>
        <ASDTable parsingResults={parsingResults} />
      </div>
    </div>
  );
};

export default AnalyzerPage;
