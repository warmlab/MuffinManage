import config from '../../config.js'
import theme from '../../utils/theme.js'
import request from '../../utils/request.js'

import {
  WEB_ALLOWED,
  POS_ALLOWED,
  PROMOTE_ALLOWED,
  getCategories,
  getProductsByCategory
} from '../../utils/resource.js'

const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    NAV_WIDTH: wx.getSystemInfoSync().windowWidth,
    NAV_OFFSET: 0,
    title_name: '管理产品',
    base_image_url: config.base_image_url,
    goods: [],
    limit: 99,
    goods_checked: [],
    openAttr: false,

    current_checked_ids: []
  },

  getCheckedGoods: function () {
    // get products from storage
    var goods = wx.getStorageSync('coupon_goods') || []
    this.setData({
      "coupon_goods": goods
    })
  },

  onPullDownRefresh: function (e) {
    var that = this
    //this.syncGoods()
    getProductsByCategory(this.data.category_id).then(products => {
      that.setData({
        //category_id: category_id,
        //goods_checked: that.data.goods_checked[that.data.category_id],
        goods: products
      })
      wx.hideLoading()
    }).catch(err => {
      console.error('get products by category error:', err)
      wx.hideLoading()
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    this.setData({
      type: options.type
    })
    getCategories().then(categories => {
      if (!categories) {
        wx.showModal({
          content: "找不到分类，请联系管理员",
          showCancel: false,
          confirmColor: theme.color,
          confirmText: "我知道了",
        })

        return
      }

      that.setData({
        categories: categories,
        category_id: categories[0].id
      })

      //分类下对应的商品
      getProductsByCategory(categories[0].id).then(products => {
        that.setData({
          //summary: summary,
          goods: products
        })
        wx.hideLoading()
      }).catch(err => {
        console.error('get products by category error:', err)
        wx.hideLoading()
      })
    }).catch(err => {
      console.error('get categories error', err)
      wx.hideLoading()
    })
  },

  handleChange: function (e) {
    var that = this
    console.log('index', e)
    var index = e.currentTarget.dataset.index //传过来的数值
    var category_id = that.data.categories[index].id
    var summary = that.data.categories[index].summary
    //分类下对应的商品
    wx.showLoading({
      title: "加载中..."
    })

    //console.log('goods_checked', that.data.goods_checked[`${that.data.type}_${category_id}`])
    getProductsByCategory(category_id).then(products => {
      /*
      products.forEach(ele => {
        var goods_checked = that.data.goods_checked[`${that.data.type}_${category_id}`]
        if (goods_checked) {
          var product = goods_checked.find(item => {
            return item.id === ele.id
          })
          if (!!product)
            ele.checked = true
        }
      })*/
      that.setData({
        category_id: category_id,
        //goods_checked: that.data.goods_checked[category_id],
        summary: summary,
      })
      that.updateCheckedNumber(products, that.data.current_checked_ids)
      wx.hideLoading()
    }).catch(err => {
      console.error('get products by category error:', err)
      wx.hideLoading()
    })

    // auto center the selected category
    this.setData({
      NAV_OFFSET: e.currentTarget.offsetLeft - this.data.NAV_WIDTH / 2
    })
  },

  goodsCheck: function (e) {
    console.log(e)
    //var ps = []

    //this.data.products.forEach(ele => {
    //	ele.checked = false
    //})
    //var goods_checked = wx.getStorageSync('goods_checked')
    //wx.setStorageSync({
    //  goods_checked: goods_checked
    //})

    //var to_unchecked_indexs = Array.from(this.data.goods_indexes)
    var index = parseInt(e.currentTarget.dataset.index)
    var id = parseInt(e.currentTarget.dataset.id)
    var product = this.data.goods[index]
    //var name = e.currentTarget.dataset.name

    //ps[index].checked = true
    var pos = this.data.current_checked_ids.findIndex(item => {
      return item.id === id
    })
    if (pos >= 0) {
      this.data.current_checked_ids.splice(pos, 1)
      product.checked = false
      product.index = 0
    } else {
      this.data.current_checked_ids.push(product)
      //this.data.current_checked_ids.push({
      //  id: id,
      //  name: product.name,
      //  summary: product.summary,
      //  price: product.price,
      //  promote_price: product.promote_price,
      //  promote_stock: product.promote_stock,
      //  image: product.images[0].image.name
      //})
    }

    if (this.data.limit < this.data.current_checked_ids.length) {
      if (this.data.limit === 1) {
        var tmp = this.data.current_checked_ids.shift()
        var o = this.data.goods.find(item => {
          return tmp.id === item.id
        })
        o.checked = false
        o.index = 0
      } else {
        this.data.current_checked_ids.pop()

        wx.showModal({
          content: `最多可选取${this.data.limit}个商品，已达到最大数量`,
          showCancel: false,
          confirmColor: theme.color,
          confirmText: "我知道了",
        })

        return
      }
    }

    this.updateCheckedNumber(this.data.goods, this.data.current_checked_ids)
    //var p = that.data.goods[index]
    //current_checked.push(index)
    //var pos = that.data.goods_indexes.indexOf(index)
    //this.data.goods_checked[`${this.data.type}_${this.data.category_id}`] = current_checked
    //console.log('goodsChecked function', this.data.goods_checked[`${this.data.type}_${this.data.category_id}`])
  },

  updateCheckedNumber: function (goods, ids) {
    ids.map((item, i) => {item.index=i+1})
    console.log(ids)
    goods.forEach(ele => {
      var o = ids.find(item => {
        return item.id === ele.id
      })
      if (o) {
        ele.checked = true
        ele.index = o.index
      }
    })

    this.setData({
      goods: goods
    })
  },

  selectionConfirm: function (e) {
    console.log(e);
    var that = this;
    //var products = []
    //this.data.goods_checked.forEach(ele => {
    //  var product = that.data.products[ele]
    //  product.is_deleted = false
    //  if (product.promote_stock < 0)
    //    product.promote_stock = 36

    //  products.push(product)
    //})
    //wx.removeStorage({key:'products_checked'});
    //wx.setStorageSync({
    //  'coupon_goods': this.data.goods_checked
    //});

    if (this.data.type === 'coupon' || this.data.type === 'promote') {
      var pages = getCurrentPages();
      var prePage = pages[pages.length - 2];

      //var all_checked = []
      //that.data.categories.forEach(ele => {
      //  var tmp = that.data.goods_checked[`${that.data.type}_${ele.id}`]
      //  if (tmp && tmp.length > 0)
      //    Array.prototype.push.apply(all_checked, tmp)
      //})
      console.log(this.data.current_checked_ids)
      prePage.updateProducts(this.data.current_checked_ids)
    } else if (this.data.type === 'ad') {
      var pages = getCurrentPages();
      var prePage = pages[pages.length - 2];

      prePage.setData({
        to_goods: this.data.current_checked_ids[0]
      })
    }

    wx.navigateBack({
      delta: 1
    });
  },

  clearSelection: function (e) {
    wx.removeStorage({
      key: 'products_checked'
    })

    this.data.products.forEach(ele => {
      ele.checked = false;
    })
    this.setData({
      goods_indexes: [],
      products: this.data.products
    })

    var pages = getCurrentPages();
    var prePage = pages[pages.length - 2];

    prePage.setData({
      products: []
    })
  },

  toEditDetail: function (e) {
    wx.navigateTo({
      url: `detail?code=${e.currentTarget.dataset.code}`
    })
  },

  navigateBack: function (e) {
    wx.navigateBack()
  }
})
