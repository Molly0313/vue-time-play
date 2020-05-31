<template>
 <div id="timePlay">
   <div id="timeMain">
     <div class="timeControl-box">
       <div class="timeControl" :class="playAction" @click="playClick()">

       </div>
     </div>
     <div class="prev-box">
       <div class="prev" title="上一页" :class="{'disable':!prevBtn}" @click="pagePrev">
         <img src="/src/assets/arrow-left.png"/>
       </div>
     </div>
     <div class="next-box">
       <div class="next" title="下一页" :class="{'disable':!nextBtn}" @click="pageNext">
         <img src="/src/assets/arrow-right.png"/>
       </div>
     </div>
     <div class="timeProgress-box" ref="timeProgressBox">
       <div class="hover-popup" v-show="isShowHoverPopup" :style="{'left': hoverPopupLeft +'px'}">
         {{temp_day.mon + '-'+ temp_day.day}}
         {{timeUnit==='天'? '' : ' '+ temp_day.hour + ":00"}}
       </div>
       <div class="curr-popup for-click" v-show="isShowClickPopup" :style="{'left': curr_x + 'px'}">{{timeUnit==='天'?curr_day.mon + '-'+ curr_day.day:curr_day.hour + ":00"}}</div>
       <div class="timeProgress-hide">
         <div class="timeProgress-inner" ref="timeProgressInner" :style="{'transform': 'translateX(-'+translate+'px)'}">
           <div class="timeProgress" ref="timeProgress" @click="clickPopup" @mouseover.prevent="hoverPopup"
                @mouseleave="leavePopup">
             <div class="timeProgress-bar" :style="{'width':width+'px'}">
               <p class="bigDot">
                 <span class="dot">

                 </span>
               </p>
               <div class="curr-popup for-animate" v-show="isShowAniPopup">
                 {{timeUnit==='天'?curr_day.mon + '-'+ curr_day.day:curr_day.hour + ":00"}}
               </div>
             </div>
           </div>
           <ul>
             <li v-for="item in timeList" class="every" ref="liNode">
               <span class="year" v-show="isCrossYear">{{item.year}}-</span><span class="mon">{{item.month}}</span>-<span class="day">{{item.day}}</span>
             </li>
           </ul>
         </div>
       </div>
     </div>
   </div>
   <div class="timeUnit">
     <div class="inner">
       <div class="timeUnitBtn day" @click="changeTimeUnit(1)" :class="{'active':timeUnit==='天'}">天</div>
       <div class="line">/</div>
       <div class="timeUnitBtn hour" @click="changeTimeUnit(2)" :class="{'active':timeUnit==='时'}">时</div>
     </div>
   </div>
   <div class="speed">
     <div class="inner">
       <div v-for="(item, key, index) in defaultOptions.speedConfig" class="inner-div">
         <div class="speedBtn" :key="index" @click="changeSpeed(item)" :class="{'active':speedIndex=== item}">{{key}}</div>
         <div class="line">/</div>
       </div>
     </div>
   </div>
 </div>
</template>

