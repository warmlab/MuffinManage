import config from '../../config.js'

import {
  login
} from '../../utils/resource.js'

const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    base_image_url: config.base_image_url
  },

  onLoad: function () {
    var that = this
    app.getUserInfo().then(res => {
      that.setData({
        userInfo: res
      })
    }).catch(err => {
      console.log('get user info error', err)
    })
  },
})
