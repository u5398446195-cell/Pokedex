"use client";
import Button from "./Button";
import EditSpace from "./Editspace";
import { useState} from 'react';

export default function EditSection(){

    const [dimension, setDimension]= useState({largeur: 200, longeur: 150})
    const {redimensionMode, setRedimensionMode}= useState(false)
    

    return(
         
         <div className="w-300 h-200 bg-neutral-800 p-1 relative rounded-3xl flex items-center justify-center shadow-md">

             
                <EditSpace dimension={dimension} setDimension={setDimension} redimensionMode={redimensionMode}/>
                <Button  setRedimensionMode={setRedimensionMode}/>

                

            </div>
           
    )

}