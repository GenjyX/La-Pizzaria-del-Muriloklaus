// script.js - controla produtos, carrinho, partículas e interações

/* ===================== Produtos (edite conforme precisar) ===================== */
const PRODUCTS = [
  {id:"pz1", title:"Margherita Clássica", desc:"Molho de tomate San Marzano, mussarela de búfala e manjericão.", price:49.90, img:"./img/pz1.jpg"},
  {id:"pz2", title:"Quattro Formaggi", desc:"Mussarela, gorgonzola, parmesão e provolone - cremosidade máxima.", price:64.90, img:"./img/pz2.jpg"},
  {id:"pz3", title:"Pepperoni Especial", desc:"Fatias generosas de pepperoni artesanal e borda crocante.", price:59.90, img:"./img/pz3.jpg"},
  {id:"pz4", title:"Rúcula & Parma", desc:"Rúcula fresca, lascas de presunto parma e toque de mel trufado.", price:69.90, img:"./img/pz4.jpg"},
  {id:"pz5", title:"Calabresa Tradicional", desc:"Calabresa temperada, cebola caramelizada e orégano.", price:54.90, img:"./img/pz5.jpg"},
  {id:"pz6", title:"Pizza do Chef (Especial)", desc:"Combinação secreta do chef — inspiração do dia.", price:79.90, img:"./img/pz6.jpg"}
];

const FALLBACKS = {
  pz1: "https://images.unsplash.com/photo-1601924582975-7b9f6b97dba1?w=900&q=80",
  pz2: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80",
  pz3: "https://images.unsplash.com/photo-1601893801449-5bd5f8f03f59?w=900&q=80",
  pz4: "https://images.unsplash.com/photo-1548365328-9b2f8c9f3f3b?w=900&q=80",
  pz5: "https://images.unsplash.com/photo-1548365328-9b2f8c9f3f3b?w=900&q=80",
  pz6: "https://images.unsplash.com/photo-1604908812925-6e0e4a2f5da6?w=900&q=80"
};

/* ===================== CARRINHO (localStorage) ===================== */
const CART_KEY = "la_pizzaria_cart_v1";

function getCart(){ try{ const raw = localStorage.getItem(CART_KEY); return raw ? JSON.parse(raw) : {}; }catch(e){ return {}; } }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartUI(); }

function addToCart(id, qty = 1){
  const cart = getCart();
  if(!cart[id]) cart[id] = 0;
  cart[id] += qty;
  saveCart(cart);
  // feedback visual
  const float = document.getElementById("cart-float");
  if(float) float.animate([{transform:"translateY(0)"},{transform:"translateY(-6px)"},{transform:"translateY(0)"}], {duration:220});
}

/* ===================== Render produtos em index ===================== */
function renderProducts(){
  const container = document.getElementById("product-list");
  if(!container) return;
  container.innerHTML = "";
  for(const p of PRODUCTS){
    const card = document.createElement("div");
    card.className = "card";
    const imgHtml = `<div class="thumb"><img src="${p.img}" alt="${p.title}" onerror="this.onerror=null;this.src='${FALLBACKS[p.id]||p.img}'"></div>`;
    card.innerHTML = `${imgHtml}
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
      <div class="meta">
        <div class="price">R$ ${p.price.toFixed(2).replace('.',',')}</div>
        <button class="add-btn" data-id="${p.id}">Adicionar</button>
      </div>`;
    container.appendChild(card);
  }
  document.querySelectorAll(".add-btn").forEach(btn=>{
    btn.addEventListener("click", ()=> {
      addToCart(btn.dataset.id, 1);
    });
  });
}

/* ===================== Atualiza badges de cart ===================== */
function getCartCount(){
  const cart = getCart();
  let total = 0;
  for(const k in cart) total += Number(cart[k]);
  return total;
}
function updateCartUI(){
  const count = getCartCount();
  const navcount = document.getElementById("nav-count");
  if(navcount) navcount.textContent = count ? `(${count})` : "";
  const floatBadge = document.getElementById("float-badge");
  if(floatBadge) floatBadge.textContent = count;
  const floatCount = document.getElementById("float-count");
  if(floatCount) floatCount.textContent = count;
}
updateCartUI();

