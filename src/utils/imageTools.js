import Taro from '@tarojs/taro';

function getLocalFilePath(path) {
  if (
    path.indexOf('_www') === 0 ||
    path.indexOf('_doc') === 0 ||
    path.indexOf('_documents') === 0 ||
    path.indexOf('_downloads') === 0
  ) {
    return path;
  }
  if (path.indexOf('file://') === 0) {
    return path;
  }
  if (path.indexOf('/storage/emulated/0/') === 0) {
    return path;
  }
  if (path.indexOf('/') === 0) {
    var localFilePath = plus.io.convertAbsoluteFileSystem(path);
    if (localFilePath !== path) {
      return localFilePath;
    } else {
      path = path.substr(1);
    }
  }
  return '_www/' + path;
}

function dataUrlToBase64(str) {
  var array = str.split(',');
  return array[array.length - 1];
}

var index = 0;
function getNewFileId() {
  return Date.now() + String(index++);
}

function biggerThan(v1, v2) {
  var v1Array = v1.split('.');
  var v2Array = v2.split('.');
  var update = false;
  for (var index = 0; index < v2Array.length; index++) {
    var diff = v1Array[index] - v2Array[index];
    if (diff !== 0) {
      update = diff > 0;
      break;
    }
  }
  return update;
}
export function downloadImages(imageUrl) {
  return new Promise((resolve, reject) => {
    Taro.downloadFile({
      url: imageUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath);
        } else {
          reject(new Error('Download failed, status code is not 200'));
        }
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
}
// 浏览器环境下的函数
export function browserPathToBase64(path) {
  return new Promise(function (resolve, reject) {
    if (typeof FileReader === 'function') {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', path, true);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        if (this.status === 200) {
          let fileReader = new FileReader();
          fileReader.onload = function (e) {
            resolve(e.target.result);
          };
          fileReader.onerror = reject;
          fileReader.readAsDataURL(this.response);
        }
      };
      xhr.onerror = reject;
      xhr.send();
    } else {
      var canvas = document.createElement('canvas');
      var c2x = canvas.getContext('2d');
      var img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        c2x.drawImage(img, 0, 0);
        resolve(canvas.toDataURL());
        canvas.height = canvas.width = 0;
      };
      img.onerror = reject;
      img.src = path;
    }
  });
}

export const compressInputImage = async (file) => {
  try {
    let compressedFile;
    let srcBase64;
    let src_size = file.file.size;

    // 如果文件小于200KB，直接转换为base64
    if (src_size <= 200 * 1024) {
      srcBase64 = await wxPathToBase64(file.url);
      return {
        base64: srcBase64,
      };
    }

    let quality = Math.floor((-0.0738 * src_size) / 1024 + 113.75);
    // 当文件大于200KB时循环压缩
    if (quality < 0) quality = 5;
    while (src_size > 200 * 1024 && quality > 0) {
      compressedFile = await Taro.compressImage({
        src: file.url,
        quality,
      });
      srcBase64 = await wxPathToBase64(compressedFile.tempFilePath);
      src_size = srcBase64.length;
      // 根据线性关系调整压缩质量

      quality = Math.floor(-0.0738 * src_size + 113.75); // 动态调整压缩质量

      // 防止负数或过大的压缩质量值
      if (quality > 99) {
        quality = 99;
      }
      console.log('compressed size', src_size);
    }

    return {
      base64: srcBase64,
    };
  } catch (error) {
    console.error('图片压缩失败：', error);
    return file;
  }
};
// 小程序（微信小程序）环境下的函数
export function wxPathToBase64(path) {
  return new Promise(function (resolve, reject) {
    // 判断路径是否为 URL
    if (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('wxfile://')
    ) {
      if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {
        wx.getFileSystemManager().readFile({
          filePath: path,
          encoding: 'base64',
          success: function (res) {
            resolve('data:image/png;base64,' + res.data);
          },
          fail: function (error) {
            reject(error);
          },
        });
      } else {
        reject(new Error('not supported in this environment'));
      }
    } else {
      resolve(path); // 如果不是 URL，直接返回原始路径
    }
  });
}

export function plusPathToBase64(path) {
  return new Promise(function (resolve, reject) {
    plus.io.resolveLocalFileSystemURL(
      getLocalFilePath(path),
      function (entry) {
        entry.file(
          function (file) {
            var fileReader = new plus.io.FileReader();
            fileReader.onload = function (data) {
              resolve(data.target.result);
            };
            fileReader.onerror = function (error) {
              reject(error);
            };
            fileReader.readAsDataURL(file);
          },
          function (error) {
            reject(error);
          }
        );
      },
      function (error) {
        reject(error);
      }
    );
  });
}

export function base64ToPath(base64) {
  return new Promise(function (resolve, reject) {
    if (typeof window === 'object' && 'document' in window) {
      base64 = base64.split(',');
      var type = base64[0].match(/:(.*?);/)[1];
      var str = atob(base64[1]);
      var n = str.length;
      var array = new Uint8Array(n);
      while (n--) {
        array[n] = str.charCodeAt(n);
      }
      return resolve(
        (window.URL || window.webkitURL).createObjectURL(
          new Blob([array], { type: type })
        )
      );
    }
    var extName = base64.split(',')[0].match(/data\:\S+\/(\S+);/);
    if (extName) {
      extName = extName[1];
    } else {
      reject(new Error('base64 error'));
    }
    var fileName = getNewFileId() + '.' + extName;
    if (typeof plus === 'object') {
      var basePath = '_doc';
      var dirPath = 'uniapp_temp';
      var filePath = basePath + '/' + dirPath + '/' + fileName;
      if (
        !biggerThan(
          plus.os.name === 'Android' ? '1.9.9.80627' : '1.9.9.80472',
          plus.runtime.innerVersion
        )
      ) {
        plus.io.resolveLocalFileSystemURL(
          basePath,
          function (entry) {
            entry.getDirectory(
              dirPath,
              {
                create: true,
                exclusive: false,
              },
              function (entry) {
                entry.getFile(
                  fileName,
                  {
                    create: true,
                    exclusive: false,
                  },
                  function (entry) {
                    entry.createWriter(function (writer) {
                      writer.onwrite = function () {
                        resolve(filePath);
                      };
                      writer.onerror = reject;
                      writer.seek(0);
                      writer.writeAsBinary(dataUrlToBase64(base64));
                    }, reject);
                  },
                  reject
                );
              },
              reject
            );
          },
          reject
        );
        return;
      }
      var bitmap = new plus.nativeObj.Bitmap(fileName);
      bitmap.loadBase64Data(
        base64,
        function () {
          bitmap.save(
            filePath,
            {},
            function () {
              bitmap.clear();
              resolve(filePath);
            },
            function (error) {
              bitmap.clear();
              reject(error);
            }
          );
        },
        function (error) {
          bitmap.clear();
          reject(error);
        }
      );
      return;
    }
    if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {
      var filePath = wx.env.USER_DATA_PATH + '/' + fileName;
      wx.getFileSystemManager().writeFile({
        filePath: filePath,
        data: dataUrlToBase64(base64),
        encoding: 'base64',
        success: function () {
          resolve(filePath);
        },
        fail: function (error) {
          reject(error);
        },
      });
      return;
    }
    reject(new Error('not support'));
  });
}
