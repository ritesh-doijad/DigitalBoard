import { useEffect, useState } from "react"
import { useBoardPostion } from "../hooks/useBoardPostion"
import { socket } from "@/common/lib/socket"
import { motion } from "framer-motion"
import {BsCursorFill} from "react-icons/bs"



export const UserMouse=({userId}:{userId:string})=>{
    const boardPos=useBoardPostion()
    const [x,setX]=useState(boardPos.x.get())
    const [y,setY]=useState(boardPos.y.get())

    const [pos,setPos]=useState({x:-1,y:-1})

    useEffect(()=>{
        socket.on("mouse_moved",(newX,newY,socketIdMoved)=>{
            if(socketIdMoved===userId){
                setPos({x:newX,y:newY})
            }
        })
        return ()=>{
          socket.off("mouse_moved");
        }
    },[userId])

    useEffect(()=>{
        const unsubscribe=boardPos.x.on("change",setX);
        return unsubscribe;
    },[boardPos.x]);
    useEffect(()=>{
        const unsubscribe=boardPos.y.on("change",setY);
        return unsubscribe;
    },[boardPos.y]);

    return(
        <motion.div className={`absolute top-0 left-0 text-blue-800 ${pos.x===-1 && `hidden`} pointer-events-none`}
        animate={{x:pos.x+x,y:pos.y+y}}
        transition={{duration:0.1,ease:"linear"}}
        >
          <BsCursorFill className="-rotate-90"/>
        </motion.div>
    )
}