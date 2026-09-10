import React from "react";
import "./styles.css";

/**
 * Define States, a React component of CS142 Project 4, Problem 2. The model
 * data for this view (the state names) is available at
 * window.cs142models.statesModel().
 */
class States extends React.Component {
  // 组建构造函数初始化
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: "",  // 搜索词，初始化为空
      states: window.cs142models.statesModel()  // 从模型获取州名数据
    };

    console.log(
      "window.cs142models.statesModel()",
      window.cs142models.statesModel()
    );
  }

  // 处理搜索框内容变化的方法
  handleChange = (event) => {
    // 从事件对象中获取输入值
    const searchTerm = event.target.value;
    // 更新状态中的搜索词，并触发重新渲染
    this.setState({searchTerm});
  }

  // 组件渲染方法
  render() {
    // 从状态中获取当前搜索词和州名列表
    const { searchTerm, states } = this.state

    // 根据搜索词过滤州名列表（忽略大小写）
    const filteredStates = states.filter((state) =>
      state.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="cs142-states-container">
          Replace this with the code for CS142 Project 4, Problem 2
          {/* 搜索输入框，绑定值和事件处理函数 */}
          <input
            type="text"
            placeholder="Search for states..."
            value={searchTerm}            // 输入框值与状态绑定
            onChange={this.handleChange}  // 监听输入变化
          />

          {/* 显示当前过滤条件 --> 子字符串 逻辑或的短路求值，非空则searchTerm，空则为"ALL states" */}
          <p> Filtering by: {searchTerm || "ALL states"}</p>

          {/* 根据过滤结果显示不同内容 */}
          {filteredStates.length > 0 ? (
            // 有匹配结果时显示州名列表
            <ul className="cs142-states-list">
              {filteredStates
                .sort()  // 按字母顺序排序
                .map((state, index) => (
                  // 遍历生成列表项，每个项需要唯一key
                  <li key={index}>{state}</li>
                ))
              } 
            </ul>
          ) : (
            // 无匹配结果时显示提示信息
            <p> No states match the search term... </p>
          )}
        </div>
    );
  }
}

export default States;
