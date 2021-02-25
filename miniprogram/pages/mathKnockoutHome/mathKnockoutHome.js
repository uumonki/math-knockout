// miniprogram/pages/mathKnockoutHome/mathKnockoutHome.js
var app = getApp();
var db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {

  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
    this.incompleteInfo()
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  incompleteInfo: function () {
    var that = this
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const openid = app.globalData.openid
    db.collection('userInfo')
      .where({_openid: openid})
      .get({
        success: function (res) {
          var verified = res.data[0].verified
          if (typeof verified === 'undefined' || verified === null || verified === false) {
            that.collectInfo()
          }
        },
        fail: () => {
          that.collectInfo()
        }
      })
  },

  collectInfo: function () {
    wx.redirectTo({
      url: '../register/register',
    })
  },

  redirect1: function () {
    wx.navigateTo({
      url: '../questions/mentalMath/mentalMath'
    })
  },

  redirect2: function () {
    wx.navigateTo({
      url: '../questions/24points/24points'
    })
  },

  redirect3: function () {
    wx.navigateTo({
      url: '../questions/mathKnockout/mathKnockout?type=concept'
    })
  },

  redirect4: function () {
    wx.navigateTo({
      url: '../questions/mathKnockout/mathKnockout?type=geometry'
    })
  },

  redirect5: function () {
    wx.navigateTo({
      url: '../questions/mathKnockout/mathKnockout?type=riddle'
    })
  },
})