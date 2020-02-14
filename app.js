import request from './utils/request.js'
import theme from './utils/theme.js'

App({
  onLaunch: function () {
    // 展示本地存储能力
    //var logs = wx.getStorageSync('logs') || []
    //logs.unshift(Date.now())
    //wx.setStorageSync('logs', logs)

    var that = this
    // 登录
    this.login().then(userInfo => {
      //that.globalData.userInfo = userInfo
      //getShopInfo()
      wx.setStorageSync('appUserInfo', userInfo)

      // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                that.globalData.userInfo = userInfo
                that.globalData.userInfo.avatarUrl = res.userInfo.avatarUrl
                that.globalData.userInfo.nickname = res.userInfo.nickName
                wx.setStorageSync('appUserInfo', that.globalData.userInfo)

                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
                }
              }
            })
          }
        }
      })
    })
  },

  wxLogin: function (resolve, reject) {
    // do weixin's login
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        request.post('login', {
          code: res.code
        }).then(res => {
          //wx.setStorageSync('appUserInfo', res.data)
          resolve(res.data)
        }).catch(err => {
          console.error('weixin login error:', err)
          wx.showModal({
            content: "系统正在升级中，请稍后...",
            showCancel: false,
            confirmColor: theme.color,
            confirmText: "我知道了",
          })
          reject(err)
        })
      }
    })
  },

  login: function () {
    var that = this
    return new Promise((resolve, reject) => {
      var userInfo = wx.getStorageSync('appUserInfo')
      if (userInfo && userInfo.access_token) {
        request.post('tokencheck').then(res => {
          console.log('tokencheck OK', res)
          resolve(userInfo)
        }).catch(err => {
          console.log('tokencheck ERR and to do weixin login', err)
          that.wxLogin(resolve, reject)
        })
      } else {
        that.wxLogin(resolve, reject)
      }
    })
  },

  getUserInfo: function () {
    return new Promise((resolve, reject) => {
      var interval = setInterval(function () {
        var userInfo = wx.getStorageSync('appUserInfo')
        console.log('user info', userInfo)
        if (!!userInfo) {
          clearInterval(interval)
          resolve(userInfo)
        }
      }, 500)
    })
  },

  globalData: {
    userInfo: null
  }
})
