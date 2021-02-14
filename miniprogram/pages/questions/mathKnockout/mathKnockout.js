Page({ // can only load the page once

  /**
   * 页面的初始数据
   */
  data: {
    timer: 121,
    timerDisplay: "2:00",
    score: 0,
    timerId: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    clearTimeout(this.data.timerId)
    this.setData({ timer: 121 })
    this.setData({ timerDisplay: "2:00" })
    this.setData({ score: 0 })
    // this.updateCards()
    this.startSetInter()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearTimeout(this.data.timerId)
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

  timeUp: function () { // CALLED WHEN TIMER IS UP, SCORE STORED IN this.data.score
    var scoreVal = this.data.score
    console.log("time's up :D")
    console.log("your score: " + scoreVal)
  },

  submit: function () {
    this.setData({ error: "" })
    try {
      var correct = (evaluate(this.data.expression) == 24)
    }
    catch (e) {
      this.setData({ error: "error" })
      this.clear()
      return -1
    }
    if (correct && this.data.used.every(v => v === true)) {
      this.updateCards()
      if (this.data.timer > 0) this.setData({ score: this.data.score + 1 })
      this.clear()
    }
    else {
      this.setData({ error: "error" })
      this.clear()
    }
  },

  clear: function () {
    this.setData({ used: [false, false, false, false] })
    this.setData({ expression: "" })
  },

  startSetInter: function () {
    if (this.data.timer > 0) {
      var time = this.data.timer - 1
      this.setData({ timer: time })
      var display = Math.floor(time / 60) + ":" + ("0" + (time % 60)).slice(-2)
      this.setData({ timerDisplay: display })
      this.setData({ timerId: setTimeout(this.startSetInter, 1000) })
    } else this.timeUp()
  },
})
