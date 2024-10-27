# Grammar Analyzer

This project is a grammar analyzer built in React, designed to parse context-free grammars (CFG) and construct parsing tables. It supports functionalities such as removing left recursion, calculating FIRST and FOLLOW sets, and building the predictive parsing table (M Table).

### GitHub Pages Link

You can access the live version of the project [here](https://jfbenitezz.github.io/Analizador-Sintactico/).
---

## Features

- **File Upload**: Upload a grammar file to parse it automatically.
- **FIRST and FOLLOW Sets**: Calculates and displays the FIRST and FOLLOW sets for each non-terminal.
- **M Table**: Generates a predictive parsing table based on the grammar provided.

## Getting Started

### Prerequisites

Make sure you have **Node.js** and **npm** installed. You can download them from [Node.js official website](https://nodejs.org/).

### Grammar Format
Grammars should be defined in a `.txt` file with each production on a new line. Here’s an example:

- E -> E + T
- E -> T
- T -> T * F
- T -> F
- F -> i
