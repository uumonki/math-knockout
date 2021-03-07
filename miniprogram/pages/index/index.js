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
    today: -2,
    rules: false,
    feedback: false
  },

  onShow: function () {
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
              } else that.incompleteInfo()
              
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
        that.setData({ 
          unavailable: u,
          today: parseInt(res.data[0].value)
        })
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
          that.incompleteInfo()
        }
      })
  },

  collectInfo: function () {
    wx.redirectTo({
      url: '../register/register',
    })
  },

  redirectToday: function () {
    const day = this.data.today
    switch (day) {
      case 0:
        wx.navigateTo({
          url: '../questions/24points/24points'
        })
        break
      case 1:
        wx.navigateTo({
          url: '../questions/mentalMath/mentalMath'
        })
        break
      case 2: 
        wx.navigateTo({
          url: '../questions/mathKnockout/mathKnockout?type=concept'
        })
        break
      case 3:
        wx.navigateTo({
          url: '../questions/mathKnockout/mathKnockout?type=geometry'
        })
        break
      case 4:
        wx.navigateTo({
          url: '../questions/riddle/riddle'
        })
        break
      case -1:
        wx.showToast({
          title: '敬请期待!',
          icon: 'none',
          duration: 1500
        })
        break
    }
  },

  showRules: function () {
    this.setData({rules: true})
  },

  showFeedback: function () {
    this.setData({feedback: true})
  },

  hide: function () {
    this.setData({
      rules: false,
      feedback: false
    })
  },

  submitFeedback: function (e) {
    const t = e.detail.value.feedback
    const c = e.detail.value.contact
    if (!(t === '' && c === ''))
      this.returnFeedback(t, c)
      this.hide()
  },

  onShareAppMessage: function () {

  },

  returnFeedback: function (t, c) {
    db.collection('userInfo')
    .where({_openid: app.globalData.openid})
    .get({
      success: function (res) {
        db.collection('feedback').add({
          data: {
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