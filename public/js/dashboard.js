

//Khởi tạo hiển thị
function fetchData(endpoint) {
  let url = '';
  let title = '';

  switch (endpoint) {
    case 'createProduct':
      $('#dataContent').empty();
      $('#userCreate').hide();
      $('#content2').show();
      $('#brandCreate').hide();
      fetchlistBrands();
      return;
    case 'brandCreate':
      $('#dataContent').empty();
      $('#userCreate').hide();
      $('#brandCreate').show();

      return;
    case 'createUser':
      $('#dataContent').empty();
      $('#content2').hide();
      $('#userCreate').show();
      $('#brandCreate').hide();
      return;
    case 'orderList':
      $('#content2').hide();
      $('#userCreate').hide();
      $('#brandCreate').hide();
      return;
    case 'searchOrderByUserId':
      $('#content2').hide();
      $('#userCreate').hide();
      $('#brandCreate').hide();
      return;
    case 'searchOrderByOrderId':

      $('#content2').hide();
      $('#userCreate').hide();
      $('#brandCreate').hide();
      $('#dataContent').html('<h2>Tra cứu đơn hàng theo ID đơn hàng</h2><p>Search orders by order ID form.</p>');
      return;
    default:
      $('#content2').hide();
      $('#content3').hide();
      $('#brandCreate').hide();
      $('#dataContent').html('<p>Content not found.</p>');
      return;
  }
}



















//--------------------------------------------------------------------------------------
//Lấy và hiển thị dữ liệu danh sách sản phẩm

function validateProductSearch(event) {
  event.target.value = event.target.value.replace(/[^0-9A-Za-zÀ-ỹ\s]/g, '');
}


function validateColor(event) {
  event.target.value = event.target.value.replace(/[^A-Za-zÀ-ỹ\s]/g, '');
}


function validateModelInput(event) {
  event.target.value = event.target.value.replace(/[^0-9A-Za-z]/g, '');
}

function validateCpu(event) {
  event.target.value = event.target.value.replace(/[^0-9A-Za-z\s]/g, '');
}


