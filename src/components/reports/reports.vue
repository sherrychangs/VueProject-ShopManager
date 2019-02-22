<template>
  <el-card class="box">
    <cus-bread level1="数据统计" level2="数据报表"></cus-bread>

    <div id="main"></div>

  </el-card>
</template>

<script>
import echarts from "echarts";
export default {
  data() {
    return {
      datalist: [],
      option: {}
    };
  },
  mounted() {
    this.getReportdata();
  },
  methods: {
    async getReportdata() {
      const myChart = echarts.init(document.getElementById("main"));
      const res = await this.$http.get(`reports/type/1`);
      const { meta: { status }, data } = res.data;
      if (status === 200) {
        this.option = data;
        this.option.toolbox = {
          feature: {
            saveAsImage: {},
            dataView: {}
          }
        };
        this.option.tooltip = {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985"
            }
          }
        };
      }
      myChart.setOption(this.option);
    }
  }
};
</script>

<style scoped>
.box {
  height: 100%;
}
#main {
  margin-top: 50px;
  width: 900px;
  height: 500px;
}
</style>
