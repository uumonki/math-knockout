// miniprogram/pages/scoreboard.js
var app = getApp();
Page({

  data: {
      monthRanking: [],
      totalRanking: [],
      monthOffset: 0,
      totalOffset: 0,
      monthScore: 0,
      totalScore: 0,
      pfpUrl: "",
      grade: 0,
      show: false, 
  },

  onLoad: function (options) {
    let that = this
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();

    
    db.collection('userInfo')
      .where({_openid:app.globalData.openid})
      .get({
        success: function (res){
            that.setData({
            monthScore:res.data[0].monthCorrect,
            totalScore:res.data[0].totalCorrect,
            pfpUrl: res.data[0].wechatInfo.avatarUrl,
            grade: res.data[0].userGrade
          })
          that.getMonthRanking(res.data[0].userGrade)
          that.getTotalRanking(res.data[0].userGrade)
        }
      })
    




  },

  getMonthRanking: function (grade) {
    let that = this
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();
    db.collection('userInfo')
    .orderBy('monthCorrect', 'desc') // descending order of 'monthCorrect' data of user
    .limit(20) // 10 query items maximum
    .where({userGrade: grade}) // same grade
    .get({
      success: function (res){
        //store the ranking info locally in monthRanking
        //ranking info: array of user objects, in descending order of monthly answered correctly
        that.setData({
          monthRanking: res.data
        })
      }
    })
  },

  getTotalRanking: function (grade) {
    //modified copy of onLoad.
    let that = this
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();

    db.collection('userInfo')
      .orderBy('totalCorrect', 'desc') // descending order of 'totalCorrect' data of user
      .limit(20) // 10 query items maximum
      .where({userGrade: grade})
      .get({
        success: function (res) {
          //store the ranking info locally in totalRanking
          //ranking info: array of user objects, in descending order of total answered correctly
          that.setData({
            totalRanking: res.data
          })
        }
      })
},

  func1: function() {
    this.setData({ show: false })
  },
  func2: function() {
    this.setData({ show: true })
  }
})
