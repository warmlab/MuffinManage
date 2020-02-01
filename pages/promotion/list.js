// pages/promotion/publish.js
import config from '../../config.js'
import request from '../../utils/request.js'

const app = getApp()

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		base_image_url: config.base_image_url
	},

	updateData: function (that) {
		wx.showLoading({
			title: '团购信息加载中...',
			mask: true
		})
		var that = this;
		request.get('promotions', {
			manage: true,
			limit: 10
		}).then(res => {
			console.log('promotions', res)
			that.setData({
				promotions: res.data
			})
			wx.stopPullDownRefresh()
			wx.hideLoading()
		}).catch(err => {
			console.log('promotions', err)
			wx.stopPullDownRefresh()
			wx.hideLoading()
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.startPullDownRefresh()
	},

	onPullDownRefresh: function (res) {
		this.updateData()
	},

	exportPromotion: function (e) {
		wx.showLoading({
			title: '发送邮件中...'
		})
		request.put('promotion', {
			id: e.currentTarget.dataset.id
		}).then(res => {
			wx.hideLoading()
			wx.showToast({
				title: '邮件发送成功'
			})
		}).catch(err => {
			wx.hideLoading()
			wx.showToast({
				title: '邮件发送失败',
				icon: 'none'
			})
		})
	},

	toEditDetail: function (e) {
		wx.navigateTo({
			url: `detail?id=${e.currentTarget.dataset.id}`
		})
	},

	deletePromotion: function (e) {
		var that = this;
		console.log(e.currentTarget.dataset.id)

		wx.showModal({
			title: '',
			content: '确定要删除该团购？',
			success: function (res) {
				if (res.confirm) {

					request.delete('promotion', {
						id: e.currentTarget.dataset.id
					})
						.then(res => {
							console.log('delete promotion successfully', res)
							that.updateData()
						}).catch(err => {
							console.log('delete promotion failed', err)
						})
					console.log(e)
				}
			}
		})
	}
})
