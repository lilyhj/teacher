$(function () {
  var layer = layui.layer;
  var form = layui.form;
  //页面渲染1-分类信息
  initCate();
  initEditor();
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
        form.render();
      },
    });
  }

  var $image = $("#image");
  var options = {
    aspectRatio: 400 / 280,
    preview: ".img-preview",
  };
  $image.cropper(options);
  $("#btnChooseImage").on("click", function () {
    $("#coverFile").click();
  });
  $("#coverFile").on("change", function (e) {
    // 获取被选中的图片文件
    //获取文件列表
    // var files = e.target.files;
    var files = this.files; //等价于上一行代码
    if (files.length === 0) {
      return;
    }
    //重新渲染裁剪区域
    var file = e.target.files[0];
    var newImgURL = URL.createObjectURL(file);
    $image
      .cropper("destroy") // 销毁旧的裁剪区域
      .attr("src", newImgURL) // 重新设置图片路径
      .cropper(options); // 重新初始化裁剪区域
  });

  //   发布文章
  //1-处理文章状态
  var art_state = "已发布";
  //2-单击“存为草稿"按钮时，状态变为'草稿'
  $("#btnSave2").on("click", function () {
    art_state = "草稿";
  });
  $("#form-pub").on("submit", function (e) {
    e.preventDefault();
    //收集表单数据（formdata）
    var fd = new FormData(this);
    fd.append("state", art_state);
    // 先裁剪后收集
    $image
      .cropper("getCroppedCanvas", {
        // 创建一个 Canvas 画布
        width: 400,
        height: 280,
      })
      .toBlob(function (blob) {
        // 将 Canvas 画布上的内容，转化为文件对象
        // 得到文件对象后，进行后续的操作
      });
    fd.append("cover_img", blob);
    // fd.forEach(function (v, k) {
    //   console.log(v, k);
    // });
    //调接口函数
    publishArticle(fd);
  });
  function publishArticle(fd) {
    $.ajax({
      method: "POST",
      url: "/my/article/add",
      data: fd,
      contentType: false,
      processData: false,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("发布文章失败！");
        }
        layer.msg("发布文章成功！", function () {
          //提示框自动关闭时调用回调函数
          // 发布文章成功后，跳转到文章列表页面
          location.href = "/article/art_list.html";
        });
      },
    });
  }
});
