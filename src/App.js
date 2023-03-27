import './index.css';
import Login from './Login';
import Profile from './Profile';
import Register from './Register';
import { BrowserRouter,Routes,Route} from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/user/:id' element={<Profile/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
