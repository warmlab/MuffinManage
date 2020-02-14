import theme from './theme.js'
import request from './request.js'

const getShopInfo = () => {
  return new Promise((resolve, reject) => {
    var shop = wx.getStorageSync('appShopInfo')
    if (!!shop) {
      resolve(shop)
    } else {
      request.get('shopinfo').then(res => {
        wx.setStorageSync('appShopInfo', res.data)
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    }
  })
}

const getCategories = () => {
  return new Promise((resolve, reject) => {
    request.get('categories')
      .then(res => {
        resolve(res.data)
      }).catch(err => {
        console.error('get product categories error', err)
        reject(err)
      })
  })
}

const getSizes = () => { 
  return new Promise((resolve, reject) => { 
      request.get('product/sizes') 
          .then(res => { 
              resolve(res.data) 
          }).catch(err => { 
              console.error('get product sizes error', err) 
              reject(err) 
          }) 
  }) 
}

const get_infomation = (url, id) => {
  return new Promise((resolve, reject) => {
    request.get(url, {
        id: id
      })
      .then(res => {
        resolve(res.data)
      }).catch(err => {
        console.error('get request error', err)
        reject(err)
      })
  })
}

const getProductInfo = goods_code => {
  return new Promise((resolve, reject) => {
    request.get('product/info', {
        code: goods_code
      })
      .then(res => {
        resolve(res.data)
      }).catch(err => {
        console.error('get request error', err)
        reject(err)
      })
  })
}

const getCouponInfo = coupon_id => {
  return get_infomation('coupon/info', coupon_id)
}

const getProductsByCategory = category_id => {
  return new Promise((resolve, reject) => {
    request.get('products', {
        category: category_id,
        show_type: 1023,
        manage: 1
      })
      .then(res => {
        resolve(res.data)
      }).catch(err => {
        console.error('get product categories error', err)
        reject(err)
      })
  })
}

module.exports = {
  getShopInfo: getShopInfo,
  getCategories: getCategories,
  getSizes: getSizes,
  getProductsByCategory: getProductsByCategory,
  getProductInfo: getProductInfo,
  getCouponInfo: getCouponInfo
}
