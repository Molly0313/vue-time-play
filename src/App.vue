<template>
  <div class="play-box">
    <vue-time-play :options="options" @onAnimate="onAnimate" @onClickEnd="onclick"></vue-time-play>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      options: {
        speedConfig: { // 速度配置
          "慢": 5000,
          "中":3000,
          "快":1000,
        },
        speed:1000,
        startDate:'2018-07-01 ',
        endDate:'2018-07-09',
        timeUnitControl: true, //是否显示时/天切换控件
        timeUnit: '天', // 默认按天还是按小时
        isShowHour: true, // 按小时是否可点
      }
    }
  },
  methods:{
    onAnimate(val){

    },
    onclick(val){

    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
  .play-box{
    width:80%;
  }
</style>
