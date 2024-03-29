// miniprogram/pages/mathKnockoutHome/mathKnockoutHome.js
var app = getApp();
var db = wx.cloud.database();

Page({

  /**
   * Page initial data
   */
  data: {
    color: 0,
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
    var that = this
    db.collection('mathKnockoutSettings') 
      .where({setting: 'dayGame'})
      .get({
        success: function (res) {
        that.setData({color: parseInt(res.data[0].value)+1})
    }
  }) 
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
          if ((typeof verified === 'undefined' || verified === null || verified === false) && !app.globalData.justVerified) {
            that.collectInfo()
          }
        },
        fail: () => {
          wx.switchTab({
            url: '../index/index',
          })
        }
      })
  },

  collectInfo: function () {
    wx.navigateTo({
      url: '../register/register',
    })
  },

  redirect1: function () {
    // if (this.data.color==1)
      wx.navigateTo({
        url: '../questions/24points/24points'
      })
  },

  redirect2: function () {
    // if (this.data.color==2)
      wx.navigateTo({
        url: '../questions/mentalMath/mentalMath'
      })
  },

  redirect3: function () {
    // if (this.data.color==3)
      wx.navigateTo({
        url: '../questions/mathKnockout/mathKnockout?type=concept'
      })
  },

  redirect4: function () {
    // if (this.data.color==4)
      wx.navigateTo({
        url: '../questions/mathKnockout/mathKnockout?type=geometry'
      })
  },

  redirect5: function () {
    // if (this.data.color==5)
      wx.navigateTo({
        url: '../questions/riddle/riddle'
      })
  },

  redirect6: function () {
    wx.navigateTo({
      url: '../scoreboard/scoreboard'
    })
  },
})