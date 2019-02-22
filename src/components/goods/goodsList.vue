<template>
  <el-card class="box">
    <cus-bread level1="商品管理" level2="商品列表"></cus-bread>
    <el-row class="search">
      <el-col>
        <el-input placeholder="请输入内容" v-model="query" class="searchbtn" @clear="getAllGoods()" clearable>
          <el-button slot="append" icon="el-icon-search" @click.prevent="searchGoods()"></el-button>
        </el-input>
        <el-button type="success" @click="showAddGoods()" plain>添加商品</el-button>
      </el-col>
    </el-row>
    <el-table :data="list" style="width: 100%" height="470px" border stripe class="goodsTable">
      <el-table-column type="index" label="#" width="80"></el-table-column>
      <el-table-column prop="goods_name" label="商品名称"></el-table-column>
      <el-table-column prop="goods_price" label="商品价格(元)" width="120"></el-table-column>
      <el-table-column prop="goods_weight" label="商品重量" width="80"></el-table-column>
      <el-table-column label="创建日期" width="100">
        <template slot-scope="scope">
          {{scope.row.add_time | fmtdate}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <el-row>
            <el-col>
              <el-button type="primary" icon="el-icon-edit" circle size="mini" plain :v-model="formdata"></el-button>
              <el-button type="danger" icon="el-icon-delete" circle size="mini" plain @click="deleteGoods(scope.row)"></el-button>
            </el-col>
          </el-row>

        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[10, 20, 30, 40]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      query: "",
      pagenum: 1,
      pagesize: 10,
      total: -1,
      list: [],
      formdata: ""
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    // 车载冰箱7.5L 冷暖两用汽车冰箱半导体12V迷你电冰箱升级款
    deleteGoods(row) {
      this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true
      })
        .then(async () => {
          const res = await this.$http.delete(`goods/${row.goods_id}`);
          const { meta: { status, msg } } = res.data;
          if (status === 200) {
            this.getTableData();
            this.$message.success(msg);
          }
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    searchGoods() {
      this.pagenum = 1;
      this.getTableData();
    },
    showAddGoods() {
      this.$router.push({
        name: "goodsAdd"
      });
    },
    getAllGoods() {
      this.getTableData();
    },
    handleSizeChange(val) {
      this.pagenum = 1;
      this.pagesize = val;
      this.getTableData();
    },
    handleCurrentChange(val) {
      this.pagenum = val;
      this.getTableData();
    },
    async getTableData() {
      const res = await this.$http.get(
        `goods?query=${this.query}&pagenum=${this.pagenum}&pagesize=${
          this.pagesize
        }`
      );
      const { data, meta: { status } } = res.data;
      if (status === 200) {
        this.total = data.total;
        this.list = data.goods;
      }
    }
  }
};
</script>

<style scoped>
.box {
  height: 100%;
}
.search {
  margin-top: 10px;
}
.searchbtn {
  width: 400px;
}
.goodsTable {
  margin-top: 10px;
}
</style>
