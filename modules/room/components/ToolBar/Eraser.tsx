"use client"

 // make sure this points to the updated hook
import { Eraser } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOptionsState } from "@/common/recoil/options/options.hooks"

const EraserComponent = () => {
  const [options, { toggleErase }] = useOptionsState() // using Redux options + actions

  return (
    <Button
      className={`text-xl ${options.erase ? "bg-green-400" : ""}`}
      onClick={toggleErase}
    >
      <Eraser />
    </Button>
  )
}

export default EraserComponent
