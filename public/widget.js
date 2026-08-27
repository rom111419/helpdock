(function () {
  var script = document.currentScript;
  if (!script) return;

  var key = script.getAttribute('data-helpdock');
  if (!key) return;

  var origin = new URL(script.src, window.location.href).origin;
  var accent = script.getAttribute('data-accent') || '#c2410c';
  var open = false;

  var frame = document.createElement('iframe');
  frame.src = origin + '/embed/' + encodeURIComponent(key);
  frame.title = 'Helpdock chat';
  frame.setAttribute('allow', 'clipboard-write');
  frame.style.cssText = [
    'position:fixed', 'bottom:88px', 'right:20px', 'width:380px', 'height:min(560px, calc(100vh - 120px))',
    'max-width:calc(100vw - 40px)', 'border:0', 'border-radius:16px', 'z-index:2147483000',
    'box-shadow:0 24px 60px -20px rgba(0,0,0,.35)', 'display:none', 'background:#fff',
    'opacity:0', 'transform:translateY(8px)', 'transition:opacity .16s ease, transform .16s ease',
  ].join(';');

  var button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', 'Open chat');
  button.style.cssText = [
    'position:fixed', 'bottom:20px', 'right:20px', 'width:56px', 'height:56px', 'border:0',
    'border-radius:50%', 'cursor:pointer', 'z-index:2147483001', 'background:' + accent,
    'box-shadow:0 10px 30px -8px rgba(0,0,0,.45)', 'display:flex', 'align-items:center',
    'justify-content:center', 'padding:0', 'transition:transform .16s ease',
  ].join(';');
  button.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M4 5.5h16v11H9.5L5 20.5v-4H4z" fill="#fff"/></svg>';

  button.addEventListener('mouseenter', function () { button.style.transform = 'scale(1.05)'; });
  button.addEventListener('mouseleave', function () { button.style.transform = 'scale(1)'; });

  button.addEventListener('click', function () {
    open = !open;
    if (open) {
      frame.style.display = 'block';
      requestAnimationFrame(function () {
        frame.style.opacity = '1';
        frame.style.transform = 'translateY(0)';
      });
      button.setAttribute('aria-label', 'Close chat');
      return;
    }
    frame.style.opacity = '0';
    frame.style.transform = 'translateY(8px)';
    button.setAttribute('aria-label', 'Open chat');
    setTimeout(function () { if (!open) frame.style.display = 'none'; }, 160);
  });

  function mount() {
    document.body.appendChild(frame);
    document.body.appendChild(button);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
