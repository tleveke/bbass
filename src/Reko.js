import React, { useEffect, useState } from 'react'
import {
  CircularProgress,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemAvatar,
  Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { SettingsEthernet } from '@material-ui/icons'
import { API, Auth } from 'aws-amplify'

import awsmobile from './aws-exports'
const apiName = awsmobile.aws_cloud_logic_custom[0].name

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper
  },
  avatar: {
    width: 400,
    textAlign: 'center'
  },
  wrapper: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  full: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0
  }
}))

const Reko = () => {
  const classes = useStyles()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const data = {
      response: true,
      headers: { Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}` }
    }
    const { username } = await Auth.currentAuthenticatedUser()
    console.log(username);
    const res = await API.get(apiName, `/upload/${username}`, data)
    if (res?.data?.results) {
      setFiles(res.data.results)
    }
    setLoading(false)
  }

  return (
    <Container>
      <Typography>Choisissez une image uploadée sur S3 pour lancer l'analyse</Typography>
      <Typography>Endpoints utilisés /upload et /reko</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <List className={classes.root}>
          {files.map((f, index) => (
            <ListItem key={index} button>
              <ListItemAvatar>
                <img alt={`Image ${index}`} className={classes.avatar} src={f.url} />
              </ListItemAvatar>
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="features" onClick={() => {}}>
                  <SettingsEthernet />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  )
}

export default Reko