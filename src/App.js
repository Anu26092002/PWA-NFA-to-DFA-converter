import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import Navbar from './components/Navbar/navbar';
import { Route, Switch, Redirect} from 'react-router';
import Home from './components/Home/Home';
import Aboutus from './components/AboutUs/Aboutus';

function App() {
  return (
    <div className="App ">
      <Navbar/>
      <Switch>
        <Route path='/about-us' exact component={Aboutus} />
        <Route path='/dashboard' component={Home}/>
        <Redirect from='/' to='/dashboard'/>
      </Switch>
    </div>
  );
}

export default App;
