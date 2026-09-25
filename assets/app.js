function stockBadge(p){
  const q=p.qty??null;
  if(q===null)return'';
  if(q<=0)return'<span class="stock-badge out">สินค้าหมด</span>';
  if(q<=LOW_STOCK_THRESHOLD)return`<span class="stock-badge low">เหลือน้อย · ${q} ชิ้น</span>`;
  return''
}
function productCard(p){
 const out=(p.qty??1)<=0;
 const rating=productRating(p.id);
 return `<article class="card"><img src="${p.img}" alt="${p.name}"><div class="body"><span class="badge">${p.cat}</span>${stockBadge(p)}<h3>${p.name}</h3><div class="rating-mini">★ ${rating.avg.toFixed(1)} <span>(${rating.count})</span></div><p class="desc">${p.desc}</p><div class="meta"><div>แบรนด์<b>${p.brand}</b></div><div>เหมาะกับ<b>${p.fit}</b></div><div>วัสดุ<b>${p.material}</b></div><div>สถานะ<b>${p.stock}</b></div></div><div class="price">฿${fmt(p.price)} <small>บาท</small></div><div class="actions"><a class="btn ghost" href="product.html?id=${p.id}">รายละเอียด</a><button class="btn" ${out?'disabled':''} onclick="addToCart('${p.id}')"> ${out?'สินค้าหมด':'เพิ่มตะกร้า'}</button></div></div></article>`
}
function renderProducts(){
 const grid=document.getElementById('productGrid'); if(!grid)return;
 const search=document.getElementById('search'),filters=document.getElementById('filters'),sort=document.getElementById('sort');
 let cat=new URLSearchParams(location.search).get('cat')||'all';
 function drawFilters(){const catNames=[...new Set(getAllProducts().map(p=>p.cat))];const cats=[['all','ทั้งหมด'],...catNames.map(c=>[c,c])];filters.innerHTML=cats.map(c=>`<button class="${c[0]===cat?'active':''}" data-cat="${c[0]}">${c[1]}</button>`).join('')}
 function draw(){const q=search.value.trim().toLowerCase();let l=getAllProducts().filter(p=>(cat==='all'||p.cat===cat)&&(p.name+' '+p.cat+' '+p.brand+' '+p.fit).toLowerCase().includes(q));const v=sort?.value||'default';if(v==='price-asc')l.sort((a,b)=>a.price-b.price);if(v==='price-desc')l.sort((a,b)=>b.price-a.price);if(v==='newest')l.sort((a,b)=>(b.id.length)-(a.id.length));if(v==='best')l.sort((a,b)=>productRating(b.id).count-productRating(a.id).count);grid.innerHTML=l.map(productCard).join('')||'<div class="empty" style="grid-column:1/-1">ไม่พบสินค้าที่ค้นหา</div>';drawFilters()}
 filters.onclick=e=>{if(e.target.matches('button')){cat=e.target.dataset.cat;draw()}};search.oninput=draw;sort?.addEventListener('change',draw);draw()
}
function renderFeatured(){const el=document.getElementById('featured');if(el)el.innerHTML=getAllProducts().slice(0,3).map(productCard).join('')}
function renderProduct(){
 const el=document.getElementById('productDetail');if(!el)return;
 const id=new URLSearchParams(location.search).get('id')||'exhaust',p=productById(id);
 if(!p){el.innerHTML='<div class="empty"><h2>ไม่พบสินค้านี้</h2><p>สินค้าอาจถูกลบหรือเปลี่ยนลิงก์</p><a class="btn" href="products.html">กลับไปเลือกสินค้า</a></div>';return}
 localStorage.setItem('motox_recent',JSON.stringify([id,...JSON.parse(localStorage.getItem('motox_recent')||'[]').filter(x=>x!==id)].slice(0,8)));
 const out=(p.qty??1)<=0, imgs=p.images||[p.img], r=productRating(id), reviews=getReviews(id);
 el.innerHTML=`<div><div class="gallery"><img id="mainProductImage" class="detail-img" src="${imgs[0]}" alt="${p.name}"><div class="thumbs">${imgs.map((x,i)=>`<button class="${i===0?'active':''}" onclick="document.getElementById('mainProductImage').src='${x}';this.parentNode.querySelectorAll('button').forEach(b=>b.classList.remove('active'));this.classList.add('active')"><img src="${x}"></button>`).join('')}</div></div><div class="hero-actions"><a class="btn ghost" href="products.html">← กลับไปสินค้าทั้งหมด</a><button class="btn" ${out?'disabled':''} onclick="buyNow('${p.id}')">${out?'สินค้าหมด':'ซื้อสินค้านี้ทันที'}</button></div></div>
 <div class="detail-box"><span class="badge">${p.cat}</span>${stockBadge(p)}<h1>${p.name}</h1><div class="rating-big">★ ${r.avg.toFixed(1)} <span>${r.count} รีวิว</span></div><p class="desc">${p.desc}</p><div class="price">฿${fmt(p.price)} <small>บาท</small></div><div class="specs"><div class="spec"><span>แบรนด์</span><b>${p.brand}</b></div><div class="spec"><span>รุ่น/การใช้งาน</span><b>${p.fit}</b></div><div class="spec"><span>วัสดุ</span><b>${p.material}</b></div><div class="spec"><span>สถานะ</span><b>${p.stock}</b></div><div class="spec"><span>การรับประกัน</span><b>${p.warranty}</b></div></div><h3>รายละเอียดสินค้า</h3><ul class="bullet">${(p.details||[]).map(x=>`<li>${x}</li>`).join('')}</ul><div class="qty"><button onclick="document.getElementById('qty').value=Math.max(1,+document.getElementById('qty').value-1)">−</button><input id="qty" type="number" min="1" value="1"><button onclick="document.getElementById('qty').value=+document.getElementById('qty').value+1">+</button></div><button class="btn" style="width:100%" ${out?'disabled':''} onclick="addToCart('${p.id}',Math.max(1,+document.getElementById('qty').value))"> ${out?'สินค้าหมด':'เพิ่มลงตะกร้า'}</button></div>`;
 const rel=getAllProducts().filter(x=>x.id!==p.id&&x.cat===p.cat).slice(0,3); if(rel.length)el.insertAdjacentHTML('afterend',`<section class="section"><h2>สินค้าแนะนำเพิ่มเติม</h2><div class="grid">${rel.map(productCard).join('')}</div></section>`);
 el.insertAdjacentHTML('afterend',`<section class="section review-section"><h2>รีวิวสินค้า</h2><div class="review-list">${reviews.length?reviews.map(x=>`<div class="review"><b>${x.name}</b><span>★ ${x.rating}</span><p>${x.text}</p></div>`).join(''):'<p class="muted">ยังไม่มีรีวิว เป็นคนแรกที่รีวิวสินค้าได้เลย</p>'}</div><form class="review-form" onsubmit="submitReview(event,'${id}')"><select name="rating" required><option value="">ให้คะแนน</option><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select><input name="name" required placeholder="ชื่อผู้รีวิว"><textarea name="text" required placeholder="เขียนรีวิว"></textarea><button class="btn">ส่งรีวิว</button></form></section>`);
}
function renderCartPage(){const items=document.getElementById('cartItems'),sum=document.getElementById('cartSummary');if(!items)return;function draw(){let c=getCart();const stale=c.filter(i=>!productById(i.id));if(stale.length){c=c.filter(i=>productById(i.id));setCart(c)}if(!c.length){items.innerHTML='<div class="empty"><br><b>ยังไม่มีสินค้าในตะกร้า</b><br><span>ไปเลือกสินค้าแล้วกด “เพิ่มตะกร้า” ได้เลย</span><br><br><a class="btn" href="products.html">เลือกสินค้า</a></div>';sum.innerHTML='';return}items.innerHTML=c.map(i=>{const p=productById(i.id);return `<div class="cart-item"><img src="${p.img}"><div><h3>${p.name}</h3><span class="badge">${p.cat}</span>${stockBadge(p)}<p class="desc">฿${fmt(p.price)} × ${i.qty} = <b>฿${fmt(p.price*i.qty)}</b></p><div class="qty"><button onclick="changeQty('${p.id}',-1);window.drawCart()">−</button><input value="${i.qty}" min="1" type="number" onchange="const v=Math.max(1,+this.value);const c=getCart();c.find(x=>x.id==='${p.id}').qty=v;setCart(c);window.drawCart()"><button onclick="changeQty('${p.id}',1);window.drawCart()">+</button></div></div><button class="btn ghost remove" onclick="removeItem('${p.id}');window.drawCart()">ลบ</button></div>`}).join('');const total=cartTotal();sum.innerHTML=`<h3>สรุปคำสั่งซื้อ</h3><div class="row"><span>รวมสินค้า</span><b>฿${fmt(total)}</b></div><div class="row"><span>ค่าจัดส่ง</span><b>คำนวณในขั้นตอนสั่งซื้อ</b></div><div class="total">฿${fmt(total)}</div><a class="btn" style="width:100%;margin-top:15px" href="checkout.html">ไปหน้าสั่งซื้อ →</a><button class="btn ghost" style="width:100%;margin-top:8px" onclick="localStorage.removeItem('motox_cart');localStorage.removeItem('motox_coupon');updateCartCount();window.drawCart();renderDrawer()">ล้างตะกร้า</button>`}window.drawCart=draw;draw()}
function applyCouponCode(){
 const code=(document.getElementById('couponCode')?.value||'').trim().toUpperCase();
 const coupons={MOTOX10:0.10,MOTOX500:500,SIBA15:0.15}; if(coupons[code]===undefined){toast('โค้ดไม่ถูกต้อง');return}
 localStorage.setItem('motox_coupon',JSON.stringify({code,discount:coupons[code]}));toast('ใช้คูปอง '+code+' แล้ว');renderCheckout();
}
function getCoupon(){try{return JSON.parse(localStorage.getItem('motox_coupon')||'null')}catch{return null}}
function couponDiscount(total){const c=getCoupon();if(!c)return 0;return c.discount<1?Math.round(total*c.discount):Math.min(c.discount,total)}
function renderCheckout(){const list=document.getElementById('orderList'),totalEl=document.getElementById('checkoutTotal'),form=document.getElementById('checkoutForm'),success=document.getElementById('success');if(!list)return;function draw(){const c=getCart().filter(i=>productById(i.id));list.innerHTML=c.length?c.map(i=>{const p=productById(i.id);return `<div class="orderline"><span>${p.name} × ${i.qty}</span><b>฿${fmt(p.price*i.qty)}</b></div>`}).join(''):'<div class="empty">ยังไม่มีสินค้าในตะกร้า<br><a class="btn" href="products.html">กลับไปเลือกสินค้า</a></div>';const sub=cartTotal(),disc=couponDiscount(sub);totalEl.textContent='฿'+fmt(sub-disc);const cd=document.getElementById('couponDiscount');if(cd)cd.textContent=disc?'− ฿'+fmt(disc):'';}draw();form?.addEventListener('submit',async e=>{e.preventDefault();const cart=getCart().filter(i=>productById(i.id));if(!cart.length){toast('ยังไม่มีสินค้าในตะกร้า');return}const outOfStock=cart.find(i=>(productById(i.id).qty??1)<=0);if(outOfStock){toast('มีสินค้าที่หมดสต็อกในตะกร้า กรุณานำออกก่อน');return}const fd=new FormData(form);const consent=document.getElementById('privacyConsent');if(!consent?.checked){toast('กรุณายินยอมตามนโยบายความเป็นส่วนตัวก่อนยืนยันคำสั่งซื้อ');return}const payload={customer:{name:fd.get('name'),phone:fd.get('phone'),email:fd.get('email')},delivery:fd.get('delivery'),address:fd.get('address'),payment:fd.get('payment'),note:fd.get('note'),privacy_consent:true,privacy_consent_at:new Date().toISOString(),items:cart.map(i=>({product_id:i.id,qty:i.qty}))};const btn=form.querySelector('button[type="submit"]');btn.disabled=true;btn.textContent='กำลังบันทึก...';try{const orders=JSON.parse(localStorage.getItem('motox_orders')||'[]');const orderNo='MX'+Date.now().toString().slice(-8);const order={order_no:orderNo,created_at:new Date().toLocaleString('th-TH'),customer:payload.customer,delivery:payload.delivery,address:payload.address,payment:payload.payment,note:payload.note,privacy_consent:payload.privacy_consent,privacy_consent_at:payload.privacy_consent_at,items:cart.map(i=>{const p=productById(i.id);return {product_id:i.id,name:p.name,price:p.price,qty:i.qty,total:p.price*i.qty}}),total:cartTotal()-couponDiscount(cartTotal()),coupon:getCoupon()?.code||'',status:'รอดำเนินการ'};orders.unshift(order);localStorage.setItem('motox_orders',JSON.stringify(orders));decrementStock(cart);document.getElementById('orderNo').textContent=orderNo;success.classList.add('show');localStorage.removeItem('motox_cart');localStorage.removeItem('motox_coupon');updateCartCount();renderDrawer();form.reset();draw()}catch(err){toast(err.message||'เกิดข้อผิดพลาด กรุณาลองใหม่')}finally{btn.disabled=false;btn.textContent='✓ ยืนยันคำสั่งซื้อ'}})}


