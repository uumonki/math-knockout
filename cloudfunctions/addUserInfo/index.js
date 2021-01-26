// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'shsid-3tx38'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try{
    db.collection('userInfo').add({
      data:{
        answer: 'yusuke sucks'
      }
    })
    return event
  } catch(e) {
    console.log(e)
  }
}