<script>
    export default {
        name: "vue-time-play",
      data(){
          return{
            defaultOptions:{
              speedConfig: { // 速度配置
                "慢": 5000,
                "中":3000,
                "快":800,
              },
              speed:800, // 默认速度
              startDate:20180701,
              endDate:20180831,
              timeUnit: '天', // 播放单位
              isShowHour: true, // 按小时是否可点
            },
            timeUnit:'天', // 播放单位
            speed: 800, // 播放速度
            playAction:'play', // 播放or暂停
            timer: null, //动画定时器
            speedIndex: null,
            playWidth:null,
            boxLeft:null, // 播放容器距离窗口左边的距离
            boxRight: null,
            translate:0, //时间轴向左的位移长度
            width:0,//时间轴长度
            dis: 108, // 运动每格长度
            dis_hour: 108/24,//小时单位移动距离
            curr_x:0,//临时记录X轴位移
            temp_day:{},//临时记录时间
            index_hover:0,//临时索引
            hover:0,//临时索引
            unitMap:{
              '1':'天',
              '2':'时'
            },
            curr_day:{
              'year':'',
              'month':'',
              'day':'',
              'hour':''
            },
            isShowAniPopup:false, //是否展示播放时的popup
            isShowClickPopup: false,// 是否展示点击时的popup
            isShowHoverPopup: false,// 是否展示hover时的popup
            hoverPopupLeft: 0,
            timeList: [],
            isCrossYear: false,
            nextBtn:false,
            prevBtn: false
          }
      },
      props:{
        options: {}
      },
      mounted(){
        Object.assign(this.defaultOptions, this.options);//基本配置
        this.timeUnit = this.defaultOptions.timeUnit;
        this.speed = this.defaultOptions.speed;
        this.speedIndex = this.speed
        this.boxLeft = this.$refs.timeProgressBox.getBoundingClientRect().left +29 //加29是因为.timeProgress-inner设置了margin-left:29px;
       // this.boxRight = document.body.clientWidth - this.boxLeft - this.$refs.timeProgressBox.clientWidth;
        this.fillDate()
        this.initDate()
      },
      watch:{
        options() {
          //当配置发生改变时
        }
      },
      methods:{
        changeSpeed(val){ // 改变速度
          let flag = false;
          if(this.playAction === 'pause') {
            flag = true;
          }
          this.speedIndex = val
          this.speed = val
          this.stopPlay();
          if(flag){
            this.playAction = 'pause'
            this.startPlay();
          }
        },
        playClick(){
          if(this.playAction === 'play') {
            this.playAction = 'pause'
          } else {
            this.playAction = 'play'
          }
          if(this.playAction === 'pause'){
            if(this.playWidth >= this.$refs.timeProgress.clientWidth){ //如果播放完成再点击播放按钮从开始播放
              this.initDate();
            } else {
              this.startPlay();
            }
          }else{
            this.stopPlay();
          }
        },
        fillDate(){
          this.timeList = []
          const start = new Date(this.defaultOptions.startDate);
          const end = new Date(this.defaultOptions.endDate);
          let startYear  = start.getFullYear(),
            startMonth = start.getMonth()+1,
            startDay   = start.getDate(),
            endYear  = end.getFullYear(),
            endMonth = end.getMonth()+1,
            endDay   = end.getDate()
          this.isCrossYear = startYear !== endYear
          while(this.compareTime(startDay,endDay,startMonth,endMonth,startYear,endYear))
          {
            if(startDay>this.monthCount(startMonth)){
              startDay = 1;
              startMonth++;
            }
            if(startMonth>12){
              startMonth = 1;
              startYear++;
            }
            let obj = {
              year:startYear,
              month:startMonth,
              day:startDay
            }
            this.timeList.push(obj)
            startDay++;
          }
        },
        compareTime(startDay,endDay,startMonth,endMonth,startYear,endYear){
          let flag = false;
          if(startYear<endYear){
            flag = true;
          } else if(startYear===endYear){
            if(startMonth<endMonth){
              flag =  true;
            } else if(startMonth===endMonth){
              if(startDay <=endDay){
                flag =  true
              }
            }
          }
          return flag
        },
        monthCount(month){
          let num = 0;
          if(month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) {
            num = 31;
          } else if(month === 4 || month === 6 || month === 9 || month === 11 ) {
            num = 30;
          } else if(month === 2) {
            if(this.calcLeapYear()) {
              num = 29;
            } else {
              num = 28;
            }
          }
          return num;
        },
        calcLeapYear(year){
          let leap = false;
          if((year%4)===0&&(year%100)===0){
            if((year%400)==0){
              leap = true;
            }else{
              leap = false;
            }
          }else if((year%4)===0&&(year%100)!==0){
            leap = true;
          }else if((year%4)!==0&&(year%100)!==0){
            leap = false;
          }else{
            leap = false;
          }
          return leap;
        },
        stopPlay(){ // 暂停播放
          this.playAction = 'play'
          clearInterval(this.timer);
        },
        startPlay(){
          let self = this;
          this.isShowClickPopup = false;
          this.isShowAniPopup = true;
          this.timer = setInterval(function(){
            let temp_date = self.curr_day;
            if(self.reachEnd()){
              self.halfPageNext();
            }
            if(self.timeUnit === "时"){
              let real_width  = Math.floor(self.width / self.dis_hour) * self.dis_hour;
              self.width = real_width + self.dis_hour;
              self.curr_day.hour = self.curr_day.hour + 1;
              if(self.width < self.$refs.timeProgress.clientWidth){
                if((self.curr_day.hour % 24) === 0){
                  self.index++;
                  self.curr_day = {"year": self.timeList[self.index].year,
                    "mon": self.timeList[self.index].month,
                    "day": self.timeList[self.index].day,
                    "hour": 0}
                }
              }
            }else{
              self.index++;
              let real_width  = Math.floor(self.width / self.dis) * self.dis;
              self.width = real_width + self.dis;
              if(self.width < self.$refs.timeProgress.clientWidth) {
                self.curr_day = {"year": self.timeList[self.index].year,
                  "mon": self.timeList[self.index].month,
                  "day": self.timeList[self.index].day,
                  "hour": 0}
              }
            }
            if(self.width >= self.$refs.timeProgress.clientWidth){
              self.width = self.$refs.timeProgress.clientWidth;
              self.curr_day = temp_date;
              self.stopPlay();
            } else {
              self.$emit('onAnimate',this.curr_day)
            }
          },self.speed)
        },
        reachEnd(){
          let dis_right = this.$refs.timeProgressBox.clientWidth - (this.width - this.translate);
          if(dis_right <= 108+29){
            return true;
          }else{
            return false;
          }
        },
        halfPageNext(){
          this.isShowClickPopup = false;
          this.isShowAniPopup = true;
          this.prevBtn = true
          let  page_width = this.$refs.timeProgressBox.clientWidth,
            con_width = this.$refs.timeProgressInner.clientWidth;
          this.translate += (this.$refs.timeProgressBox.clientWidth / 2);
          if(this.translate + page_width > con_width + 40){
            this.translate = this.$refs.timeProgressInner.clientWidth - page_width + 40;
            this.nextBtn = false
          }
        },
        initDate(){ // 初始化日期
          const curr_date = new Date(this.defaultOptions.startDate);
          const year  = curr_date.getFullYear();
          const month = curr_date.getMonth()+1;
          const day = curr_date.getDate();
          const hour = curr_date.getHours();
          this.isShowClickPopup = false;
          this.isShowAniPopup = true;
          this.curr_day = {
            "year": year,
            "mon": month,
            "day": day,
            "hour": hour
          };
          this.$emit('onAnimate',this.curr_day)
          for (let i = 0, len = this.timeList.length; i < len; i++) {
            let m = this.timeList[i].month
            let d = this.timeList[i].day;
            if(month===m&&day===d){
              this.index = i;
              this.width  = this.dis * i + this.dis / 24 * hour;
              this.$nextTick(()=>{
                this.progressAni();
              })
              break;
            }
          }
          if(this.playAction === 'pause'){ //初始化后如果正在播放就开始播放
            this.startPlay();
          }
        },
        progressAni(){ // 进度条动画
          let  page_width = this.$refs.timeProgressBox.clientWidth,
            con_width = this.$refs.timeProgressInner.clientWidth,
            page_num = Math.floor(this.width /page_width),
            left_dis = page_num * page_width;
          if(page_num !==0){
            if(page_width - this.width + left_dis < this.dis){
              left_dis = left_dis + (page_width/2);
            }

            if(left_dis+page_width>con_width + 40){
              left_dis = con_width - page_width + 40;
              this.prevBtn = false
            }
            if(this.width !==0){
              if((this.width - left_dis)<this.dis){
                left_dis = left_dis - (page_width/2);
              }
            }
          }
          if(page_width>con_width + 40){
            this.nextBtn = false
          } else {
            this.nextBtn = true
          }
          this.translate = left_dis;
        },
        changeTimeUnit(index){
          if(!this.defaultOptions.isShowHour && index === 2) { //

          } else {
            let flag = false;
            if(this.play === 'pause'){
              flag = true;
            }
            this.timeUnit = this.unitMap[index]
            console.log(this.timeUnit)
            // if(this.timeUnit === '天'){
            //   var texts = timePlay.curr_day.mon + '-'+ timePlay.curr_day.day;
            // }else{
            //   var texts = timePlay.curr_day.hour + ":00";
            // }
            // $(".curr-popup").text(texts);
            this.stopPlay();
            this.initDate();
            // if(flag){
            //     timePlay.startPlay();
            // }
          }
        },
        pageNext(){
          this.isShowClickPopup = false;
          this.isShowAniPopup = true;
          this.prevBtn = true
          let page_width = this.$refs.timeProgressBox.clientWidth,
            con_width = this.$refs.timeProgressInner.clientWidth;
          this.translate += this.$refs.timeProgressBox.clientWidth;
          if(this.translate + page_width > con_width + 40){
            this.translate = this.$refs.timeProgressBox.clientWidth - page_width + 40;
            this.nextBtn = false
          }
        },
        pagePrev(){
          this.nextBtn = true
          this.isShowClickPopup = false;
          this.isShowAniPopup = true;
          this.translate -= this.$refs.timeProgressBox.clientWidth;
          if(this.translate < 0){
            this.translate = 0;
            this.prevBtn = false
          }
        },
        clickPopup(event){
          this.stopPlay();
          this.isShowAniPopup = false;
          this.isShowClickPopup = true;
          let x = event.clientX;
          this.curr_x = x - this.boxLeft + 29;
          this.width = x - this.boxLeft;
          this.curr_day = this.temp_day;
          this.index = this.index_hover;
          this.$emit('onClickEnd', this.curr_day)
          if(this.playAction === 'pause'){
            this.startPlay();
          }
        },
        hoverPopup(event){
          let x = event.clientX;
          let day_index = Math.floor((x + this.translate-this.boxLeft) / this.dis);
          let len = this.$refs.timeProgress.clientWidth / this.dis;
          if(day_index>=0 && day_index<=len-1){
            this.index_hover = day_index;
            this.temp_day  = {
              "year": this.timeList[day_index].year,
              "mon": this.timeList[day_index].month,
              "day": this.timeList[day_index].day,
              "hour": Math.floor(((x + this.translate - this.boxLeft) % this.dis) / this.dis_hour)
            }
            this.isShowHoverPopup = true
            this.hoverPopupLeft = x - this.boxLeft + 29
          }
        },
        leavePopup(){
            this.isShowHoverPopup = false
        }
      }
    }