function validateDisplay(event) {
  event.target.value = event.target.value.replace(/[^0-9A-Za-z\s,"]/g, '');
}

function validateCamera(event) {
  event.target.value = event.target.value.replace(/[^0-9A-Za-zÀ-Ỹ\s,@]/g, '');
}


function validateDes(event) {
  event.target.value = event.target.value.replace(/[^A-Za-zÀ-ỹà-ỹ\s0-9.,-]/g, '');
}

function validateNumber(event) {
  event.target.value = event.target.value.replace(/[^0-9]/g, '');
}

function productList(user) {
  const apiUrl = '/settings/products';
  const brandUrl = '/settings/brands';

  function fetchData(user, page = 1) {
    const search = $('#searchInput').val();
    const brand = $('#filterInput').val();
    const dateSort = $('#filterProductDate').val();
    const hotSort = $('#filterHot').val();
    const statusSort = $('#filterStock').val();
    const saleSort = $('#filterSale').val();
    const params = {
      search,
      brand,
      page,
      dateSort,
      hotSort,
      statusSort,
      saleSort

    };


    $.post(apiUrl, params)
      .done(function (data) {
        renderTable(data.products, user);
        renderPagination(data.totalPages, data.currentPage);
      })
      .fail(function (xhr, status, error) {
        console.error('Error fetching data:', error);
      });
  }
  $('#content2').hide();
  $('#userCreate').hide();
  $('.spinner-grow').show();
  $('#brandCreate').hide();
  $('#dataContent').empty(); // Clear previous content
  let titleAction = ''
  if (user === 'Admin' || user === 'Nhân viên kho hàng') {
    titleAction = `<th>Tùy chọn</th>`
  }

  $('#dataContent').append(` <div class="container">
          <h2 class="font-weight-bold">Danh sách sản phẩm</h2>
   <nav class="navbar navbar-light bg-light mb-3 rounded">
      <div class="container-fluid">
  <div class="row g-3 align-items-center w-100">
    <div class="col-md-auto">
      <div class="form-group">
        <label for="searchInput">Tìm sản phẩm</label>
        <input
          type="text"
          id="searchInput"
          class="form-control"
          placeholder="Từ khóa"
          style="width: 450 px;"
          oninput="validateProductSearch(event)"
        />
      </div>
    </div>
    <div class="col-md-auto">
      <div class="form-group">
        <label for="filterInput">Thương hiệu</label>
        <select id="filterInput" class="form-select">
          <!-- Dropdown options will be inserted here by JavaScript -->
        </select>
      </div>
    </div>
    <div class="col-md-auto">
      <div class="form-group">
        <label for="filterProductDate">Thời gian</label>
        <select id="filterProductDate" class="form-select">
          <option value="-1">Mới nhất</option>
          <option value="1">Cũ nhất</option>
        </select>
      </div>
    </div>
    <div class="col-md-auto">
      <div class="form-group">
        <label for="filterStock">Tình trạng</label>
        <select id="filterStock" class="form-select">
          <option value="">Tất cả</option>
          <option value="2">Còn hàng</option>
          <option value="1">Thiếu hàng</option>
          <option value="0">Hết hàng</option>
        </select>
      </div>
    </div>
    <div class="col-md-auto">
      <div class="form-group">
        <label for="filterHot">Nổi bật</label>
        <select id="filterHot" class="form-select">
          <option value="">Tất cả</option>
          <option value="1">Đang Hot</option>
          <option value="0">Không</option>
        </select>
      </div>
    </div>
    <div class="col-md-auto">
      <div class="form-group">
        <label for="filterSale">Sale</label>
        <select id="filterSale" class="form-select">
          <option value="">Tất cả</option>
          <option value="1">Đang Sale</option>
          <option value="0">Không</option>
        </select>
      </div>
    </div>
  </div>
        </div>
      </nav>
          <table class="table table-striped mt-2 mb-2" style="border-radius: 10px; overflow: hidden;">
            <thead>
              <tr>
              <th>Hình ảnh</th>
              <th>ID</th>
                <th>Tên</th>
                <th>Thương hiệu</th>
                <th>Tình trạng</th>
                <th>Đã bán</th>
                <th>Hot</th>
                <th>Sale</th>
                ${titleAction}
              </tr>
            </thead>
            <tbody id="tableBody">
              <!-- Table data will be inserted here by JavaScript -->
            </tbody>
          </table>
          <nav>
            <ul class="pagination" id="pagination">
              <!-- Pagination buttons will be inserted here by JavaScript -->
            </ul>
          </nav>
        </div>`);

  function renderTable(products, user) {
    const tableBody = $('#tableBody');
    tableBody.empty();
    products.forEach(product => {
      let productStatus, statusText, isHot, textHot, isDiscount, discountText
      if (product.discount === 0) {
        discountText = "Không"
      } else {
        isDiscount = 'class="text-success"'
        discountText = "Đang Sale"
      }

      if (product.isHot === true) {
        isHot = `class="text-success"`
        textHot = "Có"
      } else {
        textHot = "Không"
      }

      if (product.outOfStock === "Còn hàng") {
        productStatus = `class="text-success"`
      } else if (product.outOfStock === "Thiếu hàng") {
        productStatus = `class="text-warning"`
      } else {
        productStatus = `class="text-danger"`
      }
      if (user === "Admin") {
        tableBody.append(`<tr>
        <td><img width=50 height=50 src="../data/product-images/${product.image}" alt=""></td>
                        <td>${product.productID}</td>
                        <td>${product.name}</td>
                        <td>${product.productBrand.brand}</td>
                        <td ${productStatus}>${product.outOfStock}</td>
                        <td>${product.customersPurchased}</td>
                        <td ${isHot}>${textHot}</td>
                        <td ${isDiscount}>${discountText}</td>
                        <td><a class="btn btn-secondary" href="/settings/products/${product._id}" target="_blank">sửa sản phẩm</a><button class="btn btn-danger ms-1 me-1" onclick="deProductConfirm('${product._id}','${user}')"">Xóa</button></td></tr>`);

      }
      else if (user === "Nhân viên kho hàng") {
        tableBody.append(`
          <tr>
          <td><img width=50 height=50 src="../data/product-images/${product.image}" alt=""></td>
          <td>${product.productID}</td>
        <td>${product.name}</td>
        <td>${product.productBrand.brand}</td>
        <td ${productStatus}>${product.outOfStock}</td>
        <td>${product.customersPurchased}</td>
        <td ${isHot}>${textHot}</td>
        <td ${isDiscount}>${discountText}</td>
        <td><a class="btn btn-secondary" href="/settings/products/${product._id}" target="_blank">sửa sản phẩm</a></td></tr>`);
      } else {
        tableBody.append(`<tr>
          <td><img width=50 height=50 src="../data/product-images/${product.image}" alt=""></td>
          <td>${product.productID}</td>
        <td>${product.name}</td>
        <td>${product.productBrand.brand}</td>
        <td ${productStatus}>${product.outOfStock}</td>
        <td>${product.customersPurchased}</td>
        <td ${isHot}>${textHot}</td>
        <td ${isDiscount}>${discountText}</td>
        </tr>`);

      }
    });
  }

  function renderPagination(totalPages, currentPage) {
    const pagination = $('#pagination');
    pagination.empty();
    for (let i = 1; i <= totalPages; i++) {

      pagination.append(`<li class="page-item ${i == currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
    }
  }

  function fetchBrands() {
    $.post(brandUrl)
      .done(function (brands) {
        const filterInput = $('#filterInput');
        filterInput.empty();
        filterInput.append(`<option value="" class="">Tất cả</option>`);
        brands.forEach(brand => {
          filterInput.append(`<option class="" value="${brand.brand}">${brand.brand}</option>`);
        });
      })
      .fail(function (xhr, status, error) {
        console.error('Error fetching brands:', error);
      });
  }

  $('#pagination').on('click', 'a', function (e) {
    e.preventDefault();
    const page = $(this).data('page');
    fetchData(user, page);
  });

  $('#searchInput').on('input', debounce(function () {
    fetchData(user);
  }, 300));





  $('#filterInput').change(function () {
    fetchData(user);
  });
  $('#filterProductDate').change(function () {
    fetchData(user);
  });
  $('#filterStock').change(function () {
    fetchData(user);
  });
  $('#filterHot').change(function () {
    fetchData(user);
  });
  $('#filterSale').change(function () {
    fetchData(user);
  });

  // Initial data fetch
  fetchData(user);
  fetchBrands();
  $('.spinner-grow').hide();
}















//--------------------------------------------------------------------------------------
//Lấy và hiện thi danh sách người dùng
function validateUserSearch(event) {
  event.target.value = event.target.value.replace(/[^0-9A-Za-z]/g, '');
}
function validatefirstName(event) {
  event.target.value = event.target.value.replace(/[^0-9A-Za-zÀ-ỹ]/g, '');
}
function validatelastName(event) {
  event.target.value = event.target.value.replace(/[^0-9A-Za-zÀ-ỹ\s]/g, '');
}





function userList(user) {

  const apiUrl = '/settings/users';
  // const brandUrl = '/settings/user/isAdmin';

  function fetchData(user, page = 1) {
    const search = $('#searchInput').val();
    const role = $('#filterRole').val();
    const dateSort = $('#filterDate').val();
    const status = $('#isActive').val();

    const params = {
      search,
      role,
      page,
      dateSort,
      status
    };

    $.post(apiUrl, params)
      .done(function (data) {
        renderTable(data.users, user);
        renderPagination(data.totalPages, data.currentPage);
      })
      .fail(function (xhr, status, error) {
        console.error('Error fetching data:', error);
      });
  }




  $('.spinner-grow').show();
  $('#dataContent').empty(); // Clear previous content
  $('#content2').hide();
  $('#userCreate').hide();
  $('#brandCreate').hide();
  let role = ''
  let displayRole = ''
  let displayBtn = ''
  if (user === 'Admin') {
    role = '<span class="me-2">Quyền</span><select id="filterRole" class="btn btn-outline-secondary"><option value="">Tất cả</option><option value="Khách hàng">Khách hàng</option><option value="Admin">Admin</option><option value="Nhân viên bán hàng">Nhân viên bán hàng</option><option value="Nhân viên kho hàng">Nhân viên kho hàng</option></select>'
    displayRole = '<th>Role</th>'
    displayBtn = `<th>Thao tác</th>`
  }
  $('#dataContent').append(` <div class="container">


          <h2>Danh sách Người dùng</h2>
               <nav class="navbar navbar-light bg-light mb-3 rounded">
  <div class="container-fluid">
  <div class="d-flex align-items-center">
    <input
      type="text"
      id="searchInput"
      class="form-control me-2"
      placeholder="Tìm tên người dùng"
      style="
      width:300px;max-width: 500px; height:100%"
      oninput="validateUserSearch(event)"
    />
    
              ${role}
      <span class="ms-2 me-2">Thời gian</span>
            <select id="filterDate" class="btn btn-outline-secondary">
              <option value="-1">Mới nhất</option>
              <option value="1">Cũ nhất</option>

            </select>
              <span class="ms-2 me-2">Tình trạng</span>
             <select id="isActive" class="btn btn-outline-secondary">
             <option value="">Tất cả</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Vô hiệu hóa</option>

            </select>
          </div>
    </div>
      </nav>
          <table class="table table-striped mt-2 mb-2" style="border-radius: 10px; overflow: hidden;">
            <thead>
              <tr>
              <th>ID</th>
                <th>Tên người dùng</th>
                <th>Họ và tên</th>
                <th>Tình trạng</th>
                <th>Ngày tạo</th>
                ${displayRole}
                ${displayBtn}
              </tr>
            </thead>
            <tbody id="tableBody">
              <!-- Table data will be inserted here by JavaScript -->
            </tbody>
          </table>
          <nav>
            <ul class="pagination" id="pagination">
              <!-- Pagination buttons will be inserted here by JavaScript -->
            </ul>
          </nav>
        </div>`);

  function renderTable(users, u) {
    const tableBody = $('#tableBody');
    tableBody.empty();
    users.forEach(user => {
      const dateFormat = new Date(user.accountCreatedDate).toLocaleDateString("en-GB")
      let toClass, toActive, textActive
      if (user === "Admin") {

        toClass = `class="text-danger"`
      } else if (user.role === "Manager") {
        toClass = `class="text-warning"`
      }
      if (user.isActive === true) {
        toActive = `class="text-success"`
        textActive = "Đang hoạt động"
      } else {
        toActive = `class="text-danger"`
        textActive = "Vô hiệu hóa"
      }
      let displayRole = ''
      let displayBtn = ''

      if (u === "Admin") {
        displayRole = `<td ${toClass}>${user.role}</td>`
        displayBtn = `<td>
        <button type="button" onclick="fetchUserData('${user._id}')" class="btn btn-secondary me-2" data-bs-toggle="modal" data-bs-target="#userDetails">
       Chi tiết
       </button> <form class="d-inline" action="/settings/users/${user._id}/edit"><button class="btn btn-danger">Sửa</button></form>
       </td>`
      }

      tableBody.append(`<tr>
    <td>${user.userID}</td>
    <td>${user.username}</td>
    <td>${user.lastName} ${user.firstName}</td>
    <td ${toActive}>${textActive}</td>
    <td>${dateFormat}</td>
    ${displayRole}
    ${displayBtn}
    </tr>`);
    });
  }

  function renderPagination(totalPages, currentPage) {
    const pagination = $('#pagination');
    pagination.empty();
    for (let i = 1; i <= totalPages; i++) {

      pagination.append(`<li class="page-item ${i == currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
    }
  }

  $('#pagination').on('click', 'a', function (e) {
    e.preventDefault();
    const page = $(this).data('page');
    fetchData(user, page);
  });

  $('#searchInput, #filterInput').on('input', debounce(function () {
    fetchData(user);
  }, 300));

  $('#filterRole').change(function () {
    fetchData(user);
  });
  $('#filterDate').change(function () {
    fetchData(user);
  });
  $('#isActive').change(function () {
    fetchData(user);
  });

  // Initial data fetch
  fetchData(user);
  $('.spinner-grow').hide();
}


















//--------------------------------------------------------------------------------------
//Lấy và hiện thi danh sách thương hiệu
function validateBrandSearch(event) {
  event.target.value = event.target.value.replace(/[^0-9A-Za-zÀ-ỹ\s]/g, '');
}


function brandList(user) {

  const apiUrl = '/settings/listbrands';
  // const brandUrl = '/settings/user/isAdmin';

  function fetchData(user, page = 1) {
    const search = $('#searchInput').val();
    const params = {
      search,
      page
    };
    $.post(apiUrl, params)
      .done(function (data) {
        renderTable(data.brands, user);
        renderPagination(data.totalPages, data.currentPage);
      })
      .fail(function (xhr, status, error) {
        console.error('Error fetching data:', error);
      });
  }




  $('.spinner-grow').show();
  $('#dataContent').empty(); // Clear previous content
  $('#content2').hide();
  $('#userCreate').hide();
  $('#brandCreate').hide();
  $('#dataContent').append(` <div class="container">


          <h2>Danh sách thương hiệu</h2>
               <nav class="navbar navbar-light bg-light mb-3 rounded">
      <div class="container-fluid">
  <div class="d-flex align-items-center">
    <input
      type="text"
      id="searchInput"
      class="form-control me-2"
      placeholder="Tìm thương hiệu"
      style="
      width:300px;max-width: 500px; height:100%"
      oninput="validateBrandSearch(event)"
    />
    </div>
    </div>
    </nav>
          <table class="table table-striped mt-2 mb-2" style="border-radius: 10px; overflow: hidden;">
            <thead>
              <tr>
                <th>Tên thương hiệu</th>
                
                <th></th>
              </tr>
            </thead>
            <tbody id="tableBody">
              <!-- Table data will be inserted here by JavaScript -->
            </tbody>
          </table>
          <nav>
            <ul class="pagination" id="pagination">
              <!-- Pagination buttons will be inserted here by JavaScript -->
            </ul>
          </nav>
        </div>`);

  function renderTable(brands, user) {
    const tableBody = $('#tableBody');
    tableBody.empty();
    brands.forEach(brand => {
      if (user === "Admin") {
        tableBody.append(`<tr>
      <td>${brand.brand}</td>
    <td>
    <button type="button" onclick="fetchBrandData('${user}','${brand._id}')" class="btn btn-secondary me-2" data-bs-toggle="modal" data-bs-target="#changeBrandName">
      Sửa </button>
    <button class="btn btn-danger me-2" onclick="deBrandConfirm('${user}', '${brand._id}')">
    Xóa </button>
    </td>
      </tr>`)
      } else {
        tableBody.append(`<tr>
        <td>${brand.brand}</td>
        <td>

        </td>
        </tr>`)
      }

    })
  }

  function renderPagination(totalPages, currentPage) {
    const pagination = $('#pagination');
    pagination.empty();
    for (let i = 1; i <= totalPages; i++) {

      pagination.append(`<li class="page-item ${i == currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
    }
  }

  $('#pagination').on('click', 'a', function (e) {
    e.preventDefault();
    const page = $(this).data('page');
    fetchData(user, page);
  });

  $('#searchInput').on('input', debounce(function () {
    fetchData(user);
  }, 300));


  // Initial data fetch
  fetchData(user);
  $('.spinner-grow').hide();
}




//Thông báo xác nhận trước khi xóa thương hiệu
function deBrandConfirm(user, brandId) {
  swal({
    title: "Xác nhận xóa",
    text: "Bạn có muốn xóa thương hiệu này?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
    .then((willDelete) => {
      if (willDelete) {
        deBrand(user, brandId)
      }
    });
}




function deBrand(user, brandId) {

  $.ajax({
    url: `/settings/brand/${brandId}`,
    type: 'DELETE',
    success: function (response) {
      if (response.success) {
        brandList(user)
        swal(`${response.message}`, {
          icon: "success",
        });

      } else {
        swal(`${response.message}`, {
          icon: "error",
        });
      }
    },
    error: function () {
      swal("Có lỗi xảy ra, vui lòng thử lại!");
    }
  });
};











//Thông báo xác nhận trước khi xóa sản phẩm
function deProductConfirm(productId,user) {
  swal({
    title: "Xác nhận trước khi xóa",
    text: "Bạn chắc chắn muốn xóa sản phẩm này?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
    .then((willDelete) => {
      if (willDelete) {
        deProduct(productId,user)
      }
    });
}


function deProduct(productId,user) {

  $.ajax({
    url: `/settings/product/${productId}`,
    type: 'DELETE',
    success: function (response) {
      if (response.success) {
        productList(user)
        swal("Đã xóa thành công", {
          icon: "success",
        });

      } else {
        swal("Có lỗi xảy ra, vui lòng thử lại!");
      }
    },
    error: function () {
      swal("Có lỗi xảy ra, vui lòng thử lại!");
    }
  });
};













function fetchlistBrands() {

  $.ajax({
    url: '/brands',
    type: 'POST',
    success: function (brands) {
      const $select = $('#brand-select');
      $select.empty();
      brands.forEach(function (brand) {
        $select.append(`<option value="${brand._id}">${brand.brand}</option>`);
      });
    },
    error: function () {
      alert('An error occurred while fetching brands.');
    }
  });
};










//--------------------------------------------------------------------------------------
//Form tạo thương hiệu
$('#brandForm').submit(function (e) {
  e.preventDefault();
  const user = $('#brandCreateUser').val();
  var formData = new FormData(this);

  var urlParams = new URLSearchParams();
  for (let [key, value] of formData.entries()) {
    urlParams.append(key, value);
  }

  $.ajax({
    type: 'POST',
    url: '/settings/createbrand',
    data: urlParams.toString(),
    processData: false,
    contentType: 'application/x-www-form-urlencoded',
    success: function (response) {
      if (response.success) {
        success(`${response.message}`, "", "success");
        brandList(user);
        $('#brandForm')[0].reset();
      } else {
        fail(`${response.message}`, "Hãy thử lại", "error");
      }
    },
    error: function (xhr, status, error) {
      let errorMessage = error;
      if (xhr.responseJSON && xhr.responseJSON.message) {
        errorMessage = xhr.responseJSON.message;
      }
      fail("Lỗi tạo thương hiệu", `${errorMessage}`, "error");
    }
  });
});


























//--------------------------------------------------------------------------------------
//Kiểm tra và gửi dữ liệu từ form tạo sản phẩm lên server
$('#productForm').submit(function (e) {
  e.preventDefault();
  const user = $('#productCreateUser').val();

  // Create a FormData object and append form data
  var formData = new FormData(this);


  // Check the file before sending the AJAX request
  var fileInput = $('#image');
  var file = fileInput[0].files[0];

  if (file) {
    var fileType = file.type;
    var fileSize = file.size;

    var allowedTypes = ['image/jpeg', 'image/png'];
    var maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (!allowedTypes.includes(fileType)) {
      fail("Lỗi tải tệp", "Chỉ chấp nhận các tệp JPG và PNG.", "error");
      return;
    }

    if (fileSize > maxSize) {
      fail("Lỗi tải tệp", "Kích thước tệp không được vượt quá 5MB.", "error");
      return;
    }
  } else {
    fail("Lỗi tải tệp", "Vui lòng chọn một tệp để tải lên.", "error");
    return;
  }

  // Send the AJAX request
  $.ajax({
    type: 'POST',
    url: '/settings/products/create', // Add the server-side route here
    data: formData,
    processData: false, // Important: Prevent jQuery from processing the data
    contentType: false, // Important: Prevent jQuery from setting the content type
    success: function (response) {
      if (response.success) {
        success("Tạo sản phẩm thành công", "", "success");
        productList(user);
        // Optionally, you can reset the form after successful submission
        $('#productForm')[0].reset();
      } else {
        fail("Lỗi tạo sản phẩm", "Hãy thử lại", "error");
      }
    },
    error: function (xhr, status, error) {
      let errorMessage = error;
      if (xhr.responseJSON && xhr.responseJSON.message) {
        errorMessage = xhr.responseJSON.message;
      }
      fail("Lỗi tạo sản phẩm", `${errorMessage}`, "error");
    }
  });
});




$('#button2').click(function () {
  $('#content2').toggle();
});


// Get all list items
var listItems = document.querySelectorAll('.list-group-item');

// Add click event listener to each list item
listItems.forEach(function (item) {
  item.addEventListener('click', function () {
    // Remove 'active' class from all list items
    listItems.forEach(function (item) {
      item.classList.remove('list-group-item-info');
    });

    // Add 'active' class to the clicked list item
    this.classList.add('list-group-item-info');
  });
});









//--------------------------------------------------------------------------------------
//Lấy và hiện thị chi tiết thông tin người dùng
function fetchUserData(userId) {
  $.ajax({
    url: '/settings/userinfo',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      id: userId
    }),
    success: function (data) {
      const dateFormat = new Date(data.accountCreatedDate).toLocaleDateString("en-GB")
      let address
      if (data.shippingAddress === null) {
        address = "(Chưa có thông tin)"
      } else (
        address = `${data.shippingAddress.type.address}, ${data.shippingAddress.type.city}, ${data.shippingAddress.type.district}, ${data.shippingAddress.type.country}`
      )
      $('#usernamee').text(data.username);
      $('#firstNamee').text(data.firstName);
      $('#lastNamee').text(data.lastName);
      $('#phoneNumberr').text(data.phoneNumber);
      $('#emaill').text(data.email);
      $('#addresss').text(address);
      $('#rolee').text(data.role);
      $('#isActivee').text(data.isActive);
      $('#creationDatee').text(dateFormat);
    },
    error: function (err) {
      console.error('Error fetching user data:', err);
    }
  });
}












//--------------------------------------------------------------------------------------
//Lấy và hiện thị dữ liệu người dùng
function validateOrderSearch(event) {
  event.target.value = event.target.value.replace(/[^0-9A-Za-z]/g, '');
}

function orderList(user) {

  const apiUrl = '/settings/orders';
  // const brandUrl = '/settings/user/isAdmin';

  function fetchData(user, page = 1) {
    const search = $('#searchInput').val();
    const dateSort = $('#filterDate').val();
    const status = $('#orderStatus').val();

    const params = {
      search,
      page,
      dateSort,
      status
    };

    $.post(apiUrl, params)
      .done(function (data) {
        renderTable(data.orders, user);
        renderPagination(data.totalPages, data.currentPage);
      })
      .fail(function (xhr, status, error) {
        console.error('Error fetching data:', error);
      });
  }
  $('.spinner-grow').show();
  $('#dataContent').empty();
  $('#content2').hide();
  $('#userCreate').hide();
  $('#brandCreate').hide();

  $('#dataContent').append(` <div class="container">


          <h2>Danh sách đơn hàng</h2>
               <nav class="navbar navbar-light bg-light mb-3 rounded">
      <div class="container-fluid">
        <div class="d-flex align-items-center">
    <input
      type="text"
      id="searchInput"
      class="form-control me-2"
      placeholder="Tra ID đơn hàng"
      style="
      width:300px;max-width: 500px; height:100%"
      oninput="validateOrderSearch(event)"
    />
  
      <span class="ms-2 me-2">Thời gian</span>
            <select id="filterDate" class="btn btn-outline-secondary">
              <option value="-1">Mới nhất</option>
              <option value="1">Cũ nhất</option>

            </select>
              <span class="ms-2 me-2">Trạng thái</span>
             <select id="orderStatus" class="btn btn-outline-secondary">
             <option selected value="">Tất cả</option>
             <option value="1">Đã hủy</option>
              <option value="2">Đợi xác nhận</option>
              <option value="3">Chuẩn bị hàng</option>
              <option value="4">Đang giao hàng</option>
              <option value="5">Hoàn thành</option>

            </select>

        </div>
        </div>
        </nav>
          <table class="table table-striped mt-2 mb-2" style="border-radius: 10px; overflow: hidden;">
            <thead>
              <tr>
              <th>ID đơn hàng</th>
                <th>Người dùng</th>
                <th>Tổng</th>
                <th>Hình thức</th>
                <th>Ngày mua</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody id="tableBody">
              <!-- Table data will be inserted here by JavaScript -->
            </tbody>
          </table>
          <nav>
            <ul class="pagination" id="pagination">
              <!-- Pagination buttons will be inserted here by JavaScript -->
            </ul>
          </nav>
        </div>`);

  function renderTable(orders, user) {
    const tableBody = $('#tableBody');
    tableBody.empty();
    orders.forEach(order => {
      let orderID, statusAlert, disabled = ""

      const dateFormat = new Date(order.createdAt).toLocaleDateString("en-GB")
      const totalCost = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalCost)
      if (order.status === "Hoàn thành" || order.status === "Đã hủy") {
        disabled = "disabled";
      } else {
        orderID = `onclick="fetchOrderData('${order.orderID}',2)"`;
      }
      if (order.status === "Đợi xác nhận") {
        statusAlert = "text-warning"
      } else if (order.status === "Chuẩn bị hàng") {
        statusAlert = "text-info"
      } else if (order.status === "Đang giao hàng") {
        statusAlert = "text-success"
      } else if (order.status === "Đã hủy") {
        statusAlert = "text-danger"
      }
      let isAction = ""
      if (user === "Admin" || user === "Nhân viên bán hàng") {
        isAction = `<td>
        <button type="button" ${orderID} class="btn btn-outline-secondary me-2 ${disabled}" ${disabled} data-bs-toggle="modal" data-bs-target="#changeStatusOrder">Sửa</button>
        <button type="button" onclick="fetchOrderData('${order.orderID}',1)" class="btn btn-secondary me-2" data-bs-toggle="modal" data-bs-target="#orderDetails">Chi tiết</button>
        <a class="btn btn-secondary me-2" href="/invoice/${order.orderID}" target="_blank">Xuất hóa đơn</a>
        </td>`
      } else {
        isAction = `<td><button type="button" onclick="fetchOrderData('${order.orderID}',1)" class="btn btn-secondary me-2" data-bs-toggle="modal" data-bs-target="#orderDetails">Chi tiết</button></td>`
      }
      tableBody.append(`<tr>
      <td>${order.orderID}</td>
      <td>${order.user.username}</td>
      <td>${totalCost}</td>
      <td>${order.paymentMethod}</td>
      <td>${dateFormat}</td>
      <td class="${statusAlert}">${order.status}</td>
      ${isAction}
      </tr>`);
    });
  }

  function renderPagination(totalPages, currentPage) {
    const pagination = $('#pagination');
    pagination.empty();
    for (let i = 1; i <= totalPages; i++) {

      pagination.append(`<li class="page-item ${i == currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
    }
  }

  $('#pagination').on('click', 'a', function (e) {
    e.preventDefault();
    const page = $(this).data('page');
    fetchData(user, page);
  });

  $('#searchInput, #filterInput').on('input', debounce(function () {
    fetchData(user);
  }, 300));

  $('#filterDate').change(function () {
    fetchData(user);
  });
  $('#orderStatus').change(function () {
    fetchData(user);
  });

  // Initial data fetch
  fetchData(user);
  $('.spinner-grow').hide();
}


$('#button2').click(function () {
  $('#content2').toggle();
});

// Get all list items
var listItems = document.querySelectorAll('.list-group-item');

// Add click event listener to each list item
listItems.forEach(function (item) {
  item.addEventListener('click', function () {
    // Remove 'active' class from all list items
    listItems.forEach(function (item) {
      item.classList.remove('list-group-item-info');
    });

    // Add 'active' class to the clicked list item
    this.classList.add('list-group-item-info');
  });
});

function successChangeOrderStatus() {
  swal("Cập nhật thành công!", "", "success", {
    button: "OK!",
  });
}










//--------------------------------------------------------------------------------------
//Lấy và hiện thị chi tiết người dùng
function fetchUserData(userId) {
  $.ajax({
    url: '/settings/userinfo',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      id: userId
    }),
    success: function (data) {
      const dateFormat = new Date(data.accountCreatedDate).toLocaleDateString("en-GB")
      let address
      if (data.shippingAddress === null) {
        address = "(Chưa có thông tin)"
      } else (
        address = `${data.shippingAddress.address}, ${data.shippingAddress.city}, ${data.shippingAddress.district}, ${data.shippingAddress.country}`
      )
      $('#usernamee').text(data.username);
      $('#firstNamee').text(data.firstName);
      $('#lastNamee').text(data.lastName);
      $('#phoneNumberr').text(data.phoneNumber);
      $('#emaill').text(data.email);
      $('#addresss').text(address);
      $('#rolee').text(data.role);
      $('#isActivee').text(data.isActive);
      $('#creationDatee').text(dateFormat);
    },
    error: function (err) {
      console.error('Error fetching user data:', err);
    }
  });
}














//--------------------------------------------------------------------------------------
//Lấy và hiện thị chi tiết đơn hàng
function fetchOrderData(orderID, check) {
  $.ajax({
    url: '/settings/orderinfo',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      id: orderID
    }),
    success: function (data) {
      if (check === 1) {
        const dateFormat = new Date(data.createdAt).toLocaleDateString("en-GB");

        // Shipping Address
        let shippingAddress;
        if (data.shippingAddress === null) {
          shippingAddress = "(Chưa có thông tin)";
        } else {
          shippingAddress = `${data.shippingAddress.address}, ${data.shippingAddress.city}, ${data.shippingAddress.district}, ${data.shippingAddress.country}`;
        }

        // Billing Address
        let billingAddress;
        if (data.billingAddress === null) {
          billingAddress = "(Chưa có thông tin)";
        } else {
          billingAddress = `${data.billingAddress.address}, ${data.billingAddress.city}, ${data.billingAddress.district}, ${data.billingAddress.country}`;
        }
        const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.priceAll)
        // Populate modal fields with fetched data
        $('#orderID').text(data.orderID);
        $('#trackingID').text(data.trackingID);
        $('#quantityAll').text(data.quantityAll);
        $('#priceAll').text(`${formattedPrice}`);

        // Shipping Address
        $('#shippingFullName').text(data.shippingAddress?.fullName || "(Chưa có thông tin)");
        $('#shippingPhoneNumber').text(data.shippingAddress?.phoneNumber || "(Chưa có thông tin)");
        $('#shippingAddress').text(data.shippingAddress ? shippingAddress : "(Chưa có thông tin)");

        // Billing Address
        $('#billingFullName').text(data.billingAddress?.fullName || "(Chưa có thông tin)");
        $('#billingPhoneNumber').text(data.billingAddress?.phoneNumber || "(Chưa có thông tin)");
        $('#billingAddress').text(data.billingAddress ? billingAddress : "(Chưa có thông tin)");

        // User Information
        $('#userFirstName').text(data.user.firstName);
        $('#userLastName').text(data.user.lastName);
        $('#userUsername').text(data.user.username);

        // Items
        const itemsList = $('#itemsList');
        itemsList.empty();
        data.items.forEach(item => {
          const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)
          const tong = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.priceAll)
          itemsList.append(`
           <li class="list-group-item">
          <p><strong>Sản phẩm:</strong> ${item.product} - Màu ${item.color} - ${item.ram} GB - ${item.storage} GB</p>
          <p><strong>SL:</strong> ${item.quantity}</p>
          <p><strong>Giá:</strong> ${formattedPrice} / sản phẩm</p>
          <p class="text-end"><strong>Tổng:</strong> ${tong} đ</p>
           </li>
          `);
        });

        // Order Status and Creation Date
        $('#status').text(data.status);
        $('#createdAt').text(dateFormat);
      } else if (check === 2) {

        var $form = $('#statusForm');
        $form.attr('action', `/settings/orderinfo/${orderID}`);
        $('#statusPro').text(data.status);
        $('#order').text(data.orderID);
        if (data.status === "Đợi xác nhận") {
          $("#changeOrderStatus").val("2");
        }
        else if (data.status === 'Chuẩn bị hàng') {
          $("#changeOrderStatus").val("3");
        }
        else if (data.status === 'Đang giao hàng') {
          $("#changeOrderStatus").val("4");
        }

      }
    },
    error: function (err) {
      console.error('Error fetching order data:', err);
    }
  });
}











