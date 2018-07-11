const daobanNames = ["三班二运转","四班三运转","自定义"]
const dayNumbers = ["两天","三天","四天"]

let choose_year = null,
  choose_month = null;

//设置相关公共数据
let pattern = "", //有规律，无规律
  patternName = null, //有规律值
  patternNames = []; //无规律设置的值

let zidingyibanci = ''; //自定义班次
//数组操作
//在数组中找到符合val元素的下标
Array.prototype.indexOf = function (val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == val) return i;
  }
  return -1;
};
//删除制定下标的元素
Array.prototype.remove = function (val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};
let chooseDate = new Array();//申明无规律倒班选择的数据存放的数组
Page({
  data: {
    daobanNames:  daobanNames,
    dayNumbers: dayNumbers,
    daobanValue:  [1,2],
    activeDaoban: '未设置',
    zidingyi: 'display-none',
    navBar_active1: 'active',
    navbar_tab1:  '',
    navbar_tab2:  'display-none',
    activeDaoban: '三班二运转',
    activeDaobanNumber: '四天',

    hasEmptyGrid: false,
    showPicker: false,
  },
  onLoad() {
    const date = new Date();
    const cur_year = date.getFullYear();
    const cur_month = date.getMonth() + 1;
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
    this.calculateEmptyGrids(cur_year, cur_month);
    this.calculateDays(cur_year, cur_month);
    this.setData({
      cur_year,
      cur_month,
      weeks_ch
    });
    //读取数据，并初始化
    pattern = wx.getStorageSync('pattern');
    console.log('规律模式：'+pattern);
    if (pattern == null || pattern == "") {
      pattern = 1;
    }
    if(wx.getStorageSync('pattern') == 1){
      if (wx.getStorageSync('bcname') == '自定义') {
        zidingyibanci = wx.getStorageSync('data_1');
        this.setData({
          zidingyi: ''
        });
      }
      var bcname = wx.getStorageSync('bcname');
      var bcnumber = wx.getStorageSync('bcnumber');
      this.setData({
        navBar_active1: 'active',
        navBar_active2: '',
        navbar_tab1: '',
        navbar_tab2: 'display-none',
        //数据加载
        activeDaoban: bcname,
        activeDaobanNumber: bcnumber,
        setbanci: wx.getStorageSync('data_1'),
      })

    } else if(wx.getStorageSync('pattern') == 2){ 
      //无规律数据加载
      const days = this.data.days;
      chooseDate = wx.getStorageSync('chooseDate');
      for (var i = 0; i <= chooseDate.length-1; i++) {
        console.log(chooseDate[i])
        days[chooseDate[i]].choosed = !days[chooseDate[i]].choosed;
      }
      this.setData({
        days,
        navBar_active1: '',
        navBar_active2: 'active',
        navbar_tab1: 'display-none',
        navbar_tab2: '',
        zidingyi: 'display-none', //上次设置是无规律情况下，有规律的数据全部复原
      })
    }
  },
  onShow: function (){
    this._setValue(bcname, bcnumber);
  },

  _setValue:function(bcname,bcnumber){
    var value1, value2 = 0;
    for (var i = 0; i < daobanNames.length; i++) {
      if (daobanNames[i] == bcname) {
        value1 = i;
      }
    }
    for (var j = 0; j < daobanNames.length; j++) {
      if (daobanNames[j] == bcnumber) {
        value2 = j;
      }
    }
    console.log(j+'-'+i);
    this.setData({
      daobanValue: [value1, value2],
      // daobanValue:[1,1]
    })

  },
  getThisMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  },


  getFirstDayOfWeek(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },


  calculateEmptyGrids(year, month) {
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    let empytGrids = [];
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids.push(i);
      }
      this.setData({
        hasEmptyGrid: true,
        empytGrids
      });
    } else {
      this.setData({
        hasEmptyGrid: false,
        empytGrids: []
      });
    }
  },


  calculateDays(year, month) {
    let days = [];

    const thisMonthDays = this.getThisMonthDays(year, month);

    for (let i = 1; i <= thisMonthDays; i++) {
      days.push({
        day: i,
        choosed: false
      });
    }

    this.setData({
      days
    });
  },


  handleCalendar(e) {
    const handle = e.currentTarget.dataset.handle;
    const cur_year = this.data.cur_year;
    const cur_month = this.data.cur_month;
    if (handle === 'prev') {
      let newMonth = cur_month - 1;
      let newYear = cur_year;
      if (newMonth < 1) {
        newYear = cur_year - 1;
        newMonth = 12;
      }

      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);

      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      });

    } else {
      let newMonth = cur_month + 1;
      let newYear = cur_year;
      if (newMonth > 12) {
        newYear = cur_year + 1;
        newMonth = 1;
      }

      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);

      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      });
    }
  },


  /**
   * 点击日历选择标定日期
   */
  tapDayItem(e) {
    const idx = e.currentTarget.dataset.idx;
    const days = this.data.days;
    if(chooseDate.indexOf(idx)>-1){
      chooseDate.remove(idx);
    } else {
      chooseDate.push(idx);
    }
    console.log(chooseDate);
    days[idx].choosed = !days[idx].choosed;
    this.setData({
      days,
    });
  },


  chooseYearAndMonth() {
    const cur_year = this.data.cur_year;
    const cur_month = this.data.cur_month;
    let picker_year = [],
      picker_month = [];
    for (let i = 2000; i <= 2050; i++) {
      picker_year.push(i);
    }
    for (let i = 1; i <= 12; i++) {
      picker_month.push(i);
    }
    const idx_year = picker_year.indexOf(cur_year);
    const idx_month = picker_month.indexOf(cur_month);
    this.setData({
      picker_value: [idx_year, idx_month],
      picker_year,
      picker_month,
      showPicker: true,
    });
  },


  pickerChange(e) {
    const val = e.detail.value;
    choose_year = this.data.picker_year[val[0]];
    choose_month = this.data.picker_month[val[1]];
  },


  tapPickerBtn(e) {
    const type = e.currentTarget.dataset.type;
    const o = {
      showPicker: false,
    };
    if (type === 'confirm') {
      o.cur_year = choose_year;
      o.cur_month = choose_month;
      this.calculateEmptyGrids(choose_year, choose_month);
      this.calculateDays(choose_year, choose_month);
    }

    this.setData(o);
  },


  onShareAppMessage() {
    return {
      title: '定制日历',
      desc: '为你完美解决，各种类型的倒班，值班日历问题。',
      path: 'pages/calendar/calendar'
    };
  },


  bai: function () {
    // 白班
    zidingyibanci = zidingyibanci + '白';
    // zidingyibancis = zidingyibancis + '1';
    this.setData({
      setbanci: zidingyibanci
    })
  },
  zhong: function () {
    //中班
    zidingyibanci = zidingyibanci + '中';
    // zidingyibancis = zidingyibancis + '2';
    this.setData({
      setbanci: zidingyibanci
    })
  },
  ye: function () {
    //夜班
    zidingyibanci = zidingyibanci + '夜';
    // zidingyibancis = zidingyibancis + '3';
    this.setData({
      setbanci: zidingyibanci
    })
  },
  fullday: function () {
    //全天
    zidingyibanci = zidingyibanci + '全';
    // zidingyibancis = zidingyibancis + '4';
    this.setData({
      setbanci: zidingyibanci
    })
  },
  xiu: function () {
    //休息
    zidingyibanci = zidingyibanci + '休';
    // zidingyibancis = zidingyibancis + '0';
    this.setData({
      setbanci: zidingyibanci
    })
  },
  clear: function () {
    //清除
    zidingyibanci = ''
    // zidingyibancis = ''
    this.setData({
      setbanci: zidingyibanci
    })
  },


  //倒班方式选择
  bindChange: function (e) {
    console.log(e);
    const val = e.detail.value
    if (val[0] == 2){
      this.setData({
        zidingyi: '',
      })
    }else{
      this.setData({
        zidingyi: 'display-none'
      })
    }
    console.log(this.data.daobanNames[val[0]]);
    this.setData({
      activeDaoban: this.data.daobanNames[val[0]],
      activeDaobanNumber: this.data.dayNumbers[val[1]]
    })
  },


  //navBar切换
  bindNavbar1: function(e){
    pattern = 1;
    this.setData({
      navBar_active1: 'active',
      navBar_active2: '',
      navbar_tab1: '',
      navbar_tab2: 'display-none',
    })
  },
  bindNavbar2: function(e){
    pattern = 2;
    this.setData({
      navBar_active1: '',
      navBar_active2: 'active',
      navbar_tab1: 'display-none',
      navbar_tab2: '',
    })
  },

  /**
   * 保存数据
   */
  primarySave: function () {
    var db = this.data.activeDaoban;//倒班名称
    var ts = this.data.activeDaobanNumber;//倒班天数
    var bcname = ""
    var bcnumber = ""
    if (pattern == 1) {
      //生成班次列表` 
      if (db == "三班二运转") {
        if (ts == "二天") {
          patternName = "白白夜夜休休";
          bcnumber = "二天"
        } else if (ts == "三天") {
          patternName = "白白白夜夜夜休休休";
          bcnumber = "三天"
        } else {
          patternName = "白白白白夜夜夜夜休休休休";
          bcnumber = "四天"
        }
        bcname = "三班二运转"
      } else if( db == "四班三运转") {
        if (ts == "二天") {
          patternName = "白白中中夜夜休休";
          bcnumber = "二天"
        } else if (ts == "三天") {
          patternName = "白白白中中中夜夜夜休休休";
          bcnumber = "三天"
        } else {
          patternName = "白白白白中中中中夜夜夜夜休休休休";
          bcnumber = "四天"
        }
        bcname = "四班三运转"
      } else if(db == "自定义") {
        console.log('自定义模式：'+zidingyibanci);
        bcname = "自定义"
        patternName = zidingyibanci;
        bcnumber = "";
      }
      //写入数据
      wx.setStorageSync('data_1', patternName);
      wx.setStorageSync("bcname", bcname);  //选择的班次名称 如三班二运转
      wx.setStorageSync("bcnumber", bcnumber);  //选择班次的天数
      chooseDate = {};
      wx.setStorageSync('chooseDate', chooseDate);
      wx.setStorageSync('cur_year', '');
      wx.setStorageSync('cur_month', '');
    }
    if (pattern == 2) { //无规律班次
      wx.setStorageSync('chooseDate',chooseDate)
      wx.setStorageSync('cur_year', this.data.cur_year);
      wx.setStorageSync('cur_month', this.data.cur_month);
    }
    wx.setStorageSync('pattern', pattern);  //保存模式

    //返回日历页面
    // wx.navigateBack()
    wx.reLaunch({
      url:'../calendar/calendar'
    });
    // wx.navigateTo()
  },
})
