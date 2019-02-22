<template>
  <el-card class="box">
    <cus-bread level1="商品管理" level2="商品列表"></cus-bread>
    <el-row>
      <el-col>
        <el-alert title="添加商品信息" type="info" :closable="false" center show-icon class="title">
        </el-alert>
      </el-col>
    </el-row>
    <el-row class="steps">
      <el-col>
        <el-steps :active="active*1" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
        </el-steps>
      </el-col>
    </el-row>
    <el-form label-position="top" label-width="80px" :model="formdata" class="form">
      <el-tabs v-model="active" tab-position="left" @tab-click="handleClick()">
        <el-tab-pane label="基本信息" name="1">
          <el-form-item label="商品名称">
            <el-input v-model="formdata.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="formdata.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量">
            <el-input v-model="formdata.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量">
            <el-input v-model="formdata.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-cascader expand-trigger="hover" :options="options" v-model="selectedOptions" :props="defaultprops" @change="handleChange" clearable>
            </el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="2">
          <el-form-item :label="item.attr_name" v-for="(item,i) in arrMany" :key="i">
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox :label="item1" v-for="(item1,i) in item.attr_vals" :key="i" border></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="3">
          <el-form-item :label="item.attr_name" v-for="(item,i) in arrOnly" :key="i">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="4">
          <el-form-item>
            <el-upload class="upload-demo" :headers="headers" action="http://localhost:8888/api/private/v1/upload" list-type="picture" :on-remove="handleRemove" multiple :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="5">
          <el-form-item>
            <el-button type="success" @click="AddGoods()" plain>添加商品</el-button>
            <quill-editor class="richText" v-model="formdata.goods_introduce"></quill-editor>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>

  </el-card>
</template>

<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import { quillEditor } from "vue-quill-editor";
export default {
  components: {
    quillEditor
  },
  data() {
    return {
      active: "1",
      formdata: {
        goods_name: "",
        goods_price: "",
        goods_number: "",
        goods_weight: "",
        goods_cat: "",
        pics: [],
        goods_introduce: "",
        attrs: []
      },
      options: [],
      selectedOptions: [],
      defaultprops: {
        label: "cat_name", // label不写，默认值就是'label'
        // children: "children", // children不写，默认值就是'children'
        value: "cat_id"
      },
      arrMany: [],
      checkarr: [],
      arrOnly: [],
      headers: {
        Authorization: localStorage.getItem("token")
      }
    };
  },
  created() {
    this.getGoodsCate();
  },
  methods: {
    async AddGoods() {
      const arr1 = this.arrMany.map(item => {
        return { attr_id: item.attr_id, attr_value: item.attr_value };
      });
      const arr2 = this.arrOnly.map(item => {
        return { attr_id: item.attr_id, attr_value: item.attr_value };
      });

      this.formdata.attrs = [...arr1, ...arr2];
      const res = await this.$http.post(`goods`, this.formdata);
      console.log(res);
      const { meta: { status, msg }, data } = res.data;
      if (status === 201) {
        this.$message.success(msg);
        this.$router.push({
          name: "goods"
        });
      }
    },
    handleRemove(file, fileList) {
      // 方法一
      // file是被删除图片的数组数据
      // fileList就是剩余图片的数组数据，取值重新赋值给formdata.pics
      this.formdata.pics = [];
      fileList.forEach(item => {
        this.formdata.pics.push({ pics: item.response.data.tmp_path });
      });

      // 方法二
      // 在原有formdata.pics的基础上去掉被删除的图片数据
      // const Index = this.formdata.pics.findIndex(item => {
      //   return item.pic === file.response.data.tmp_path;
      // });
      // this.formdata.pics.splice(Index, 1);
    },
    handleSuccess(res) {
      const { meta: { msg, status }, data } = res;
      if (status === 200) {
        this.$message.success(msg);
        this.formdata.pics.push({
          pics: data.tmp_path
        });
      }
    },
    async handleClick() {
      if (this.active == 2 || this.active == 3) {
        if (this.selectedOptions.length != 3) {
          this.$message.warning("请选择商品的三级分类");
          if (this.active == 2) {
            this.arrMany = [];
          } else {
            this.arrOnly = [];
          }
          return;
        }
        if (this.active == 2) {
          const res = await this.$http.get(
            `categories/${this.selectedOptions[2]}/attributes?sel=many`
          );
          const { meta: { status }, data } = res.data;
          if (status === 200) {
            this.arrMany = data;
            this.arrMany.forEach(item => {
              item.attr_vals =
                item.attr_vals.trim().length === 0
                  ? [""]
                  : item.attr_vals.trim().split(",");
            });
          }
        }
        if (this.active == 3) {
          const res = await this.$http.get(
            `categories/${this.selectedOptions[2]}/attributes?sel=only`
          );
          const { meta: { status }, data } = res.data;
          if (status === 200) {
            this.arrOnly = data;
          }
        }
      }
    },
    handleChange(value) {
      this.formdata.goods_cat = value.join(",");
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
.steps {
  margin-top: 10px;
}
.title {
  margin-top: 20px;
}
.form {
  height: 400px;
  overflow: auto;
}
.richText {
  margin-top: 10px;
}
.ql-editor,
.ql-blank {
  min-height: 200px;
}
</style>
