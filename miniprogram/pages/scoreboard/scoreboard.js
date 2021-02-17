// miniprogram/pages/scoreboard.js
Page({

  data: {
      monthRanking: null,
      totalRanking: null,
      monthOffset: 0,
      totalOffset: 0
  },

  onLoad: function (options) {
    let that = this
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();

    db.collection('userInfo')
      .orderBy('monthCorrect', 'desc') // descending order of 'monthCorrect' data of user
      .limit(20) // 10 query items maximum
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

  getTotalRanking: function () {
    //modified copy of onLoad.
    let that = this
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();

    db.collection('userInfo')
      .orderBy('totalCorrect', 'desc') // descending order of 'totalCorrect' data of user
      .limit(20) // 10 query items maximum
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


  
})