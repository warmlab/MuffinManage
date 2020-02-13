import config from '../../config.js'

import {
  login,
  getProductsByCategory
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
      if (res.privilege !== 1023) {
        getProductsByCategory(1).then(products => {
          that.setData({
            //summary: summary,
            goods: products
          })
          wx.hideLoading()
        }).catch(err => {
          console.error('get products by category error:', err)
          wx.hideLoading()
        })
      }
      that.setData({
        userInfo: res
      })
    }).catch(err => {
      console.log('get user info error', err)
    })
  },
})
