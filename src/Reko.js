import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemAvatar,
  Switch,
  Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { SettingsEthernet } from '@material-ui/icons'
import { API, Auth } from 'aws-amplify'
import { Stage, Layer, Rect, Circle } from 'react-konva'

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
  const [open, setOpen] = useState(null)

  const [computing, setComputing] = useState(false)
  const [bboxes, setBBoxes] = useState([])
  const [landmarks, setLandmarks] = useState([])

  const [layer1Enabled, setLayer1Enabled] = useState(true)
  const [layer2Enabled, setLayer2Enabled] = useState(false)

  /// hardcoded values! ratio 1.333
  const w = 640
  const h = 480

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const data = {
      response: true,
      headers: { Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}` }
    }
    const { username } = await Auth.currentAuthenticatedUser()
    const res = await API.get(apiName, `/upload/${username}`, data)
    if (res?.data?.results) {
      setFiles(res.data.results)
    }
    setLoading(false)
  }

  const startReko = async (key) => {
    setComputing(true)
    const data = {
      response: true,
      headers: { Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}` }
    }
    const res = await API.get(apiName, `/reko/${key}`, data)
    if (res?.data?.results) {
      setBBoxes(res.data.results.map((r) => r.BoundingBox))
      setLandmarks(res.data.results.map((r) => r.Landmarks))
    }
    setComputing(false)
  }

  const openPopup = (file) => {
    setOpen(file.url)
    startReko(file.key)
  }

  const handleClose = () => {
    setBBoxes([])
    setLandmarks([])
    setOpen(null)
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
                <IconButton edge="end" aria-label="features" onClick={() => openPopup(f)}>
                  <SettingsEthernet />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
      <Dialog open={open !== null} fullWidth maxWidth="md" onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogContent>
          <DialogContentText>Résultat de la reconnaissance d'images</DialogContentText>
          <div style={{ width: 640, height: 480 }}>
            {computing ? <LinearProgress /> : <div style={{ height: 4 }} />}
            <div className={classes.wrapper}>
              <img className={classes.full} src={open} />
              <Stage width={w} height={h}>
                <Layer visible={layer1Enabled}>
                  {bboxes.map((b, index) => (
                    <Rect index={`b-${index}`} x={b.Left * w} y={b.Top * h} width={b.Width * w} height={b.Height * h} stroke="red" />
                  ))}
                </Layer>
                <Layer visible={layer2Enabled}>
                  {landmarks.map((landmark, index) =>
                    landmark.map((l) => <Circle index={`l-${index}`} x={l.X * w} y={l.Y * h} radius={1} fill="red" />)
                  )}
                </Layer>
              </Stage>
            </div>
          </div>
          <Box>
            <FormControlLabel
              control={
                <Switch checked={layer1Enabled} onChange={() => setLayer1Enabled(!layer1Enabled)} color="primary" name="layer1Enabled" />
              }
              label="Rectangle englobant"
            />

            <FormControlLabel
              control={
                <Switch checked={layer2Enabled} onChange={() => setLayer2Enabled(!layer2Enabled)} color="primary" name="layer2Enabled" />
              }
              label="Point d'intérêts"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Reko