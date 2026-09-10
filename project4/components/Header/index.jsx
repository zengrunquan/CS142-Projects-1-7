import React from "react";
import "./styles.css"

class Header extends React.Component{
    render() {
        return (
            <header className="cs142-header">
                <div className="cs142-header-content">
                    {/* 标题 */}
                    <h1>State Explorer</h1>
                    
                    {/* 页眉内容 */}
                    <h3>
                        This is a small web application project. 
                        Please click the button below to switch between views. 
                        When switching to 'Example', read carefully and understand the content. 
                        When switching to 'States', check out the search character effect.
                    </h3>
                </div>
            </header>
        )
    }
}

export default Header;