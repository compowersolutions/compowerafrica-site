// --- CONFIG: replace with your deployed Apps Script URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwwghV3clz4lrYyYYTpa_4yumeFJ5xZMIY8qWDE_Al6dh7EkJTLEx4Gzk1m429_r6cpwA/exec";

// UTIL
function jsonPost(payload){
  return fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r => r.json());
}

// Carousel
(function(){
  const carousel = document.getElementById('carousel');
  const slides = carousel.querySelectorAll('.slide');
  let idx = 0;
  function show(i){ carousel.style.transform = `translateX(${-i*100}%)`; }
  document.getElementById('prev').addEventListener('click',()=>{ idx = (idx-1+slides.length)%slides.length; show(idx) });
  document.getElementById('next').addEventListener('click',()=>{ idx = (idx+1)%slides.length; show(idx) });
  // autoplay
  setInterval(()=>{ idx = (idx+1) % slides.length; show(idx) }, 5000);
})();

// Footer year
document.addEventListener('DOMContentLoaded', ()=> {
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();
});

// Registration form
const regForm = document.getElementById('registerForm');
if(regForm){
  regForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const data = Object.fromEntries(new FormData(regForm).entries());
    document.getElementById('registerMessage').textContent = "Submitting...";
    try{
      const res = await jsonPost({ action: "register", ...data });
      if(res.status === 'ok') {
        document.getElementById('registerMessage').textContent = "Thank you — registration saved.";
        regForm.reset();
      } else {
        document.getElementById('registerMessage').textContent = "Error: " + (res.message || "Try again");
      }
    } catch(err){
      document.getElementById('registerMessage').textContent = "Error sending data.";
      console.error(err);
    }
  });
}

// Contact form
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const data = Object.fromEntries(new FormData(contactForm).entries());
    document.getElementById('contactMessage').textContent = "Sending...";
    try{
      const res = await jsonPost({ action: "contact", ...data });
      if(res.status === 'ok') {
        document.getElementById('contactMessage').textContent = "Message sent. We'll get back to you.";
        contactForm.reset();
      } else {
        document.getElementById('contactMessage').textContent = "Error: " + (res.message || "Try again");
      }
    } catch(err){
      document.getElementById('contactMessage').textContent = "Error sending message.";
      console.error(err);
    }
  });
}

// Download form (password protected)
const downloadForm = document.getElementById('downloadForm');
if(downloadForm){
  downloadForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const data = Object.fromEntries(new FormData(downloadForm).entries());
    const msgEl = document.getElementById('downloadMessage');
    msgEl.textContent = "Checking password...";
    try{
      const res = await jsonPost({ action: "download", password: data.password });
      if(res.status === 'ok' && res.base64){
        // decode base64, create blob, and prompt download
        const byteString = atob(res.base64);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for(let i=0;i<byteString.length;i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: res.mime || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.name || 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        msgEl.textContent = "Download started.";
      } else {
        msgEl.textContent = "Invalid password or file not available.";
      }
    } catch(err){
      msgEl.textContent = "Error fetching file.";
      console.error(err);
    }
  });
}
