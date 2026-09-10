import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Link} from "react-router-dom";

import Example from "./components/Example";
import States from "./components/States";
import Header from "./components/Header";

const Nav = () => {
    return (
        <div style={{
            background: '#f4f4f4',
            padding: '10px',
            border: '1px solid #ccc',
            marginBottom: '20px'
        }}>
            <Link to="/Example" style={{ 
                color: 'black', 
                textDecoration: 'none', 
                padding: '8px 12px', 
                border: '1px solid black', 
                borderRadius: '4px'
            }}>
                Example
            </Link>
            <Link to="/States" style={{ 
                color: 'black', 
                textDecoration: 'none', 
                padding: '8px 12px', 
                border: '1px solid black', 
                borderRadius: '4px',
                marginLeft: '10px'
            }}>
                States
            </Link>
        </div>
    );
};

// 主页面APP
const APP = () => {
    return (
        <HashRouter>
            <div>
                <Header />
                <Nav />
                <Route path="/States" component={States} />
                <Route path="/Example" component={Example} />
            </div>
        </HashRouter>
    );
};

ReactDOM.render(<APP />, document.getElementById("reactapp"));