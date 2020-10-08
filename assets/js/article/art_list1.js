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
  initCate();
  function initTable() {
    $.ajax({
      method: "GET",
      url: "/my/article/list",
      data: q,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("初始化文章列表失败！");
        }
        var htmlStr = template("tpl-table", res);
        $("tbody").html(htmlStr);
        renderPage(res.total);
      },
    });
  }
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
  //   筛选数据
  $("#form-search").on("submit", function (e) {
    e.preventDefault();
    var cate_id = $("[name=cate_id]").val();
    var state = $("[name=state]").val();
    q.cate_id = cate_id;
    q.state = state;
    initTable();
  });
  function renderPage(total) {
    laypage.render({
      elem: "pageBox",
      count: total, // 总的条数
      limit: q.pagesize, // 每页显示的条数
      curr: q.pagenum, // 当前页的页码
      limits: [2, 4, 6, 8, 10],
      layout: ["count", "limit", "page", "prev", "next", "skip"],
      jump: function (obj, first) {
        if (first === true) {
          return;
        }
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
          //判断当前页面的删除按钮个数是否为1，并且用三元表达式判断当前页面是否为第一页，若为第一页则不跳转
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
