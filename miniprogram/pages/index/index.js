// miniprogram/pages/index/index.js
const app = getApp();
const db = wx.cloud.database();
const subjects = ['24点', '速算', '概念', '几何', '数字谜'];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    unavailable: [],
    rules: false,
    feedback: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
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
                    that.incompleteInfo()
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
        if (parseInt(res.data[0].value) > -1) array.splice(array.indexOf(parseInt(res.data[0].value)), 1)
        const u = array.map((a) => subjects[a])
        console.log(u)
        that.setData({ unavailable: u })
      }
    })
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
          that.onLoad()
        }
      })
  },

  collectInfo: function () {
    wx.redirectTo({
      url: '../register/register',
    })
  },

  redirectToday: function () {
    console.log("BITCH")
  },

  showRules: function () {
    this.setData({rules: true})
  },

  hide: function () {
    this.setData({
      rules: false,
      feedback: false
    })
  },

  submitFeedback: function (e) {
    console.log(e.detail.value)
    const t = e.detail.value.feedback
    const c = e.detail.value.contact
    if (!(t === '' && c === ''))
      console.log("1")
      this.returnFeedback(t, c)
      this.hide()
  },

  returnFeedback: function (t, c) {
    db.collection('userInfo')
    .where({_openid: app.globalData.openid})
    .get({
      success: function (res) {
        db.collection('feedback').add({
          data: {
            _openid: app.globalData.openid,
            userData: res.data[0],
            text: t,
            contact: c
          },
          success: function () {
            wx.showToast({
              title: '反馈成功!',
            })
          }
        })
      }
    })
  }
})