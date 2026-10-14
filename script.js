const API_URL = "https://dummyjson.com/products";

// global vairables
let products = [];
let editingproducts = null;
let editingProductId = null;

// get products
async function getproducts() {
  try {
    showLoading(true);
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("faild to fetch products");
    }
    const data = await response.json();
    products = data.products;
    displayProducts(products);
  } catch (error) {
    console.log(error);
    showError("faild to load products");
  } finally {
    showLoading(false);
  }
}

// display Products
function displayProducts(productsArray) {
  const container = document.querySelector("#productsContainer");
  container.innerHTML = "";

  // no products
  if (productsArray.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert-warning text-center">no products found</div>
      </div>`;
    return;
  }

  productsArray.forEach((product) => {
    container.innerHTML += `
      <div class="col-md-6 col-xl-3">
        <div class="card product-card shadow-sm h-100">
          <img src="${product.thumbnail}" class="card-img-top product-image">
          <div class="card-body d-flex flex-column">
            <span class="badge bg-secondary mb-2">${product.category}</span>
            <h5 class="card-title product-title">${product.title}</h5>
            <p class="text-muted product-description">${product.description}</p>
            <p class="product-price">${product.price}</p>
            <div class="card-buttons mt-auto d-flex gap-2">
              <button class="btn btn-warning w-50" onclick="editProduct(${product.id})">Edit</button>
              <button class="btn btn-danger w-50" onclick="deleteProduct(${product.id})">delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

// open add modal
function openAddModal() {
  editingProductId = null;
  document.querySelector("#modalTitle").innerHTML = "Add Product";
  document.querySelector("#saveBtn").innerText = "Add Product";
  document.querySelector("#productForm").reset();
  document.querySelector("#productId").value = "";
}

// save product
async function saveProduct() {
  const form = document.querySelector("#productForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const title = document.querySelector("#title").value.trim();
  const price = Number(document.querySelector("#price").value.trim());
  const category = document.querySelector("#category").value.trim();
  const image = document.querySelector("#image").value.trim();
  const description = document.querySelector("#description").value.trim();
  const productData = {
    title: title,
    price: price,
    category: category,
    thumbnail: image,
    description: description,
  };
  if (!title || !price || !category || !image || !description) {
    alert("Please fill in all fields");
    return;
  }
  try {
    if (editingProductId) {
      await updateProduct(editingProductId, productData);
    } else {
      await createProduct(productData);
    }
  } catch (error) {
    console.error(error);
    showError("somthing went wrong");
  }
}

async function createProduct(productdata) {
  const response = await fetch(`${API_URL}/add`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(productdata),
  });
  const newProduct = await response.json();
  console.log("Created Produt: ", newProduct);
  products.unshift(newProduct);
  displayProducts(products);
  closeModal();
  alert("product added succesfully ");
}

// load

function showLoading(show) {
  const loading = document.querySelector("#loading");
  if (show) {
    loading.classList.toggle("d-none");
  } else {
    loading.classList.add("d-none");
  }
}

function showError(message) {
  const error = document.querySelector("#errorMessage");
  error.innerText = message;
  error.classList.remove("d-none");
  setTimeout(() => {
    error.classList.add("d-none");
  }, 4000);
}

function closeModal() {
  const moadalelement = document.querySelector("#productModal");
  const modal = bootstrap.Modal.getInstance(moadalelement);
  if (modal) {
    modal.hide();
  }
  document.getElementById("productForm").reset();
  editingProductId = null;
}
getproducts();

// delete product
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("faild to delete product");
    }
    products = products.filter((product) => product.id !== id);
    displayProducts(products);
  } catch (error) {
    console.log(error);
    showError("faild to delete product");
  }
}

// edit product (يفتح الفورم ويملّاه)
function editProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) {
    showError("product noy found");
    return;
  }

  editingProductId = id;
  document.querySelector("#modalTitle").innerHTML = "Edit Product";
  document.querySelector("#saveBtn").innerText = "Update Product";
  document.querySelector("#title").value = product.title;
  document.querySelector("#price").value = product.price;
  document.querySelector("#category").value = product.category;
  document.querySelector("#image").value = product.thumbnail;
  document.querySelector("#description").value = product.description;
  document.querySelector("#productId").value = product.id;

  const modalElement = document.querySelector("#productModal");
  bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

// update product (يبعت التعديل)
async function updateProduct(id, productData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    throw new Error("faild to update product");
  }
  const updatedProduct = await response.json();
  products = products.map((product) =>
    product.id === id ? { ...product, ...updatedProduct } : product,
  );
  displayProducts(products);
  closeModal();
  alert("product updated successfully");
}

function searchProducts() {
  const serachValue = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  const filterproducts = products.filter((product) => {
    return (
      product.title.toLowerCase().includes(serachValue) ||
      product.category.toLowerCase().includes(serachValue)
    );
  });
  displayProducts(filterproducts);
}
