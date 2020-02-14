import {getShopInfo} from '../../utils/resource.js'
import request from '../../utils/request.js'

const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {

  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this

    request.get('shopinfo').then(res => {
      wx.setStorageSync('appShopInfo', res.data)
      that.setData({
      shopInfo: res.data
      })
    }).catch(err => {
      console.log('get shopinfo error', err)
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  saveShopInfo: function(e) {
    console.log('to submit shop info', e)
    request.post('shopinfo', e.detail.value).then(res => {
      wx.setStorageSync('appShopInfo', res.data)
      wx.navigateBack()
    })
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})