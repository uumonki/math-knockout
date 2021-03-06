// miniprogram/pages/scoreboard.js
const app = getApp();
const db = wx.cloud.database();

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
      day: 0,
      rank: 0
  },

  onLoad: function () {
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
  },

  onShow: function () {
    let that = this
    if (typeof app.globalData.openid === 'undefined') app.globalData.openid = ''
    db.collection('userInfo')
      .where({_openid:app.globalData.openid})
      .get({
        success: function (res) {
          db.collection('mathKnockoutSettings')
            .where({ setting: 'dayGame' })
            .get({
              success: function (res1) {
                const day = parseInt(res1.data[0].value)
                that.setData({
                  day: day,
                  monthScore: res.data[0]['dailyScore'+day],
                  totalScore: res.data[0].totalCorrect,
                  pfpUrl: res.data[0].wechatInfo.avatarUrl,
                  grade: res.data[0].userGrade
                })
                that.getRanking(res.data[0].userGrade, day)
              }
            })
        }, fail: (e) => {
          console.log(e)
        }
      })
  },

  getMonthRanking: function (grade, day) {
    let that = this
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();
    db.collection('userInfo')
    .orderBy('dailyScore'+day, 'desc') // descending order of 'monthCorrect' data of user
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

  getRanking: function (grade, day) {
    let that = this
    wx.cloud.callFunction({
      name: 'getRanking',
      data: {grade: grade},
      success: res => {
        var arr = res.result
        arr.sort((a, b) => b.totalCorrect - a.totalCorrect)
        that.setData({ totalRanking: arr })
        var totalRank = arr.map((a) => a._openid).indexOf(app.globalData.openid) + 1
        that.setData({ rank: totalRank })
        arr.sort((a, b) => b['dailyScore' + day] - a['dailyScore' + day])
        that.setData({ monthRanking: arr })
      },
    })

    /* 
    let that = this
    var arr = []          // 定义空数据 用来存储之后的数据
    var fetches = 0
    //初次循环获取云端数据库的分次数的promise数组
    for (let i = 0; i < 15; i++) {
      db.collection('userInfo').where({userGrade: grade}).skip(i*20).get({
        success: function (res) {
          fetches++
          arr = arr.concat(res.data)
        
          if(fetches === 15){
            arr.sort((a, b) => b.totalCorrect - a.totalCorrect)
            that.setData({ totalRanking: arr })
            var totalRank = arr.map((a) => a._openid).indexOf(app.globalData.openid) + 1
            that.setData({ rank: totalRank })
            arr.sort((a, b) => b['dailyScore' + day] - a['dailyScore' + day])
            that.setData({ monthRanking: arr })
          }
          
        }
      })
      
    } */   

  },

  onShareAppMessage: function () {

  },

  func1: function() {
    this.setData({ show: false })
  },
  func2: function() {
    this.setData({ show: true })
  }
})


