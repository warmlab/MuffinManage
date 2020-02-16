import config from '../../config.js'
import request from '../../utils/request.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 4
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  typeChange: function (e) {
    this.data.set({
      type: parseInt(e.currentTarget.dataset.value)
    })
  },

  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      success: function (res) {
        that.setData({
          image_url: res.tempFilePaths[0],
          choosed: true
        })
      }
    })
  },

  confirmAd: function (e) {
    var that = this;

    console.log('ad info to commit', e)

    var data = {
      title: e.detail.value.title,
      note: e.detail.value.note,
      type: that.data.type
    }

    // 如果产品图片没有做修改
    wx.showLoading({
      title: '图片上传中...',
      mask: true
    })

    wx.uploadFile({
      url: `${config.base_url}/image`,
      filePath: that.data.image_url,
      name: 'upload-files',
      formData: data,
      header: request.header,
      success: function (res) {
        var r
        try {
          r = JSON.parse(res.data)
          wx.hideLoading()
        } catch (err) {
          wx.hideLoading()
        }
        console.log('upload image successfully', r)
        wx.navigateBack()
      },
      fail: function (err) {
        console.log('upload image error', err)
        wx.hideLoading()
      }
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