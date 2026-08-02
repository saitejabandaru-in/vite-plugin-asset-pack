// removed style
import logoDataUri from './logo.svg'
import photoUrl from './photo.jpg'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <img src="${logoDataUri}" class="logo" alt="Vite logo" />
    <img src="${photoUrl}" class="logo" alt="Large Photo" style="width: 200px" />
  </div>
`

console.log('App Loaded. Logo SVG Data URI length:', logoDataUri.length);
