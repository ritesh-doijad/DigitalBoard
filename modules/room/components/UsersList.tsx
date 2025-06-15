"use client"


import { useRoom } from "@/common/recoil/room/roomHook"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"

const UserList = () => {
  const { users } = useRoom()
  const [hoveredUser, setHoveredUser] = useState<string | null>(null)

  return (
    <TooltipProvider>
      <div className="pointer-events-auto absolute z-30 flex p-5">
        {[...users.keys()].map((userId, index) => {
          const user = users.get(userId)
          const initial = user?.name.charAt(0) || "A"

          return (
            <Tooltip key={userId}>
              <TooltipTrigger asChild>
                <div
                  className="transition-transform hover:z-10 hover:scale-110"
                  style={{ marginLeft: index !== 0 ? "-0.5rem" : 0 }}
                  onMouseEnter={() => setHoveredUser(userId)}
                  onMouseLeave={() => setHoveredUser(null)}
                >
                  <Avatar
                    className="flex h-5 w-5 select-none items-center justify-center text-xs text-white ring-2 ring-background md:h-8 md:w-8 md:text-base lg:h-12 lg:w-12"
                    style={{
                      backgroundColor: user?.color || "black",
                    }}
                  >
                    <AvatarFallback style={{ backgroundColor: user?.color || "black" }}>{initial}</AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-sm">
                {user?.name || "Anonymous"}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}

export default UserList
