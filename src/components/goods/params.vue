<template>
  <el-card class="box">
    <cus-bread level1="商品管理" level2="分类参数"></cus-bread>
    <el-alert title="注意:只允许为第三级分类设置参数" type="warning" :closable="false" show-icon class="title">
    </el-alert>
    <el-row class="selection">
      <el-col>
        <span>请选择商品分类</span>
        <el-cascader expand-trigger="hover" :options="options" :show-all-levels="false" v-model="selectedOptions" :props="defaultprops" @change="handleChange" clearable>
        </el-cascader>
      </el-col>
    </el-row>
    <el-tabs v-model="active" @tab-click="handleTabClick">
      <el-tab-pane label="动态参数" name="many">
        <el-button type="primary" disabled size="mini">设置动态参数</el-button>
        <el-table :data="list" style="width: 100%;" height="360">
          <el-table-column type="expand" label="" width="60">
            <template slot-scope="scope">
              <el-tag v-for="(v,i) in scope.row.attr_vals" :key="i" closable @close="deleteAttr(scope.row,i)">
                {{v}}
              </el-tag>
              <el-input class="input-new-tag" v-if="inputVisible==scope.row.index" v-model="inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row.index)">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column label="#" type="index" width="60">
          </el-table-column>
          <el-table-column prop="attr_name" label="属性名称" width="180">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" plain></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" plain></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="静态参数" name="only">
        <el-button type="primary" disabled size="mini">设置静态参数</el-button>
        <el-table :data="listStatic" style="width: 100%" height="400px">
          <el-table-column type="index" label="#" width="40">
          </el-table-column>
          <el-table-column prop="attr_name" label="属性名称" width="180">
          </el-table-column>
          <el-table-column prop="attr_vals" label="属性值" width="180">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" plain></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" plain></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      active: "many",
      list: [],
      listStatic: [],
      options: [],
      selectedOptions: [],
      defaultprops: {
        label: "cat_name",
        value: "cat_id"
      },
      inputVisible: -1,
      inputValue: "",
      i: 0
    };
  },
  created() {
    this.getGoodsCate();
  },
  methods: {
    handleTabClick() {
      this.getAttrData();
    },
    async deleteAttr(row, index) {
      row.attr_vals.splice(index, 1);
      const newAttr = {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(",")
      };
      const res = await this.$http.put(
        `categories/${row.cat_id}/attributes/${row.attr_id}`,
        newAttr
      );
      const { meta: { status, msg } } = res.data;
      if (status === 200) {
        this.$message.success(msg);
      }
    },
    async handleInputConfirm(row) {
      if (this.inputValue) {
        row.attr_vals.push(this.inputValue);
        this.inputVisible = false;
        this.inputValue = "";
        const newAttr = {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(",")
        };
        const res = await this.$http.put(
          `categories/${row.cat_id}/attributes/${row.attr_id}`,
          newAttr
        );
        const { meta: { status, msg }, data } = res.data;
        if (status === 200) {
          this.$message.success(msg);
          this.inputVisible = -1;
        }
      } else {
        this.inputVisible = -1;
      }
    },
    showInput(index) {
      this.inputVisible = index;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleChange(value) {
      this.getAttrData();
    },
    async getAttrData() {
      if (this.selectedOptions.length !== 3) {
        this.$message.warning("请选择三级分类");
        if (this.active === "many") {
          this.list = [];
        } else {
          this.listStatic = [];
        }
        return;
      }
      const res = await this.$http.get(
        `categories/${this.selectedOptions[2]}/attributes?sel=${this.active}`
      );
      const { meta: { status }, data } = res.data;
      if (status === 200) {
        if (this.active === "many") {
          this.list = data;
          this.list.forEach(item => {
            item.attr_vals =
              item.attr_vals.trim("").length === 0
                ? []
                : item.attr_vals.trim("").split(",");
            item.index = this.i++;
          });
        } else this.listStatic = data;
      }
    },
    async getGoodsCate() {
      const res = await this.$http.get(`categories?type=3`);
      const { meta: { status }, data } = res.data;
      if (status === 200) {
        this.options = data;
      }
    }
  }
};
</script>

<style scoped>
.box {
  height: 100%;
}
.title {
  margin-top: 15px;
}
.selection {
  margin-top: 15px;
  font-size: 14px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
