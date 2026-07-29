import logoSvg from './logo.svg';

document.querySelector<HTMLImageElement>('#logo-img')!.src = logoSvg;

console.log('App Loaded. Logo SVG Data URI length:', logoSvg.length);
