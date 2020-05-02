// pages/promotion/publish.js
import config from '../../config.js'
import request from '../../utils/request.js'

const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		base_image_url: config.base_image_url,
		action_show: false
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
		})
			.then(res => {
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

	touchS: function (e) {
		console.log('start', e)
		if (e.touches.length == 1) {
			this.setData({
				//设置触摸起始点水平方向位置
				startX: e.touches[0].clientX
			});
		}
	},

	touchE: function (e) {
		console.log('end', e)
		if (e.changedTouches.length == 1) {
			//手指移动结束后水平位置
			var endX = e.changedTouches[0].clientX;
			//触摸开始与结束，手指移动的距离
			var disX = this.data.startX - endX;
			//如果距离小于删除按钮的1/2，不显示删除按钮
			if (disX > 100) {
				//获取手指触摸的是哪一项
				var index = parseInt(e.currentTarget.dataset.index);
				//更新列表的状态
				this.data.promotions[index].action_show = true
				this.setData({
					promotions: this.data.promotions
				})
			} else if (disX < -100) {
				//获取手指触摸的是哪一项
				var index = parseInt(e.currentTarget.dataset.index);
				//更新列表的状态
				this.data.promotions[index].action_show = false
				this.setData({
					promotions: this.data.promotions
				})

			}
		}
	},

	toViewOrders: function (e) {
		wx.navigateTo({
			url: `/pages/order/index?promotion=${e.currentTarget.dataset.id}`
		})
	},

	exportPromotion: function (e) {
		wx.showLoading({
			title: '发送邮件中...'
		})
		request.put('promotion', {
			id: e.currentTarget.dataset.id
		})
			.then(res => {
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
