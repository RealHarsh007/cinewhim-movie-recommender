import React from 'react';import {createRoot} from 'react-dom/client';import App from './App.jsx';import './index.css';
class Boundary extends React.Component{state={e:false};static getDerivedStateFromError(){return{e:true}}render(){return this.state.e?<p className="p-8">Something broke. <button className="underline" onClick={()=>location.reload()}>Reload the page</button></p>:this.props.children}}
createRoot(document.getElementById('root')).render(<Boundary><App/></Boundary>);