/* ===================== Página do carrinho: render, qty, remove, summary ===================== */
function renderCartPage(){
  const cartItemsEl = document.getElementById("cart-items");
  if(!cartItemsEl) return;
  const cart = getCart();
  const keys = Object.keys(cart);
  cartItemsEl.innerHTML = "";
  if(keys.length === 0){
    cartItemsEl.innerHTML = `<div class="card" style="text-align:center;padding:40px"><h4>Seu carrinho está vazio</h4><p style="color:var(--muted)">Adicione pizzas na página principal.</p><div style="height:14px"></div><a class="btn-primary" href="index.html">Voltar à Pizzaria</a></div>`;
    updateSummary();
    return;
  }
  for(const id of keys){
    const qty = Number(cart[id]);
    const prod = PRODUCTS.find(p=>p.id === id) || {title:id, price:0, img:FALLBACKS[id]};
    const item = document.createElement("div");
    item.className = "cart-item";
    item.innerHTML = `
      <img src="${prod.img}" alt="${prod.title}" onerror="this.onerror=null;this.src='${FALLBACKS[id]||prod.img}'">
      <div class="item-info">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${prod.title}</strong>
          <strong>R$ ${(prod.price * qty).toFixed(2).replace('.',',')}</strong>
        </div>
        <div style="color:var(--muted)">${prod.desc || ''}</div>
        <div class="qty-controls">
          <button class="dec" data-id="${id}">−</button>
          <div style="min-width:36px;text-align:center;font-weight:800">${qty}</div>
          <button class="inc" data-id="${id}">+</button>
          <button class="remove-btn" data-id="${id}" style="margin-left:10px">Remover</button>
        </div>
      </div>
    `;
    cartItemsEl.appendChild(item);
  }

  // listeners
  cartItemsEl.querySelectorAll(".inc").forEach(b=>{
    b.addEventListener("click", ()=> {
      const id = b.dataset.id; const cart = getCart();
      cart[id] = Number(cart[id]) + 1; saveCart(cart); renderCartPage();
    });
  });
  cartItemsEl.querySelectorAll(".dec").forEach(b=>{
    b.addEventListener("click", ()=> {
      const id = b.dataset.id; const cart = getCart();
      cart[id] = Number(cart[id]) - 1;
      if(cart[id] <= 0) delete cart[id];
      saveCart(cart); renderCartPage();
    });
  });
  cartItemsEl.querySelectorAll(".remove-btn").forEach(b=>{
    b.addEventListener("click", ()=> {
      const id = b.dataset.id; const cart = getCart();
      delete cart[id]; saveCart(cart); renderCartPage();
    });
  });

  updateSummary();
}

/* ===================== resumo e WhatsApp ===================== */
function updateSummary(){
  const cart = getCart();
  let subtotal = 0;
  for(const id in cart){
    const prod = PRODUCTS.find(p=>p.id === id);
    if(!prod) continue;
    subtotal += prod.price * Number(cart[id]);
  }
  const shipping = subtotal === 0 ? 0 : (subtotal >= 120 ? 0 : 12.00); // frete grátis acima de R$120
  const total = subtotal + shipping;

  const elSub = document.getElementById("subtotal");
  const elShip = document.getElementById("shipping");
  const elTot = document.getElementById("total");
  if(elSub) elSub.textContent = `R$ ${subtotal.toFixed(2).replace('.',',')}`;
  if(elShip) elShip.textContent = `R$ ${shipping.toFixed(2).replace('.',',')}`;
  if(elTot) elTot.textContent = `R$ ${total.toFixed(2).replace('.',',')}`;

  // whatsapp link
  const whats = document.getElementById("whats-button");
  const WHATS_NUMBER = "5516993777701"; // +55 16 99377-7701
  if(whats){
    if(subtotal === 0){ whats.href = "#"; whats.style.opacity = "0.55"; whats.onclick = (e)=> e.preventDefault(); }
    else {
      const lines = [];
      lines.push("Olá, La Pizzaria del Muriloklaus! Gostaria de finalizar meu pedido:");
      for(const id in cart){
        const prod = PRODUCTS.find(p=>p.id === id);
        if(!prod) continue;
        lines.push(`- ${prod.title} x ${cart[id]} = R$ ${(prod.price * Number(cart[id])).toFixed(2).replace('.',',')}`);
      }
      lines.push(`Subtotal: R$ ${subtotal.toFixed(2).replace('.',',')}`);
      lines.push(`Frete: R$ ${shipping.toFixed(2).replace('.',',')}`);
      lines.push(`Total: R$ ${total.toFixed(2).replace('.',',')}`);
      lines.push("");
      lines.push("Nome: ");
      lines.push("Endereço (ou retirar na loja): ");
      lines.push("Observações: ");
      const message = encodeURIComponent(lines.join("\n"));
      whats.href = `https://wa.me/${WHATS_NUMBER}?text=${message}`;
      whats.style.opacity = "1";
      whats.onclick = null;
    }
  }

  // clear cart button
  const clearBtn = document.getElementById("clear-cart");
  if(clearBtn) clearBtn.onclick = ()=>{ localStorage.removeItem(CART_KEY); updateCartUI(); renderCartPage(); };
}

/* ===================== particles canvas (background) ===================== */
function initParticlesCanvas(){
  const canvas = document.getElementById("particles");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const particles = [];
  const colors = ["rgba(186,28,28,0.06)","rgba(202,161,75,0.025)","rgba(255,255,255,0.02)"];

  function rand(min,max){ return Math.random()*(max-min)+min; }
  function createP(){
    const p = {
      x: rand(0,w),
      y: rand(0,h),
      vx: rand(-0.2,0.2),
      vy: rand(-0.05,0.2),
      r: rand(2,28),
      c: colors[Math.floor(rand(0,colors.length))]
    };
    particles.push(p);
  }
  for(let i=0;i<60;i++) createP();

  function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight; }
  addEventListener("resize", resize);

  function draw(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      ctx.beginPath();
      ctx.fillStyle = p.c;
      ctx.ellipse(p.x, p.y, p.r, p.r, 0, 0, Math.PI*2);
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if(p.x > w + 50) p.x = -50;
      if(p.x < -50) p.x = w + 50;
      if(p.y > h + 50) p.y = -50;
      if(p.y < -50) p.y = h + 50;
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ===================== inicialização condicional ===================== */
document.addEventListener("DOMContentLoaded", ()=>{
  renderProducts();
  updateCartUI();
  renderCartPage();
});

// torna funções disponíveis no console se desejar
window.addToCart = addToCart;
window.initParticlesCanvas = initParticlesCanvas;
