import { globalStyle } from '@vanilla-extract/css'

globalStyle('body', {
  fontFamily: `'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', 'メイリオ',
    Meiryo, Osaka, 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif`,
  color: 'white !important',
  background: '#282a37',
  fontSize: '11px',
})

globalStyle('input', {
  border: 'none',
  borderRadius: '2px',
})

globalStyle('input:focus', {
  outline: '1px #00ff11 solidss',
})

globalStyle('div.code-toolbar > .toolbar', { top: '-4px' })

globalStyle('a', {
  padding: '4px',
  cursor: 'pointer',
})

globalStyle('a, a:visited', {
  color: 'white',
})

globalStyle('a:hover', {
  opacity: 0.7,
})
