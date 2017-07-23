Page({
  onTap: function (event) {
    // wx.navigateTo({    //接收一个对象
    //     url:"../post/post"
    // });
    wx.redirectTo({    //接收一个对象
      url: "../post/post"
    });
    // wx.switchTab({
    //   url: "../post/post"
    // });

  }
})