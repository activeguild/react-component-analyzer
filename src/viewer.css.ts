import { style } from '@vanilla-extract/css'

export const styles = {
  drawer: style({
    height: '100%',
    position: 'fixed',
    top: 0,
    right: 0,
    width: '600px',
    zIndex: 200,
    boxShadow: '1px 0px 7px rgba(0, 0, 0, 0.5)',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease-out',
    background: '#272822',
    paddingLeft: '16px',
    paddingTop: '18px',
    overflow: 'scroll',
  }),
  open: style({ transform: 'translateX(0)' }),
  drawerClose: style({
    position: 'absolute',
    fontSize: '14px',
    top: '8px',
    left: '8px',
  }),
  sideNavContainer: style({
    display: 'flex',
    flexDirection: 'column',
    width: '160px',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    background: '#333130',
    zIndex: '200',
  }),
  sideNav: style({
    height: '100%',
    overflow: 'scroll',
    listStyle: 'none',
    padding: '12px 20px 0 20px',
    margin: 0,
  }),
  sideNavTitle: style({
    margin: '20px 20px 0 20px',
    fontWeight: 'bold',
  }),
  sideNavSearch: style({
    margin: '20px 20px 0 20px',
  }),
  sideNavItem: style({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  sideNavLink: style({
    marginLeft: '8px',
    color: 'inherit',
  }),
  active: style({
    color: '#00ff11',
  }),
  diagramWrapper: style({
    marginLeft: '160px',
  }),
  customNode: style({
    background: '#01060b',
    borderRadius: '4px',
    padding: '10px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '2px 2px 4px #01060b',
    selectors: {
      '&.active': {
        border: 'solid 1px #00ff11',
      },
    },
  }),
  customNodeInput: style({
    marginTop: '-10px',
    marginLeft: 'auto',
    marginRight: 'auto',
    cursor: 'pointer',
    selectors: {
      '&:hover': {
        opacity: 0.7,
      },
    },
  }),
  customNodeOutput: style({
    marginBottom: '-10px',
    marginLeft: 'auto',
    marginRight: 'auto',
    cursor: 'pointer',
    selectors: {
      '&:hover': {
        opacity: 0.7,
      },
    },
  }),
  customNodeId: style({
    color: 'white',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }),
  customNodeToolbar: style({
    textAlign: 'right',
  }),
}
