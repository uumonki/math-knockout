// miniprogram/pages/filter/filter.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tags: [0, 0, 0, 0], 
    /* EACH ELEMENT IN tags REPRESENTS THE OPTION CHOSEN FOR A ROW
     * OPTIONS ARE REPRESENTED WITH 0 ~ 5 FROM LEFT TO RIGHT
     * E.G. [5, 0, 2, 1] REPRESENTS 计算机, 全部题型, 二星, 未作答 */
    selectionDisplay: [], // USED TO CONTROL UI
    optionCount: [6, 3, 6, 4], // NUMBER OF OPTIONS FOR EACH ROW
    optionText: [["全部学科", "数学", "物理", "化学", "生物", "计算机"], ["全部题型", "选择题", "填空题"], ["全部星级", "一", "二", "三", "四", "五"], ["全部状态", "未作答", "已答对", "已答错"]],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // INITIALIZE DISPLAY
    var display = []
    for (var i = 0; i < 4; i++) {
      let displayRow = ["selected"]
      for (var j = 0; j < this.data.optionCount[i] - 1; j++) { displayRow.push("unselected") }
      display.push(displayRow)
    }
    this.setData({selectionDisplay: display})
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

  selectTag: function(event) { // UPDATES tags AND DISPLAY WHEN AN OPTION IS CHOSEN
    let row = event.currentTarget.dataset.row
    let option = event.currentTarget.dataset.option
    var tagsSelected = this.data.tags
    tagsSelected[row] = option
    this.setData({tags: tagsSelected})
    this.updateDisplay()
  },

  updateDisplay: function() { // CONTROLS UI FOR OPTION SELECTION
    var display = this.data.selectionDisplay
    for (var i = 0; i < 4; i++) {
      let displayRow = []
      for (var j = 0; j < this.data.optionCount[i]; j++) { displayRow.push("unselected") }
      displayRow[this.data.tags[i]] = "selected"
      display[i] = displayRow
    }
    this.setData({selectionDisplay: display})
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

  }
})

