import React, { useState, useEffect } from 'react';
import FileUpload from '../components/fileUpload';
import PrimerosTable from '../components/PrimerosTable';
import SiguientesTable from '../components/SiguientesTable';
import MTable from '../components/MTable';
import ASDTable from '../components/ASDTable';
import { validarExp, eliminarRecursividadPorIzquierda, calcularPrimero, calcularSiguiente, construirTablaM } from '../logic/functions'; 
import {ASD} from '../logic/ASDChecker';

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

    // 3. Format the grammar for display purposes
    setFormattedGrammar(formatGrammar(gramatica));
    setGrammarWithoutRecursion(JSON.stringify(gramatica, null, 2)); // For display purposes only

    // 4. Calculate `primeros`
    const primerosCalculated = {};
    for (const nt in gramatica) {
      primerosCalculated[nt] = calcularPrimero(gramatica, nt, {});
    }
    setPrimeros(primerosCalculated);

    // 5. Calculate `siguientes`
    const siguientesCalculated = calcularSiguiente(gramatica, Object.keys(gramatica)[0]);
    setSiguientes(siguientesCalculated);

    // 6. Determine terminal order based on grammar appearance
    const terminalOrderCalculated = [];
    for (const productions of Object.values(gramatica)) {
      for (const production of productions) {
        for (const char of production) {
          const regexNonTerminal = /[^A-Z'&]/
          // Check each character in the production to see if it's a terminal
          if (regexNonTerminal.test(char) && !terminalOrderCalculated.includes(char)) { // Ensure only terminals are added
            terminalOrderCalculated.push(char);
          }
        }
      }
    }
    terminalOrderCalculated.push(`$`); // Add the end symbol
    setTerminalOrder(terminalOrderCalculated);

    // 7. Construct `M Table`
    const mTableCalculated = construirTablaM(gramatica, primerosCalculated, siguientesCalculated, terminalOrderCalculated);
    setMTable(mTableCalculated);
  };

  const handleAnalyze = () => {
   //8. Analyze the input string with the `ASD` function
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
          <h2 className="text-lg font-semibold mb-2">GIC No Recursiva</h2>
          <pre className="bg-white p-2 h-40 overflow-y-auto rounded-md whitespace-pre-wrap">
            {formattedGrammar}
          </pre>
        </div>
      </div>

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
          placeholder="Enter input string"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          className="border p-2 rounded-md mb-4"
        />
        <button onClick={handleAnalyze} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Analyze
        </button>
        <ASDTable parsingResults={parsingResults} />
      </div>
    </div>
  );
};

export default AnalyzerPage;
