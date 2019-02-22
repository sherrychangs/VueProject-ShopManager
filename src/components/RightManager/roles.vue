<template>
  <el-card class="box">
    <cus-bread level1="权限管理" level2="角色列表"></cus-bread>
    <el-button class="addbtn" @click="showDiaAddRole()">添加角色</el-button>
    <el-table :data="list" @expand-change="expand" style="width: 100%" height="470px" class="rolesTable">
      <el-table-column type="expand" width="50">
        <template slot-scope="scope">
          <el-row v-if="scope.row.children.length===0">
            <el-col>
              <span>未分配权限</span>
            </el-col>
          </el-row>
          <el-row v-for="(item,i) in scope.row.children" :key="i">
            <el-col :span="4">
              <el-tag closable @close="removeRights(scope.row,scope.row.children,item)">{{item.authName}}</el-tag>
              <i class="el-icon-arrow-right"></i>
            </el-col>
            <el-col :span="20">
              <el-row v-for="(item1,i) in item.children" :key="i">
                <el-col :span="4">
                  <el-tag closable type="success" @close="removeRights(scope.row,item.children,item1)">{{item1.authName}}</el-tag>
                  <i class="el-icon-arrow-right"></i>
                </el-col>
                <el-col :span="20">
                  <el-tag v-for="(item2,i) in item1.children" :key="i" closable type="warning" @close="removeRights(scope.row,item1.children,item2)">{{item2.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index" label="#" width="50"></el-table-column>
      <el-table-column prop="roleName" label="角色名称" width="200"></el-table-column>
      <el-table-column prop="roleDesc" label="角色描述" width="200"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-row>
            <el-col>
              <el-button type="primary" icon="el-icon-edit" circle size="mini" plain @click="showRole(scope.row)"></el-button>
              <el-button type="danger" icon="el-icon-delete" circle size="mini" plain @click="deleteRole(scope.row)"></el-button>
              <el-button type="success" icon="el-icon-check" circle size="mini" plain @click="showRights(scope.row)"></el-button>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="添加角色" :visible.sync="dialogFormVisibleRole">
      <el-form label-position="left" label-width="80px" :model="formdata" :rules="rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formdata.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="formdata.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleRole = false">取 消</el-button>
        <el-button type="primary" @click="addRole()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑角色" :visible.sync="dialogFormVisibleEdit">
      <el-form label-position="left" label-width="80px" :model="formdata" :rules="rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formdata.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="formdata.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editRole()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="分配权限" :visible.sync="dialogVisibleRights">
      <el-tree ref="tree" :data="rights" show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="checkRights" :props="defaultProps" highlight-current>
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleRights = false">取 消</el-button>
        <el-button type="primary" @click="setRights()">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      rights: [],
      checkRights: [],
      roleID: "",
      formdata: {
        roleName: "",
        roleDesc: ""
      },
      dialogVisibleRights: false,
      dialogFormVisibleRole: false,
      dialogFormVisibleEdit: false,
      defaultProps: {
        label: "authName",
        children: "children"
      },
      rules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    expand(row, expandedRows) {
      if (expandedRows.length > 1) {
        expandedRows.shift(); // 删除数组中第一个数据，保证展开行的数组中只有一个数据，即只展开一行
      }
    },
    async setRights() {
      this.dialogVisibleRights = false;
      const Array = [
        ...this.$refs.tree.getCheckedKeys(), // ref操作DOM元素
        ...this.$refs.tree.getHalfCheckedKeys()
      ];
      const res = await this.$http.post(`roles/${this.roleID}/rights`, {
        rids: Array.join(",")
      });
      const { meta: { status, msg } } = res.data;
      if (status === 200) {
        this.$message.success(msg);
        this.getTableData();
      }
    },
    async showRights(role) {
      this.dialogVisibleRights = true;
      this.roleID = role.id;
      this.checkRights = [];
      const res = await this.$http.get(`rights/tree`);
      const { meta: { status }, data } = res.data;
      if (status === 200) {
        this.rights = data;
        role.children.forEach(item => {
          item.children.forEach(item1 => {
            item1.children.forEach(item2 => {
              this.checkRights.push(item2.id);
            });
          });
        });
      }
    },
    async removeRights(role, item, right) {
      const res = await this.$http.delete(
        `roles/${role.id}/rights/${right.id}`
      );
      const { meta: { status, msg } } = res.data;
      if (status === 200) {
        item.splice(item.indexOf(right), 1);
        // role.children = data.data    //此方法的使用前提是，后台返回的数据为剩余的权限
        this.$message.success(msg);
      }
    },
    async editRole() {
      this.dialogFormVisibleEdit = false;
      const res = await this.$http.put(
        `roles/${this.formdata.id}`,
        this.formdata
      );
      const { meta: { status, msg } } = res.data;
      if (status === 200) {
        this.$message.success(msg);
        this.getTableData();
      }
    },
    async showRole(role) {
      this.dialogFormVisibleEdit = true;
      const res = await this.$http.get(`roles/${role.id}`);
      const { meta: { status }, data } = res.data;
      if (status === 200) {
        this.formdata = data;
      }
    },
    deleteRole(role) {
      this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true
      })
        .then(async () => {
          const res = await this.$http.delete(`roles/${role.id}`);
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
    async addRole() {
      this.dialogFormVisibleRole = false;
      const res = await this.$http.post(`roles`, this.formdata);
      const { meta: { status, msg } } = res.data;
      if (status === 201) {
        this.getTableData();
        this.$message.success(msg);
      }
    },
    showDiaAddRole() {
      this.formdata = {};
      this.dialogFormVisibleRole = true;
    },
    async getTableData() {
      const res = await this.$http.get(`roles`);
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
.addbtn {
  margin-top: 10px;
}
.rolesTable {
  margin-top: 10px;
}
</style>
