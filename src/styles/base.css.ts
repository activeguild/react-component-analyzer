import { globalStyle } from '@vanilla-extract/css'
globalStyle('body', {
  fontFamily: `'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', 'メイリオ',
    Meiryo, Osaka, 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif`,
  color: 'white !important',
  background: '#282a37',
  fontSize: '1px',
})

globalStyle('input', {
  border: 'none',
  borderRadius: '2px',
})

globalStyle('input:focus', {
  outline: '1px #00ff11 solidss',
})

globalStyle('.bi.bi-diagram', {
  backgroundColor: '#282a37 !important',
  overflow: ' scroll !important',
  border: 'none !important',
  boxShadow: 'none !important',
})

globalStyle(
  '.bi.bi-diagram .bi-link-canvas-layer .bi-diagram-link .bi-link-path',
  {
    strokeWidth: '0.12rem',
    stroke: 'url(#header-shape-gradient) #fff',
  }
)

globalStyle('a', {
  padding: '4px',
  cursor: 'pointer',
})

globalStyle('a + a', {
  marginLeft: '4px',
})

globalStyle('a, a:visited', {
  color: 'white',
})

globalStyle('a:hover', {
  opacity: 0.7,
})
