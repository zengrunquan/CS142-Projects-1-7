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
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = function() { // 更推荐用 onload 替代 onreadystatechange
      if (xhr.status >= 200 && xhr.status < 300) {
        // 检查自动解析结果（确保 JSON 有效）
        if (xhr.response !== null) {
          resolve({ data: xhr.response });
        } else {
          reject({ status: 500, statusText: 'JSON parsing error' });
        }
      } else {
        reject({ status: xhr.status, statusText: xhr.statusText });
      }
    };

    xhr.onerror = function() {
      reject({ status: 0, statusText: 'Network Error' });
    };

    xhr.send();
  });
}

export default fetchModel;
