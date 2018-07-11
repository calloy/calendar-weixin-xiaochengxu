var calendar = require('../../utils/base.js').calendar;
var weeks = Array("周日", "周一", "周二", "周三", "周四", "周五", "周六")
Page({
  data: {
    weeks_ch: ["一", "二", "三", "四", "五", "六", "日"],
    date: "2017-02-19",
    indexNumber: 2,
    duration: 500
  },
  onLoad: function (options) {
    this._loadData();
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成
  },
  onShow: function () {
    // 处理设置页面返回，重新加载数据问题
    this._loadData();

  },
  onHide: function () {
    // 生命周期函数--监听页面隐藏
  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载
  },
  onPullDownRefresh: function () {
    // 页面相关事件处理函数--监听用户下拉动作
  },
  onReachBottom: function () {
    // 页面上拉触底事件的处理函数
  },
  onShareAppMessage: function () {
    // 用户点击右上角分享
    return {
      title: '定制日历', // 分享标题
      desc: '这是一个定制版的排班日历，支持任意上班方式，偶尔YY下假期还是不错的。', // 分享描述
      path: 'pages/calendar/calendar' // 分享路径
    }
  },

  bindDateChange: function (e) {
    //日期选择-开始上班日期
    this.setData({
      date: e.detail.value
    })
    //保存选择的开始日期
    wx.setStorageSync('start_date', e.detail.value)
    //更新数据
    var tday = theday();
    this._updateData(tday);
  },

  _loadData: function () {
    //加载开始上班日期
    var strDay = "";
    try {
      strDay = wx.getStorageSync('start_date');
    } catch (e) {
      // Do something when catch error
    }
    if (strDay == '') {
      strDay = this.data.date;
    }
    //更新数据
    var tday = theday();
    this.setData({
      oldCurrent: this.data.indexNumber,
      date: strDay
    });
    this._updateData(tday);
  },

  // 更新日历数据
  _updateData: function (date) {
    this.setData({
      month: (date.getMonth() + 1),
      year: date.getFullYear(),
      week: weeks[date.getDay()],
      rili1: lastMonth(date),
      rili2: theMonth(date),
      rili0: nextMonth(date),
    })
  },

  // 更新日历头部信息
  _updateCalendarHeader: function (sign) {
    // true 左滑，显示下一个月
    // false 右滑，显示上一个月
    var m = this.data.month;
    var y = this.data.year;
    if (sign) {
      if (m == 12) {
        y = y + 1;
        m = 1;
      } else {
        m = m + 1;
      }
    } else {
      if (m == 1) {
        y = y - 1;
        m = 12;
      } else {
        m = m - 1;
      }
    }
    this.setData({
      month: m,
      year: y,
    });
  },


  // 左右滑动效果
  onSetData: function (event) {
    // 检测是否是触摸事件
    if (!event.detail.source) {
      return;
    }
    var current = event.detail.current;
    var oldCurrent = this.data.oldCurrent;
    if (current > oldCurrent) {
      // 向左滑，显示下一个月
      // 更改日历头部的年和月信息
      this._updateCalendarHeader(true);
      var strDate = this.data.year + '-' + (this.data.month) + '-1';
      if (current == 3) {
        this.setData({
          rili1: leftMove(strDate),
          oldCurrent: current
        });
      }
      if (current == 2) {
        this.setData({
          oldCurrent: current,
          rili0: leftMove(strDate)
        });
      }
      if (current == 4 || current == 1) {
        this.setData({
          duration: 1
        })
        this.setData({
          indexNumber: 1,
          oldCurrent: 1,
          rili2: leftMove(strDate)
        });
      }

    } else if (current < oldCurrent) {
      // 向右滑，显示上一个月
      this._updateCalendarHeader(false);
      var strDate = this.data.year + '-' + (this.data.month) + '-1';
      if (current == 0) {
        this.setData({
          duration: 1,
        })
        this.setData({
          indexNumber: 3,
          oldCurrent: 3,
          rili2: rightMove(strDate)
        });
      }
      if (current == 2) {
        this.setData({
          oldCurrent: current,
          rili1: rightMove(strDate)
        });
      }
      if (current == 1) {
        this.setData({
          oldCurrent: current,
          rili0: rightMove(strDate)
        });
      }
    }
    // 回复动画时间
    this.setData({
      duration: 500
    })
  },

  //点击今天按钮
  taptheday: function () {
    this.setData({
      indexNumber: 2,
    });
    var tday = theday();
    //更新数据
    this._updateData(tday);
  },

  //打开设置页面
  setcalendar: function () {
    wx.navigateTo({
      url: '../setting/setting'
    })
  },
});


