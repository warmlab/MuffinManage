const app = getApp();

import config from '../../config.js'
import request from '../../utils/request.js'

Page({
  data: {
    province: '山东省',
    city: '青岛市',
    district: '李沧区',
    from_time: '09:00',
    to_time: '21:00',
    available: true,
    checked: false
  },

  onLoad: function (options) {
    var that = this
    if (options.id && options.id != "0") {
      wx.showLoading({
        title: '加载中，请稍候',
        mask: true
      })
      request.get('pickupaddress', {
        code: options.id
      }).then(res => {
        console.log('pickup address info', res.data)
        that.setData({
          id: options.id,
          contact: res.data.contact,
          phone: res.data.phone,
          province: res.data.province,
          city: res.data.city,
          district: res.data.district,
          address: res.data.address,
          from_time: res.data.from_time,
          to_time: res.data.to_time,
          available: (res.data.status & 1) === 1,
          checked: (res.data.status & 2) === 2
        })
        wx.hideLoading()
      }).catch(err => {
        console.error(err)
        wx.hideLoading()
      })
    }
  },

  save: function (e) {
    var that = this;
    console.log('to save address', e);
    if (e.detail.value.contact.trim() === '') {
      wx.showToast({
        title: '您还没有写联系人',
        icon: 'none',
        duration: 2000
      });

      return;
    }
    if (e.detail.value.phone.trim() === '') {
      wx.showToast({
        title: '您还没有写联系电话',
        icon: 'none',
        duration: 2000
      });

      return;
    }

    if (e.detail.value.address.trim() === '') {
      wx.showToast({
        title: '您还没有写具体提货地址',
        icon: 'none',
        duration: 2000
      });

      return;
    }

    var status = 0
    if (that.data.available)
      status = 1
    if (that.data.checked)
      status = status | 2
    request.post('pickupaddress', {
      code: that.data.id,
      contact: e.detail.value.contact,
      phone: e.detail.value.phone,
      province: that.data.province,
      city: that.data.city,
      district: that.data.district,
      address: e.detail.value.address,
      from_time: that.data.from_time,
      to_time: that.data.to_time,
      status: status
    }).then(res => {
      console.log(res.data);
      var pages = getCurrentPages();
      var prePage = pages[pages.length - 2];
      var addrs = prePage.data.addresses;
      addrs.push(res.data);
      prePage.setData({
        addresses: addrs
      });

      wx.showToast({
        title: '地址更新成功',
        icon: 'success',
        duration: 2000
      });
      setTimeout(function () {
        wx.navigateBack();
      }, 1800);
    })
    //if (!a.has_empty) {
    //    a.next_seq++;
    //    a.addrs.push({'addr':'', 'seq': a.next_seq});
    //    a.has_empty = true;
    //    this.setData({'addr_add': a});
    //}
  },

  timeChange: function (e) {
    //var t = {}
    //t[e.currentTarget.dataset.name] = e.detail.value;
    //this.setData(t);
    this.setData({
      [e.currentTarget.dataset.name]: e.detail.value
    });
  },

  regionChange: function (e) {
    this.setData({
      province: e.detail.value[0],
      city: e.detail.value[1],
      district: e.detail.value[2]
    })
  },

  defaultAddress: function (e) {
    this.setData({
      checked: e.detail.value
    });
  },

  changeAvailable: function(e) {
    this.setData({
      available: e.detail.value
    })
  }
});
