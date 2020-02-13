import config from '../../config.js'
import request from '../../utils/request.js'

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_image_url: config.base_image_url,
    type: 4 // 4-ad
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		var that = this;
		wx.showLoading({
			title: '广告加载中...',
			mask: true
		})

		request.get('images', {
			type: that.data.type
		}).then(res => {
      console.log(res.data)
			that.setData({
				ads: res.data
			})
			wx.hideLoading()
		}).catch(err => {
			console.log('get images', err)
			wx.hideLoading()
		})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  deleteAd: function(e) {
    var id = e.currentTarget.dataset.id
    wx.showLoading({
			title: '广告删除中...',
			mask: true
    })
    request.del('image', {id: id}).then(res => {
      wx.hideLoading()
      wx.showToast({
				title: '删除成功',
				icon: 'none',
				duration: 2000
			})
    }).catch(err => {
      console.log('delete ad ', id, 'error ', err)
      wx.hideLoading()
      wx.showToast({
				title: '删除失败',
				icon: 'none',
				duration: 2000
			})
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})