//--------------------------------------------------------------------------------------
//Lấy và hiển thị thương hiệu
function fetchBrandData(user, brandID) {
  $.ajax({
    url: '/settings/brandinfo',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      id: brandID
    }),
    success: function (data) {
      var $form = $('#BrandModify');
      $form.attr('action', `/settings/brandinfo/${brandID}`);
      $('#Brandname').val(data.brand);
      $('#getUserR').val(user);
    },
    error: function (err) {
      console.error('Error fetching order data:', err);
    }
  });
}













//--------------------------------------------------------------------------------------
//Cập nhật tình trạng đơn hàng lên server
$('#statusForm').on('submit', function (event) {
  event.preventDefault();
  var formAction = $(this).attr('action'); // Get the form's action attribute

  var formData = new FormData(this);
  var status = formData.get('OrderStatus');

  const user = $('#statusCreateUser').val();


  $.ajax({
    url: `${formAction}/${status}`,
    method: 'POST',
    data: formData,
    processData: false, // Tell jQuery not to process the data
    contentType: false, // Tell jQuery not to set the content-type header
    success: function (data) {
      successChangeOrderStatus()
      orderList(user)
    },
    error: function (err) {
      console.error('Error updating order status:', err);
      fail()
    }
  });
});












//--------------------------------------------------------------------------------------
//Cập nhật tên thương hiệu lên server
$('#BrandModify').on('submit', function (event) {
  const user = $('#getUserR').val();
  event.preventDefault();
  var formAction = $(this).attr('action');
  var formData = {
    Brandname: $(this).find('#Brandname').val()
  };

  $.ajax({
    url: `${formAction}`,
    method: 'POST',
    data: JSON.stringify(formData),
    contentType: 'application/json',
    success: function (data) {
      if (data.success) {
        successChangeOrderStatus();
        brandList(user);
      }
      else {
        fail("Lỗi", `${data.error}`, "error");
        brandList(user)
      }
    },
    error: function (err) {
      console.error('Error updating order status:', err);
      fail();
    }
  });
});










