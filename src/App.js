import './App.css';
import { Buffer } from 'buffer';
import Authentication from "./components/Authentication"

function App() {
  global.Buffer = Buffer; // very important
  return (
    <div className="App">
      <Authentication></Authentication>
    </div>
  );
}

export default App;
