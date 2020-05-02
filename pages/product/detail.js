// pages/product/publish.js
const app = getApp();

import config from '../../config.js'
import request from '../../utils/request.js'

import {
  getSizes,
  getCategories
} from '../../utils/resource.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    category: 0,
    //wrap_type: 1,
    images: [],
    images_choosed: [],
    web_allowed: true,
    promote_allowed: true,
    on_sale: true,
    on_recommend: true,
    detail_images: [],
    detail_images_choosed: [],
    to_remove_images: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    if (options.code === undefined || options.code === "0") {
      // to get category from server
      getCategories().then(res => {
        that.setData({
          categories: res
        })
      })

      return
    }

    this.setData({
      code: options.code
    })

    wx.showLoading({
      title: '商品信息加载中...',
      mask: true
    })

    request.get('product', {
      code: options.code
    }).then(res => {
      var images = []
      var detail_images = []
      res.data.images.forEach(image => {
        //if (image.type === 0) image.type = image.image.type
        if (image.type === 0 || (image.type & 1) === 1)
          images.push({
            path: `${config.base_image_url}/${image.image.name}`,
            index: image.index,
            id: image.image.id,
            type: 1
          })
        if ((image.type & 2) === 2)
          detail_images.push({
            path: `${config.base_image_url}/${image.image.name}`,
            index: image.index,
            id: image.image.id,
            type: 2,
          })
      })

      // to get category from server
      getCategories().then(res => {
        that.setData({
          categories: res
        })
      })

      // get sizes of the product
			getSizes().then(sizes => {
				that.setData({
					sizes: sizes
				})
			}).catch(err => {
				console.log("get product sizes error", err)
			})

      that.setData({
        product: res.data,
        category: res.data.category.id,
        //wrap_type: res.data.wrap_type,
				extra_info: res.data.category.extra_info,
				web_allowed: res.data.web_allowed,
				promote_allowed: res.data.promote_allowed,
        //on_sale: res.data.status & 0x01 === 0x01 ? true : false,
        //on_recommend: res.data.status & 0x04 === 0x04 ? true : false,
        //web_allowed: res.data.status & 0x08 === 0x08 ? true : false,
        //promote_allowed: res.data.status & 0x20 === 0x20 ? true : false,
        images: images,
        detail_images: detail_images
      })

      wx.hideLoading()
    }).catch(err => {
      wx.hideLoading()
      console.error('getting product error', err)
      // to get category from server
      getCategories().then(res => {
        that.setData({
          categories: res
        })
      })
    })

    wx.hideShareMenu()
  },

  categoryChange: function (e) {
    var index = parseInt(e.detail.value)
    var category = this.data.categories[index]
    console.log('category', category)
    this.setData({
      category: category.id,
    })
  },

  //wrapTypeChange: function (e) {
  //  this.setData({
  //    wrap_type: e.detail.value
  //  })
  //},

  webAllowChange: function (e) {
    this.setData({
      web_allowed: e.detail.value==='true' ? true : false
    })
  },

  promoteAllowChange: function (e) {
    this.setData({
      promote_allowed: e.detail.value==='true' ? true : false
    })
  },

  onSaleChange: function (e) {
    this.setData({
      on_sale: e.detail.value==='true' ? true : false
    })
  },

  recommendChange: function(e) {
    this.setData({
      on_recommend: e.detail.value==='true' ? true : false
    })
  },

  chooseImages: function (e) {
    var that = this;
    wx.chooseImage({
      success: function (res) {
        var details = that.data.images_choosed
        res.tempFilePaths.forEach(ele => {
          details.push({
            path: ele,
            type: 1
          })
        })
        console.log(details)
        that.setData({
          images_choosed: details
        })
      }
    })
  },

  chooseDetailImage: function (e) {
    var that = this
    wx.chooseImage({
      count: 9,
      success: function (res) {
        var details = that.data.detail_images_choosed
        res.tempFilePaths.forEach(ele => {
          details.push({
            path: ele,
            type: 2
          })
        })
        that.setData({
          detail_images_choosed: details,
        })
      }
    })
  },

  detailImageLoad: function (e) {
    var that = this
    console.log(e)
    wx.getSystemInfo({
      success: res => {
        var width = res.windowWidth
        that.setData({
          detail_width: '94%',
          detail_height: e.detail.height * (width / e.detail.width) * 0.94
        })
      }
    })
  },

  removeImage: function (e) {
    console.log(e)
    var index = parseInt(e.currentTarget.dataset.index)
    var source = e.currentTarget.dataset.source
    var type = e.currentTarget.dataset.type

    if (source === 'choosed') { // choosed
      if (type === 'banner') {
        this.data.images_choosed.splice(index, 1)
        this.setData({
          images_choosed: this.data.images_choosed
        })
      } else if (type === 'detail') {
        this.data.detail_images_choosed.splice(index, 1)
        this.setData({
          detail_images_choosed: this.data.detail_images_choosed
        })
      }
    } else if (source === 'original') {
      var to_remove_images = this.data.to_remove_images
      if (type === 'banner') {
        to_remove_images = to_remove_images.concat(this.data.images.splice(index, 1))
        this.setData({
          images: this.data.images,
          to_remove_images: to_remove_images
        })
      } else if (type === 'detail') {
        to_remove_images = to_remove_images.concat(this.data.detail_images.splice(index, 1))
        this.setData({
          detail_images: this.data.detail_images,
          to_remove_images: to_remove_images
        })
      }
    }
  },

  uploadImages: function (images) {
    //var banner_ids = [];
    var photo_ids = [];
    var that = this;

    return new Promise(function (resolve, reject) {
      // 如果产品图片没有做修改
      if (images.length === 0) {
        resolve(photo_ids)
      }

      wx.showLoading({
        title: '商品图片上传中...',
        mask: true
      })

      images.forEach((image, index) => {
        wx.uploadFile({
          url: `${config.base_url}/image`,
          filePath: image.path,
          name: 'upload-files',
          formData: image,
          header: request.header,
          success: function (res) {
            var data
            try {
              data = JSON.parse(res.data)
            } catch (err) {
              wx.hideLoading()
              reject(err)
            }
            console.log('upload detail successfully', data, image)
            photo_ids.push({
              id: data.id,
              index: index + 1,
              type: data.type
            })

            if (photo_ids.length === images.length) {
              wx.hideLoading()
              resolve(photo_ids)
            }
          },
          fail: function (err) {
            console.log('upload image error', err)
            wx.hideLoading()
            reject(err)
          }
        })
      })
    })
  },

  checkInput: function (data) {
    if (data.name.trim() === '') {
      wx.showToast({
        title: '需要给产品起个名字',
        icon: 'none',
        duration: 3000
      })

      return false
    }

    if (data.summary.trim() === '') {
      wx.showToast({
        title: '需要给产品写点摘要',
        icon: 'none',
        duration: 3000
      })

      return false
    }

    if (data.category == 0) {
      wx.showToast({
        title: '需要给产品指定分类',
        icon: 'none',
        duration: 3000
      })

      return false
    }

    // 将货币单位换算成分
    /*
    var price = parseFloat(data.original_price)
    if (Number.isNaN(price) || price <= 0) {
      wx.showToast({
        title: '需要给产品定个原始价格',
        icon: 'none',
        duration: 3000
      })

      return false
    }
    data.original_price = price * 100
    */

    var price = parseFloat(data.price)
    if (Number.isNaN(price) || price <= 0) {
      wx.showToast({
        title: '需要给产品定个售出价格',
        icon: 'none',
        duration: 3000
      })

      return false
    }
    data.price = price * 100

    price = parseFloat(data.member_price)
    if (Number.isNaN(price) || price <= 0) {
      data.member_price = data.price
    } else {
      data.member_price = price * 100
    }

    price = parseFloat(data.promote_price)
    if (Number.isNaN(price) || price <= 0) {
      wx.showToast({
        title: '需要给产品定个团购价格',
        icon: 'none',
        duration: 3000
      })

      return false
    }
    data.promote_price = price * 100

    /*
    if (data.original_price < data.price) {
      wx.showToast({
        title: '出售价格居然高于原始价格',
        icon: 'none',
        duration: 3000
      })

      return false
    }
    */

    if (data.member_price > data.price) {
      wx.showToast({
        title: '会员价格居然高于出售价格',
        icon: 'none',
        duration: 3000
      })

      return false
    }

    if (data.promote_price > data.price) {
      wx.showToast({
        title: '团购价格居然高于出售价格',
        icon: 'none',
        duration: 3000
      })

      return false
    }

    if (data.promote_price > data.member_price) {
      wx.showToast({
        title: '团购价格居然高于会员价格',
        icon: 'none',
        duration: 3000
      })

      return false
    }
    
    return true
  },

  saveProduct: function (e) {
    var that = this;

    var data = e.detail.value
    data.on_sale = this.data.on_sale
    data.on_recommend = this.data.on_recommend
    data.web_allowed = this.data.web_allowed
    data.promote_allowed = this.data.promote_allowed
    //data.wrap_type = this.data.wrap_type
    data.category = this.data.category

    if (!this.checkInput(data)) {
      return
    }
    if (that.data.images.length === 0 && this.data.images_choosed.length === 0) {
      wx.showToast({
        title: '请至少选择一张产品图片',
        icon: 'none',
        duration: 3000
      })

      return
    }

    console.log('update product', data)

    //var images_choosed = this.data.images_choosed.map(item => item)
    var images_choosed = this.data.images_choosed
    var images = images_choosed.concat(this.data.detail_images_choosed)
    //if (images_choosed) images_choosed.push({path: that.data.detail_images, index: 1, type: 2})
    var promise = this.uploadImages(images)
    promise.then(ids => {
      wx.showLoading({
        title: that.data.code ? '开始创建商品信息':'开始商品信息',
        mask: true
      })
      var data = e.detail.value
      data.category = that.data.category
      data.images = ids
      data.to_remove_images = that.data.to_remove_images
      if (that.data.product)
        data.code = that.data.product.code
      //data.price = data.price * 100
      //data.member_price = data.member_price * 100
      //data.promote_price = data.promote_price * 100
      console.log('post data:', data)
      request.post('product', data)
        .then(res => {
          wx.hideLoading()
          //var pages = getCurrentPages();
          //var prePage = pages[pages.length - 2];
          //prePage.setData({dragon:res.data});
          //prePage.syncProducts();
          wx.navigateBack()
        }).catch(err => {
          wx.hideLoading()
          wx.showToast({
            title: '提交失败请与管理员联系',
            icon: 'none',
            duration: 2000
          })
        })
    }).catch(err => {
      console.error('comfirm product erorr:', err)
      wx.hideLoading()
      wx.showToast({
        title: '上传图片失败',
        icon: 'none',
        duration: 2000
      })
    })
  },

  navigateBack: function (e) {
    wx.navigateBack()
  }
})
