// miniprogram/pages/index/index.js
const app = getApp();
const db = wx.cloud.database();
const subjects = ['24点', '速算', '概念', '几何', '数字谜'];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    unavailable: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    this.getUserData()
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    //get openid of user and store it in app.globalData.openid
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        //call 'login' cloud function
        app.globalData.openid = res.result.openid
        db.collection('userInfo').where({
          _openid: app.globalData.openid
        })
          .get({
            success: function (res) {
              // if the user openid is not in database
              if (res.data.length == 0) {
                // create new user object in database
                db.collection('userInfo').add({
                  data: {
                    wechatInfo: app.globalData.userInfo,
                    monthAnswer: 0, //number answered every month
                    monthCorrect: 0, // number of questions answered correctly every month
                    totalAnswer: 0, //total number of questions answered
                    totalCorrect: 0, // total number of questions answered correctly
                    record: [],
                    dailyScore0: 0, // math knockout daily scores
                    dailyScore1: 0,
                    dailyScore2: 0,
                    dailyScore3: 0,
                    dailyScore4: 0,
                  },
                  success: function (res) {
                    //if success, log the new userinfo object
                    console.log(res)
                  }
                })
              }
            }
          })
        },
        fail: e => {
          console.error(e)
        }
      })
    db.collection('mathKnockoutSettings')
    .where({ setting: 'dayGame' })
    .get({
      success: function (res) {
        var array = [0, 1, 2, 3, 4]
        array.splice(array.indexOf(parseInt(res.data[0].value)), 1)
        const u = array.map((a) => subjects[a])
        console.log(u)
        that.setData({ unavailable: u })
      }
    })
  },

  getUserData: function () {
    let that = this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              //info stored into global data; can be called anytime
              app.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
})