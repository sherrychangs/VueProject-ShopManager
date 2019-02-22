<template>
  <el-card class="box">
    <cus-bread level1="订单管理" level2="订单列表"></cus-bread>
    <el-table :data="list" style="width: 100%" height="520px" stripe border class="ordersTable">
      <el-table-column type="index" label="#" width="80"></el-table-column>
      <el-table-column prop="order_number" label="订单编号" width="300"></el-table-column>
      <el-table-column prop="order_price" label="订单价格" width="100"></el-table-column>
      <el-table-column label="是否付款" width="100">
        <template slot-scope="scope">
          <div v-if="scope.row.pay_status==='0'">
            <el-tag type="danger">未付款</el-tag>
          </div>
          <div v-else>
            <el-tag type="success">已付款</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="is_send" label="是否发货" width="100"></el-table-column>
      <el-table-column label="下单时间" width="300">
        <template slot-scope="scope">
          {{scope.row.create_time | fmtdate('YYYY-MM-DD HH:mm:ss')}}
        </template>
      </el-table-column>
      <el-table-column prop="l" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="mini" plain @click="showorder(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[10, 20, 30, 40]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog title="修改订单地址" :visible.sync="dialogFormVisibleEdit">
      <el-form label-position="left" label-width="80px" :model="formdata">
        <el-form-item label="省市区/县" prop="">
          <el-cascader expand-trigger="hover" :options="options" :show-all-levels="false" v-model="selectedOptions" :props="defaultprops" @change="handleChange" clearable change-on-select value="form.cat_level">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="form"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editorder()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import City from "@/assets/js/city_data2017_element.js";
export default {
  data() {
    return {
      list: [],
      pagenum: 1,
      pagesize: 10,
      total: -1,
      formdata: {
        is_send: "",
        order_pay: "",
        order_price: "",
        order_number: "",
        pay_status: ""
      },
      form: {},
      dialogFormVisibleEdit: false,
      options: [],
      selectedOptions: [],
      defaultprops: {
        // 键值相同，可以不写这个选项
        label: "lable",
        value: "value",
        children: "children"
      }
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    showorder() {
      this.dialogFormVisibleEdit = true;
      this.options = City;
    },
    editorder() {
      this.dialogFormVisibleEdit = false;
    },
    handleChange() {},
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
        `orders?pagenum=${this.pagenum}&pagesize=${this.pagesize}`
      );
      const { meta: { status }, data } = res.data;
      if (status === 200) {
        this.list = data.goods;
        this.total = data.total;
      }
    }
  }
};
</script>

<style scoped>
.box {
  height: 100%;
}
.ordersTable {
  margin-top: 10px;
}
</style>
