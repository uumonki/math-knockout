// miniprogram/pages/mathKnockoutHome/mathKnockoutHome.js
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

  redirect1: function () {
    wx.navigateTo({
      url: '../questions/mentalMath/mentalMath'
    })
  },

  redirect2: function () {
    wx.navigateTo({
      url: '../questions/24points/24points'
    })
  }
})