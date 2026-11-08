"use client";
import { motion } from "motion/react";

export default function Button(setRedimensionMode){

    return(

    <motion.div 
     initial={{scale: 0, opacity: 0}}
     animate={{scale: 1, opacity: 1}}
     whileHover={{ scale: 1.1 }}
    className="space-x-4 w-fit flex items-center px-2 h-15 rounded-4xl hover:shadow-md hover:bg-neutral-800 border border-white bg-neutral-900 absolute bottom-3">

<button className="bg-gray-500 rounded-md " onClick={()=>  setRedimensionMode(true)}>KK</button>

    </motion.div>
)

}