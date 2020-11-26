import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import App from './App'
import Amplify from 'aws-amplify'
import awsExports from './aws-exports'

Amplify.configure(awsExports)

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#42ab9e'
    },
    secondary: {
      main: '#616161'
    }
  }
})

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)