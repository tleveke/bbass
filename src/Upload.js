import React, { useState } from 'react'
import { Box, Button, CircularProgress, Container, Typography } from '@material-ui/core'
import { DropzoneArea } from 'material-ui-dropzone'
import { API, Auth } from 'aws-amplify'

import awsmobile from './aws-exports'
const apiName = awsmobile.aws_cloud_logic_custom[0].name

const Upload = () => {
  const [files, setFiles] = useState([])
  const [sending, setSending] = useState(false)
  const handleChange = (files) => setFiles(files)

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  const sendToS3 = async () => {
    setSending(true)
    const file = await toBase64(files[0])
    const { username } = await Auth.currentAuthenticatedUser()
    const data = {
      response: true,
      body: { file, username }
    }
    await API.post(apiName, '/upload', data)
    setFiles([])
    setSending(false)
  }

  return (
    <Container>
      <Typography>Uploader un fichier vers AWS S3</Typography>
      <Typography>Endpoint utilisé /upload</Typography>
      {!sending && (
        <DropzoneArea
          filesLimit={1}
          onChange={handleChange}
          dropzoneText="Sélectionner une image JPEG"
          acceptedFiles={['image/jpeg', 'image/jpg']}
        />
      )}
      <Box mt={4}>
        <Button variant="contained" color="primary" disabled={files.length === 0} onClick={sendToS3}>
          {sending ? <CircularProgress color="secondary" /> : 'Envoyer'}
        </Button>
      </Box>
    </Container>
  )
}

export default Upload