//自己编写代码->>日历组件其他功能
/**
 * 生成传入的年月所对应的排版日历
 * @param y 年
 * @param m 月
 * @return 日期
 */
function firstDay(y, m) {

  //确定当月第一天是星期几
  var fird = 0;//第一天的毫秒数
  var reDate = new Array(42);
  var myday = new Date();
  var mdate = new Date(y, m, 1);
  var thedate = new Date();
  var xingqi = new Array("星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六")
  //获取每个月一号是星期几，反推出这个星期的星期一是什么日期
  var week = mdate.getDay();
  if (week != 1) {
    //如果是星期天，为了保证计算，设置值为7
    if (week == 0) {
      week = 7;
    }
    //获取当月第一天的毫秒数
    fird = mdate.getTime() - (24 * 60 * 60 * 1000 * (week - 1));
  } else {
    fird = mdate.getTime();
  }
  //读取配置数据
  var start_date = "";
  var active = "";
  var data = ""
  try {
    start_date = wx.getStorageSync('start_date')
  } catch (e) {
    console.log('读取缓存中数据start_date失败')
    start_date = "2017-12-19";
  }
  try {
    active = wx.getStorageSync('active')
  } catch (e) {
    console.log('读取缓存中数据active失败')
    data = "白白白白夜夜夜夜休休休休"
  }
  if (start_date == "") {
    start_date = "2017-12-19";
  }
  if (active == "") {
    data = "白白白白夜夜夜夜休休休休"
  } else if (active == "1") {
    try {
      data = wx.getStorageSync('data_1')
    } catch (e) {
      console.log('读取缓存中数据data-1失败')
      data = "白白白白夜夜夜夜休休休休"
    }
  }
  var pattern = wx.getStorageSync('pattern');
  if (!pattern) {//保障第一次运行也是有数据显示的
    pattern = 1;
  }
  var pattern2_data = Array();
  try {
    pattern2_data['chooseDate'] = wx.getStorageSync('chooseDate');
  } catch (e) {
    console.log('读取缓存数据pattern2失败');
  }
  try {
    pattern2_data['cur_year'] = wx.getStorageSync('cur_year');
  } catch (e) {
    console.log('读取缓存数据pattern2失败');
  }
  try {
    pattern2_data['cur_month'] = wx.getStorageSync('cur_month');
  } catch (e) {
    console.log('读取缓存数据pattern2失败');              
  }
  var start = getTheDate(start_date);
  //循环得到要显示的所有日期数据
	/**返回数据格式
	 * (("日期Ly-m-d","年","月","日","农历","星期","是否今天","班次标识 1,2,3","是否当月","是否当天"),(.......)) 
	 */
  for (var i = 0; i < 42; i++) {
    mdate.setTime(fird + i * 24 * 60 * 60 * 1000);
    reDate[i] = new Array();
    reDate[i][0] = mdate.getFullYear() + "-" + (mdate.getMonth() + 1) + "-" + mdate.getDate();
    reDate[i][1] = mdate.getFullYear();
    reDate[i][2] = mdate.getMonth() + 1;
    reDate[i][3] = mdate.getDate();
    /*2016/2/3 修正 农历显示问题*/
    reDate[i][4] = ('初一' === calendar.solar2lunar(reDate[i][1], reDate[i][2], reDate[i][3]).IDayCn) ? calendar.solar2lunar(reDate[i][1], reDate[i][2], reDate[i][3]).IMonthCn : calendar.solar2lunar(reDate[i][1], reDate[i][2], reDate[i][3]).IDayCn;
    reDate[i][5] = xingqi[mdate.getDay()];
    reDate[i][6] = (mdate.getDate() == myday.getDate() && mdate.getFullYear() == myday.getFullYear() && mdate.getMonth() == myday.getMonth()) ? 1 : 0;
    if (pattern == 1) {
      reDate[i][7] = hh(mdate, start, data);
    } else if (pattern == 2) {
      reDate[i][7] = ff(mdate, pattern2_data);
    }
    reDate[i][8] = mdate.getMonth() == m ? 1 : 0;
    reDate[i][9] = ((mdate.getFullYear() == thedate.getFullYear()) && (mdate.getMonth() == thedate.getMonth()) && (mdate.getDate() == thedate.getDate())) ? 1 : 0;
    //		返回数组格式-------------
    //		0 完整日期
    //		1 年
    //		2 月
    //		3 日
    //		4 农历
    //		5 星期
    //		6 是否是当月(显示界面存在显示不是当月的情况)
    //		7 班次（返回班次标识，白，夜，休，中，全，中）
    //		8 返回当前日期是否和查询月相同
    //		9 是否是当天
  }
  return reDate;
}


