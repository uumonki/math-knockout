// miniprogram/pages/register.js
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that=this;
    wx.getStorage({
      key: 'userInfo',
      success(res){
        console.log('get storage success:',JSON.parse(res.data))
        that.setData({
          userInfo: JSON.parse(res.data)
        })
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
  bindGetUserInfo: function(e){
    console.log('bindGetUserInfo:',e) //授权登录
    //获取登录信息成功
    if(e.detail.userInfo){
      wx.setStorage({
        data: JSON.stringify(e.detail.userInfo), //JSON = 序列化
        key: 'userInfo',
        //check if storing userInfo is successful
        success(res){
          console.log('set storage success:',res)
        }
      })

      wx.getStorage({
        key: 'userInfo',
        //check if getting userInfo is successful
        success(res){
          console.log('get storage success:',JSON.parse(res.data))
          that.setData({
            userInfo: JSON.parse(res.data)
          })
        }
      })
      
    }else{
      //获取登录信息失败

    }

  },
})