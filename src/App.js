import React, { useEffect, useState } from 'react'
import { useLocation, Switch, Route, Link } from 'react-router-dom'
import { Auth } from 'aws-amplify'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import clsx from 'clsx'
import {
  AppBar,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from '@material-ui/core'
import { CloudUpload, Face, Home } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'

//import Reko from './Reko'
import Upload from './Upload'

const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  appBar: {
    marginLeft: drawerWidth,
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`
    }
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    }
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  }
}))

const MyAppBar = () => {
  const classes = useStyles()
  const location = useLocation()
  let title = ''
  switch (location.pathname) {
    default:
    case '/':
      title = "Page d'accueil"
      break
    case '/reko':
      title = "Reconnaissance d'images"
      break
    case '/upload':
      title = 'Upload vers S3'
      break
  }
  return (
    <AppBar position="absolute" className={clsx(classes.appBar, classes.appBarShift)}>
      <Toolbar className={classes.toolbar}>
        <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

const Root = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    setUser(await Auth.currentAuthenticatedUser())
  }

  return (
    <Container maxWidth="sm">
      <Typography>Bonjour utilisateur : {user?.username}</Typography>
      <Typography>Votre email de connexion : {user?.attributes?.email}</Typography>
      <AmplifySignOut />
    </Container>
  )
}

const App = () => {
  const classes = useStyles()
  const [open, setOpen] = useState(true)
  return (
    <>
      <div className={classes.root}>
        <CssBaseline />
        <MyAppBar />
        <nav className={classes.drawer} aria-label="mailbox folders">
          <Drawer
            variant="persistent"
            open={open}
            onClose={() => setOpen(false)}
            classes={{
              paper: classes.drawerPaper
            }}
          >
            <div>
              <div className={classes.toolbar} />
              <Divider />
              <List>
                <ListItem component={Link} to="/">
                  <ListItemIcon>
                    <Home />
                  </ListItemIcon>
                  <ListItemText primary="Accueil" />
                </ListItem>
                <ListItem component={Link} to="/upload">
                  <ListItemIcon>
                    <CloudUpload />
                  </ListItemIcon>
                  <ListItemText primary="Upload" />
                </ListItem>
              </List>
            </div>
          </Drawer>
        </nav>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route exact path="/" render={() => <Root />} />
            <Route path="/upload" render={() => <Upload />} />
          </Switch>
        </main>
      </div>
    </>
  )
}

export default withAuthenticator(App)