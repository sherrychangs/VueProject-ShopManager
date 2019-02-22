<template>
  <el-container class="homecontainer">
    <el-header class="header">
      <el-row>
        <el-col :span="4">
          <img src="@/assets/logo.png" alt="图片加载失败">
        </el-col>
        <el-col :span="19">
          <h2 class="middle">后台管理系统</h2>
        </el-col>
        <el-col :span="1">
          <div class="grid-content bg-purple">
            <a href="#" class="loginout" @click.prevent="loginOut()">退出</a>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-container class="bodycontainer">
      <el-aside class="aside" width="200px">
        <el-menu :default-active="$route.name" class="el-menu-vertical-demo" :unique-opened="true" :router="true">
          <el-submenu :index="v.path" v-for="(v,i) in menus" :key="i" >
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{v.authName}}</span>
            </template>
            <el-menu-item :index="item.path" v-for="(item,i) in v.children" :key="i">
              <i class="el-icon-menu"></i>
              <span>{{item.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
export default {
  data(){
    return {
      menus:[]
    }
  },
  created(){
    this.getMenus()
  },
  methods: {
    async getMenus(){
      const res = await this.$http.get(`menus`)
      const {meta:{status},data} = res.data
      if(status===200){
        this.menus = data
      }
    },
    loginOut () {
      localStorage.clear()
      this.$router.push({
        name: 'login'
      })
      this.$message.success('退出成功')
    }
  }
}
</script>

<style>
.homecontainer {
  background-color: #e9eef3;
  height: 100%;
}
.header {
  background-color: #b3c0d1;
  height: 60px;
  padding: 0;
  line-height: 60px;
}
.middle {
  text-align: center;
  color: #fff;
}
.loginout {
  text-decoration: none;
}
.bodycontainer {
  height: 100%;
}
.aside {
  background-color: #fff;
  height: 100%;
}
</style>
