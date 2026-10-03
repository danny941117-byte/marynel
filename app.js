(() => {
  "use strict";

  const CONFIG = {
    currency: "Q",
    shippingCost: 35,
    paymentProvider: "REcurrente",
    demoMode: true
  };

  const demoProducts = [
    { id: 1, name: "Audífonos Bluetooth", category: "Tecnología", price: 149, icon: "🎧", description: "Audio inalámbrico para tu día a día." },
    { id: 2, name: "Power Bank", category: "Tecnología", price: 129, icon: "🔋", description: "Energía portátil para tus dispositivos." },
    { id: 3, name: "Reloj Urbano", category: "Accesorios", price: 189, icon: "⌚", description: "Diseño moderno para complementar tu estilo." },
    { id: 4, name: "Mochila Moto", category: "Accesorios", price: 229, icon: "🎒", description: "Práctica para llevar lo que necesitas." },
    { id: 5, name: "Herramienta Multiuso", category: "Herramientas", price: 99, icon: "🛠️", description: "Una solución compacta para varias tareas." },
    { id: 6, name: "Hidrolavadora", category: "Hogar", price: 599, icon: "💦", description: "Limpieza potente para diferentes superficies." },
    { id: 7, name: "Billetera", category: "Accesorios", price: 79, icon: "👛", description: "Compacta, práctica y funcional." },
    { id: 8, name: "Lentes Deportivos", category: "Accesorios", price: 119, icon: "🕶️", description: "Protección y estilo para actividades al aire libre." }
  ];

  let products = loadProducts();
  let cart = loadCart();

  function loadProducts() {
    try {
      const saved = JSON.parse(localStorage.getItem("marynel_products_v2") || "null");
      return Array.isArray(saved) && saved.length ? saved : demoProducts;
    } catch { return demoProducts; }
  }
  function saveProducts() {
    try { localStorage.setItem("marynel_products_v2", JSON.stringify(products)); return true; }
    catch (e) { log("No se pudo guardar el catálogo. La imagen puede ser demasiado grande.", e.message); return false; }
  }

  const $ = (selector) => document.querySelector(selector);
  const money = (value) => `${CONFIG.currency}${Number(value).toFixed(2)}`;

  function log(message, data = "") {
    const now = new Date().toLocaleTimeString("es-GT");
    const line = `[${now}] ${message}${data ? `\n${typeof data === "string" ? data : JSON.stringify(data, null, 2)}` : ""}`;
    const panel = $("#diagnosticLog");
    if (panel) {
      panel.textContent = `${line}\n${panel.textContent}`.slice(0, 5000);
    }
    console.info("[MARYNEL]", message, data);
  }

  function setStatus(ok, text) {
    const status = $("#diagnosticStatus");
    if (status) {
      status.textContent = text;
      status.style.color = ok ? "#62d995" : "#ff6577";
    }
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem("marynel_cart") || "[]");
    } catch (error) {
      log("No se pudo leer el carrito guardado.", error.message);
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem("marynel_cart", JSON.stringify(cart));
    } catch (error) {
      log("No se pudo guardar el carrito.", error.message);
    }
  }

  function renderProducts(filter = "all") {
    const grid = $("#productGrid");
    if (!grid) return;

    const list = filter === "all" ? products : products.filter(p => p.category === filter);

    grid.innerHTML = list.map(product => `
      <article class="product-card">
        <div class="product-image" aria-label="${product.name}">${product.icon}</div>
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-bottom">
            <span class="price">${money(product.price)}</span>
            <button class="add-button" data-add="${product.id}" type="button">Agregar</button>
          </div>
        </div>
      </article>
    `).join("");

    grid.querySelectorAll("[data-add]").forEach(button => {
      button.addEventListener("click", () => addToCart(Number(button.dataset.add)));
    });
  }

  function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) {
      log("Producto no encontrado.", id);
      return;
    }

    const existing = cart.find(item => item.id === id);
    if (existing) existing.quantity += 1;
    else cart.push({ id, quantity: 1 });

    saveCart();
    renderCart();
    openCart();
    log(`Producto agregado: ${product.name}`);
  }

  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
    log(`Producto eliminado: ${id}`);
  }

  function subtotal() {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  function renderCart() {
    const container = $("#cartItems");
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    $("#cartCount").textContent = count;

    if (!container) return;

    if (!cart.length) {
      container.innerHTML = `<div class="empty-cart">Tu carrito está vacío.<br><br>Agrega productos para comenzar.</div>`;
    } else {
      container.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        return `
          <div class="cart-row">
            <div class="cart-thumb">${product.icon}</div>
            <div>
              <h4>${product.name}</h4>
              <small>${item.quantity} × ${money(product.price)}</small><br>
              <button class="remove-item" data-remove="${product.id}" type="button">Eliminar</button>
            </div>
            <strong>${money(product.price * item.quantity)}</strong>
          </div>
        `;
      }).join("");

      container.querySelectorAll("[data-remove]").forEach(button => {
        button.addEventListener("click", () => removeFromCart(Number(button.dataset.remove)));
      });
    }

    const total = subtotal();
    $("#cartSubtotal").textContent = money(total);
    $("#cartShipping").textContent = cart.length ? money(CONFIG.shippingCost) : "Por calcular";
    $("#cartTotal").textContent = money(cart.length ? total + CONFIG.shippingCost : 0);
  }

  function openCart() {
    $("#cartDrawer").classList.remove("hidden");
    $("#cartOverlay").classList.remove("hidden");
  }

  function closeCart() {
    $("#cartDrawer").classList.add("hidden");
    $("#cartOverlay").classList.add("hidden");
  }

  function openCheckout() {
    if (!cart.length) {
      log("El usuario intentó pagar con el carrito vacío.");
      alert("Agrega al menos un producto al carrito.");
      return;
    }

    $("#checkoutTotal").textContent = money(subtotal() + CONFIG.shippingCost);
    $("#checkoutModal").classList.remove("hidden");
    closeCart();
  }

  function closeCheckout() {
    $("#checkoutModal").classList.add("hidden");
  }

  function updateAddressVisibility() {
    const delivery = $("#deliveryType").value;
    const addressField = $("#addressField");
    const address = addressField.querySelector("textarea");

    if (delivery === "pickup") {
      addressField.style.display = "none";
      address.required = false;
    } else {
      addressField.style.display = "block";
      address.required = true;
    }
  }

  async function handleCheckout(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const order = {
      customer: {
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email")
      },
      delivery: formData.get("delivery"),
      address: formData.get("address"),
      items: cart.map(item => {
        const product = products.find(p => p.id === item.id);
        return {
          id: product.id,
          name: product.name,
          quantity: item.quantity,
          unitPrice: product.price
        };
      }),
      subtotal: subtotal(),
      shipping: formData.get("delivery") === "shipping" ? CONFIG.shippingCost : 0,
      total: subtotal() + (formData.get("delivery") === "shipping" ? CONFIG.shippingCost : 0),
      createdAt: new Date().toISOString()
    };

    log("Pedido preparado.", order);

    // PUNTO DE INTEGRACIÓN:
    // Aquí se conectará el backend/API de Recurrente.
    // Nunca se deben colocar claves secretas del proveedor en este archivo.
    if (CONFIG.demoMode) {
      closeCheckout();
      $("#successText").textContent =
        `Pedido de demostración por ${money(order.total)} preparado. ` +
        `El siguiente paso será redirigir al checkout real de ${CONFIG.paymentProvider}.`;
      $("#successModal").classList.remove("hidden");
      cart = [];
      saveCart();
      renderCart();
      event.currentTarget.reset();
      updateAddressVisibility();
    }
  }


  function renderAdmin() {
    const box = $("#adminProductList");
    if (!box) return;
    $("#adminProductCount").textContent = `${products.length} producto${products.length === 1 ? "" : "s"}`;
    box.innerHTML = products.map(p => `
      <article class="admin-product-row">
        ${p.image ? `<img src="${p.image}" alt="${p.name}">` : `<div class="preview-image">${p.icon || "📦"}</div>`}
        <div class="admin-row-body">
          <span class="product-category">${p.category || "General"}</span>
          <h4>${p.name}</h4><p>${p.description || ""}</p>
          <div class="meta"><strong>${money(p.price)}</strong><span class="stock">Stock: ${p.stock ?? 0}</span></div>
          <button class="delete-product" data-delete="${p.id}" type="button">Eliminar producto</button>
        </div>
      </article>`).join("");
    box.querySelectorAll("[data-delete]").forEach(b => b.onclick = () => {
      if (!confirm("¿Eliminar este producto?")) return;
      products = products.filter(p => p.id !== Number(b.dataset.delete));
      saveProducts(); renderProducts(); renderAdmin();
      log("Producto eliminado.");
    });
  }

  function previewProduct() {
    const file = $("#productImage")?.files?.[0];
    const image = $(".preview-image");
    if (image && file) {
      const reader = new FileReader();
      reader.onload = e => { image.textContent = ""; image.style.backgroundImage = `url("${e.target.result}")`; };
      reader.readAsDataURL(file);
    }
    if ($("#productPreview")) {
      $("#productPreview h3").textContent = $("#productName").value || "Tu producto aparecerá aquí";
      $("#productPreview p").textContent = $("#productDescription").value || "Completa los datos para ver la presentación.";
      $("#productPreview strong").textContent = $("#productPrice").value ? money($("#productPrice").value) : "Q0.00";
    }
  }

  async function addProductFromForm(e) {
    e.preventDefault();
    const file = $("#productImage").files[0];
    if (!file) return alert("Selecciona una foto.");
    if (file.size > 2 * 1024 * 1024) return alert("Usa una imagen menor de 2 MB en esta versión.");
    const reader = new FileReader();
    reader.onload = () => {
      const product = {
        id: Date.now(),
        name: $("#productName").value.trim(),
        price: Number($("#productPrice").value),
        category: $("#productCategory").value.trim() || "General",
        stock: Math.max(0, Number($("#productStock").value || 0)),
        description: $("#productDescription").value.trim(),
        image: reader.result,
        icon: "📦"
      };
      if (!product.name || !Number.isFinite(product.price) || !product.description) return alert("Completa nombre, precio y detalle.");
      products.unshift(product);
      if (!saveProducts()) { products.shift(); return; }
      e.target.reset();
      $("#productStock").value = 1;
      renderProducts(); renderAdmin();
      log("Producto publicado.", product.name);
      alert("Producto agregado correctamente.");
    };
    reader.readAsDataURL(file);
  }

  function init() {
    $("#year").textContent = new Date().getFullYear();

    renderProducts();
    renderCart();
    renderAdmin();
    updateAddressVisibility();

    $("#categoryFilter").addEventListener("change", event => renderProducts(event.target.value));
    $("#cartButton").addEventListener("click", openCart);
    $("#closeCart").addEventListener("click", closeCart);
    $("#cartOverlay").addEventListener("click", closeCart);
    $("#checkoutButton").addEventListener("click", openCheckout);
    $("#closeCheckout").addEventListener("click", closeCheckout);
    $("#deliveryType").addEventListener("change", updateAddressVisibility);
    $("#checkoutForm").addEventListener("submit", handleCheckout);
    $("#productForm").addEventListener("submit", addProductFromForm);
    ["productImage","productName","productPrice","productDescription"].forEach(id => $("#" + id).addEventListener("input", previewProduct));
    $("#resetProducts").addEventListener("click", () => {
      if (!confirm("¿Restaurar productos de demostración?")) return;
      products = demoProducts;
      saveProducts(); renderProducts(); renderAdmin();
      log("Catálogo demo restaurado.");
    });
    $("#closeSuccess").addEventListener("click", () => $("#successModal").classList.add("hidden"));

    setStatus(true, "Sistema operativo");
    log("MARYNEL base cargada correctamente.");
    log(`Productos disponibles: ${products.length}`);
    log("Pago: preparado para integración externa.");
  }

  window.addEventListener("error", event => {
    setStatus(false, "Error detectado");
    log("ERROR JAVASCRIPT", event.message);
  });

  window.addEventListener("unhandledrejection", event => {
    setStatus(false, "Error asíncrono");
    log("ERROR ASÍNCRONO", String(event.reason));
  });

  document.addEventListener("DOMContentLoaded", init);
})();