</script>

<style scoped lang="scss">
  *{
    margin: 0;
    padding: 0;
  }
  ul{
    padding: 0;
    margin: 0;
    list-style: none;
  }
  .time-box{
    position:absolute;
    bottom:20px;
    left:340px;
    width:60%;
    height:80px;
    display:inline-block;
  }
  #timePlay{
    width: 100%;
  //margin-left:400px;
    height: 80px;
    background-color: #222E33;
    display: flex;
    border-radius: 2px;
    box-shadow:0px 4px 6px 0px rgba(24,32,37,1);
  }
  .timeUnit{
    position: relative;
    z-index: 2;
    float: left;
    width: 80px;
    height: 80px;
    padding: 25px 10px;
    box-sizing: border-box;
  }
  .speed{
    position: relative;
    z-index: 2;
    float: left;
    width: 108px;
    height: 80px;
    padding: 25px 10px;
    box-sizing: border-box;
  }
  .speed> .inner,.timeUnit > .inner {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 5px;
    font-size: 0;
    .inner-div {
      display: inline-block;
      &:last-child{
        .line{
          display: none;
        }
      }
    }
  }
  .inner .line{
    display:inline-block;
    font-size:14px;
    margin:0 5px;

  }
  .inner .disabled{
    color:#6d6d6d;
    cursor:default;
  }
  .timeUnitBtn,.speedBtn{
    cursor: pointer;
    font-size: 14px;
    line-height: 26px;
    display: inline-block;
    text-align: center;
    box-sizing: border-box;
    color: #DBDCE7;
  }
  .timeUnitBtn.active, .speedBtn.active{
    color: #15A87F;
  }
  #timeMain{
    position: relative;
    flex: 1;
  }
  .timeControl-box{
    position: relative;
    width: 40px;
    height: 80px;
    float: left;
    margin-left: 10px;
  }
  .timeControl{
    position: absolute;
    left: 10px;
    top: 30px;
    width: 14px;
    height: 18px;
    cursor: pointer;
  }
  .timeControl.play::after{
    content: '';
    border-left: 14px solid #15A87F;
    border-top: 9px solid transparent;
    border-bottom: 9px solid transparent;
    display: inline-block;
  }
  .timeControl.pause::after{
    content: '';
    float: right;
    width: 4px;
    height: 18px;
    margin-right: 2px;
    background-color: #15A87F;
    display: inline-block;
  }
  .timeControl.pause::before{
    content: '';
    float: left;
    width: 4px;
    height: 18px;
    margin-left: 2px;
    background-color: #15A87F;
    display: inline-block;
  }
  .timeProgress-box{
    position: absolute;
    left: 100px;
    top: 0;
    bottom: 0;
    right: 70px;
  }
  .timeProgress-box > .timeProgress-hide{
    position: relative;
    width: 108%;
    height: 100%;
    overflow: hidden;
  }
  .timeProgress-inner{
    margin:0 29px;
    position: absolute;
    height: 80px;
    top: 0;
    left: 0;
    padding-top: 44px;
    box-sizing: border-box;
    -webkit-transform: translateX(0px);
    -moz-transform: translateX(0px);
    -ms-transform: translateX(0px);
    -o-transform: translateX(0px);
    transform: translateX(0px);
    -webkit-transition: all .3s;
    -moz-transition: all .3s;
    -ms-transition: all .3s;
    -o-transition: all .3s;
    transition: all .3s;
  }
  .timeProgress-inner > ul{
    overflow: hidden;
    white-space: nowrap;
    font-size: 0;
  }
  .timeProgress-inner > ul > li{
    width: 108px;
    margin: 10px 0;
    color: #DBDCE7;
    font-size: 13px;
    line-height: 16px;
    text-align: center;
    border-left: 1px solid #2D3D44;
    box-sizing: border-box;
    display: inline-block;
    pointer-events: none;
  }
  .timeProgress-inner > ul > li:last-of-type{
    border-right: 1px solid #2D3D44;
  }
  .timeProgress{
    position: absolute;
    top: 36px;
    width: 100%;
    height: 6px;
    background: #2D3D44;
    border-radius: 4px;
    cursor: pointer;
  }
  .timeProgress-bar{
    position: absolute;
    height: 6px;
    border-radius: 4px;
    background: #15A87F;
    overflow: visible !important;
    -webkit-transition: width .3s;
    -moz-transition: width .3s;
    -ms-transition: width .3s;
    -o-transition: width .3s;
    transition: width .3s;
  }
  .bigDot{
    width:20px;
    height:20px;
    background:rgba(21,168,127,0.5);
    border-radius: 10px;
    position: absolute;
    right: -10px;
    bottom: -7px;
    margin:0;
    text-align:center;
    line-height:19px;
  .dot{
    display:inline-block;
    width:10px;
    height:10px;
    background:rgba(21,168,127,1);
    border-radius: 5px;
  }
  }
  .prev-box{
    position: absolute;
    z-index: 2;
    top: 0;
    left: 60px;
    width: 40px;
    height: 80px;
  }
  .next-box{
    position: absolute;
    z-index: 2;
    right: 8px;
    top: 0;
    width: 40px;
    height: 80px;
  }
  .prev, .next{
    position: absolute;
    left: 0;
    top: 31px;
    width: 18px;
    height: 18px;
    cursor: pointer;
    background: #15A87F;
    border-radius: 10px;
    line-height:15px;
    text-align:center;
  }
  .curr-popup{
    position: absolute;
    right: 0;
    bottom: 16px;
    /*display: none;*/
    -webkit-transform: translateX(50%);
    -moz-transform: translateX(50%);
    -ms-transform: translateX(50%);
    -o-transform: translateX(50%);
    transform: translateX(50%);
    width: 60px;
    font-size: 12px;
    line-height: 24px;
    color: #DBDCE7;
    background-color: #15A87F;
    text-align: center;
  }
  .curr-popup.for-click{
    position: absolute;
    left: 29px;
    right: none;
    bottom: 52px;
    -webkit-transform: translateX(-50%);
    -moz-transform: translateX(-50%);
    -ms-transform: translateX(-50%);
    -o-transform: translateX(-50%);
    transform: translateX(-50%);
  }
  .curr-popup::after{
    content: '';
    position: absolute;
    left: 22px;
    top: 100%;
    border-top: 8px solid #15A87F;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
  }
  .hover-popup{
    position: absolute;
    bottom: 52px;
    -webkit-transform: translateX(-50%);
    -moz-transform: translateX(-50%);
    -ms-transform: translateX(-50%);
    -o-transform: translateX(-50%);
    transform: translateX(-50%);
    width: 60px;
    font-size: 12px;
    line-height: 24px;
    color: #DBDCE7;
    background-color: #15A87F;
    text-align: center;
  }
  .hover-popup::after{
    content: '';
    position: absolute;
    left: 22px;
    top: 100%;
    border-top: 8px solid #15A87F;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
  }
  .next.disable,.prev.disable{
    background-color: #2D3D44;
    pointer-events: none;
  }

</style>
