import Link from 'next/link';
import Image from "next/image";

export default function Card({src, alt, header, text, link}){
    return(
              <Link href={link}>
         <div className="group relative h-40 rounded-2xl overflow-hidden border border-white/10 bg-slate-900/80 p-4 flex flex-col justify-between shadow-xl hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer backdrop-blur-md">
    
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10"></div>
          <Image src={src} width={80} height={80} alt={alt} className="inset-0 w-full h-full absolute object-cover group-hover:scale-110 group-hover:opacity-40 transition-all duration-500" />
          <div className="relative z-20 space-y-1 mt-auto">
            <h4 className="text-sm font-black text-white tracking-wide group-hover:text-blue-400 transition-colors">{header}</h4>
            <p className="text-[10px] text-slate-300">{text}</p>
          </div>
        </div>
            </Link>
    )
}