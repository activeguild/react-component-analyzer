import { globalStyle } from '@vanilla-extract/css'

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

globalStyle('.line-highlight', {
  background: `linear-gradient(
    to right,
    hsla(124, 120%, 50%, 0.15) 100%,
    hsla(24, 20%, 50%, 0)
  ) !important`,
})
