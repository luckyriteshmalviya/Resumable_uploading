import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FileUpload from './upload'

function App() {
  // const [count, setCount] = useState(0)

  // function handleUpload(e){
  //   console.log(e.target.files[0])

//  }
  return (
    <>
      <div>
      {/* <input type='file' onChange={handleUpload} /> */}
      <FileUpload />
      </div>
    </>
  )
}

export default App
