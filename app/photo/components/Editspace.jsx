import { motion } from "motion/react";

export default function EditSpace({ dimension, setDimension, redimensionMode }) {
    return (
        // Conteneur limité à 1115x680 px
        <div className="bg-neutral-900 w-[1115px] h-[680px] relative flex items-center justify-center overflow-hidden border border-neutral-700 rounded-2xl shadow-2xl select-none">
            
            
            <div 
                style={{
                    width: `${dimension.largeur}px`,
                    height: `${dimension.longeur}px`,
                }}
                className={`relative bg-white rounded-3xl shadow-2xl flex items-center justify-center transition-all ${
                    redimensionMode ? "border-4 border-blue-500" : "border-0"
                }`}
            >
             
                <span className="text-neutral-900 font-bold text-sm">
                    {Math.round(dimension.largeur)} x {Math.round(dimension.longeur)}
                </span>

            
                {redimensionMode && (
                    <>
                        {/* 1. Poignée HAUT */}
                        <motion.div 
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0}
                            onDrag={(e, info) => {
                                setDimension(prev => ({ 
                                    ...prev, 
                                    longeur: Math.max(50, prev.longeur - info.delta.y) 
                                }));
                            }}
                            className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-orange-500 border-2 border-orange-900 rounded-md cursor-ns-resize shadow-md"
                        />

                        {/* 2. Poignée BAS */}
                        <motion.div 
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0}
                            onDrag={(e, info) => {
                                setDimension(prev => ({ 
                                    ...prev, 
                                    longeur: Math.max(50, prev.longeur + info.delta.y) 
                                }));
                            }}
                            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-orange-500 border-2 border-orange-900 rounded-md cursor-ns-resize shadow-md"
                        />

                        {/* 3. Poignée GAUCHE */}
                        <motion.div 
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0}
                            onDrag={(e, info) => {
                                setDimension(prev => ({ 
                                    ...prev, 
                                    largeur: Math.max(50, prev.largeur - info.delta.x) 
                                }));
                            }}
                            className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-orange-500 border-2 border-orange-900 rounded-md cursor-ew-resize shadow-md"
                        />

                        {/* 4. Poignée DROITE */}
                        <motion.div 
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0}
                            onDrag={(e, info) => {
                                setDimension(prev => ({ 
                                    ...prev, 
                                    largeur: Math.max(50, prev.largeur + info.delta.x) 
                                }));
                            }}
                            className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-orange-500 border-2 border-orange-900 rounded-md cursor-ew-resize shadow-md"
                        />
                    </>
                )}

            </div>

        </div>
    );
}