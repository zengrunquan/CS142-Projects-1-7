import React from "react";
import ReactDOM from "react-dom";

import Example from "./components/Example";
import States from "./components/States";
import Header from "./components/Header";

/**
 * ViewSwitcher 组件：实现 Example 和 States 组件之间切换显示
 * -- 使用状态管理当前显示的组件
 * --实现按钮点击事件监听触发视图切换
 */

class ViewSwitcher extends React.Component {
    //组件构造函数，初始化状态和绑定事件处理函数
    constructor(props) {
        super(props);  // 调用父类构造函数
        this.state = {
            showExample: false  // 控制组件的显示：true 显示 Example，false 显示 States
        };

        // 类组件处理事件回调
        // 绑定事件处理函数，确保回调中 this 指向当前组件实例
        this.handleSwitchView = this.handleSwitchView.bind(this)
    }

    // 视图切换逻辑
    handleSwitchView() {
        // setState，确保状态更新一致
        // 对 showExample 每次取反，从而实现切换
        this.setState(prevState => ({
            showExample: !prevState.showExample
        }));
    }

    // 组件渲染，根据状态
    render() {
        // 从状态获取flag（显示标志）
        const { showExample } = this.state;
        return (
                <div>
                    {showExample ? (
                        <div>
                            <button onClick={this.handleSwitchView}>Switch to States</button>
                            <Example />  {/* 组件渲染 */}
                        </div>
                    ) : (
                        <div>
                            <button onClick={this.handleSwitchView}>Switch to Example</button>
                            <States/>
                        </div>
                    )}
                </div>
        )
    }
}


export default ViewSwitcher;  // 组件导出，便于其他文件导入使用

ReactDOM.render(
    <div>
        <Header/>
        <ViewSwitcher/>
    </div>,
    document.getElementById("reactapp")
);  // 渲染到HTML页面中