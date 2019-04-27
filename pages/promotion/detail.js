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
    var addresses = this.getAddresses();

    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // get promotion info from server
    request.get('promotion', {
      id: options.id
    })
      .then(res => {
        console.log('promotion', res.data)
         var products = res.data.products.map(ele => {
          var p = ele.product
          p.is_deleted = ele.is_deleted
          p.promote_stock = ele.stock
          
          for (var ps of p.sizes) {
            if (ps.size.id === ele.size.id) {
              p.want_size = ps
              break
            }
          }
          if (p.summary.length > 80)
            p.summary = p.summary.slice(0, 70) + '...'

          return p
        }).filter(ele => !ele.is_deleted)
        //var products = []
        //res.data.products.forEach(ele => {
        //  var p = ele.product
        //  p.is_deleted = ele.is_deleted
        //  p.promote_stock = ele.stock
        //  // determine the size of product
        //  for (var ps of p.sizes) {
        //    if (ps.size.id === ele.size.id) {
        //      p.want_size = ps
        //      break
        //    }
        //  }
        //  //p.promote_stock = 36
        //  //p.promote_price = ele.price
        //  //p.promote_price += p.want_size.promote_price_plus
        //  if (p.summary.length > 80)
        //    p.summary = p.summary.slice(0, 70) + '...'
        //  products.push(p)
        //})

        // set addresses
        addresses.then(addrs => {
          addrs.map(addr => {
            var index = res.data.addresses.findIndex(item => addr.id === item.address.id)
            addr.checked = (index >= 0)
          })
          //addrs.forEach(addr => {
          //  console.log('sadfasdf', addr.id)
          //  var index = res.data.addresses.findIndex(item => addr.id === item.id)
          //  if (index > 0) {
          //    addr.checked = true
          //  } else
          //    addr.checked = false
          //})

          that.setData({
            addresses: addrs,
          })
        })

        // set delivery ways
        that.data.delivery_ways.map(way => way.checked = ((res.data.delivery_way & way.value) > 0))

        // set payments
        that.data.payments.map(payment => payment.checked = ((res.data.payment & payment.value) > 0))

        that.setData({
          id: res.data.id,
          name: res.data.name,
          products: products,
          //addresses: that.data.addresses,
          binding: res.data.binding,
          from_date: res.data.from_time.substr(0, 10),
          from_time: res.data.from_time.substr(11),
          last_order_date: res.data.last_order_time.substr(0, 10),
          last_order_time: res.data.last_order_time.substr(11),
          to_date: res.data.to_time.substr(0, 10),
          to_time: res.data.to_time.substr(11),
          publish: 1,
          publish_date: res.data.publish_time.substr(0, 10),
          publish_time: res.data.publish_time.substr(11),
          valuecard_allowed: res.data.valuecard_allowed,
          delivery_ways: that.data.delivery_ways,
          payments: that.data.payments,
          delivery_fee: res.data.delivery_fee,
          note: res.data.note
        });
        wx.setStorageSync('products_checked', {
          products: products,
          'timestamp': Date.now()
        });

        //that.getProducts();
        wx.hideLoading();
      })
      .catch(err => {
        console.log('get promotion error', err)
        var now = new Date();
        now.setDate(now.getDate() + 2)

        addresses.then(addrs => {
          var addrs_tmp = [];
          // set default selected addresses
          addrs.forEach(element => {
            if (element.checked)
              addrs_tmp.push(element.id);
          })

          console.log('addresses selected', addrs_tmp)
          that.setData({
            addresses: addrs,
            addrs_sel: addrs_tmp
          })
        })
        //var fromDateTime = new Date();
        //var toDateTime = new Date();
        //var lastOrderTime = new Date();
        //fromDateTime.setHours(14, 0, 0);
        //toDateTime.setHours(19, 0, 0);
        //lastOrderTime.setHours(8, 0, 0);
        that.setData({
          from_date: [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
          from_time: '14:00',
          to_date: [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
          to_time: '19:00',
          last_order_date: [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
          last_order_time: '08:00',
          publish_date: [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
          publish_time: '08:00'
        });
        wx.hideLoading();
      })
    //last_order_time: lastOrderTime.toLocaleTimeString('cn-ZH', {hour12: false, hour: '2-digit', minute: '2-digit'}),
  },

  addProduct: function (e) {
    wx.navigateTo({
      url: '/pages/product/list?type=promote'
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
    product.promote_stock = v
  },

  amountChange: function (e) {
    var v = parseInt(e.currentTarget.dataset.value);
    //var a = parseInt(this.data.order.amount);
    var index = parseInt(e.currentTarget.dataset.index);
    var product = this.data.products[index];

    if (product.promote_stock < 0)
      product.promote_stock = 0;

    if (v < 0) {
      if (product.promote_stock >= -v) {
        product.promote_stock += v;
        this.setData({
          products: this.data.products,
          //total_cost: this.calculateCost()
        });
      }
    } else if (v > 0) {
      product.promote_stock += v;
      this.setData({
        //promotion: this.data.promotion,
        products: this.data.products,
        //total_cost: this.calculateCost()
      });
    }
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
    //if (prefix == 'from')
    //    this.setData({'fromTime': e.detail.value});
    //else if (prefix == 'to')
    //    this.setData({'toTime': e.detail.value});
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
    //if (e.detail.value === "0") {
    //    this.setData({deliveryInputFlag: "none"});
    //} else {
    //    this.setData({deliveryInputFlag: "block"});
    //}
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

  startDragon: function (e) {
    console.log(e);
    if (this.data.products.length === 0) {
      wx.showModal({
        title: '团规商品',
        content: '没有选择团购商品',
        showCancel: false
      });

      return;
    } else {
      var p = this.data.products.filter(item => item.promote_stock < 0)
      if (p && p.length > 0) {
      wx.showModal({
        title: p[0].name,
        content: '该商品的团购库存不能是0',
        showCancel: false
      });

      return
      }
    }

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
    }

    wx.showLoading({
      title: '团购正在生成中，请稍候',
      mask: true
    })

    var data = {}
    data.products = this.data.products.map(p => {
      return {
        id: p.id,
        stock: p.promote_stock,
        size: p.want_size ? p.want_size.size.id : 0
      }
    })
    data.addresses = this.data.addresses.filter(item => item.checked).map(item => item.id)
    //data.delivery_ways = this.data.delivery_ways.filter(item => item.checked)
    //data.payments = this.data.payments.filter(item => item.checked)

    data.id = this.data.id
    data.binding = this.data.binding
    data.delivery_way = delivery_way
    data.payment = payment
    data.delivery_fee = delivery_fee * 100; // 转换成单位分
    data.name = e.detail.value.name;
    data.note = e.detail.value.note;
    data.last_order_date = this.data.last_order_date
    data.last_order_time = this.data.last_order_time
    data.from_date = this.data.from_date
    data.from_time = this.data.from_time
    data.to_date = this.data.to_date
    data.to_time = this.data.to_time
    data.publish_date = this.data.publish_date
    data.publish_time = this.data.publish_time
    data.to_remove = this.data.to_remove_products

    request.post('promotion', data)
      .then(res => {
        wx.hideLoading()
        wx.navigateBack();
      })
      .catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '团购生成失败，请检查数据',
          icon: 'none',
          duration: 2000
        })
        console.log('post promotion error', err)
      })
  }
})
