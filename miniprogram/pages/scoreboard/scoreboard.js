// miniprogram/pages/scoreboard.js
Page({

  data: {
      monthRanking: null,
      totalRanking: null
  },

  onLoad: function (options) {
    let that = this
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();

    db.collection('userInfo')
      .orderBy('monthCorrect', 'desc') // descending order of 'monthCorrect' data of user
      .limit(10) // 10 query items maximum
      .get({
        success: function (res){
          console.log(res)
          that.setData({
            monthRanking: res.data
          })
        }
      })
    console.log(that.monthRanking)
  },

  
})