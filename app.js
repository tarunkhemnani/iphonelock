// Simple lockscreen behaviors: live time/date, passcode UI, POST passcode to API
(function(){
  // --- Config (change API_URL & wallpaper path) ---
  const API_URL = 'https://example.com/api/passcode'; // << replace with your endpoint
  const WALLPAPER = 'wallpaper.jpg'; // replace file
  // ------------------------------------------------

  // Update wallpaper src (optional)
  const wp = document.getElementById('wallpaper');
  if (wp) wp.style.backgroundImage = `url('${WALLPAPER}')`;

  // Time and date
  function updateTime(){
    const now = new Date();
    const optsTime = {hour:'2-digit', minute:'2-digit'};
    const optsDate = {weekday:'long', month:'long', day:'numeric'};
    document.getElementById('time').textContent = now.toLocaleTimeString([], optsTime);
    document.getElementById('date').textContent = now.toLocaleDateString([], optsDate);
    // top-right small battery/time demo
    document.querySelector('.time-top').textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  }
  updateTime();
  setInterval(updateTime, 1000);

  // Toggle passcode panel when the main screen is tapped (mimics tap-to-show-passcode)
  const passPanel = document.getElementById('passPanel');
  const lockscreen = document.getElementById('lockscreen');
  let passVisible = false;
  lockscreen.addEventListener('click', (e)=> {
    // ignore clicks on keypad/panel itself
    if (e.target.closest('.passcode-panel')) return;
    passVisible = !passVisible;
    passPanel.style.display = passVisible ? 'block' : 'none';
    passPanel.setAttribute('aria-hidden', !passVisible);
  });

  // Passcode logic
  const MAX_DIGITS = 6;
  let digits = [];

  function setDots(){
    const dots = document.querySelectorAll('.dot');
    dots.forEach((d,i)=> {
      if (i < digits.length) d.classList.add('filled'); else d.classList.remove('filled');
    });
  }

  async function submitPin(pin){
    // Show a quick visual confirmation (you can enhance with animations)
    try{
      // POST as JSON. Adjust auth headers as needed.
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({passcode: pin})
      });
      if(!resp.ok) throw new Error('Network response not ok');
      const json = await resp.json();
      // Handle success - currently just log
      console.log('API response', json);
      // Optionally show success UI
      alert('Passcode submitted');
    }catch(err){
      console.error('Submit error', err);
      alert('Failed to send passcode');
    } finally {
      digits = [];
      setDots();
      passPanel.style.display = 'none';
      passPanel.setAttribute('aria-hidden', true);
      passVisible = false;
    }
  }

  // Keypad clicks
  document.getElementById('keypad').addEventListener('click', (e)=>{
    const k = e.target.closest('.key');
    if(!k) return;
    if(k.classList.contains('empty')) return;
    if(k.id === 'keyBack'){
      digits.pop();
      setDots();
      return;
    }
    const val = k.dataset.key;
    if(!val) return;
    if(digits.length >= MAX_DIGITS) return;
    digits.push(val);
    setDots();
    if(digits.length === MAX_DIGITS){
      // assemble and submit
      const pin = digits.join('');
      setTimeout(()=> submitPin(pin), 250); // small delay for UX
    }
  });

  // Keyboard support: numeric entry & backspace
  window.addEventListener('keydown', (e)=>{
    if(!passVisible) return;
    if(e.key === 'Backspace') {
      digits.pop(); setDots(); return;
    }
    if(/^[0-9]$/.test(e.key) && digits.length < MAX_DIGITS){
      digits.push(e.key); setDots();
      if(digits.length === MAX_DIGITS){
        const pin = digits.join('');
        setTimeout(()=> submitPin(pin), 200);
      }
    }
  });

  // cancel button
  document.getElementById('cancelBtn').addEventListener('click', ()=> {
    digits = []; setDots();
    passPanel.style.display = 'none';
    passPanel.setAttribute('aria-hidden', true);
    passVisible = false;
  });

  // Accessibility: if user taps and holds on bottom icons, show camera/flash hints (optional)
})();
