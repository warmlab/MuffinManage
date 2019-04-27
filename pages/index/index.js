import {
  login
} from '../../utils/resource.js'
//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function () {
    app.getUserInfo().then(res => {
      this.setData({
        userInfo: res
      })
    })
  },
})
