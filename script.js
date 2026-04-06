let menu = document.getElementById("menu");
let logOut = document.getElementById("log-out");
let sidebarToggle = document.getElementById("sidebarToggle");
let sidebar = document.getElementById("sidebar");

// Create overlay element for mobile
let sidebarOverlay = null;

// Sidebar Toggle Functionality
if (sidebarToggle && sidebar) {
  // Create overlay element
  function createOverlay() {
    if (!sidebarOverlay) {
      sidebarOverlay = document.createElement("div");
      sidebarOverlay.className = "sidebar-overlay";
      document.body.appendChild(sidebarOverlay);
    }
  }

  // Toggle sidebar
  function toggleSidebar() {
    const isMobile = window.innerWidth < 992;

    if (isMobile) {
      createOverlay();
      sidebar.classList.toggle("show");
      sidebarOverlay.classList.toggle("active");
    } else {
      sidebar.classList.toggle("collapsed");
      // Make sure overlay is hidden on desktop
      if (sidebarOverlay) {
        sidebarOverlay.classList.remove("active");
      }
    }
  }

  sidebarToggle.addEventListener("click", toggleSidebar);

  // Close sidebar when clicking on overlay
  function handleOverlayClick(event) {
    const isMobile = window.innerWidth < 992;

    if (
      isMobile &&
      sidebarOverlay &&
      sidebarOverlay.classList.contains("active")
    ) {
      // Check if click is on overlay (not on sidebar or toggle button)
      if (event.target === sidebarOverlay) {
        sidebar.classList.remove("show");
        sidebarOverlay.classList.remove("active");
      }
    }
  }

  document.addEventListener("click", handleOverlayClick);

  // Handle window resize
  window.addEventListener("resize", function () {
    const isMobile = window.innerWidth < 992;

    if (!isMobile && sidebarOverlay) {
      sidebar.classList.remove("show");
      sidebarOverlay.classList.remove("active");
    }
  });
}

// Log Out Functionality
if (logOut) {
  logOut.addEventListener("click", function (e) {
    e.preventDefault();
    // You can add your logout logic here
    // For example: window.location.href = 'login.html';
    alert("تم تسجيل الخروج بنجاح");
  });
}

// Prevent dropdown from closing when clicking inside
document.addEventListener("click", function (event) {
  const dropdownMenu = document.querySelector(".dropdown-menu");
  if (dropdownMenu && dropdownMenu.contains(event.target)) {
    event.stopPropagation();
  }
});

// ==========================================
// Products Management System
// ==========================================

