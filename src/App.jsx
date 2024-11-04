import AnalyzerPage from './pages/AnalyzerPage'
import classes from '../public/css/App.module.css'
import AnimatedBackground from './components/AnimatedBackground'
function App() {
  return (
    <div className={"App"}>
      <AnimatedBackground />
      <header className="App-header">
      <h2 className={classes.titulo}>Analizador Sintáctico</h2>
        <AnalyzerPage />
        
      </header>
     
    </div>

  )
}

export default App
