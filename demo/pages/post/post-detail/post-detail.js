var postsData = require('../../../data/data.js')
var app = getApp();
Page({
  data: {
    isPlayingMusic: false
  },
  onLoad: function (option) {
    // console.log(option)
    var postId = option.id;//获取图文点击的id
    this.data.currentPostId = postId;//存该条数据id，收藏是调用
    var postData = postsData.postList[postId];//在所有详情数据中获取该条数据
    this.setData({
      postData: postData //把该条数据添加到data内
    })

    var postsCollected = wx.getStorageSync('posts_collected')
    //console.log(postsCollected)
    if (postsCollected) {// 判断有没有缓存（收藏）
      var postCollected = postsCollected[postId]
      this.setData({
        collected: postCollected
      })
    }
    else {
      var postsCollected = {};
      postsCollected[postId] = false;
      wx.setStorageSync('posts_collected', postsCollected);
    }

    if (app.globalData.g_isPlayingMusic && app.globalData.g_currentMusicPostId 
    === postId) {//判断进入详情页时音乐是否在播放（根据全局变量）改变当前详情播放图片
      this.setData({
        isPlayingMusic: true
      })
    }
    this.setMusicMonitor();//进入页面即调用此方法
  },

  setMusicMonitor: function () {
    //点击播放图标和总控开关都会触发这个函数
    var that = this;
    wx.onBackgroundAudioPlay(function (event) {//监听音乐播放
      var pages = getCurrentPages();
      var currentPage = pages[pages.length - 1];
      if (currentPage.data.currentPostId === that.data.currentPostId) {
        // 打开多个post-detail页面后，每个页面不会关闭，只会隐藏。通过页面栈拿到到
        // 当前页面的postid，只处理当前页面的音乐播放。
        if (app.globalData.g_currentMusicPostId == that.data.currentPostId) {
          // 播放当前页面音乐才改变图标
          that.setData({
            isPlayingMusic: true
          })
        }
        // if(app.globalData.g_currentMusicPostId == that.data.currentPostId )
        // app.globalData.g_currentMusicPostId = that.data.currentPostId;
      }
      app.globalData.g_isPlayingMusic = true;

    });
    wx.onBackgroundAudioPause(function () {//监听音乐暂停
      var pages = getCurrentPages();
      var currentPage = pages[pages.length - 1];
      if (currentPage.data.currentPostId === that.data.currentPostId) {
        if (app.globalData.g_currentMusicPostId == that.data.currentPostId) {
          that.setData({
            isPlayingMusic: false
          })
        }
      }
      app.globalData.g_isPlayingMusic = false;
      // app.globalData.g_currentMusicPostId = null;
    });
    wx.onBackgroundAudioStop(function () {
      that.setData({
        isPlayingMusic: false
      })
      app.globalData.g_isPlayingMusic = false;
      // app.globalData.g_currentMusicPostId = null;
    });
  },

  onColletionTap: function (event) {//点击收藏事件
    // this.getPostsCollectedSyc();
    this.getPostsCollectedAsy();//调用函数
  },

  getPostsCollectedAsy: function () {//异步调用
    var that = this;
    wx.getStorage({
      key: "posts_collected",
      success: function (res) {
        var postsCollected = res.data;
        var postCollected = postsCollected[that.data.currentPostId];//获取data已存的数据id
        // 收藏变成未收藏，未收藏变成收藏
        postCollected = !postCollected;
        postsCollected[that.data.currentPostId] = postCollected;
        that.showToast(postsCollected, postCollected);
        //that.showModal(postsCollected, postCollected); //确认弹框
      }
    })
  },

  // getPostsCollectedSyc: function () {//同步
  //   var postsCollected = wx.getStorageSync('posts_collected');
  //   var postCollected = postsCollected[this.data.currentPostId];
  //   // 收藏变成未收藏，未收藏变成收藏
  //   postCollected = !postCollected;
  //   postsCollected[this.data.currentPostId] = postCollected;
  //   this.showToast(postsCollected, postCollected);
  // },

  // showModal: function (postsCollected, postCollected) {
  //   var that = this;
  //   wx.showModal({
  //     title: "收藏",
  //     content: postCollected ? "收藏该文章？" : "取消收藏该文章？",
  //     showCancel: "true",
  //     cancelText: "取消",
  //     cancelColor: "#333",
  //     confirmText: "确认",
  //     confirmColor: "#405f80",
  //     success: function (res) {
  //       if (res.confirm) {
  //         wx.setStorageSync('posts_collected', postsCollected);
  //         // 更新数据绑定变量，从而实现切换图片
  //         that.setData({
  //           collected: postCollected
  //         })
  //       }
  //     }
  //   })
  // },

  showToast: function (postsCollected, postCollected) {
    // 更新文章是否的缓存值
    wx.setStorageSync('posts_collected', postsCollected);//设置缓存 键，值
    // 更新数据绑定变量，从而实现切换图片
    this.setData({
      collected: postCollected
    })
    wx.showToast({ //弹出框
      title: postCollected ? "收藏成功" : "取消成功",
      duration: 1000,
      icon: "success"
    })
  },

  onShareTap: function (event) { //分享
    var itemList = [
      "分享给微信好友",
      "分享到朋友圈",
      "分享到QQ",
      "分享到微博"
    ];
    wx.showActionSheet({//弹出框
      itemList: itemList,
      itemColor: "#405f80",
      success: function (res) {
        // res.cancel 用户是不是点击了取消按钮
        // res.tapIndex 数组元素的序号，从0开始
        wx.showModal({
          title: "用户 " + itemList[res.tapIndex],
          content: "用户是否取消？" + "现在无法实现分享功能，请您先登录"
        })
      }
    })
  },

  onMusicTap: function (event) { //播放音乐
    var currentPostId = this.data.currentPostId;
    var postData = postsData.postList[currentPostId];
    var isPlayingMusic = this.data.isPlayingMusic;
    if (isPlayingMusic) {
      wx.pauseBackgroundAudio();
      this.setData({
        isPlayingMusic: false
      })
      // app.globalData.g_currentMusicPostId = null;
      app.globalData.g_isPlayingMusic = false;
    }
    else {
      wx.playBackgroundAudio({
        dataUrl: postData.music.url,
        title: postData.music.title,
        coverImgUrl: postData.music.coverImg,
      })
      this.setData({
        isPlayingMusic: true
      })
      app.globalData.g_currentMusicPostId = this.data.currentPostId;
      app.globalData.g_isPlayingMusic = true;
    }
  },

  /*
  * 定义页面分享函数
  */
  onShareAppMessage: function (event) {
    return {
      title: '离思五首·其四',
      desc: '曾经沧海难为水，除却巫山不是云',
      path: '/pages/posts/post-detail/post-detail?id=0'
    }
  }

})