// Check if we're on the products page
const productsTableBody = document.getElementById("productsTableBody");
if (productsTableBody) {
  // Products data storage (using localStorage for persistence)
  let products = JSON.parse(localStorage.getItem("products")) || [];
  let currentEditId = null;
  let currentDeleteId = null;

  // DOM Elements
  const productForm = document.getElementById("productForm");
  const productName = document.getElementById("productName");
  const productPrice = document.getElementById("productPrice");
  const productQuantity = document.getElementById("productQuantity");
  const productCategory = document.getElementById("productCategory");
  const productStatus = document.getElementById("productStatus");
  const productId = document.getElementById("productId");
  const saveProductBtn = document.getElementById("saveProductBtn");
  const productModalLabel = document.getElementById("productModalLabel");
  const productsCount = document.getElementById("productsCount");
  const emptyState = document.getElementById("emptyState");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const deleteProductName = document.getElementById("deleteProductName");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const productModal = document.getElementById("productModal");
  const deleteModal = document.getElementById("deleteModal");
  const toastNotification = document.getElementById("toastNotification");
  const toastMessage = document.getElementById("toastMessage");

  // Bootstrap modal instances
  let productModalInstance = null;
  let deleteModalInstance = null;

  // Initialize modals when DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    productModalInstance = new bootstrap.Modal(
      document.getElementById("productModal"),
    );
    deleteModalInstance = new bootstrap.Modal(
      document.getElementById("deleteModal"),
    );
  });

  // Save products to localStorage
  function saveToLocalStorage() {
    localStorage.setItem("products", JSON.stringify(products));
  }

  // Show toast notification
  function showToast(message, type = "success") {
    toastMessage.textContent = message;
    toastNotification.className = `toast align-items-center text-white border-0 bg-${type}`;
    const toast = new bootstrap.Toast(toastNotification);
    toast.show();
  }

  // Get status badge class
  function getStatusBadgeClass(status) {
    switch (status) {
      case "متوفر":
        return "bg-success";
      case "غير متوفر":
        return "bg-danger";
      case "قريباً":
        return "bg-warning text-dark";
      default:
        return "bg-secondary";
    }
  }

  // Format price
  function formatPrice(price) {
    return parseFloat(price).toLocaleString("ar-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Render products table
  function renderProducts(filteredProducts = null) {
    const productsToShow = filteredProducts || products;

    // Update count
    productsCount.textContent = productsToShow.length;

    // Show/hide empty state
    if (productsToShow.length === 0) {
      emptyState.classList.remove("d-none");
      productsTableBody.innerHTML = "";
      return;
    }

    emptyState.classList.add("d-none");

    productsTableBody.innerHTML = productsToShow
      .map(
        (product, index) => `
      <tr data-id="${product.id}">
        <td>${index + 1}</td>
        <td>${product.name}</td>
        <td>${formatPrice(product.price)} ر.س</td>
        <td>${product.quantity}</td>
        <td>${product.category}</td>
        <td><span class="badge ${getStatusBadgeClass(product.status)}">${product.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${product.id}" title="تعديل">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${product.id}" title="حذف">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `,
      )
      .join("");
  }

  // Add new product
  function addProduct(productData) {
    const newProduct = {
      id: Date.now().toString(),
      ...productData,
    };
    products.push(newProduct);
    saveToLocalStorage();
    renderProducts();
    showToast("تم إضافة المنتج بنجاح");
  }

  // Update product
  function updateProduct(id, productData) {
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
      saveToLocalStorage();
      renderProducts();
      showToast("تم تعديل المنتج بنجاح");
    }
  }

  // Delete product
  function deleteProduct(id) {
    products = products.filter((p) => p.id !== id);
    saveToLocalStorage();
    renderProducts();
    showToast("تم حذف المنتج بنجاح");
  }

  // Search products
  function searchProducts(query) {
    if (!query.trim()) {
      renderProducts();
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.status.toLowerCase().includes(query.toLowerCase()),
    );
    renderProducts(filtered);
  }

  // Open edit modal
  function openEditModal(id) {
    const product = products.find((p) => p.id === id);
    if (product) {
      currentEditId = id;
      productName.value = product.name;
      productPrice.value = product.price;
      productQuantity.value = product.quantity;
      productCategory.value = product.category;
      productStatus.value = product.status;
      productId.value = product.id;

      productModalLabel.innerHTML =
        '<i class="fas fa-edit me-2"></i>تعديل منتج';
      productModalInstance.show();
    }
  }

  // Open delete confirmation modal
  function openDeleteModal(id) {
    const product = products.find((p) => p.id === id);
    if (product) {
      currentDeleteId = id;
      deleteProductName.textContent = product.name;
      deleteModalInstance.show();
    }
  }

  // Reset form
  function resetForm() {
    productForm.reset();
    currentEditId = null;
    productId.value = "";
    productModalLabel.innerHTML =
      '<i class="fas fa-plus-circle me-2"></i>إضافة منتج جديد';
  }

  // Event Listeners

  // Save product button
  if (saveProductBtn) {
    saveProductBtn.addEventListener("click", function () {
      // Validate form
      if (
        !productName.value.trim() ||
        !productPrice.value ||
        !productQuantity.value ||
        !productCategory.value
      ) {
        showToast("يرجى ملء جميع الحقول المطلوبة", "danger");
        return;
      }

      const productData = {
        name: productName.value.trim(),
        price: parseFloat(productPrice.value),
        quantity: parseInt(productQuantity.value),
        category: productCategory.value,
        status: productStatus.value,
      };

      if (currentEditId) {
        updateProduct(currentEditId, productData);
      } else {
        addProduct(productData);
      }

      productModalInstance.hide();
      resetForm();
    });
  }

  // Confirm delete button
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", function () {
      if (currentDeleteId) {
        deleteProduct(currentDeleteId);
        currentDeleteId = null;
        deleteModalInstance.hide();
      }
    });
  }

  // Search form
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      searchProducts(searchInput.value);
    });

    // Real-time search
    searchInput.addEventListener("input", function () {
      searchProducts(this.value);
    });
  }

  // Table action buttons (edit/delete) - using event delegation
  productsTableBody.addEventListener("click", function (e) {
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {
      const id = editBtn.dataset.id;
      openEditModal(id);
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      openDeleteModal(id);
    }
  });

  // Reset form when modal is closed
  if (productModal) {
    productModal.addEventListener("hidden.bs.modal", function () {
      resetForm();
    });
  }

  // Initial render
  renderProducts();
}
