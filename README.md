# Analizador de Gramáticas

Este proyecto es un analizador de gramáticas construido en React, diseñado para analizar gramáticas libres de contexto (GLC) y construir tablas de análisis. Soporta funcionalidades como la eliminación de recursión por la izquierda, el cálculo de los conjuntos PRIMERO y SIGUIENTE, y la construcción de la tabla de análisis predictivo (Tabla M).

### Enlace de GitHub Pages

Puedes acceder a la versión en vivo del proyecto [aquí](https://jfbenitezz.github.io/Analizador-Sintactico/).
---

## Funcionalidades

- **Carga de Archivos**: Carga un archivo de gramática para analizarlo automáticamente.
- **Conjuntos PRIMERO y SIGUIENTE**: Calcula y muestra los conjuntos PRIMERO y SIGUIENTE para cada no terminal.
- **Tabla M**: Genera una tabla de análisis predictivo basada en la gramática proporcionada.
- **Verificación ASD**: Realiza un análisis sintáctico para validar la entrada contra la gramática definida, mostrando los resultados del análisis en formato de tabla.

## Comenzando

### Requisitos Previos

Asegúrate de tener **Node.js** y **npm** instalados. Puedes descargarlos desde [el sitio oficial de Node.js](https://nodejs.org/).

### Formato de la Gramática

Las gramáticas deben definirse en un archivo `.txt`, con cada producción en una nueva línea. Aquí tienes un ejemplo:

- E -> E + T
- E -> T
- T -> T * F
- T -> F
- F -> i

### Instrucciones de Ejecución

Para ejecutar el proyecto localmente, corre los siguientes comandos en la terminal dentro de la carpeta del proyecto:

1. `npm i` para instalar las dependencias.
2. `npm run dev` para iniciar el proyecto en modo de desarrollo.
