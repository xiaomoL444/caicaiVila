export function XMLHttpSend(url, method, func) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.send();
  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      let response = JSON.parse(this.response);
      func(response);
    }
  };
}

export function getUrlParam(param) {
  // 获取由全部参数组成的字符串。
  let query = window.location.search.substring(1);
  // 分割参数，得到每一个参数字符串组成的数组。
  let vars = query.split('&');
  // 遍历数组，得到每一个参数字符串。
  for (let i = 0; i < vars.length; i++) {
    // 分割每一个参数字符串，得到参数名和参数值组成的数组。
    var pair = vars[i].split('=');
    // 如果参数名等于传入的param，则返回该值。
    if (pair[0] == param) {
      return decodeURI(pair[1]);
    }
  }
  // 若参数不存在，则返回false。
  return false;
}