/**
 *  班次计算说明：
 *  返回班次字符，白，中，夜，休
 *  @param target_date 目标日期（2017-02-18）（其中月1-12）  日期类型
 *  @param start_date 开始日期（2017-02-18）（其中月1-12）   日期类型
 *  @param data 保存的设置数据                               字符型
 *  @return 班次
 */
function hh(target_date, start_date, data) {
  //保存的数据举例：
  //三班两运转，每班四天：白白白白夜夜夜夜休休休休
  //===================================================
  var return_date = "";
  var result = 0;
  var banci = data;
  var banci_len = banci.length;
  //获得目标时间和开始时间间的间隔
  var tarNum = target_date.getTime();
  var staNum = start_date.getTime();

  if (tarNum == staNum) {
    return_date = banci[0];
  } else if (tarNum > staNum) {
    result = Math.floor((tarNum - staNum) / 1000 / 24 / 60 / 60);
    result = result > banci_len - 1 ? result % (banci_len) : result;
    return_date = banci[result];
  } else {
    result = Math.floor((staNum - tarNum) / 1000 / 24 / 60 / 60);
    result = result > banci_len - 1 ? result % (banci_len) : result;
    return_date = banci[banci_len - result]
    if (banci_len - result == banci_len) {
      return_date = banci[0];
    }

  }
  return return_date;
}

/**
 * 无规律倒班数据生成
 * target_date 目标日期
 * date 休息数据
 */
function ff(target_date, date) {
  if (target_date.getFullYear() == date['cur_year'] && target_date.getMonth() == date['cur_month'] - 1) {
    for (var j = 0, len = date['chooseDate'].length; j < len; j++) {
      if (date['chooseDate'][j] == target_date.getDate() - 1) {
        return '休';
      }
    }
  }
  // return '&nbsp;';
  return ' ';
}

/**
 * 返回当前日期 是一个日期对象
 */
function theday() {
  var day = new Date();
  return day;
}

/**
 * 获取上月的设置
 */
function lastMonth(date) {
  if (date.getMonth() == 0) {
    return firstDay(date.getFullYear() - 1, 11);
  }
  return firstDay(date.getFullYear(), date.getMonth() - 1);
}


/**
 * 获取本月的设置
 */
function theMonth(date) {
  return firstDay(date.getFullYear(), date.getMonth())
}


/**
 *获取下月的设置
 */
function nextMonth(date) {
  if (date.getMonth() == 11) {
    return firstDay(date.getFullYear() + 1, 0);
  }
  return firstDay(date.getFullYear(), date.getMonth() + 1);
}

/**
 * 向左滑，更新下一个月的日历数据
 */
function leftMove(strDate) {
  return nextMonth(getTheDate(strDate));
}

/**
 * 向右滑，更新上一个月的日历数据
 */
function rightMove(strDate) {
  return lastMonth(getTheDate(strDate));
}

// 获取日历对象，解决苹果系统日期函数BUG
function getTheDate(strDate) {
  var start_date = strDate + ' 0:0:0';
  var tday = new Date(start_date)
  wx.getSystemInfo({
    success: function (res) {
      var Cts = res.model;
      if (Cts.indexOf('iPhone') > -1) {
        // console.log(new Date(start_date.replace(/-/g, "/")));
        // 针对苹果系统 new Date()不支持2017-12-12格式做替换
        tday = new Date(start_date.replace(/-/g, "/"))
      }
    }
  })
  return tday;
}
