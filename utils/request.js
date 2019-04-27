import config from '../config.js'

var request = {
  header: {
    'X-SHOPPOINT': config.shoppoint,
    'X-PARTMENT': config.partment,
    'X-VERSION': config.api_version,
    'X-TERMINAL-TYPE': config.terminal_type,
    //'X-ACCESS-TOKEN': '',
    'Content-Type': 'application/json'
  },

  _request: function (url, data, method) {
    if (!this.header['X-ACCESS-TOKEN']) {
      var userInfo = wx.getStorageSync('appUserInfo')
      if (userInfo && userInfo.access_token) {
        this.header['X-ACCESS-TOKEN'] = userInfo.access_token
      }
    }

    var that = this
    var promise = new Promise(function (resolve, reject) {
      wx.request({
        url: config.base_url + '/' + url,
        method: method,
        header: that.header,
        data: data,
        success: res => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(url, data, res.data);
            resolve(res)
          } else {
            reject(res.data)
          }
        },
        fail: err => {
          console.error(url, err)
          reject(err)
        }
      })
    })

    return promise;
  },

  get: function (url, data) {
    return this._request(url, data, 'GET')
  },

  post: function (url, data) {
    return this._request(url, data, 'POST')
  },

  del: function (url, data) {
    return this._request(url, data, 'DELETE')
  },

  put: function (url, data) {
    return this._request(url, data, 'PUT')
  }
}

export default request
