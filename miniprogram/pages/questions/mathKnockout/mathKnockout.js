// miniprogram/pages/questions/mathKnockout/mathKnockout.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    score: 0,
    timer: 121,
    timerDisplay: "2:00"
  },

  timeUp: function(){ // CALLED WHEN TIMER IS UP, SCORE STORED IN this.data.score
    var scoreVal = this.data.score
    console.log("time's up :D")
    console.log("your score: " + scoreVal)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.startSetInter()

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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  startSetInter: function(){
    if (this.data.timer > 0) {
      var time = this.data.timer - 1
      this.setData({timer: time})
      var display = Math.floor(time/60) + ":" + ("0" + (time % 60)).slice(-2)
      this.setData({timerDisplay: display})
      setTimeout(this.startSetInter, 1000)
    } else this.timeUp()
  }

})