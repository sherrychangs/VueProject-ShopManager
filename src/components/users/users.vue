<template>
  <el-card class="mainbox">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row class="search">
      <el-col>
        <el-input placeholder="请输入内容" v-model="query" class="searchbtn" @clear="getAllUsers()" clearable>
          <el-button slot="append" icon="el-icon-search" @click.prevent="searchUsers()"></el-button>
        </el-input>
        <el-button type="success" @click="showDiaAddUser()" plain>添加用户</el-button>
      </el-col>
    </el-row>
    <el-table :data="list" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="#" width="80"></el-table-column>
      <el-table-column prop="username" label="姓名" width="100"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
      <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
      <el-table-column label="创建日期" width="180">
        <template slot-scope="scope">
          {{scope.row.create_time | fmtdate}}
        </template>
      </el-table-column>
      <el-table-column label="用户状态" width="180">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949" @change="changeState(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <el-row>
            <el-col>
              <el-button type="primary" icon="el-icon-edit" circle size="mini" plain @click="showUser(scope.row)" :v-model="formdata"></el-button>
              <el-button type="danger" icon="el-icon-delete" circle size="mini" plain @click="deleteUser(scope.row)"></el-button>
              <el-button type="success" icon="el-icon-check" circle size="mini" plain @click="showRole(scope.row)"></el-button>
            </el-col>
          </el-row>

        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum" :page-sizes="[2, 4, 6, 8]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
    <!-- 对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogFormVisibleAdd">
      <el-form label-position="right" label-width="80px" :model="formdata" :rules="rules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formdata.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formdata.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formdata.email"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formdata.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="addUsers()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑用户" :visible.sync="dialogFormVisibleEdit">
      <el-form label-position="right" label-width="80px" :model="formdata" :rules="rules">
        <!-- <el-input v-model="formdata.id" type="hidden"></el-input> -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formdata.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formdata.email"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formdata.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editUser()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="分配角色" :visible.sync="dialogFormVisibleRole">
      <el-form label-position="left" label-width="80px" :model="formdata" :rules="rules">
        <el-form-item label="用户名">
          {{formdata.username}}
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="selectVal" placeholder="请选择">
            <el-option label="请选择" disabled :value="-1"></el-option>
            <el-option :label="item.roleName" :value="item.id" v-for="(item,i) in roles" :key="i"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleRole = false">取 消</el-button>
        <el-button type="primary" @click="changeRole()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      query: "",
      pagenum: 1,
      pagesize: 2,
      total: -1,
      loading: true,
      list: [],
      roles: [],
      dialogFormVisibleAdd: false,
      dialogFormVisibleEdit: false,
      dialogFormVisibleRole: false,
      formdata: {
        id: "",
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      selectVal: -1,
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    async changeRole() {
      this.dialogFormVisibleRole = false;
      const res = await this.$http.put(`users/${this.formdata.id}/role`, {
        rid: this.selectVal
      });
      const { meta: { status, msg } } = res.data;
      if (status === 200) {
        this.$message.success(msg);
      }
    },
    async showRole(user) {
      this.dialogFormVisibleRole = true;
      this.formdata = user;
      const res = await this.$http.get(`roles`);
      const { data, meta: { status } } = res.data;
      if (status === 200) {
        this.roles = data;
      }
      const res2 = await this.$http.get(`users/${user.id}`);
      if (res2.data.meta.status === 200) {
        this.selectVal = res2.data.data.rid;
      }
    },
    deleteUser(user) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true
      })
        .then(async () => {
          const res = await this.$http.delete(`users/${user.id}`);
          const { meta: { status, msg } } = res.data;
          if (status === 200) {
            this.pagenum = 1;
            this.getTableData();
            this.$message.success(msg);
          }
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    async editUser() {
      const res = await this.$http.put(
        `users/${this.formdata.id}`,
        this.formdata
      );
      this.dialogFormVisibleEdit = false;
      const { meta: { status, msg } } = res.data;
      if (status === 200) {
        this.$message.success(msg);
        this.getTableData();
      }
    },
    async showUser(user) {
      this.dialogFormVisibleEdit = true;
      const res = await this.$http.get(`users/${user.id}`);
      const { meta: { status }, data } = res.data;
      if (status === 200) {
        this.formdata = data;
      }
    },
    async changeState(user) {
      const res = await this.$http.put(
        `users/${user.id}/state/${user.mg_state}`
      );
      const { meta: { status, msg } } = res.data;
      if (status === 200) {
        this.$message.success(msg);
      }
    },
    async addUsers() {
      const res = await this.$http.post(`users`, this.formdata);
      this.dialogFormVisibleAdd = false;
      const { meta: { msg, status } } = res.data;
      if (status === 201) {
        this.getTableData();
        this.$message.success(msg);
      }
    },
    showDiaAddUser() {
      this.formdata = {};
      this.dialogFormVisibleAdd = true;
    },
    getAllUsers() {
      this.getTableData();
    },
    searchUsers() {
      this.pagenum = 1;
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
        `users?query=${this.query}&pagenum=${this.pagenum}&pagesize=${
          this.pagesize
        }`
      );
      const { data, meta: { status } } = res.data;
      if (status === 200) {
        this.total = data.total;
        this.list = data.users;
        this.loading = false;
      }
    }
  }
};
</script>

<style scope>
.mainbox {
  height: 100%;
}
.search {
  margin-top: 20px;
}
.searchbtn {
  width: 400px;
}
</style>
