import { HEADER, URL_BACK } from './config';
import Taro from '@tarojs/taro';
/**
 * 发送请求
 */
function baseRequest(
  url,
  method,
  data,
  { auth = false, noVerify = false, noAlert = false }
) {
  let Url = URL_BACK + url;
  let header = HEADER;
  // 请求地址处理
  if (auth) {
    header.Authorization = `${global.userToken}`;
    //登录过期自动登录
    // if (!store.state.app.token) {
    //   toLogin();
    //   return Promise.reject({
    //     msg: '未登录',
    //   });
    // }
  }

  // if (store.state.app.token) {
  //   header[TOKENNAME] = store.state.app.token;
  // }
  // if (store.state.app.uid) {
  //   if (data) {
  //     data.userId = store.state.app.uid;
  //   } else {
  //     data = {
  //       userId: store.state.app.uid,
  //     };
  //   }
  // }

  return new Promise((reslove, reject) => {
    Taro.request({
      url: Url,
      method: method || 'GET',
      timeout: 6000000,
      header: header,
      // header: {
      // 	'content-type': 'multipart/form-data', // 使用表单数据格式
      // 'enctype': 'multipart/form-data', // 使用表单数据格式
      // },
      data: data || {},
      success: (res) => {
        let statusCode = res.statusCode;
        if (statusCode / 100 < 3) {
          reslove(res.data);
        } else {
          // let showErr = '请求失败' + statusCode;
          // if (!noAlert) {
          //   utils.showToast(showErr);
          // }
          reject();
        }
      },
      fail: (message) => {
        // let showErr = '请求失败';
        // if (!noAlert) {
        //   utils.showToast(showErr);
        // }
        reject();
      },
    });
  });
}

const request = {};

['options', 'get', 'post', 'put', 'head', 'delete', 'trace', 'connect'].forEach(
  (method) => {
    request[method] = (api, data, opt) => {
      return baseRequest(api, method, data, opt || {});
    };
  }
);
request.upload = (url, filePath, data, name) => {
  return new Promise((resolve, reject) => {
    Taro.uploadFile({
      url: URL_BACK + url,
      filePath: filePath,
      // formData: data,
      name: 'file',
      success: (res) => {
        // if (res.statusCode === 200) {
        debugger;
        resolve(res);
        // } else {
        //   reject(
        //     new Error(`Failed to upload file. Status code: ${res.statusCode}`)
        //   );
        // }
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
};

export default request;
