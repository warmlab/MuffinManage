import config from '../../config.js'
import request from '../../utils/request.js'

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    base_image_url: config.base_image_url,
    products: [],
    to_remove_products: [],
    addrs_sel: [],
    //fromDate: "",
    //fromTime: "",
    //toDate: "",
    //toTime: "" 

    promotion_id: 0,
    promote_type: 1, // 1-热卖 2-上新 4-特价 8-预售 
    binding: false,
    payment_method: 1,
    publish: 0,
    valuecard_allowed: false,
    delivery_ways: [{
      value: 1,
      name: '自提',
      checked: true
    }, {
      value: 2,
      name: '快递',
      checked: true
    }],
    payments: [{
      value: 4,
      name: '微信支付',
      checked: true
    }, {
      value: 2,
      name: '储值卡支付',
      checked: true
    }],
    //delivery_way: 3, // 取货方式 1-自提 2-快递
    delivery_fee: 1000,
    prepay_flag: 1
    //is_infinite: false,
    //is_overflow: false,

  },

  getSelectedProducts: function () {
    // get products from storage
    var products = wx.getStorageSync('products_checked') || {
      timstamp: 0
    };

    if (Date.now() - products.timestamp < 24 * 60 * 60 * 1000) {
      this.setData({
        "products": products.products
      });
    }
  },

  // get pickup addresses
  getAddresses: function () {
    var that = this;
    return new Promise((resolve, reject) => {
      request.get('addresses')
        .then(res => {
          console.log('pickup addresses', res)
          resolve(res.data)
        })
        .catch(err => {
          reject(err)
        })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    wx.hideShareMenu();
    // get selected products
    //that.getSelectedProducts();
    // get pickup addresses
    //var addresses = this.getAddresses();

    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // get promotion info from server
    request.get('promotion', {
      id: options.id
    }).then(res => {
      console.log('promotion', res.data)
      var products = res.data.products.map(ele => {
        var p = ele.product
        p.is_deleted = ele.is_deleted
        //p.promote_stock = ele.promote_stock < 0 ? 0 : ele.promote_stock
        //p.stock = ele.stock <= 0 ? 36 : ele.stock

        //for (var ps of p.sizes) {
        //  if (ps.size.id === ele.size.id) {
        //    p.want_size = ps
        //    break
        //  }
        //}

        return p
      }).filter(ele => !ele.is_deleted)

      that.setData({
        id: res.data.id,
        name: res.data.name,
        promote_type: res.data.type,
        products: products,
        from_date: res.data.from_time.substr(0, 10),
        from_time: res.data.from_time.substr(11),
        to_date: res.data.to_time.substr(0, 10),
        to_time: res.data.to_time.substr(11),
        note: res.data.note
      });
      wx.setStorageSync('products_checked', {
        products: products,
        'timestamp': Date.now()
      });

      //that.getProducts();
      wx.hideLoading();
    }).catch(err => {
      console.log('get promotion error', err)
      var now = new Date();

      that.setData({
        from_date: [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
        from_time: '7:00',
        to_date: [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
        to_time: '19:00',
      });
      wx.hideLoading();
    })
    //last_order_time: lastOrderTime.toLocaleTimeString('cn-ZH', {hour12: false, hour: '2-digit', minute: '2-digit'}),
  },

  addProducts: function (e) {
    wx.navigateTo({
      url: '/pages/product/list?type=choice'
    });
  },

  removeProduct: function (e) {
    var index = parseInt(e.currentTarget.dataset.index)
    var p = this.data.products.splice(index, 1)
    this.data.to_remove_products.push({id: p[0].id})
    console.log(this.data.to_remove_products)
    this.setData({
      products: this.data.products,
      to_remove_products: this.data.to_remove_products
    })
  },

  amountSet: function (e) {
    var v = parseInt(e.detail.value);
    //var a = parseInt(this.data.order.amount);
    var index = parseInt(e.currentTarget.dataset.index);
    var product = this.data.products[index];
    product.stock = v
  },

  amountChange: function (e) {
    var v = parseInt(e.currentTarget.dataset.value);
    //var a = parseInt(this.data.order.amount);
    var index = parseInt(e.currentTarget.dataset.index);
    var product = this.data.products[index];

    if (product.stock < 0)
      product.stock = 0;

    if (v < 0) {
      if (product.stock >= -v) {
        product.stock += v;
        this.setData({
          products: this.data.products,
          //total_cost: this.calculateCost()
        });
      }
    } else if (v > 0) {
      product.stock += v;
      this.setData({
        //promotion: this.data.promotion,
        products: this.data.products,
        //total_cost: this.calculateCost()
      });
    }
  },

  promoteTypeChange: function(e) {
    var promote_type = this.data.promote_type
    var value = parseInt(e.currentTarget.dataset.value)
    if ((promote_type & value) > 0)
    this.setData({
      promote_type: promote_type & ~value
    })
    else
    this.setData({
      promote_type: promote_type | value
    })
  },

  productsBindSwitch: function (e) {
    this.setData({
      binding: e.detail.value === 'true' ? true : false,
    });
  },

  timeChange: function (e) {
    console.log('date time change', e.detail.value, this.data.from_time);
    this.setData({
      [e.currentTarget.dataset.name]: e.detail.value
    });
  },

  allowMember: function (e) {
    this.setData({
      valuecard_allowed: e.detail.value
    });
  },

  deliveryChange: function (e) {
    var index = parseInt(e.currentTarget.dataset.index)
    var ways = this.data.delivery_ways
    ways[index].checked = !ways[index].checked
    this.setData({
      delivery_ways: ways
    });
  },

  addressChange: function (e) {
    var index = parseInt(e.currentTarget.dataset.index)
    var addrs = this.data.addresses
    addrs[index].checked = !addrs[index].checked
    this.setData({
      addresses: addrs
    })
  },

  newAddressPage: function (e) {
    wx.navigateTo({
      url: '/pages/manage/address'
    });
  },

  paymentChange: function (e) {
    var index = parseInt(e.currentTarget.dataset.index)
    var arr = this.data.payments
    arr[index].checked = !arr[index].checked
    this.setData({
      payments: arr
    })
  },

  publishChange: function (e) {
    this.setData({
      publish: parseInt(e.detail.value)
    });
  },

  updateProducts: function (ps) {
    var that = this
    var products = this.data.products
    var arr = ps.filter(item => that.data.products.findIndex(ele => ele.id === item.id) < 0)
    //products.concat(arr)
    
    this.setData({
      products: products.concat(arr)
    })
  },

  startPromote: function (e) {
    console.log(e);
    if (this.data.products.length === 0) {
      wx.showModal({
        title: '选择商品',
        content: '没有选择活动商品',
        showCancel: false
      });

      return;
    } else {
      var p = this.data.products.filter(item => item.stock < 0)
      if (p && p.length > 0) {
      wx.showModal({
        title: p[0].name,
        content: '该商品库存不能小于0',
        showCancel: false
      });

      return
      }
    }

    /*
    var addrs = this.data.addresses.filter(item => item.checked)
    console.log('addrs', addrs)
    if (addrs.length === 0) {
      wx.showModal({
        title: '取货地址',
        content: '请选择至少一个取货地址',
        showCancel: false
      });

      return;
    }

    var delivery_way = 0
    this.data.delivery_ways.forEach(item => {
      if (item.checked) delivery_way |= item.value
    })
    if (delivery_way === 0) {
      wx.showModal({
        title: '取货方式',
        content: '请选择至少一种取货方式',
        showCancel: false
      });

      return;
    }

    var delivery_fee = parseFloat(e.detail.value.delivery_fee);
    if (this.data.delivery_ways[1].checked && (isNaN(delivery_fee) || delivery_fee < 0)) {
      wx.showModal({
        title: '运费',
        content: '运费没输入或小于0',
        showCancel: false
      });

      return;
    }

    var payment = 0
    this.data.payments.forEach(item => {
      if (item.checked) payment |= item.value
    })
    if (payment === 0) {
      wx.showModal({
        title: '付款方式',
        content: '请选择至少一种付款方式',
        showCancel: false
      });

      return;
    } */

    wx.showLoading({
      title: '促销正在生成',
      mask: true
    })

    var data = {}
    data.products = this.data.products.map(p => {
      return {
        id: p.id,
        stock: p.stock,
        size: p.want_size ? p.want_size.size.id : 0
      }
    })
    //data.addresses = this.data.addresses.filter(item => item.checked).map(item => item.id)
    //data.delivery_ways = this.data.delivery_ways.filter(item => item.checked)
    //data.payments = this.data.payments.filter(item => item.checked)

    data.id = this.data.id
    data.promote_type = this.data.promote_type
    //data.binding = this.data.binding
    //data.delivery_way = delivery_way
    //data.payment = payment
    //data.delivery_fee = delivery_fee * 100; // 转换成单位分
    //data.name = e.detail.value.name;
    //data.note = e.detail.value.note;
    //data.last_order_date = this.data.last_order_date
    //data.last_order_time = this.data.last_order_time
    data.from_date = this.data.from_date
    data.from_time = this.data.from_time
    data.to_date = this.data.to_date
    data.to_time = this.data.to_time
    //data.publish_date = this.data.publish_date
    //data.publish_time = this.data.publish_time
    data.to_remove = this.data.to_remove_products

    request.post('promotion', data)
      .then(res => {
        wx.hideLoading()
        wx.showModal({
          title: '促销生成成功',
          showCancel: false
        })
        wx.navigateBack();
      })
      .catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '促销生成失败，请检查数据',
          icon: 'none',
          duration: 2000
        })
        console.log('post promotion error', err)
      })
  }
})
