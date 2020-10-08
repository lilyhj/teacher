$(function () {
  var layer = layui.layer;
  var form = layui.form;
  //调用页面渲染函数
  initCate();
  initEditor();
  function initCate() {
    $.ajax({
      method: "GET",
      url: "/my/article/cates",
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("获取文章分类列表失败！");
        }
        var htmlStr = template("tpl-cate", res);
        $("[name=cate_id]").html(htmlStr);
        //调用form。render方法重新渲染下拉列表
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
  //为选择按钮添加点击事件
  $("#btnChooseImage").on("click", function () {
    $("#coverFile").click();
  });
  //弹出选择框事件 更换裁剪的图片
  $("#coverFile").on("change", function (e) {
    var files = this.files;
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
  //发布文章
  var art_state = "已发布";
  $("#btnSave2").on("click", function () {
    art_state = "草稿";
  });
  $("#form-pub").on("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(this);
    fd.append("state", art_state);
    $image
      .cropper("getCroppedCanvas", {
        // 创建一个 Canvas 画布
        width: 400,
        height: 280,
      })
      .toBlob(function (blob) {
        // 将 Canvas 画布上的内容，转化为文件对象
        // 得到文件对象后，进行后续的操作
        fd.append("cover_img", blob);
        //调用渲染函数
        publishArticle(fd);
      });
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
          return layer.msg("添加文章失败");
        }
        layer.msg("添加文章成功！", function () {
          location.href = "art_list.html";
        });
      },
    });
  }
});
