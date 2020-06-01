# vue-time-play
基于vue的时间播放器组件

##使用

1、
 ```
npm install vue-play-time --save
//main.js中引入
import vuePlayTime from 'vue-play-time'
Vue.use(vuePlayTime);
 ```
2、
 ```
<vue-time-play :options="options" @onAnimate="onAnimate" @onClickEnd=“onClick”></vue-time-play>
  ```
 ```
options = {
    speedConfig: {
      "慢": 5000,
      "中":3000,
      "快":1000,
    },
    speed:1000,
    startDate:'2018-07-01 ',
    endDate:'2018-07-09',
    timeUnitControl: true,
    timeUnit: '天'
}
 ```
 **options参数说明**

| param           | option   | type     |description                                     |
|---------------- | -------- | ---------| ---------------------------------------------- |
| speedConfig     | optional | json     | 播放速度配置，例如{"慢": 5000,"中":3000,"快":800}  |
| speed           | optional | number   | 播放速度，必须和配置中的速度保持一致，默认：800        |
| startDate       | required | string   | 播放的开始时间                                    |
| endDate         | required | string   | 播放的结束时间                                    |
| timeUnit        | optional | string   | 按天或小时播放，默认按天                            |
| timeUnitControl | optional | boolean  | 是否显示时/天切换控件                              |

onAnimate：时间轴动画每次结束的回调，回调参数是当前时间

onClickEnd：点击时间轴的回调，回调参数是当前时间

onClickUnit：切换天/小时的回调，回调参数hour或day
