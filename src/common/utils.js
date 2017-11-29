import fetchJsonp from 'fetch-jsonp';

/**
* @author William Cui
* @description 封装接口请求方法
* @param method {string} 请求地址 【可选】 默认 ‘GET’
* @param url {string} 请求地址 【必要】
* @param data {object} 请求参数对象 【可选】
* @param success {function} 请求成功回掉函数 【必要】
* @param error {function} 请求错误回掉函数 【可选】
**/
function getJSON({ url, method, data, success, error, timeout }) {
  //用于开发环境跨域接口联调
  url = 'http://192.168.6.180:8080' + url;

  //键值对转换为字符串
  function params(data) {
    let arr = [];
    Object.keys(data).forEach((key, index) => {
      arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    });
    return arr.join('&');
  }

  if (method === 'POST') {
    fetch(url, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params(data)
    })
      .then(response => {
        return response.json();
      })
      .then(json => {
        success && success(json);
      })
      .catch(e => {
        console.log('fetchjson: ', e);
        error && error(e);
      });
  } else {
    if (data) url += '?' + params(data);
    fetchJsonp(url, {
      timeout: timeout || 1000 * 10,
      charset: 'utf-8'
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {
        success && success(json);
      })
      .catch(function(e) {
        console.log('fetchjsonp: ', e);
        error && error(e);
      });
  }
}

/**
* @author William Cui
* @description 获取当前时间YYYY-MM-DD hh:mm:ss
* @date 2017-06-30
**/
function getNowTime() {
  const now = new Date();

  let month = now.getMonth() + 1;
  month = month <= 9 ? '0' + month : month;

  let date = now.getDate();
  date = date <= 9 ? '0' + date : date;

  let hour = now.getHours();
  hour = hour <= 9 ? '0' + hour : hour;

  let minute = now.getMinutes();
  minute = minute <= 9 ? '0' + minute : minute;

  let seconds = now.getSeconds();
  seconds = seconds <= 9 ? '0' + seconds : seconds;

  let messageTime =
    now.getFullYear() +
    '-' +
    month +
    '-' +
    date +
    ' ' +
    hour +
    ':' +
    minute +
    ':' +
    seconds;
  return messageTime;
}

/**
* @author William Cui
* @description 计算字符串长度，汉字算两个字符串
* @param str {string} 计算字符串 【必要】
* @date 2017-06-20
**/
function getStrSize(str) {
  return str.replace(/[^\x00-\xff]/g, 'aa').length;
}

/**
* @author gm
* @description 二次验权判断当前账户是否有权限
* @param moduleCode {string} 模块代码 【必填】
* @param privilegeCode {string} 权限编码 【必填】
* @param success {function} 请求成功回掉函数 【必要】
* @param failed {function} 请求错误回掉函数 【可选】
* @date 2017-06-21
**/
function checkPermission({
  moduleCode,
  privilegeCode,
  title,
  toDoSomething,
  closePopup,
  failed
}) {
  let loginName = JSON.parse(sessionStorage.getItem('account')).loginName;
  getJSON({
    url: '/reception/permission/checkPermission',
    data: { loginName, moduleCode, privilegeCode },
    success: function(json) {
      if (json.code === 0) {
        toDoSomething && toDoSomething(json);
      } else {
        failed && failed(json);
      }
    }
  });
}

/**
* @author William Cui
* @description 数字不够位数前面自动补零
* @param number {number} 需要格式化的数字
* @param n {number} 需要格式化成的位数
**/
function fillZero(number, n) {
  return (Array(n).join(0) + number).slice(-n);
}

/**
* @author William Cui
* @description 根据后端返回的时间戳格式化成指定的格式
* @param timestamp {number} 需要格式化的时间戳
* @param patternStr {string} 指定的格式字符串 默认是'YYYY-MM-DD hh:mm:ss'
Y: 代表年份， M: 代表月份， D: 代表一个月中的第几天， h: 代表小时， m: 代表分, s: 代表秒
**/
function formatDate(timestamp, patternStr) {
  patternStr = patternStr || 'YYYY-MM-DD hh:mm:ss';
  var patternArray = patternStr.match(/\w+/g);
  var date = new Date(timestamp);
  var dateObj = {
    Y: date.getFullYear(),
    M: date.getMonth() + 1,
    D: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds()
  };
  patternArray.forEach(pattern => {
    let replaceStr = fillZero(dateObj[pattern[0]], pattern.length);
    patternStr = patternStr.replace(pattern, replaceStr);
  });
  return patternStr;
}

/**
* @author William Cui
* @description 把日期字符串转成时间戳
* @param dateStr {string} 需要格式化的日期字符串
**/
function formatStamp(dateStr) {
  return new Date(dateStr).getTime();
}

/**
* @author William Cui
* @description 把数字字符限制指定的位数和小数位数
* @param numberString {number || string} 需要限制的数字或字符
* @param m {number} 需要限制的整数位数
* @param n {number} 需要限制的小数位数
**/
function digitalLimit(numberString, m, n) {
  if (
    numberString.indexOf('0') === 0 &&
    numberString.indexOf('.') !== 1 &&
    numberString.length > 1
  ) {
    numberString = numberString.substr(1);
  }
  if (numberString.indexOf('.') > -1) {
    const index = numberString.indexOf('.');
    numberString = numberString.substr(0, index + n + 1);
  }

  if (numberString.indexOf('.') === -1) {
    numberString = numberString.substr(0, m);
  }
  return numberString;
}

export {
  getJSON,
  getNowTime,
  getStrSize,
  checkPermission,
  fillZero,
  formatDate,
  formatStamp,
  digitalLimit
};