//Hiện thông báo thành công hay thất bại khi cập nhật
function success(notify, detail, status) {
  swal(`${notify}`, `${detail}`, `${status}`, {
    button: "OK!",
  });
}

function fail(notify, detail, status) {
  swal(`${notify}`, `${detail}`, `${status}`, {
    button: "OK!",
  });
}































//--------------------------------------------------------------------------------------
//Hiển thị thống kê chung
function dashboardList(user, startDate = null, endDate = null) {
  const apiUrl = '/settings/dashboards';
  const requestData = startDate && endDate ? { startDate, endDate } : {};


  function fetchData(user) {
    $.post(apiUrl, requestData)
      .done(function (data) {
        renderDashboardData(user, data);
      })
      .fail(function (xhr, status, error) {
        console.error('Error fetching data:', error);
      });
  }

  $('.spinner-grow').show();
  $('#dataContent').empty();
  $('#content2').hide();
  $('#userCreate').hide();
  $('#brandCreate').hide();
  let newU = ''
  let newP = ''
  let newO = ''
  let summaryDisplay = ''
  let revenue = ''
  let countUser = ''
  if (!(startDate && endDate)) {
    newP = '<span>(</span><span id="newProducts">0</span><span> sản phẩm mới)</span>'
    newO = '<span>(</span><span id="newOrders">0</span><span> đơn hàng mới)</span>'
    newU = '<span>(</span><span id="newUsers">0</span><span> người dùng mới)</span>'
  }
  if (user === 'Admin') {
    summaryDisplay = `<div class="col-md-4 mb-3">
  <div class="card h-100">
    <div class="card-body">
      <h5 class="card-title">Người dùng</h5>
      <ul class="list-group list-group-flush">
        <li class="list-group-item d-flex justify-content-between align-items-center">
          Khách hàng
          <span class="badge bg-success rounded-pill" id="customers">Đang tải</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
          Nhân viên bán hàng
          <span class="badge bg-warning rounded-pill" id="salesStaff">Đang tải</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
          Nhân viên kho hàng
          <span class="badge bg-info rounded-pill" id="warehouseStaff">Đang tải</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
          Admin
          <span class="badge bg-danger rounded-pill" id="admins">Đang tải</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
        Bị vô hiệu hóa
        <span class="text-danger" id="disabledUsers">Đang tải</span>
      </li>
      </ul>
    </div>
   </div>
  </div>`

    countUser = ` <div class="col-md-3 mb-3">
  <div class="card bg-danger text-white h-100">
    <div class="card-body">
      <h5 class="card-title">Người dùng</h5>
      <p class="card-text" style="border-top: 1px solid white;
      padding-top: 10px;" id="totalAllUsers">0</p>${newU}
    </div>
  </div>
  </div>`

  }
  if (user === 'Admin' || user === 'Nhân viên bán hàng') {

    revenue = `<div class="col-md-3 mb-3">
    <div class="card bg-success text-white h-100">
      <div class="card-body">
        <h5 class="card-title">Doanh thu nhận được</h5>
        <p class="card-text" id="totalRevenue">0</p>
        <h5 style="border-top: 1px solid white;padding-top:10px" class="card-title">Doanh thu đang chờ</h5>
        <h3 class="card-text text-center" id="activeRevenue">0 VNĐ</h3>
      </div>
    </div>
  </div>`

  }
  const dashboardTemplate = `

    <div class="container">

    <div class="row">
      <h1>Thống kê chung <span id="dateRange"></span></h1>
      <div class="row mb-3">
        <div class="col-md-5">
          <label for="startDateInput" class="form-label">Từ ngày:</label>
          <input type="date" class="form-control" name="startDate" id="startDateInput">
        </div>
        <div class="col-md-5">
          <label for="endDateInput" class="form-label">Tới ngày:</label>
          <input type="date" class="form-control" name="endDate" id="endDateInput">
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button type="button" class="btn btn-primary w-100" onclick="filterbtn('${user}')">Lọc</button>
        </div>
      </div>
  
      <div class="row">
        ${revenue}
        <div class="col-md-3 mb-3">
          <div class="card bg-primary text-white h-100">
            <div class="card-body">
              <h5 class="card-title">Sản phẩm</h5>
              <p class="card-text" id="totalProducts" style="border-top: 1px solid white;
              padding-top: 10px;">0</p>${newP}
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card bg-warning text-white h-100">
            <div class="card-body">
              <h5 class="card-title">Đơn hàng</h5>
              <p class="card-text" style="border-top: 1px solid white;
              padding-top: 10px;" id="totalOrders">0</p>${newO}
            </div>
          </div>
        </div>
       ${countUser}
      </div>
      <h2>Chi tiết</h2>
      <div class="row">
        ${summaryDisplay}
        <div class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Đơn hàng</h5>
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  Hoàn tất
                  <span class="badge bg-success rounded-pill" id="completedOrders">Đang tải</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  Đang chờ duyệt
                  <span class="badge bg-info rounded-pill" id="pendingOrders">Đang tải</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  Đang xử lý
                  <span class="badge bg-warning rounded-pill" id="preparingOrders">Đang tải</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  Bị hủy
                  <span class="badge bg-danger rounded-pill" id="canceledOrders">Đang tải</span>
                </li>
                
              </ul>
            </div>
          </div>
        </div>


        <div class="col-md-4 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Sản phẩm</h5>
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Còn hàng
                <span class="badge bg-success rounded-pill" id="haveStock">Đang tải</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Thiếu hàng
                <span class="badge bg-warning rounded-pill" id="lowStock">Đang tải</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Hết hàng
                <span class="badge bg-danger rounded-pill" id="endStock">Đang tải</span>
              </li>
           
              
            </ul>
          </div>
        </div>
      </div>


  
      </div>
      <!-- Các mục khác -->
    </div>
  </div>
    `;

  $('#dataContent').append(dashboardTemplate);

  fetchData(user);
  $('.spinner-grow').hide();
}

