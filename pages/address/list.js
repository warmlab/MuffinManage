// pages/promotion/publish.js
import request from '../../utils/request.js'

const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
  data: {
    limit: 10
  },

	onShow: function (e) {
		var that = this
		wx.showLoading({
			title: '提货地址加载中...',
			mask: true
		})

		request.get('pickupaddresses', {
			manage: true,
			limit: 10
		}).then(res => {
			that.setData({
				addresses: res.data
			})
			wx.hideLoading()
		}).catch(err => {
			console.log('promotions', err)
			wx.hideLoading()
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
	},

	toEditDetail: function (e) {
		wx.navigateTo({
			url: `detail?id=${e.currentTarget.dataset.id}`
		})
	},

	deleteAddress: function (e) {
		var that = this;
		console.log(e.currentTarget.dataset.id)

		wx.showModal({
			title: '',
			content: '确定要删除该地址？',
			success: res => {
				if (res.confirm) {
					request.delete('address', {
							id: e.currentTarget.dataset.id
						}).then(res => {
							console.log('delete address successfully', res)
							that.updateData()
						}).catch(err => {
							console.log('delete address failed', err)
						})
					console.log(e)
				}
			}
		})
	}
})
