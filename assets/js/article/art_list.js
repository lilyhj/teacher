$(function () {
  var layer = layui.layer;
  var form = layui.form;
  var layPage = layui.layPage;
  //事件过滤器
  template.defaults.imports.dataFormat = function (date) {
    const dt = new Date(date);
    var y = dt.getFullYear();
    var m = padZero(dt.getMonth() + 1);
    var d = padZero(dt.getDate());
    var hh = padZero(dt.getHours());
    var mm = padZero(dt.getMinutes());
    var ss = padZero(dt.getSeconds());
    return y + "-" + m + "-" + d + " " + hh + ":" + mm + ":" + ss;
  };
  // 补零
  function padZero(n) {
    return n > 9 ? n : "0" + n;
  }
  var q = {
    pagenum: 1,
    pagesize: 2,
    cate_id: "",
    state: "",
  };
  initTable();
  function initTable() {
    $.ajax({
      method: "GET",
      url: "/my/article/list",
      data: q,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("获取文章列表失败！");
        }
        var htmlStr = template("tpl-table", res);
        $("tbody").html(htmlStr);
        renderPage(res.total);
      },
    });
  }
  initCate();
  function initCate() {
    $.ajax({
      method: "GET",
      url: "/my/article/cates",
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("初始化文章分类失败！");
        }
        var htmlStr = template("tpl-cate", res);
        $("[name=cate_id]").html(htmlStr);
        //调用，重弄西渲染表单曲
        form.render();
      },
    });
  }
  $("#form-search").on("submit", function (e) {
    e.preventDefault();
    // 收集数据
    var cate_id = $("[name=cate_id]").val();
    var state = $("[name=state]").val();
    // 修改参数对象
    q.cate_id = cate_id;
    q.state = state;
    // 调接口
    initTable();
  });
  function renderPage(total) {
    console.log(total);
    laypage.render({
      elem: "pageBox",
      count: total, // 总的条数
      limit: q.pagesize, // 每页显示的条数
      curr: q.pagenum, // 当前页的页码
      limits: [2, 4, 6, 8, 10],
      layout: ["count", "limit", "page", "prev", "next", "skip"],
      /* 
        1.首次渲染分页按钮时，调用jump回调
        2.单击分页按钮时，也调用jump回调
        first 是否首次
              true 首次渲染时调用了jump
              undefined 单击了页码按钮时调用了jump
      */
      jump: function (obj, first) {
        if (first === true) {
          return;
        }
        /* 
          obj 分页的所有选项值
            obj.curr 当前的页码值
        */
        console.log(obj.curr);
        q.pagenum = obj.curr;
        q.pagesize = obj.limit;
        initTable();
      },
    });
  }
  $("tbody").on("click", ".btn-delete", function () {
    // 获取删除按钮的个数
    var len = $(".btn-delete").length;
    var id = $(this).attr("data-id");
    layer.confirm("确定要删除此文章吗？", { icon: 3, title: "提示" }, function (
      index
    ) {
      $.ajax({
        method: "GET",
        url: "/my/article/delete/" + id,
        success: function (res) {
          if (res.status !== 0) {
            return layer.msg("删除文章失败");
          }
          layer.msg("删除文章成功");
          /* 
          小bug，如果当前页数据只有一条，被删除之后，上一页的数据没有获取到
          原因：重新获取数据时，没有对页码进行减1操作
          解决思路：
              判断当前被删除的数据， 是否是当前页的最后一条（判断删除按钮的个数）
              若当前为第一页则不跳转
        */
          if (len === 1) {
            q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1;
          }
          initTable();
        },
      });

      layer.close(index);
    });
  });
});