/* ---------- Reviews / recently viewed / coupons ---------- */
function getReviews(id){try{return JSON.parse(localStorage.getItem('motox_reviews_'+id)||'[]')}catch{return[]}}
function productRating(id){const r=getReviews(id);if(!r.length)return{avg:0,count:0};return{avg:r.reduce((s,x)=>s+Number(x.rating),0)/r.length,count:r.length}}
function submitReview(e,id){e.preventDefault();const f=e.target,r={name:f.name.value.trim(),rating:+f.rating.value,text:f.text.value.trim(),date:new Date().toLocaleDateString('th-TH')};const a=getReviews(id);a.unshift(r);localStorage.setItem('motox_reviews_'+id,JSON.stringify(a));toast('ขอบคุณสำหรับรีวิว');renderProduct()}
function renderRecently(){const el=document.getElementById('recentlyViewed');if(!el)return;const ids=JSON.parse(localStorage.getItem('motox_recent')||'[]');const ps=ids.map(productById).filter(Boolean);el.innerHTML=ps.length?ps.map(productCard).join(''):'<p class="muted">ยังไม่มีสินค้าที่เพิ่งดู</p>'}
/* ---------- Customer login gate ---------- */
function renderCustomerChip(){const chip=document.getElementById('customerChip');if(!chip)return;const c=currentCustomer();if(!c){chip.innerHTML='<a href="javascript:void(0)" onclick="showCustomerGate(boot)">เข้าสู่ระบบ / สมัครสมาชิก</a>';return}chip.innerHTML=`<span> สวัสดี, ${c.name}</span><button type="button" onclick="logoutCustomer()">ออกจากระบบ</button>`}
function showCustomerGate(onSuccess){
  const wrap=document.createElement('div');wrap.id='customerGate';wrap.className='login';
  wrap.innerHTML=`<div class="login-box">
    <div class="eyebrow">MOTO-X PARTS</div>
    <h2>ยินดีต้อนรับ</h2>
    <p class="muted">เข้าสู่ระบบหรือสมัครสมาชิกก่อนเข้าใช้งานร้านค้า</p>
    <div class="login-tabs"><button type="button" id="tabLogin" class="active">เข้าสู่ระบบ</button><button type="button" id="tabRegister">สมัครสมาชิก</button></div>
    <form id="loginForm">
      <label>เบอร์โทรศัพท์<input id="cgPhone" required placeholder="08x-xxx-xxxx"></label>
      <label>รหัสผ่าน<input id="cgPass" type="password" required placeholder="รหัสผ่าน"></label>
      <div id="cgNameWrap" style="display:none"><label>ชื่อ-นามสกุล<input id="cgName" placeholder="กรอกชื่อ-นามสกุล"></label></div>
      <button type="submit" class="btn2 primary" style="width:100%;margin-top:10px">เข้าสู่ระบบ</button>
    </form>
    <p id="cgMsg" style="color:#ff7777;min-height:18px;margin:10px 0 0"></p>
    <small class="muted">ข้อมูลบัญชีนี้เก็บไว้ในเบราว์เซอร์ของคุณเท่านั้น (ระบบสาธิต)</small>
  </div>`;
  document.body.appendChild(wrap);
  let mode='login';
  const tabLogin=wrap.querySelector('#tabLogin'),tabReg=wrap.querySelector('#tabRegister'),nameWrap=wrap.querySelector('#cgNameWrap'),form=wrap.querySelector('#loginForm'),msg=wrap.querySelector('#cgMsg'),submitBtn=form.querySelector('button[type="submit"]');
  function setMode(m){mode=m;tabLogin.classList.toggle('active',m==='login');tabReg.classList.toggle('active',m==='register');nameWrap.style.display=m==='register'?'block':'none';submitBtn.textContent=m==='register'?'สมัครสมาชิก':'เข้าสู่ระบบ';msg.textContent=''}
  tabLogin.onclick=()=>setMode('login');tabReg.onclick=()=>setMode('register');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const phone=wrap.querySelector('#cgPhone').value.trim();
    const pass=wrap.querySelector('#cgPass').value;
    let res;
    if(mode==='register'){const name=wrap.querySelector('#cgName').value.trim();if(!name){msg.textContent='กรุณากรอกชื่อ-นามสกุล';return}res=registerCustomer(name,phone,pass)}
    else res=loginCustomer(phone,pass);
    if(!res.ok){msg.textContent=res.msg;return}
    wrap.remove();
    onSuccess();
  });
}
function boot(){setupGlobal();renderCustomerChip();renderFeatured();renderProducts();renderProduct();renderCartPage();renderCheckout();renderRecently();}
document.addEventListener('DOMContentLoaded',()=>{
  const hs=document.getElementById('headerSearch');
  if(hs){hs.addEventListener('keydown',e=>{if(e.key==='Enter' && hs.value.trim()){window.location.href='products.html?search='+encodeURIComponent(hs.value.trim())}})}
  if(currentCustomer())boot();
  else showCustomerGate(boot);
});
