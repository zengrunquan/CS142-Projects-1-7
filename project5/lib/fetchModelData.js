/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
function fetchModel(url) {
  // 返回 Promise对象，用于异步处理HTTP请求
  return new Promise(function (resolve, reject) {
    // 1. 创建XMLHttpRequest对象 - 用于发起HTTP请求
    const xhr = new XMLHttpRequest();

    // 2. 初始化请求：GET方法 + 目标URL + 异步操作
    xhr.open('GET', url, true);
    
    // 3. 设置响应类型为JSON - 浏览器会自动解析JSON响应
    // 解析失败时 response 为 null
    xhr.responseType = 'json';

    // 4注册请求完成处理器
    // 触发条件：请求完成（无论成功或者失败）
    xhr.onload = function() {
      // 4.1 检查HTTP状态码：200 - 299 
      if (xhr.status >= 200 && xhr.status < 300) {
        // 4.1.1 验证JSON解析结果
        if (xhr.response !== null) {
          // 成功情况：返回 {data: parsedJSON对象}
          resolve({ data: xhr.response });
        } else {
          // JSON解析失败：500错误
          // 可能原因：无效JSON/空响应
          reject({ status: 500, statusText: 'JSON parsing error' });
        }
      } else {
        // 4.2 HTTP错误处理：非2xx状态码（404等）
        reject({ status: xhr.status, statusText: xhr.statusText });
      }
    };

    // 5. 注册网络错误事件处理器
    // 触发条件：地层网络错误（DSN解析失败/cors/断网等）
    xhr.onerror = function() {
      reject({ status: 0, statusText: 'Network Error' });
    };

    // 6.发送HTTP请求（GET请求无需body）
    xhr.send();
  });
}

export default fetchModel;
