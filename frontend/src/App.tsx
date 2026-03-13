import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import Intro from "./pages/Intro/Intro"

function App() {

  const [introDone,setIntroDone] = useState(false)

  return (

    <AnimatePresence>

      {!introDone && (
        <Intro onFinish={() => setIntroDone(true)} />
      )}

      {introDone && (

        <motion.div
          initial={{ opacity:0, y:40 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6 }}
        >
          <h1 style={{color:"white",textAlign:"center"}}>
            Dashboard Loading
          </h1>
        </motion.div>

      )}

    </AnimatePresence>

  )
}

export default App