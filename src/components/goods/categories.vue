<template>
  <el-card class="box">
    <cus-bread level1="商品管理" level2="商品分类"></cus-bread>
    <el-button type="success" @click="addCategories()" plain class="addbtn">添加分类</el-button>
    <el-table :data="list" style="width: 100%" height="470px" class="table">
      <el-tree-grid prop="cat_name" label="分类名称" treeKey="cat_id" childKey="children" parentKey="cat_pid" levelKey="cat_level" :indentSize="30">
      </el-tree-grid>
      <el-table-column label="级别">
        <template slot-scope="scope">
          <span v-if="scope.row.cat_level===0">一级</span>
          <span v-if="scope.row.cat_level===1">二级</span>
          <span v-if="scope.row.cat_level===2">三级</span>
        </template>
      </el-table-column>
      <el-table-column label="是否有效" width="200">
        <template slot-scope="scope">
          {{scope.row.cat_deleted? '无效' : '有效'}}
          <!-- <span v-if="scope.row.cat_deleted===false">有效</span> -->
          <!-- <span v-if="scope.row.cat_deleted!==false">无效</span> -->
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-row>
            <el-col>
              <el-button type="primary" icon="el-icon-edit" circle size="mini" plain :v-model="formdata" @click="showCategories(scope.row)"></el-button>
              <el-button type="danger" icon="el-icon-delete" circle size="mini" plain @click="deleteCate(scope.row)"></el-button>
            </el-col>
          </el-row>

        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <el-dialog title="修改商品分类" :visible.sync="dialogFormVisible">
      <el-form label-position="right" label-width="80px" :model="formdata">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="formdata.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="添加商品分类" :visible.sync="dialogFormVisibleAdd">
      <el-form label-position="left" label-width="100px" :model="form">
        <el-form-item label="分类名称">
          <el-input v-model="form.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="请选择分类">
          <el-cascader expand-trigger="hover" :options="options" :show-all-levels="false" v-model="selectedOptions" :props="defaultprops" @change="handleChange" clearable change-on-select value="form.cat_level">
          </el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="saveAddCate()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import ElTreeGrid from "element-tree-grid";
export default {
  data() {
    return {
      pagenum: 1,
      pagesize: 5,
      total: -1,
      dialogFormVisible: false,
      dialogFormVisibleAdd: false,
      list: [],
      formdata: {
        cat_name: ""
      },
      form: {
        cat_pid: "-1",
        cat_name: "",
        cat_level: "-1"
      },
      options: [],
      selectedOptions: [],
      defaultprops: {
        label: "cat_name",
        value: "cat_id"
      }
    };
  },
  created() {
    this.getCategories();
  },
  methods: {
    async saveAddCate() {
      if (this.selectedOptions.length == 0) {
        this.form.cat_pid = 0;
        this.form.cat_level = 0;
      }
      if (this.selectedOptions.length == 1) {
        this.form.cat_pid = this.selectedOptions[0];
        this.form.cat_level = 1;
      } else if (this.selectedOptions.length == 2) {
        this.form.cat_pid = this.selectedOptions[1];
        this.form.cat_level = 2;
      }
      const res = await this.$http.post(`categories`, this.form);
      console.log(res);
      const { meta: { status, msg } } = res.data;
      if (status === 201) {
        this.$message.success(msg);
        this.getCategories();
      } else {
        this.$message.warning("创建失败");
      }

      this.dialogFormVisibleAdd = false;
      this.form.cat_name = "";
      this.selectedOptions = [];
    },
    handleChange() {},
    addCategories() {
      this.dialogFormVisibleAdd = true;
      this.getGoodsCate();
    },
    async getGoodsCate() {
      const res = await this.$http.get(`categories?type=2`);
      const { meta: { status }, data } = res.data;
      if (status === 200) {
        this.options = data;
      }
    },
    async deleteCate(cate) {
      this.$confirm("此操作将永久删除该分类, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true
      })
        .then(async () => {
          const res = await this.$http.delete(`categories/${cate.cat_id}`);
          const { meta: { status, msg } } = res.data;
          if (status === 200) {
            this.pagenum = 1;
            this.getCategories();
            this.$message.success(msg);
          }
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    async editCate() {
      this.dialogFormVisible = false;
      const res = await this.$http.put(
        `categories/${this.formdata.cat_id}`,
        this.formdata
      );
      const { meta: { status, msg } } = res.data;
      if (status === 200) {
        this.$message.success(msg);
        this.getCategories();
      }
    },
    async showCategories(cate) {
      this.dialogFormVisible = true;
      const res = await this.$http.get(`categories/${cate.cat_id}`);
      const { meta: { status }, data } = res.data;
      if (status === 200) {
        this.formdata = data;
      }
    },
    handleSizeChange(val) {
      this.pagenum = 1;
      this.pagesize = val;
      this.getCategories();
    },
    handleCurrentChange(val) {
      this.pagenum = val;
      this.getCategories();
    },
    async getCategories() {
      const res = await this.$http.get(
        `categories?type=3&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
      );
      const { meta: { status }, data } = res.data;
      if (status === 200) {
        this.list = data.result;
        this.total = data.total;
      }
    }
  },
  components: {
    ElTreeGrid
  }
};
</script>

<style scoped>
.box {
  height: 100%;
}
.addbtn {
  margin-top: 10px;
}
</style>