function renderDashboardData(user, data) {
  const totalRevenue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.totalRevenue)
  const activeRevenue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.activeRevenue)

  $('#totalOrders').text(data.totalOrders);
  $('#totalProducts').text(data.totalProducts);


  if (user === 'Admin') {
    $('#admins').text(data.admins);
    $('#totalAllUsers').text(data.totalUsers);
    $('#customers').text(data.customers);
    $('#salesStaff').text(data.salesStaff);
    $('#warehouseStaff').text(data.warehouseStaff);
    $('#totalRevenue').text(`${totalRevenue}`);
    $('#activeRevenue').text(activeRevenue);
  }
  else if (user === 'Nhân viên bán hàng') {
    $('#totalRevenue').text(`${totalRevenue}`);
    $('#activeRevenue').text(activeRevenue);
  }

  $('#completedOrders').text(data.completedOrders);
  $('#pendingOrders').text(data.pendingOrders);
  $('#preparingOrders').text(data.preparingOrders);
  $('#canceledOrders').text(data.canceledOrders);

  $('#disabledUsers').text(data.disabledUsers);
  $('#haveStock').text(data.haveStock);
  $('#lowStock').text(data.lowStock);
  $('#endStock').text(data.endStock);
  if (!(data.startDate && data.endDate)) {
    if (user === 'Admin') {
      $('#newUsers').text(data.newUsers);
    }
    $('#newProducts').text(data.newProducts);
    $('#newOrders').text(data.newOrders);
  }
  else {
    $('#dateRange').text(`(${data.startDate} tới ${data.endDate})`)
  }

}














//Lựa chọn lọc phạm vi ngày trong thống kê chung
function filterbtn(user) {
  const startDateInput = document.getElementById('startDateInput');
  const endDateInput = document.getElementById('endDateInput');
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  dashboardList(user, startDate, endDate);
};



function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}