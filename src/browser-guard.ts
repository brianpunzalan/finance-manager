const ua = navigator.userAgent
const isChrome = /Chrome\/[\d.]+/.test(ua) && !/Edg\/|OPR\//.test(ua)

if (!isChrome) {
  const root = document.getElementById('root')
  if (root) root.innerHTML = ''
  window.location.hash = '/unsupported'
}

export { isChrome }
