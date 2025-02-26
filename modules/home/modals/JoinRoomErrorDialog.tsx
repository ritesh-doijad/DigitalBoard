import type React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface JoinRoomErrorDialogProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
}

export const JoinRoomErrorDialog: React.FC<JoinRoomErrorDialogProps> = ({ isOpen, onClose, roomId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> Room with ID &quot;{roomId}&quot; does not exist or is full!</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">Try to join the room later.</p>
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  )
}

