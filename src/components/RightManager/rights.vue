<template>
  <el-card class="box">
    <cus-bread level1="权限管理" level2="权限列表"></cus-bread>
    <el-table :data="list" style="width: 100%" height="520px" stripe border class="rightsTable">
      <el-table-column type="index" label="#" width="80"></el-table-column>
      <el-table-column prop="authName" label="权限名称" width="200"></el-table-column>
      <el-table-column prop="path" label="路径" width="200"></el-table-column>
      <el-table-column prop="level" label="等级">
        <template slot-scope="scope">
          <span v-if="scope.row.level==='0'">一级</span>
          <span v-if="scope.row.level==='1'">二级</span>
          <span v-if="scope.row.level==='2'">三级</span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      list: []
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    async getTableData() {
      const res = await this.$http.get(`rights/list`);
      const { meta: { status }, data } = res.data;
      if (status === 200) {
        this.list = data;
      }
    }
  }
};
</script>

<style scoped>
.box {
  height: 100%;
}
.rightsTable {
  margin-top: 20px;
}
</style>
