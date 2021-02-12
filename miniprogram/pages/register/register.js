// miniprogram/pages/register.js
var db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    realName: '',
    userClass: '',
    userGnum: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*wx.getStorage({
      key: 'userInfo',
      success(res){
        console.log('get storage success:',JSON.parse(res.data))
        that.setData({
          userInfo: JSON.parse(res.data)
        })
      }
    })*/
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
  userNameInput: function(e){
    console.log(e.detail.value)
    this.setData({
      realName: e.detail.value
    })
  },
  userClassInput: function(e){
    console.log(e.detail.value)
    this.setData({
      userClass: e.detail.value
    })
  },
  userGnumInput: function(e){
    console.log(e.detail.value)
    this.setData({
      userGnum: e.detail.value
    })
  },

  InputuserInfo: function (){
    var that = this;
    if (this.data.realName.length==0||this.data.userClass==0||this.data.userGnum==0){
      wx.showToast({
        title: '请填完整所有的信息',
        icon: 'none',
        duration: 2000
      })
    }else{
      wx.request({
        url: 'http://localhost/test/getopenid.php', // 仅为示例，并非真实的接口地址
        method: 'post',
        data: {
          realName: that.data.realname,
          class: that.data.userclass,
          Gnum: that.data.userGnum,
          time: new Date()
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success(res) {
          if (res.data.code == "OK") {
            var unitName = res.data.data.User.unitName;
            var unitId = res.data.data.User.unitId;
            wx.setStorageSync('unitId', unitId);
            wx.setStorageSync('unitName', unitName);
            wx.setStorageSync('realName', res.data.realName);
            wx.setStorageSync('userClass', res.data.userClass);
            wx.setStorageSync('userGnum', res.data.userGnum);
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    }
    }
    /*db.collection("userInfo").add({
      data:{
        realName: this.data.realname,
        class: this.data.userclass,
        Gnum: this.data.userGnum,
        time: new Date()
      }
    })
    .then(res => {
      console.log('add userinfo sucess', res)
    })
    .catch(console.error)
  }*/

  /*bindGetUserInfo: function(e){
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

  },*/
  
})
